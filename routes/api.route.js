const router = require("express").Router();
const { authenticate } = require("../middlewares/authMiddleware");
const {
  signupValidator,
  loginValidator,
  forgotPasswordValidator,
  resetPasswordValidator,
  updateProfileValidator,
  logoutValidator,
} = require("../validators/authValidator");
const { validateRequest } = require("../middlewares/validateRequest");
const {
  signup,
  login,
  logout,
  forgotPassword,
  resetPassword,
  verifyEmail,
  getProfile,
  updateProfile,
  resendVerification,
} = require("../controllers/authController");

// Health check
router.get("/", (req, res) => res.send({ message: "Welcome To DSHELF API" }));

// Auth Routes
router.post("/signup", signupValidator, validateRequest, signup);
router.post("/login", loginValidator, validateRequest, login);
router.post(
  "/forgot-password",
  forgotPasswordValidator,
  validateRequest,
  forgotPassword
);

// Reset password routes
router.get("/reset-password/:token", (req, res) => {
  const frontendUrl = process.env.FRONTEND_URL || 'http://localhost:3000';
  res.redirect(`${frontendUrl}/auth/reset-password?token=${req.params.token}`);
});

router.post(
  "/reset-password",
  resetPasswordValidator,
  validateRequest,
  resetPassword
);

router.get("/user/profile", authenticate, getProfile);
router.patch(
  "/user/profile",
  authenticate,
  updateProfileValidator,
  updateProfile
);

// router.post('/logout', authenticate, logoutValidator, validateRequest, logout);
router.get("/verify-email/:token", verifyEmail);
router.post("/resend-verification", resendVerification);

module.exports = router;
