import { fileURLToPath } from 'url';
import path from 'path';
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const CONFIG_DIR = path.join(__dirname);

export const CLIENT_DIR = path.join(__dirname, '..', '..', 'client', 'build');

export const UPLOADS_DIR = path.join(__dirname, '..', 'uploads');

export const PROFILE_PICTURES_DIR = path.join(UPLOADS_DIR, 'profile-pictures');
export const INGREDIENTS_DIR = path.join(UPLOADS_DIR, 'ingredients');
export const SANDWICHES_DIR = path.join(UPLOADS_DIR, 'sandwiches');
