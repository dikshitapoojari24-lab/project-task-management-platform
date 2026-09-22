import { body } from "express-validator";

// ===============================
// CREATE TASK VALIDATOR
// ===============================
export const createTaskValidator = [
  body("title")
    .trim()
    .notEmpty()
    .withMessage("Task title is required")
    .isLength({ min: 2, max: 150 })
    .withMessage("Task title must be between 2 and 150 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Status must be todo, in-progress, or done"),

  body("projectId")
    .notEmpty()
    .withMessage("Project ID is required")
    .isMongoId()
    .withMessage("Invalid project ID")
];

// ===============================
// UPDATE TASK VALIDATOR
// ===============================
export const updateTaskValidator = [
  body("title")
    .optional()
    .trim()
    .notEmpty()
    .withMessage("Task title cannot be empty")
    .isLength({ min: 2, max: 150 })
    .withMessage("Task title must be between 2 and 150 characters"),

  body("description")
    .optional()
    .trim()
    .isLength({ max: 1000 })
    .withMessage("Description cannot exceed 1000 characters"),

  body("status")
    .optional()
    .isIn(["todo", "in-progress", "done"])
    .withMessage("Status must be todo, in-progress, or done"),

  body("projectId")
    .optional()
    .isMongoId()
    .withMessage("Invalid project ID")
];