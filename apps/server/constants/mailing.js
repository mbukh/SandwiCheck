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

export const generateEmailConfirmationHtml = ({ user, confirmationURL }) => {
  return `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <h2>Email Confirmation</h2>
        <p>Hello ${user.name},<br />Thank you for signing up! Please confirm your email address by clicking the link below:</p>
        <p><a href="${confirmationURL}" style="color: #4a90e2; text-decoration: none;">${confirmationURL}</a></p>
        <p>If you did not create an account, please ignore this email.</p>
    </div>`;
};

export const generateEmailConfirmationText = ({ user, confirmationURL }) => {
  return `
    Email Confirmation\n
    Hello ${user.name},\n
    Thank you for signing up! Please confirm your email address by clicking the link below:\n
    ${confirmationURL}\n
    If you did not create an account, please ignore this email.
    `;
};
