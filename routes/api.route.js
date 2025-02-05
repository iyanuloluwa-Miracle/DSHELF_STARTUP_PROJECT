const router = require('express').Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { 
  signupValidator, 
  loginValidator, 
  forgotPasswordValidator, 
  resetPasswordValidator, 
  logoutValidator 
} = require('../validators/authValidator');
const { validateRequest } = require('../middlewares/validateRequest');


// Health check
router.get('/', (req, res) => res.send({ message: 'Welcome To DSHELF API' }));

// Auth Routes
router.post('/signup', signupValidator, validateRequest, authController.signup);
router.post('/login', loginValidator, validateRequest, authController.login);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, authController.forgotPassword);
router.post('/reset-password', resetPasswordValidator, validateRequest, authController.resetPassword);
router.post('/logout', authenticate, logoutValidator, validateRequest, authController.logout);
router.get('/verify-email/:token', verifyEmail);


module.exports = router;
