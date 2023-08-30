import createHttpError from "http-errors";

import sharp from "sharp";

import { INGREDIENTS_DIR } from "../config/dir.js";

import { ALL_IMAGE_FIELDS, imageFieldsByType } from "../constants/ingredientsConstants.js";

import { saveBufferToFile, removeFilesInPath } from "../utils/fileUtils.js";

export const removeAllIngredientImagesByImageBase = async (filenameBase) => {
    const allPossibleFiles = ALL_IMAGE_FIELDS.map(
        ({ suffix }) =>
            `${filenameBase}${suffix}.${process.env.INGREDIENTS_IMAGE_EXTENSION}`
    );

    await removeFilesInPath(INGREDIENTS_DIR, allPossibleFiles);
};

export const saveIngredientImages = async ({
    reqFiles,
    type,
    areAllFieldsRequired,
    filenameBase,
    next,
}) => {
    const requiredFields = areAllFieldsRequired
        ? imageFieldsByType(type)
        : getUploadedImageFieldsByType(reqFiles, type);

    try {
        await validateReqFiles(reqFiles, requiredFields);

        const savedFileNames = await saveFiles(reqFiles, requiredFields, filenameBase);

        return savedFileNames;
    } catch (error) {
        if (error instanceof createHttpError.HttpError) {
            next(error);
        } else {
            console.error("Error saving file on server:", error);

            await removeAllIngredientImagesByImageBase(filenameBase);

            next(error);
        }

        return;
    }
};

// === UTILS === //

export function getUploadedImageFieldsByType(reqFiles, type) {
    const imageFields = imageFieldsByType(type);
    return imageFields.filter((imageField) =>
        Object.prototype.hasOwnProperty.call(reqFiles, imageField.fieldName)
    );
}

async function validateReqFiles(reqFiles, requiredFields) {
    for (const { fieldName, title } of requiredFields) {
        const file = reqFiles[fieldName] && reqFiles[fieldName][0];

        if (!file) {
            throw new createHttpError.BadRequest(
                `All images are required. Check image for ${title}`
            );
        }

        const { buffer, extension } = file;

        if (extension !== "png" || !(await hasTransparency(buffer))) {
            throw new createHttpError.BadRequest(
                `Only transparent PNG files are allowed. Check image for ${title}`
            );
        }
    }
}

async function hasTransparency(pngFileBuffer) {
    try {
        const metadata = await sharp(pngFileBuffer).metadata();
        return metadata.channels === 4;
    } catch (error) {
        console.error("Error checking transparency:", error);
        return false;
    }
}

async function saveFiles(reqFiles, requiredFields, filenameBase) {
    const savedFileNames = await Promise.all(
        requiredFields.map(async ({ fieldName, suffix }) => {
            const { buffer } = reqFiles[fieldName][0];
            const fileName = `${filenameBase}${suffix}.${process.env.INGREDIENTS_IMAGE_EXTENSION}`;
            const result = await saveBufferToFile(buffer, INGREDIENTS_DIR, fileName);

            if (!result) {
                throw new Error("Save error");
            }

            return fileName;
        })
    );

    return savedFileNames;
}
