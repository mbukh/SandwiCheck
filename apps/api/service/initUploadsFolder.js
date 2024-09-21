import path from 'path';
import fs from 'fs/promises';

import { UPLOADS_DIR, PROFILE_PICTURES_DIR, INGREDIENTS_DIR, SANDWICHES_DIR } from '../config/dir.js';

const folders = [UPLOADS_DIR, PROFILE_PICTURES_DIR, INGREDIENTS_DIR, SANDWICHES_DIR];

async function ensureDirectory(folderPath) {
  try {
    const stats = await fs.stat(folderPath);
    if (!stats.isDirectory()) {
      // Remove the file
      await fs.unlink(folderPath);
      throw new Error(`Folder "${folderPath}" is not a directory`);
    }
  } catch (error) {
    await fs.mkdir(folderPath, { recursive: true });
  }

  // Create an index.html file in the folder
  const indexPath = path.join(folderPath, 'index.html');
  await fs.writeFile(indexPath, '');
}

Promise.all(folders.map((folder) => ensureDirectory(folder)));
