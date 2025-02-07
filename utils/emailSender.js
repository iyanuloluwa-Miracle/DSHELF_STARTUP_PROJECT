// utils/emailSender.js
const nodemailer = require('nodemailer');
const { EMAIL_HOST, EMAIL_PORT, EMAIL_USER, EMAIL_PASS, BASE_URL } = require('../config/env');

const transporter = nodemailer.createTransport({
    host: EMAIL_HOST,
    port: EMAIL_PORT,
    secure: true,
    auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASS
    }
});

exports.sendVerificationEmail = async (user, verificationToken) => {
    const verificationUrl = `${BASE_URL}/verify-email/${verificationToken}`;

    const mailOptions = {
        from: EMAIL_USER,
        to: user.email,
        subject: 'Verify Your Email',
        html: `
            <h1>Email Verification</h1>
            <p>Hi ${user.firstName},</p>
            <p>Please click the link below to verify your email address:</p>
            <a href="${verificationUrl}">Verify Email</a>
            <p>This link will expire in 24 hours.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};
exports.sendResetPasswordEmail = async (email, token) => {
    const resetUrl = `${BASE_URL}/reset-password/${token}`;

    const mailOptions = {
        from: EMAIL_USER,
        to: email,
        subject: 'Password Reset Request',
        html: `
            <h1>Password Reset</h1>
            <p>You requested a password reset.</p>
            <p>Click the link below to reset your password:</p>
            <a href="${resetUrl}">Reset Password</a>
            <p>This link will expire in 1 hour.</p>
            <p>If you didn't request this, please ignore this email.</p>
        `
    };

    await transporter.sendMail(mailOptions);
};