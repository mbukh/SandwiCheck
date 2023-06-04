import { Request } from "express";
import User from "../user/user.interface.ts";

interface RequestWithUser extends Request {
    user: User;
    parentUser?: User;
}

export default RequestWithUser;
