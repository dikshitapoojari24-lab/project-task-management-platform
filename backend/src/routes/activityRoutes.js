const express = require("express");
const { query, validationResult } = require("express-validator");

const Activity = require("../models/Activity");
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
  GET /api/activity

  Returns recent activity for the
  currently logged-in user.
*/
router.get(
  "/",
  protect,
  [
    query("limit")
      .optional()
      .isInt({ min: 1, max: 50 })
      .withMessage("Limit must be between 1 and 50"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const limit = Number(req.query.limit) || 20;

      const activities = await Activity.find({
        user: req.user._id,
      })
        .populate("user", "name email")
        .sort({ createdAt: -1 })
        .limit(limit);

      return res.status(200).json({
        success: true,
        count: activities.length,
        activities,
      });
    } catch (error) {
      console.error("Get activity error:", error);

      return res.status(500).json({
        message: "Unable to load activity.",
      });
    }
  }
);

module.exports = router;