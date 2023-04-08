import path from "path";
import fs from "fs/promises";

const saveImageFromBuffer = async (buffer, folder, fileName) => {
    const destinationPath = path.join(folder, fileName);
    await fs.writeFile(destinationPath, buffer);

    return fileName;
};

export default saveImageFromBuffer;
