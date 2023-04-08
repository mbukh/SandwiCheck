export const generateHtmlMessage = ({ user, resetURL }) => {
    return `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <h2>Password Reset Request</h2>
        <p>Hello ${user.name},<br />We received a request to reset your password. Please click the link below to reset your password:</p>
        <p><a href="${resetURL}" style="color: #4a90e2; text-decoration: none;">${resetURL}</a></p>
        <p>If you did not request this password reset, please ignore this email.</p>
    </div>`;
};

export const generateTextMessage = ({ user, resetURL }) => {
    return `
    Password Reset Request\n
    Hello ${user.name},\n
    We received a request to reset your password. Please click the link below to reset your password:\n
    ${resetURL}\n
    If you did not request this password reset, please ignore this email.
    `;
};
