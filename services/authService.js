const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET } = require('../config/env');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/emailSender');
const { Op } = require('sequelize');

const createUser = async (userData) => {
    const { password, confirm_password, ...otherData } = userData;

    if (password !== confirm_password) {
        throw new Error('Passwords do not match');
    }

    const existingUser = await User.findOne({ 
        where: { email: userData.email } 
    });
    
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await User.create({
        ...otherData,
        password: hashedPassword,
        confirm_password: hashedPassword
    });

    await sendVerificationEmail(user);
    return user;
};

const loginUser = async (email, password) => {
    const user = await User.findOne({ 
        where: { email } 
    });

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
        { userId: user.id, email: user.email },
        JWT_SECRET,
        { expiresIn: '24h' }
    );

    return { 
        user: {
            id: user.id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            country: user.country,
            city: user.city
        }, 
        token 
    };
};

const initiatePasswordReset = async (email) => {
    const user = await User.findOne({ 
        where: { email } 
    });

    if (!user) {
        throw new Error('User not found');
    }

    const resetToken = crypto.randomBytes(32).toString('hex');
    user.resetPasswordToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');
    user.resetPasswordExpires = new Date(Date.now() + 3600000); // 1 hour
    
    await user.save();
    await sendResetPasswordEmail(email, resetToken);
    return true;
};

const resetPassword = async (token, newPassword, confirm_password) => {
    if (newPassword !== confirm_password) {
        throw new Error('Passwords do not match');
    }

    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');

    const user = await User.findOne({
        where: {
            resetPasswordToken: hashedToken,
            resetPasswordExpires: {
                [Op.gt]: new Date()
            }
        }
    });

    if (!user) {
        throw new Error('Invalid or expired token');
    }

    user.password = await bcrypt.hash(newPassword, 12);
    user.confirm_password = user.password;
    user.resetPasswordToken = null;
    user.resetPasswordExpires = null;
    await user.save();
    return true;
};

const verifyEmail = async (token) => {
    const user = await User.findByPk(token);
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