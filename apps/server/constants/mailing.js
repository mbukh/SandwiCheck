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

export const generateChildActivationHtml = ({ childName, parentName, confirmationURL, resetURL }) => {
  const inviterName = parentName || 'Your parent';
  const inviterReference = parentName || 'your parent';

  return `
    <div style="font-family: Arial, sans-serif; font-size: 16px; color: #333;">
        <h2>Welcome to SandwiCheck!</h2>
        <p>Hi ${childName},</p>
        <p>${inviterName} has created a SandwiCheck account for you so you can plan your perfect sandwiches together.</p>
        <p style="margin-top: 24px;"><strong>Step 1: Confirm your email</strong></p>
        <p><a href="${confirmationURL}" style="color: #e6127d; text-decoration: none;">Confirm my email address</a></p>
        <p style="margin-top: 24px;"><strong>Step 2: Choose your password</strong></p>
        <p><a href="${resetURL}" style="color: #4a90e2; text-decoration: none;">Set my SandwiCheck password</a></p>
        <p>If you weren't expecting this invitation, please let ${inviterReference} know or ignore this email.</p>
        <p>See you soon,<br/>The SandwiCheck crew</p>
    </div>`;
};

export const generateChildActivationText = ({ childName, parentName, confirmationURL, resetURL }) => {
  const inviterName = parentName || 'Your parent';
  const inviterReference = parentName || 'your parent';

  return `
Welcome to SandwiCheck, ${childName}!

${inviterName} has created a SandwiCheck account for you so you can plan your perfect sandwiches together.

Step 1: Confirm your email:
${confirmationURL}

Step 2: Choose your password:
${resetURL}

If you weren't expecting this invitation, please let ${inviterReference} know or ignore this email.

See you soon,
The SandwiCheck crew
  `;
};
