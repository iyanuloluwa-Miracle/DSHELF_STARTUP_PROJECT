const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET } = require('../config/env');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/emailSender');

const createUser = async (userData) => {
    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(userData.password, 12);
    const user = new User({
        ...userData,
        password: hashedPassword
    });

    await user.save();
    await sendVerificationEmail(user);
    return user;
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('Invalid credentials');
    }

    if (!user.isVerified) {
        throw new Error('Email not verified');
    }

    const isValidPassword = await bcrypt.compare(password, user.password);
    if (!isValidPassword) {
        throw new Error('Invalid credentials');
    }

    const token = jwt.sign(
        { userId: user._id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { user, token };
};

const initiatePasswordReset = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    user.resetPasswordExpires = Date.now() + 3600000;
    
    await user.save();
    await sendResetPasswordEmail(email, resetToken);
    return true;
};

const resetPassword = async (token, newPassword) => {
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        throw new Error('Invalid or expired token');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return true;
};

const verifyEmail = async (token) => {
    const user = await User.findById(token);
    if (!user) {
        throw new Error('Invalid verification token');
    }

    if (user.isVerified) {
        throw new Error('Email already verified');
    }

    user.isVerified = true;
    await user.save();
    return true;
};

module.exports = {
    createUser,
    loginUser,
    initiatePasswordReset,
    resetPassword,
    verifyEmail
};