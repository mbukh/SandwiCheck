import fs from 'node:fs/promises';
import path from 'node:path';
import logger from './logger.js';

export const saveBufferToFile = async (buffer, folder, fileName) => {
  if (!folder || !fileName || !buffer) return;

  const destinationPath = path.join(folder, fileName);

  try {
    await fs.writeFile(destinationPath, buffer);
    return fileName;
  } catch (error) {
    logger.error('Error saving file', {
      error: error,
      fileName,
      folder,
    });
    return;
  }
};

export const removeFile = async (folderPath, fileName) => {
  if (!folderPath || !fileName) return;

  const filePath = fileName ? path.join(folderPath, fileName) : folderPath;

  try {
    const fileStats = await fs.stat(filePath);

    if (fileStats.isFile()) {
      await fs.unlink(filePath);

      return fileName;
    }
  } catch {
    return;
  }
};

export const removeFilesInPath = async (folderPath, fileNames) => {
  await Promise.allSettled(fileNames.map(async (fileName) => await removeFile(folderPath, fileName)));
};

export const getTimeBasedFilename = () => {
  const now = new Date();

  const year = now.getFullYear();
  const month = `${now.getMonth() + 1}`.padStart(2, '0');
  const day = `${now.getDate()}`.padStart(2, '0');

  const hours = `${now.getHours()}`.padStart(2, '0');
  const minutes = `${now.getMinutes()}`.padStart(2, '0');
  const seconds = `${now.getSeconds()}`.padStart(2, '0');

  const dateTime = `${year}${month}${day}_${hours}${minutes}${seconds}`;

  return dateTime;
};
