import mongoose from 'mongoose';
import connectDB from '../config/db.ts';
import { type IngredientType, isBreadType } from '../constants/ingredientsConstants.ts';
import Ingredient from '../models/IngredientModel.ts';
import type { IIngredientWithPortion } from '../models/SandwichModel.ts';
import Sandwich from '../models/SandwichModel.ts';
import User from '../models/UserModel.ts';
import logger from '../utils/logger.ts';
import { generateSandwichImage } from '../utils/manageSandwichesImages.ts';
import { createUserParentsConnections } from '../utils/manageUserConnections.ts';
import { createSandwichService } from './createSandwichService.ts';
import { breadData, cheeseData, condimentData, proteinData, toppingData } from './initialData/ingredientsData.ts';
import { sandwichesData } from './initialData/sandwichesData.ts';
import { usersData } from './initialData/usersData.ts';

const waitForConnection = (): Promise<void> => {
  return new Promise<void>((resolve) => {
    // If already connected, resolve immediately
    if (mongoose.connection.readyState === 1) {
      resolve();
      return;
    }

    // Otherwise, wait for connection
    mongoose.connection.once('connected', () => {
      resolve();
    });

    // Handle connection errors
    mongoose.connection.once('error', (error) => {
      logger.error('Database connection error:', error);
      throw error;
    });
  });
};

const upsertIngredients = async ({
  data,
  Model,
}: {
  data: Array<{ name: string; type: IngredientType }>;
  Model: typeof Ingredient;
}): Promise<void> => {
  if (!data || data.length === 0) {
    logger.warn('No data provided for ingredients');
    return;
  }

  const type = data[0]?.type ?? '';
  try {
    let added = 0;
    let updated = 0;

    for (const item of data) {
      const existing = await Model.findOne({ name: item.name, type: item.type });

      if (existing) {
        existing.set(item);
        await existing.save();
        updated++;
      } else {
        await Model.create(item);
        added++;
      }
    }

    logger.info(`Upserted ${type}: ${added} added, ${updated} updated (total: ${data.length})`);
  } catch (error) {
    logger.error(`Error upserting ${type}:`, error);
    throw error;
  }
};

// Helper function to generate a random date within the last year
const getRandomDateInLastYear = (): Date => {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  const randomTime = oneYearAgo.getTime() + Math.random() * (now.getTime() - oneYearAgo.getTime());
  return new Date(randomTime);
};

// Helper function to generate a date after a given date but still within the last year
const getRandomDateAfter = (afterDate: Date): Date => {
  const now = new Date();
  const oneYearAgo = new Date(now);
  oneYearAgo.setFullYear(now.getFullYear() - 1);

  // Ensure afterDate is within the last year, otherwise use oneYearAgo
  const minTime = Math.max(afterDate.getTime(), oneYearAgo.getTime());

  // If minTime is already at or after now, use a date just after minTime (within last year)
  if (minTime >= now.getTime()) {
    const justAfter = new Date(minTime);
    justAfter.setDate(justAfter.getDate() + 1);
    return new Date(Math.min(justAfter.getTime(), now.getTime()));
  }

  const randomTime = minTime + Math.random() * (now.getTime() - minTime);
  return new Date(randomTime);
};

const upsertUsers = async (): Promise<void> => {
  try {
    // Separate users with emails (parents/adults) from tethered children
    const usersWithEmail = usersData.filter(
      (user): user is Extract<typeof user, { email: string }> => 'email' in user && Boolean(user.email),
    );
    const tetheredChildren = usersData.filter(
      (user): user is Extract<typeof user, { _parentEmails: string[] }> =>
        'isTetheredChild' in user && Boolean(user.isTetheredChild),
    );

    let added = 0;
    let updated = 0;

    // First, upsert all users with emails
    for (const userData of usersWithEmail) {
      const { email, ...userFields } = userData;
      const existing = await User.findOne({ email: email.toLowerCase() });

      const randomCreatedAt = getRandomDateInLastYear();
      const createdAt = randomCreatedAt;
      const updatedAt = createdAt;

      if (existing) {
        existing.set({ ...userFields, email: email.toLowerCase(), createdAt, updatedAt });
        await existing.save();
        updated++;
      } else {
        await User.create({ ...userFields, email: email.toLowerCase(), createdAt, updatedAt });
        added++;
      }
    }

    logger.info(`Upserted users with email: ${added} added, ${updated} updated (total: ${usersWithEmail.length})`);

    // Then, handle tethered children
    added = 0;
    updated = 0;

    for (const childData of tetheredChildren) {
      const { _parentEmails, ...childFields } = childData;

      if (!_parentEmails || _parentEmails.length === 0) {
        logger.warn(`Skipping child ${childData.name}: no parent emails specified`);
        continue;
      }

      // Find parent users by email
      const parents = await User.find({ email: { $in: _parentEmails.map((email) => email.toLowerCase()) } });

      if (parents.length === 0) {
        logger.warn(`Skipping child ${childData.name}: parents not found`);
        continue;
      }

      // Validate that all parent emails were found
      if (parents.length < _parentEmails.length) {
        const foundEmails = new Set(parents.map((p) => p.email));
        const missingEmails = _parentEmails.filter((email) => !foundEmails.has(email.toLowerCase()));
        logger.warn(
          `Child ${childData.name}: Some parents not found (${missingEmails.join(', ')}). Proceeding with found parents only.`,
        );
      }

      // Find the earliest parent creation date
      const parentDates = parents.map((p) => p.createdAt || new Date()).sort((a, b) => a.getTime() - b.getTime());
      const earliestParentDate = parentDates[0] ?? new Date();

      // Generate a creation date after the earliest parent, but still within the last year
      const childCreatedAt = getRandomDateAfter(earliestParentDate);
      const childUpdatedAt = childCreatedAt;

      /*
       * For tethered children, we need to find by name and parent relationship
       * Since email is not unique for children, we'll use name + parent relationship
       */
      const existingChild = await User.findOne({
        name: childData.name,
        isTetheredChild: true,
        parents: { $in: parents.map((p) => p._id) },
      });

      if (existingChild) {
        // Update existing child
        existingChild.set({
          ...childFields,
          parents: parents.map((p) => p._id),
          createdAt: childCreatedAt,
          updatedAt: childUpdatedAt,
        });
        await existingChild.save();

        // Ensure parent-child connections and roles are properly set
        for (const parent of parents) {
          await createUserParentsConnections(existingChild, parent._id);
        }
        updated++;
      } else {
        // Create new child
        const newChild = new User({
          ...childFields,
          parents: parents.map((p) => p._id),
          createdAt: childCreatedAt,
          updatedAt: childUpdatedAt,
        });
        await newChild.save();
        added++;

        // Use utility function to properly set up parent-child connections and roles
        for (const parent of parents) {
          await createUserParentsConnections(newChild, parent._id);
        }
      }
    }

    logger.info(`Upserted tethered children: ${added} added, ${updated} updated (total: ${tetheredChildren.length})`);
  } catch (error) {
    logger.error('Error upserting users:', error);
    throw error;
  }
};

const createSandwiches = async (): Promise<void> => {
  try {
    // First, build a map of ingredient names to ObjectIds and types
    const ingredientMap = new Map<string, mongoose.Types.ObjectId>();
    const ingredientTypeMap = new Map<string, string>();
    const allIngredients = await Ingredient.find({});
    for (const ingredient of allIngredients) {
      ingredientMap.set(ingredient.name, ingredient._id);
      ingredientTypeMap.set(ingredient.name, ingredient.type);
    }

    // Build a map of user emails to ObjectIds (for adults/parents)
    const userEmailMap = new Map<string, { id: mongoose.Types.ObjectId; name: string }>();
    const usersWithEmail = await User.find({ email: { $exists: true, $ne: null } });
    for (const user of usersWithEmail) {
      userEmailMap.set(user.email!.toLowerCase(), { id: user._id, name: user.name });
    }

    let added = 0;
    let updated = 0;
    let skipped = 0;
    let failed = 0;
    const MAX_FAILURE_THRESHOLD = Math.ceil(sandwichesData.length * 0.1); // 10% failure threshold

    for (const sandwichData of sandwichesData) {
      try {
        // Validate ingredients array
        if (!sandwichData.ingredients || sandwichData.ingredients.length === 0) {
          logger.warn(`Skipping sandwich "${sandwichData.name}": No ingredients`);
          skipped++;
          continue;
        }

        // Resolve ingredients to ObjectIds
        const resolvedIngredients: IIngredientWithPortion[] = [];
        for (const ing of sandwichData.ingredients) {
          const ingredientId = ingredientMap.get(ing.name);
          if (!ingredientId) {
            throw new Error(`Ingredient "${ing.name}" not found`);
          }
          const ingredientType = ingredientTypeMap.get(ing.name);
          // Bread should not have portion key
          if (isBreadType(ingredientType ?? '')) {
            resolvedIngredients.push({ ingredientId });
          } else {
            resolvedIngredients.push({ ingredientId, portion: ing.portion });
          }
        }

        // Resolve author to ObjectId and name
        let authorId;
        let authorName;
        let authorUser;

        // Check if it's a tethered child's sandwich (has childName)
        if (sandwichData.childName) {
          // Find parent by email
          const parentInfo = userEmailMap.get(sandwichData.authorEmail.toLowerCase());
          if (!parentInfo) {
            logger.warn(
              `Skipping sandwich "${sandwichData.name}": parent email "${sandwichData.authorEmail}" not found`,
            );
            skipped++;
            continue;
          }

          /*
           * Find the child by name and parent relationship
           * Using $in to explicitly check if parent is in the parents array (handles multiple parents)
           * Also verify that ALL parents match to ensure we get the correct child
           */
          const parentIds = [parentInfo.id];
          const childUser = await User.findOne({
            name: sandwichData.childName,
            isTetheredChild: true,
            parents: { $in: parentIds },
          });

          if (!childUser) {
            logger.warn(
              `Skipping sandwich "${sandwichData.name}": child "${sandwichData.childName}" not found for parent "${sandwichData.authorEmail}"`,
            );
            skipped++;
            continue;
          }

          // Additional validation: ensure the child actually has this parent
          const childHasParent = childUser.parents.some((parentId) =>
            parentIds.some((pid) => pid.toString() === parentId.toString()),
          );
          if (!childHasParent) {
            logger.warn(
              `Skipping sandwich "${sandwichData.name}": child "${sandwichData.childName}" does not have parent "${sandwichData.authorEmail}"`,
            );
            skipped++;
            continue;
          }

          authorId = childUser._id;
          authorName = childUser.name;
          authorUser = childUser;
        } else {
          // It's a user with email (adult/parent)
          const userInfo = userEmailMap.get(sandwichData.authorEmail.toLowerCase());
          if (!userInfo) {
            logger.warn(
              `Skipping sandwich "${sandwichData.name}": author email "${sandwichData.authorEmail}" not found`,
            );
            skipped++;
            continue;
          }

          authorId = userInfo.id;
          authorName = userInfo.name;
          // Fetch the full user document to get createdAt
          authorUser = await User.findById(authorId);
          if (!authorUser) {
            logger.warn(`Skipping sandwich "${sandwichData.name}": author user not found`);
            skipped++;
            continue;
          }
        }

        // Generate a random creation date after the author's registration date
        const authorCreatedAt = authorUser.createdAt || new Date();
        const sandwichCreatedAt = getRandomDateAfter(authorCreatedAt);
        const sandwichUpdatedAt = sandwichCreatedAt;

        // Check if sandwich already exists (by name and authorId)
        const existingSandwich = await Sandwich.findOne({ name: sandwichData.name, authorId: authorId });

        if (existingSandwich) {
          // Update existing sandwich
          const firstName = authorName && authorName.split(' ')[0];

          // Update sandwich fields
          existingSandwich.set({
            ingredients: resolvedIngredients,
            authorName: firstName,
            comment: sandwichData.comment || undefined,
            votesCount: sandwichData.votesCount ?? existingSandwich.votesCount,
            createdAt: sandwichCreatedAt,
            updatedAt: sandwichUpdatedAt,
          });

          // Regenerate image if ingredients changed
          existingSandwich.image = await generateSandwichImage(resolvedIngredients);

          // Validate and save
          await existingSandwich.validate();
          await existingSandwich.save();

          updated++;
        } else {
          // Use the service function to create the sandwich (this will generate images)
          const newSandwich = await createSandwichService({
            name: sandwichData.name,
            ingredients: resolvedIngredients,
            authorId,
            authorName,
            comment: sandwichData.comment || undefined,
            votesCount: sandwichData.votesCount || 0,
          });

          // Set the creation date after creation (since the service doesn't accept it)
          newSandwich.createdAt = sandwichCreatedAt;
          newSandwich.updatedAt = sandwichUpdatedAt;
          await newSandwich.save();

          added++;
        }
      } catch (error) {
        logger.error(`Error creating sandwich "${sandwichData.name}":`, (error as Error).message);
        failed++;

        // Check if we've exceeded the failure threshold
        if (failed > MAX_FAILURE_THRESHOLD) {
          logger.error(
            `Aborting: Too many sandwich creation failures (${failed} failures, threshold: ${MAX_FAILURE_THRESHOLD})`,
          );
          throw new Error(
            `Sandwich creation failed: ${failed} failures exceeded threshold of ${MAX_FAILURE_THRESHOLD}`,
            { cause: error },
          );
        }
      }
    }

    logger.info(
      `Upserted sandwiches: ${added} added, ${updated} updated, ${skipped} skipped, ${failed} failed (total: ${sandwichesData.length})`,
    );
  } catch (error) {
    logger.error('Error creating sandwiches:', error);
    throw error;
  }
};

const main = async (): Promise<void> => {
  try {
    await connectDB();

    await waitForConnection();

    const tuplesDataModelToProcess: Array<[Array<{ name: string; type: IngredientType }>, typeof Ingredient]> = [
      [breadData, Ingredient],
      [proteinData, Ingredient],
      [cheeseData, Ingredient],
      [toppingData, Ingredient],
      [condimentData, Ingredient],
    ];

    // Step 1: Upsert ingredients
    await Promise.all(tuplesDataModelToProcess.map(([data, Model]) => upsertIngredients({ data, Model })));

    // Step 2: Upsert users
    await upsertUsers();

    // Step 3: Create sandwiches (using API service to generate images)
    await createSandwiches();

    logger.info('All data upserted to database');
  } catch (error) {
    logger.error('Error in main execution:', error);
    throw error;
  } finally {
    await mongoose.connection.close();
    logger.info('Database connection closed');
  }
};

await main();
