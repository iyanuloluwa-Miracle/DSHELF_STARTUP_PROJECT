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
    secure: process.env.EMAIL_PORT === '465', 
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

    const verificationUrl = `${BASE_URL}/api/verify-email/${verificationToken}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: user.email,
      subject: "Email Verification",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
          </div>
          <div style="padding: 20px;">
            <h2>Email Verification</h2>
            <p>Hi ${user.firstName},</p>
            <p>To continue setting up your Dshelf account, please verify your email.</p>
            <p>Verify your email address by clicking the link below:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${verificationUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Verify Email</a>
            </div>
            <p>The link will expire in 24 hours.</p>
            <p>If you did not make this request, please disregard this email.</p>
          </div>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Dshelf Team</p>
          </div>
        </div>
      `,
    };

    console.log("Sending verification email to:", user.email);
    await transporter.sendMail(mailOptions);
    console.log("Verification email sent successfully");
  } catch (error) {
    console.error("Error sending verification email:", error);
    throw new Error("Failed to send verification email");
  }
};

exports.sendResetPasswordEmail = async (user) => {
  try {
    const resetToken = require("crypto").randomBytes(32).toString("hex");

    // Update user with reset token and expiration
    user.resetPasswordToken = resetToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour from now
    await user.save();

    const resetUrl = `${BASE_URL}/reset-password/${resetToken}`;

    const mailOptions = {
      from: EMAIL_USER,
      to: user.email,
      subject: "Password Reset",
      html: `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <div style="background-color: #f4f4f4; padding: 20px; text-align: center;">
           
          </div>
          <div style="padding: 20px;">
            <h2>Password Reset</h2>
            <p>Hello,</p>
            <p>We've received a request to reset the password for the Dshelf account associated with ${user.email}.</p>
            <p>You can reset your password by clicking the link below:</p>
            <div style="text-align: center; margin: 20px 0;">
              <a href="${resetUrl}" style="background-color: #007bff; color: white; padding: 10px 20px; text-decoration: none; border-radius: 5px;">Reset Your Password</a>
            </div>
            <p>The link will expire in 1 hour.</p>
            <p>If you did not request a password reset, please let us know immediately by replying to this mail.</p>
          </div>
          <div style="background-color: #f4f4f4; padding: 10px; text-align: center; font-size: 12px;">
            <p>© ${new Date().getFullYear()} Dshelf Team</p>
          </div>
        </div>
      `,
    };

    console.log("Sending reset password email to:", user.email);
    await transporter.sendMail(mailOptions);
    console.log("Reset password email sent successfully");
  } catch (error) {
    console.error("Error sending reset password email:", error);
    throw new Error("Failed to send reset password email");
  }
};