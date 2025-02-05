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
const { 
  signup, 
  login, 
  logout, 
  forgotPassword, 
  resetPassword, 
  verifyEmail 
} = require('../controllers/authController');

// Health check
router.get('/', (req, res) => res.send({ message: 'Welcome To DSHELF API' }));

// Auth Routes
router.post('/signup', signupValidator, validateRequest, signup);
router.post('/login', loginValidator, validateRequest, login);
router.post('/forgot-password', forgotPasswordValidator, validateRequest, forgotPassword);
router.post('/reset-password', resetPasswordValidator, validateRequest, resetPassword);
router.post('/logout', authenticate, logoutValidator, validateRequest, logout);
router.get('/verify-email/:token', verifyEmail);


module.exports = router;
