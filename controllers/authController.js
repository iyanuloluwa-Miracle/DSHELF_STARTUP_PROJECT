const authService = require('../services/authService');

const signup = async (req, res) => {
    try {
        const user = await authService.createUser(req.body);
        res.status(201).json({
            message: 'User registered successfully. Please verify your email.'
        });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const login = async (req, res) => {
    try {
        const { email, password } = req.body;
        const { user, token } = await authService.loginUser(email, password);
        
        res.cookie('token', token, {
            httpOnly: true,
            secure: process.env.NODE_ENV === 'production',
            maxAge: 24 * 60 * 60 * 1000
        });

        res.json({
            message: 'Login successful',
            user: {
                id: user._id,
                firstName: user.firstName,
                lastName: user.lastName,
                email: user.email,
                country: user.country,
                city: user.city
            },
            token
        });
    } catch (error) {
        res.status(401).json({ message: error.message });
    }
};

const logout = (req, res) => {
    res.clearCookie('token');
    res.json({ message: 'Logout successful' });
};

const forgotPassword = async (req, res) => {
    try {
        await authService.initiatePasswordReset(req.body.email);
        res.json({ message: 'Password reset email sent successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const resetPassword = async (req, res) => {
    try {
        const { token, newPassword } = req.body;
        await authService.resetPassword(token, newPassword);
        res.json({ message: 'Password reset successful' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};

const verifyEmail = async (req, res) => {
    try {
        await authService.verifyEmail(req.params.token);
        res.json({ message: 'Email verified successfully' });
    } catch (error) {
        res.status(400).json({ message: error.message });
    }
};


module.exports ={
    signup,
    login,
    logout,
    forgotPassword,
    resetPassword,
    verifyEmail
}