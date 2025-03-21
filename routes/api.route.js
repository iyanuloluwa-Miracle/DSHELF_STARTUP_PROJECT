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
} = require("../controllers/authController");

// Health check
router.get("/", (req, res) => res.send({ message: "Welcome To DSHELF API" }));

// Auth Routes
router.post("/auth/signup", signupValidator, validateRequest, signup);
router.post("/auth/login", loginValidator, validateRequest, login);
router.post(
  "/auth/forgot-password",
  forgotPasswordValidator,
  validateRequest,
  forgotPassword
);
router.post(
  "/auth/reset-password",
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

// router.post('/auth/logout', authenticate, logoutValidator, validateRequest, logout);
router.get("/auth/verify-email/:token", verifyEmail);

module.exports = router;
