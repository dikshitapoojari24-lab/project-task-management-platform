const express = require("express");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");
const protect = require("../middleware/authMiddleware");

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      message: "Validation failed",
      errors: errors.array(),
    });
  }

  next();
};

/*
  GET /api/users/me

  Returns the currently logged-in user's profile.
*/
router.get("/me", protect, async (req, res) => {
  try {
    const user = await User.findById(req.user._id).select(
      "-password"
    );

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    console.error("Get current user error:", error);

    return res.status(500).json({
      message: "Unable to load your profile.",
    });
  }
});

/*
  GET /api/users

  Returns users that can be assigned to tasks.

  Only basic public profile information is returned.
*/
router.get("/", protect, async (req, res) => {
  try {
    const users = await User.find()
      .select("name email")
      .sort({ name: 1 });

    return res.status(200).json({
      success: true,
      count: users.length,
      users,
    });
  } catch (error) {
    console.error("Get users error:", error);

    return res.status(500).json({
      message: "Unable to load users.",
    });
  }
});

/*
  PUT /api/users/me

  Update the logged-in user's name/email.
*/
router.put(
  "/me",
  protect,
  [
    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Name cannot be empty")
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters"),

    body("email")
      .optional()
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const user = await User.findById(req.user._id);

      if (!user) {
        return res.status(404).json({
          message: "User not found.",
        });
      }

      if (req.body.name !== undefined) {
        user.name = req.body.name;
      }

      if (req.body.email !== undefined) {
        const emailExists = await User.findOne({
          email: req.body.email.toLowerCase(),
          _id: { $ne: req.user._id },
        });

        if (emailExists) {
          return res.status(409).json({
            message: "An account with this email already exists.",
          });
        }

        user.email = req.body.email.toLowerCase();
      }

      await user.save();

      return res.status(200).json({
        success: true,
        message: "Profile updated successfully.",
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("Update user error:", error);

      return res.status(500).json({
        message: "Unable to update your profile.",
      });
    }
  }
);

/*
  DELETE /api/users/me

  Deletes the logged-in user's account.
*/
router.delete("/me", protect, async (req, res) => {
  try {
    const user = await User.findByIdAndDelete(req.user._id);

    if (!user) {
      return res.status(404).json({
        message: "User not found.",
      });
    }

    return res.status(200).json({
      success: true,
      message: "Account deleted successfully.",
    });
  } catch (error) {
    console.error("Delete user error:", error);

    return res.status(500).json({
      message: "Unable to delete your account.",
    });
  }
});

module.exports = router;