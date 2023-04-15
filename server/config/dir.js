import { fileURLToPath } from "url";
import path from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const configDir = path.join(__dirname);

export const clientDir = path.join(__dirname, "..", "..", "client", "build");

export const uploadsDir = path.join(__dirname, "..", "uploads");

export const profilePicturesDir = path.join(uploadsDir, "profile-pictures");
export const ingredientsDir = path.join(uploadsDir, "ingredients");
export const sandwichesDir = path.join(uploadsDir, "sandwiches");
