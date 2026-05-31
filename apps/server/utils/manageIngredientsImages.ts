import type { NextFunction } from 'express';
import createHttpError from 'http-errors';
import sharp from 'sharp';
import { INGREDIENTS_DIR } from '#config/dir.ts';
import { ALL_IMAGE_FIELDS, imageFieldsByType } from '#constants/ingredientsConstants.ts';
import { removeFilesInPath, saveBufferToFile } from '#utils/fileUtils.ts';
import logger from './logger.ts';

type ReqFiles = Record<string, Express.Multer.File[]>;
type ImageField = { fieldName: string; title: string; suffix: string };

export const removeAllIngredientImagesByImageBase = async (filenameBase: string): Promise<void> => {
  const allPossibleFiles = ALL_IMAGE_FIELDS.map(
    ({ suffix }) => `${filenameBase}${suffix}.${process.env.INGREDIENTS_IMAGE_EXTENSION}`,
  );

  await removeFilesInPath(INGREDIENTS_DIR, allPossibleFiles);
};

export const saveIngredientImages = async ({
  reqFiles,
  type,
  areAllFieldsRequired,
  filenameBase,
  next,
}: {
  reqFiles: ReqFiles;
  type: string;
  areAllFieldsRequired: boolean;
  filenameBase: string;
  next: NextFunction;
}): Promise<string[] | undefined> => {
  const requiredFields = areAllFieldsRequired ? imageFieldsByType(type) : getUploadedImageFieldsByType(reqFiles, type);

  try {
    await validateReqFiles(reqFiles, requiredFields);

    const savedFileNames = await saveFiles(reqFiles, requiredFields, filenameBase);

    return savedFileNames;
  } catch (error) {
    if (error instanceof createHttpError.HttpError) {
      next(error);
    } else {
      logger.error('Error saving file on server:', error);

      await removeAllIngredientImagesByImageBase(filenameBase);

      next(error);
    }

    return;
  }
};

// === UTILS === //

export function getUploadedImageFieldsByType(reqFiles: ReqFiles, type: string): ImageField[] {
  const imageFields = imageFieldsByType(type);
  return imageFields.filter((imageField) => Object.prototype.hasOwnProperty.call(reqFiles, imageField.fieldName));
}

async function validateReqFiles(reqFiles: ReqFiles, requiredFields: ImageField[]): Promise<void> {
  for (const { fieldName, title } of requiredFields) {
    const file = reqFiles[fieldName] && reqFiles[fieldName][0];

    if (!file) {
      throw new createHttpError.BadRequest(`All images are required. Check image for ${title}`);
    }

    const { buffer, extension } = file;

    if (extension !== 'png' || !(await hasTransparency(buffer))) {
      throw new createHttpError.BadRequest(`Only transparent PNG files are allowed. Check image for ${title}`);
    }
  }
}

async function hasTransparency(pngFileBuffer: Buffer): Promise<boolean> {
  try {
    const metadata = await sharp(pngFileBuffer).metadata();
    return metadata.channels === 4;
  } catch (error) {
    logger.error('Error checking transparency:', error);
    return false;
  }
}

async function saveFiles(reqFiles: ReqFiles, requiredFields: ImageField[], filenameBase: string): Promise<string[]> {
  const savedFileNames = await Promise.all(
    requiredFields.map(async ({ fieldName, suffix }) => {
      const file = reqFiles[fieldName]?.[0];

      if (!file) {
        throw new Error('Save error');
      }

      const { buffer } = file;
      const fileName = `${filenameBase}${suffix}.${process.env.INGREDIENTS_IMAGE_EXTENSION}`;
      const result = await saveBufferToFile(buffer, INGREDIENTS_DIR, fileName);

      if (!result) {
        throw new Error('Save error');
      }

      return fileName;
    }),
  );

  return savedFileNames;
}
