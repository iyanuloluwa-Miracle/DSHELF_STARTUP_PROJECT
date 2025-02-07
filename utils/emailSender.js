// utils/emailSender.js
const nodemailer = require("nodemailer");
const {
  EMAIL_HOST,
  EMAIL_PORT,
  EMAIL_USER,
  EMAIL_PASSWORD,
  BASE_URL,
} = require("../config/env");

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: false, 
    auth: {
      user: EMAIL_USER,
      pass: EMAIL_PASSWORD  
    },
    tls: {
      rejectUnauthorized: false
    }
});
// Verify email configuration on startup
transporter.verify(function (error, success) {
  if (error) {
    console.error("Email configuration error:", error);
  } else {
    console.log("Email server is ready to send messages");
  }
});
exports.sendVerificationEmail = async (user) => {
  try {
    const verificationToken = require("crypto").randomBytes(32).toString("hex");

    // Update user with verification token
    user.verificationToken = verificationToken;
    await user.save();

    const verificationUrl = `${BASE_URL}/verify-email/${verificationToken}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: user.email,
      subject: "Verify Your Email",
      html: `
                <h1>Email Verification</h1>
                <p>Hi ${user.firstName},</p>
                <p>Please click the link below to verify your email address:</p>
                <a href="${verificationUrl}">Verify Email</a>
                <p>This link will expire in 24 hours.</p>
            `,
    };

    console.log("Sending email to:", user.email);
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};
exports.sendResetPasswordEmail = async (email, token) => {
  const resetUrl = `${BASE_URL}/reset-password/${token}`;

  const mailOptions = {
    from: EMAIL_USER,
    to: email,
    subject: "Password Reset Request",
    html: `
            <h1>Password Reset</h1>
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `,
  };

  await transporter.sendMail(mailOptions);
};
