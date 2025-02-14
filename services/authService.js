const User = require('../models/User');
const bcrypt = require('bcryptjs');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const { JWT_SECRET } = require('../config/env');
const { sendVerificationEmail, sendResetPasswordEmail } = require('../utils/emailSender');

const createUser = async (userData) => {
    const { password, confirm_password, ...otherData } = userData;

    if (password !== confirm_password) {
        throw new Error('Passwords do not match');
    }

    const existingUser = await User.findOne({ email: userData.email });
    if (existingUser) {
        throw new Error('User already exists');
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = new User({
        ...otherData,
        password: hashedPassword,
        confirm_password: hashedPassword
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

    // Set token expiration to 24 hours
    const tokenExpiration = Math.floor(Date.now() / 1000) + (24 * 60 * 60);
    
    const token = jwt.sign(
        { 
            userId: user._id, 
            email: user.email,
            exp: tokenExpiration 
        },
        JWT_SECRET
    );

    return { 
        user: {
            id: user._id,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            country: user.country,
            city: user.city
        }, 
        token,
        expiresIn: tokenExpiration
    };
};

const initiatePasswordReset = async (email) => {
    const user = await User.findOne({ email });
    if (!user) {
        throw new Error('User not found');
    }

    // Generate plain token for email
    const plainToken = crypto.randomBytes(32).toString('hex');
    console.log('Generated plain token:', plainToken);
    
    // Hash token for storage
    const hashedToken = crypto
        .createHash('sha256')
        .update(plainToken)
        .digest('hex');
    console.log('Hashed token for storage:', hashedToken);

    // Save the hashed version in database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // Log the user's reset token details after saving
    console.log('Saved user reset token details:', {
        hashedToken: user.resetPasswordToken,
        expires: user.resetPasswordExpires,
        currentTime: Date.now()
    });
    
    // Send the plain token in the email
    await sendResetPasswordEmail(user.email, plainToken);
    return true;
};
const resetPassword = async (token, newPassword, confirm_password) => {
    console.log('Received token:', token);
    
    if (!token) {
        throw new Error('No token provided');
    }

    if (newPassword !== confirm_password) {
        throw new Error('Passwords do not match');
    }

    // Hash the received token for comparison
    const hashedToken = crypto
        .createHash('sha256')
        .update(token)
        .digest('hex');
    console.log('Hashed received token:', hashedToken);

    // Find user with matching token
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    console.log('Found user:', user ? 'Yes' : 'No');
    if (user) {
        console.log('Token expiry:', user.resetPasswordExpires);
        console.log('Current time:', Date.now());
    }

    if (!user) {
        throw new Error('Invalid or expired token');
    }

    // Update password
    user.password = await bcrypt.hash(newPassword, 12);
    user.confirm_password = user.password;
    user.resetPasswordToken = undefined;
    user.resetPasswordExpires = undefined;
    await user.save();
    return true;
};


const verifyEmail = async (token) => {
    const user = await User.findOne({ verificationToken: token });
    if (!user) {
        throw new Error('Invalid verification token');
    }

    if (user.isVerified) {
        throw new Error('Email already verified');
    }

    user.isVerified = true;
    user.verificationToken = undefined; // Clear the verification token
    await user.save();
    return {
        success: true,
        message: 'Email verified successfully'
    };
};


module.exports = {
    createUser,
    loginUser,
    initiatePasswordReset,
    resetPassword,
    verifyEmail
};
