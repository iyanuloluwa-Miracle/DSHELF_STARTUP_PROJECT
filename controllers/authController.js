// controllers/authController.js
const authService = require('../services/authService');
const User = require('../models/User');
const { 
    successResponse, 
    errorResponse, 
    validationErrorResponse,
    HttpStatus 
} = require('../helpers/responses');

const signup = async (req, res) => {
    try {
        const { 
            firstName, 
            lastName, 
            email, 
            password, 
            confirm_password, 
            country, 
            city 
        } = req.body;

        // Validate required fields
        if (!firstName || !lastName || !email || !password || !confirm_password || !country || !city) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                validationErrorResponse(
                    'All fields are required',
                    {
                        general: 'Please fill in all required fields'
                    }
                )
            );
        }

        const user = await authService.createUser(req.body);
        
        return res.status(HttpStatus.CREATED).json(
            successResponse(
                'User registered successfully. Please verify your email.',
                { userId: user._id }
            )
        );
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json(
            errorResponse(error.message)
        );
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;

        if (!email || !password) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                validationErrorResponse(
                    'Email and password are required',
                    {
                        general: 'Please provide both email and password'
                    }
                )
            );
        }

        const { user, token, expiresIn } = await authService.loginUser(email, password);

        return res.status(HttpStatus.OK).json(
            successResponse('Login successful', { 
                user, 
                token,
                expiresIn,
                tokenType: 'Bearer'
            })
        );
    } catch (error) {
        return res.status(HttpStatus.UNAUTHORIZED).json(
            errorResponse(error.message)
        );
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    return res.status(HttpStatus.OK).json(
        successResponse('Logout successful')
    );
};

const forgotPassword = async (req, res) => {
    try {
        const { email } = req.body;

        if (!email) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                validationErrorResponse(
                    'Email is required',
                    {
                        email: 'Please provide an email address'
                    }
                )
            );
        }

        await authService.initiatePasswordReset(email);
        return res.status(HttpStatus.OK).json(
            successResponse('Password reset email sent successfully')
        );
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json(
            errorResponse(error.message)
        );
    }
};
const resetPassword = async (req, res) => {
    try {
        const { token, newPassword, confirm_password } = req.body;

        if (!token || !newPassword || !confirm_password) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                validationErrorResponse(
                    'All fields are required',
                    {
                        general: 'Please provide token, new password and confirmation'
                    }
                )
            );
        }

        await authService.resetPassword(token, newPassword, confirm_password);
        
        // Update to use the new URL format
        return res.redirect(`${process.env.FRONTEND_URL}/auth/login/reset-password?token=${token}`);
    } catch (error) {
        return res.status(HttpStatus.BAD_REQUEST).json(
            errorResponse(error.message)
        );
    }
};





const verifyEmail = async (req, res) => {
    try {
        const { token } = req.params;

        if (!token) {
            return res.status(HttpStatus.BAD_REQUEST).json(
                validationErrorResponse(
                    'Verification token is required',
                    {
                        token: 'Please provide a verification token'
                    }
                )
            );
        }

        await authService.verifyEmail(token);
        
        // Redirect to the specific login URL you provided
        res.redirect(`${process.env.FRONTEND_URL}/auth/login?verified=true`);
    } catch (error) {
        // Redirect to login page with error
        res.redirect(`${process.env.FRONTEND_URL}/auth/login?error=${encodeURIComponent(error.message)}`);
    }
};
const getProfile = async (req, res) => {
    try {
        const user = await User.findById(req.user.userId)
            .select('-password -resetPasswordToken -resetPasswordExpires -verificationToken');
        
        if (!user) {
            return res.status(HttpStatus.NOT_FOUND).json(
                errorResponse('User not found')
            );
        }

        // Check if user is verified
        if (!user.isVerified) {
            return res.status(HttpStatus.FORBIDDEN).json(
                errorResponse('Email not verified. Please verify your email.')
            );
        }

        return res.status(HttpStatus.OK).json(
            successResponse('Profile fetched successfully', { user })
        );
    } catch (error) {
        return res.status(HttpStatus.INTERNAL_SERVER_ERROR).json(
            errorResponse(error.message)
        );
    }
};


module.exports = {
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail,
    getProfile
};