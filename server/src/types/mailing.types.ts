import User from "../user/user.interface.ts";

interface EmailGeneratorProps {
    userName: string;
    resetURL: string;
}

export interface EmailOptions {
    to: string;
    subject: string;
    html: string;
    text: string;
}

export default EmailGeneratorProps;
