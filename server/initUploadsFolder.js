import path from "path";
import fs from "fs/promises";

import {
    uploadsDir,
    profilePicturesDir,
    ingredientsDir,
    sandwichesDir,
} from "./config/dir.js";

const folders = [uploadsDir, profilePicturesDir, ingredientsDir, sandwichesDir];

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
    const indexPath = path.join(folderPath, "index.html");
    await fs.writeFile(indexPath, "");
}

Promise.all(folders.map((folder) => ensureDirectory(folder)));
