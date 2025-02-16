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
        throw new Error('Email not verified. Please verify your email to login.');
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
            firstName: user.firstName,
            lastName: user.lastName,
            exp: tokenExpiration
        },
        JWT_SECRET
    );

    // Return user data without sensitive information
    const userData = {
        id: user._id,
        firstName: user.firstName,
        lastName: user.lastName,
        email: user.email,
        country: user.country,
        city: user.city,
        isVerified: user.isVerified
    };

    return { 
        user: userData,
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
    const resetToken = crypto.randomBytes(32).toString('hex');
    
    // Hash token before saving to database
    const hashedToken = crypto
        .createHash('sha256')
        .update(resetToken)
        .digest('hex');

    // Save the hashed version in database
    user.resetPasswordToken = hashedToken;
    user.resetPasswordExpires = Date.now() + 3600000; // 1 hour
    
    await user.save();
    
    // Log for debugging
    console.log('Token details:', {
        plainToken: resetToken,
        hashedTokenInDB: hashedToken,
        expires: user.resetPasswordExpires
    });
    
    // Send the plain token in the email
    await sendResetPasswordEmail(user.email, resetToken);
    return true;
};

const resetPassword = async (token, newPassword, confirm_password) => {
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

    // Log for debugging
    console.log('Reset attempt:', {
        receivedToken: token,
        hashedReceivedToken: hashedToken
    });

    // Find user with matching token that hasn't expired
    const user = await User.findOne({
        resetPasswordToken: hashedToken,
        resetPasswordExpires: { $gt: Date.now() }
    });

    if (!user) {
        console.log('User lookup failed:', {
            tokenMatch: false,
            currentTime: Date.now(),
            userFound: false
        });
        throw new Error('Invalid or expired password reset token');
    }

    // Update password
    const hashedPassword = await bcrypt.hash(newPassword, 12);
    user.password = hashedPassword;
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
