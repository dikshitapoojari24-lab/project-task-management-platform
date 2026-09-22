const express = require("express");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { body, validationResult } = require("express-validator");

const User = require("../models/User");

const router = express.Router();

const handleValidationErrors = (req, res, next) => {
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(400).json({
      success: false,
      message: "Validation failed.",
      errors: errors.array(),
    });
  }

  next();
};

const generateToken = (userId) => {
  return jwt.sign(
    {
      userId,
    },
    process.env.JWT_SECRET,
    {
      expiresIn: "7d",
    }
  );
};

router.post(
  "/signup",
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Name is required.")
      .isLength({ max: 100 })
      .withMessage("Name cannot exceed 100 characters."),

    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail(),

    body("password")
      .isLength({ min: 6 })
      .withMessage("Password must be at least 6 characters long."),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, email, password } = req.body;

      console.log("Signup request received:", {
        name,
        email,
      });

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from .env");
      }

      const existingUser = await User.findOne({
        email: email.toLowerCase(),
      });

      if (existingUser) {
        return res.status(409).json({
          success: false,
          message: "An account with this email already exists.",
        });
      }

      const hashedPassword = await bcrypt.hash(password, 12);

      const user = await User.create({
        name,
        email: email.toLowerCase(),
        password: hashedPassword,
      });

      const token = generateToken(user._id);

      return res.status(201).json({
        success: true,
        message: "Account created successfully.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("SIGNUP ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to create your account.",
      });
    }
  }
);

router.post(
  "/login",
  [
    body("email")
      .trim()
      .isEmail()
      .withMessage("Please provide a valid email address.")
      .normalizeEmail(),

    body("password")
      .notEmpty()
      .withMessage("Password is required."),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { email, password } = req.body;

      console.log("Login request received:", {
        email,
      });

      if (!process.env.JWT_SECRET) {
        throw new Error("JWT_SECRET is missing from .env");
      }

      const user = await User.findOne({
        email: email.toLowerCase(),
      });

      if (!user) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const passwordMatch = await bcrypt.compare(
        password,
        user.password
      );

      if (!passwordMatch) {
        return res.status(401).json({
          success: false,
          message: "Invalid email or password.",
        });
      }

      const token = generateToken(user._id);

      return res.status(200).json({
        success: true,
        message: "Login successful.",
        token,
        user: {
          id: user._id,
          name: user.name,
          email: user.email,
        },
      });
    } catch (error) {
      console.error("LOGIN ERROR:", error);

      return res.status(500).json({
        success: false,
        message: error.message || "Unable to log in.",
      });
    }
  }
);

module.exports = router;