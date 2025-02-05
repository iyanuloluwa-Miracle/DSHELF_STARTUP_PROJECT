const router = require('express').Router();
const { authenticate } = require('../middlewares/authMiddleware');
const { 
  signupValidator, 
  resetPasswordValidator 
} = require('../validators/authValidator');
const { validationResult } = require('express-validator');

// Validation middleware
const validateRequest = (req, res, next) => {
  const errors = validationResult(req);
  if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
  }
  next();
};

router.get('/', async (req, res, next) => {
  res.send({ message: 'Ok api is working 🚀' });
});

// Route definitions
router.post('/signup', signupValidator, validateRequest, signup);
router.post('/login', login);
router.post('/logout', authenticate, logout);
router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPasswordValidator, validateRequest, resetPassword);
router.get('/verify-email/:token', verifyEmail);

module.exports = router;
