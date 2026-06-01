/**
 * Generate Missing Sandwich Images
 *
 * PURPOSE:
 * Walk every sandwich in the database and (re)generate any composite image that is
 * missing from disk. Sandwich images are deterministic composites built from the
 * sandwich's ingredients by `generateSandwichImage` (see
 * #utils/manageSandwichesImages.ts) and stored as files under SANDWICHES_DIR; the
 * Sandwich document only keeps the filename in its `image` field. Files can go
 * missing after a fresh checkout, a lost/rebuilt uploads volume, or for sandwiches
 * that were left on the schema default ('defaultSandwichImage.png').
 *
 * WHAT IT DOES:
 *   For each sandwich:
 *     1. Treats the image as missing when `image` is still the schema default OR the
 *        file `image` points to is absent from SANDWICHES_DIR.
 *     2. For a missing image, calls `generateSandwichImage(ingredients)` — the same
 *        helper the API uses — which composites the layers and writes the file
 *        (it no-ops if the deterministic file already exists).
 *     3. If the resulting filename differs from the stored `image`, updates the
 *        document so the DB points at the real file.
 *   Sandwiches whose image file already exists are left untouched.
 *
 * USAGE:
 *   node --env-file ./config/.env service/generateMissingSandwichImages.ts
 *   # or: pnpm --filter @sandwicheck/server run generate-missing-sandwich-images
 *
 * OPTIONS (env vars):
 *   DRY_RUN=true   Report what would be generated without writing files or the DB.
 *   FORCE=true     Regenerate every sandwich image even if the file already exists.
 *
 * NOTES:
 *   - Credentials (MONGO_URI) and image config (INGREDIENTS_IMAGE_EXTENSION, …) come
 *     from the server .env, exactly like the running API — pass it with --env-file.
 *   - Idempotent and safe to run repeatedly; per-sandwich errors are logged and do
 *     not abort the run (the process exits non-zero if any sandwich failed).
 */

import fs from 'node:fs/promises';
import path from 'node:path';
import mongoose from 'mongoose';
import connectDB from '#config/db.ts';
import { SANDWICHES_DIR } from '#config/dir.ts';
import type { IIngredientWithPortion } from '#models/SandwichModel.ts';
import Sandwich from '#models/SandwichModel.ts';
import logger from '#utils/logger.ts';
import { generateSandwichImage } from '#utils/manageSandwichesImages.ts';

/*
 * Mirrors the `image` default in #models/SandwichModel.ts — a sandwich left on this
 * value never had a composite generated, so it is always treated as missing.
 */
const DEFAULT_SANDWICH_IMAGE = 'defaultSandwichImage.png';

const DRY_RUN = process.env.DRY_RUN === 'true';
const FORCE = process.env.FORCE === 'true';

type LeanSandwich = {
  _id: mongoose.Types.ObjectId;
  name: string;
  image: string;
  ingredients: IIngredientWithPortion[];
};

const fileExists = async (filePath: string): Promise<boolean> => {
  try {
    await fs.access(filePath);
    return true;
  } catch (error) {
    if ((error as NodeJS.ErrnoException).code === 'ENOENT') {
      return false;
    }
    throw error;
  }
};

const generateMissingSandwichImages = async (): Promise<void> => {
  const stats = { total: 0, present: 0, generated: 0, dbUpdated: 0, wouldGenerate: 0, failed: 0 };

  /*
   * `sharp().toFile()` does not create parent dirs; ensure the output folder exists
   * so a fresh/empty uploads volume doesn't fail every write (mirrors initUploadsFolder.ts).
   */
  if (!DRY_RUN) {
    await fs.mkdir(SANDWICHES_DIR, { recursive: true });
  }

  const sandwiches = await Sandwich.find({}).select('_id name image ingredients').lean<LeanSandwich[]>();

  stats.total = sandwiches.length;
  logger.info(`Scanning ${stats.total} sandwiches for missing images...`, { dryRun: DRY_RUN, force: FORCE });

  for (const sandwich of sandwiches) {
    const storedImage = sandwich.image;
    const hasFile =
      storedImage !== DEFAULT_SANDWICH_IMAGE && (await fileExists(path.join(SANDWICHES_DIR, storedImage)));

    if (hasFile && !FORCE) {
      stats.present++;
      continue;
    }

    if (DRY_RUN) {
      stats.wouldGenerate++;
      logger.info(`Would generate image for "${sandwich.name}"`, { sandwichId: sandwich._id.toString() });
      continue;
    }

    try {
      // Same helper the API uses; deterministic filename, no-ops if the file exists.
      const fileName = await generateSandwichImage(sandwich.ingredients);
      stats.generated++;

      if (fileName !== storedImage) {
        await Sandwich.updateOne({ _id: sandwich._id }, { $set: { image: fileName } });
        stats.dbUpdated++;
      }

      logger.info(`Generated image for "${sandwich.name}"`, {
        sandwichId: sandwich._id.toString(),
        image: fileName,
      });
    } catch (error) {
      stats.failed++;
      logger.error(`Failed to generate image for "${sandwich.name}"`, {
        sandwichId: sandwich._id.toString(),
        error: (error as Error).message,
      });
    }
  }

  logger.info(
    DRY_RUN
      ? `Dry run complete: ${stats.wouldGenerate} of ${stats.total} sandwiches are missing images (${stats.present} already present).`
      : `Done: generated ${stats.generated} image(s), updated ${stats.dbUpdated} DB record(s), ${stats.present} already present, ${stats.failed} failed (of ${stats.total} total).`,
  );

  if (stats.failed > 0) {
    process.exitCode = 1;
  }
};

const main = async (): Promise<void> => {
  try {
    await connectDB();
    await generateMissingSandwichImages();
  } catch (error) {
    logger.error('Error in generateMissingSandwichImages execution:', error);
    process.exitCode = 1;
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
};

await main();
