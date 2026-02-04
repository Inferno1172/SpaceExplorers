const nodemailer = require("nodemailer");

// ==================================================
// CONFIGURE EMAIL TRANSPORTER (GMAIL)
// ==================================================
const transporter = nodemailer.createTransport({
  service: "gmail",
  auth: {
    user: process.env.EMAIL_USER,       // Gmail address from environment
    pass: process.env.EMAIL_PASSWORD,   // Gmail app password from environment
  },
});

// ==================================================
// SEND PASSWORD RESET EMAIL
// ==================================================
module.exports.sendPasswordResetEmail = (email, resetToken, callback) => {
  // Construct reset link for frontend
  const resetUrl = `http://localhost:3000/users/reset-password?token=${resetToken}`;

  // Define email content
  const mailOptions = {
    from: process.env.EMAIL_USER,      // Sender address
    to: email,                         // Recipient
    subject: "Password Reset Request", // Email subject line
    html: `
      <h2>Password Reset Request</h2>
      <p>You requested a password reset. Click the link below to reset your password:</p>
      <a href="${resetUrl}">${resetUrl}</a>
      <p>This link will expire in 1 hour.</p>
      <p>If you didn't request this, please ignore this email.</p>
    `,
  };

  // Send email using callback
  transporter.sendMail(mailOptions, callback);
};