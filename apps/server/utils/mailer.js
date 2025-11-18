import nodemailer from 'nodemailer';

const mailPort = Number(process.env.MAIL_PORT) || 587;
const mailHost = process.env.MAIL_HOST || 'localhost';
const isSecure = mailPort === 465;
const isTLS = mailPort === 587;

const sendEmail = async (options) => {
  // Build transport config - auth only if username is provided (for Resend.com)
  // Mailpit doesn't require authentication
  const transportConfig = { host: mailHost, port: mailPort, secure: isSecure && !isTLS, requireTLS: isTLS };

  // Add auth only if MAIL_USERNAME is provided (e.g., for Resend.com)
  if (process.env.MAIL_USERNAME) {
    transportConfig.auth = { user: process.env.MAIL_USERNAME, pass: process.env.MAIL_PASSWORD || '' };
  }

  const transporter = nodemailer.createTransport(transportConfig);

  const mailOptions = {
    from: process.env.EMAIL_FROM,
    to: options.to,
    subject: options.subject,
    text: options.text,
    html: options.html,
  };

  await transporter.sendMail(mailOptions);
};

export default sendEmail;
