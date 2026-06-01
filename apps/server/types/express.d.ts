import type { UserDocument } from '#models/UserModel.ts';

declare global {
  namespace Express {
    interface Request {
      requestId?: string;
      user?: UserDocument;
      parentUser?: UserDocument | null;
    }

    namespace Multer {
      interface File {
        extension?: string;
      }
    }
  }
}
