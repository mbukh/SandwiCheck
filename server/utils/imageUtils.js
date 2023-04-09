import path from "path";
import fs from "fs/promises";

export const saveImageFromBuffer = async (buffer, folder, fileName) => {
    const destinationPath = path.join(folder, fileName);
    await fs.writeFile(destinationPath, buffer);

    return fileName;
};

export const removeImage = async (folder, fileName) => {
    const destinationPath = path.join(folder, fileName);
    try {
        const stats = await fs.stat(destinationPath);
        if (stats.isFile()) {
            await fs.unlink(destinationPath);
        }
    } catch (error) {
        return;
    }
};
