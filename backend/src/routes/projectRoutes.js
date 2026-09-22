const express = require("express");
const { body, param, validationResult } = require("express-validator");

const Project = require("../models/Project");
const Task = require("../models/Task");
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
  GET /api/projects

  Returns all projects owned by the
  currently logged-in user.
*/
router.get("/", protect, async (req, res) => {
  try {
    const projects = await Project.find({
      owner: req.user._id,
    }).sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: projects.length,
      projects,
    });
  } catch (error) {
    console.error("Get projects error:", error);

    return res.status(500).json({
      message: "Unable to load projects.",
    });
  }
});

/*
  GET /api/projects/:id

  Returns one project with its tasks.

  A user can view the project if:
  1. They own the project, or
  2. They are assigned to a task in that project.
*/
router.get(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid project ID")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const project = await Project.findById(req.params.id);

      if (!project) {
        return res.status(404).json({
          message: "Project not found.",
        });
      }

      const userId = req.user._id.toString();

      const isProjectOwner =
        project.owner.toString() === userId;

      const hasAssignedTask = await Task.exists({
        project: project._id,
        assignee: req.user._id,
      });

      if (!isProjectOwner && !hasAssignedTask) {
        return res.status(403).json({
          message: "You do not have access to this project.",
        });
      }

      const tasks = await Task.find({
        project: project._id,
      })
        .populate("assignee", "name email")
        .populate("owner", "name email")
        .sort({ createdAt: -1 });

      return res.status(200).json({
        success: true,
        project,
        tasks,
      });
    } catch (error) {
      console.error("Get project error:", error);

      return res.status(500).json({
        message: "Unable to load the project.",
      });
    }
  }
);

/*
  POST /api/projects

  Creates a new project.
*/
router.post(
  "/",
  protect,
  [
    body("name")
      .trim()
      .notEmpty()
      .withMessage("Project name is required")
      .isLength({ max: 150 })
      .withMessage("Project name cannot exceed 150 characters"),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description cannot exceed 1000 characters"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const { name, description } = req.body;

      const project = await Project.create({
        name,
        description: description || "",
        owner: req.user._id,
      });

      await Activity.create({
        user: req.user._id,
        action: "created",
        entityType: "project",
        entityId: project._id,
        message: `Created project "${project.name}".`,
      });

      return res.status(201).json({
        success: true,
        message: "Project created successfully.",
        project,
      });
    } catch (error) {
      console.error("Create project error:", error);

      return res.status(500).json({
        message: "Unable to create the project.",
      });
    }
  }
);

/*
  PUT /api/projects/:id

  Update project name/description.
*/
router.put(
  "/:id",
  protect,
  [
    param("id").isMongoId().withMessage("Invalid project ID"),

    body("name")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Project name cannot be empty")
      .isLength({ max: 150 })
      .withMessage("Project name cannot exceed 150 characters"),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage("Description cannot exceed 1000 characters"),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });

      if (!project) {
        return res.status(404).json({
          message: "Project not found.",
        });
      }

      if (req.body.name !== undefined) {
        project.name = req.body.name;
      }

      if (req.body.description !== undefined) {
        project.description = req.body.description;
      }

      await project.save();

      await Activity.create({
        user: req.user._id,
        action: "updated",
        entityType: "project",
        entityId: project._id,
        message: `Updated project "${project.name}".`,
      });

      return res.status(200).json({
        success: true,
        message: "Project updated successfully.",
        project,
      });
    } catch (error) {
      console.error("Update project error:", error);

      return res.status(500).json({
        message: "Unable to update the project.",
      });
    }
  }
);

/*
  DELETE /api/projects/:id

  Deletes the project and all tasks
  belonging to that project.
*/
router.delete(
  "/:id",
  protect,
  [param("id").isMongoId().withMessage("Invalid project ID")],
  handleValidationErrors,
  async (req, res) => {
    try {
      const project = await Project.findOne({
        _id: req.params.id,
        owner: req.user._id,
      });

      if (!project) {
        return res.status(404).json({
          message: "Project not found.",
        });
      }

      await Activity.create({
        user: req.user._id,
        action: "deleted",
        entityType: "project",
        entityId: project._id,
        message: `Deleted project "${project.name}".`,
      });

      await Task.deleteMany({
        project: project._id,
      });

      await Project.deleteOne({
        _id: project._id,
      });

      return res.status(200).json({
        success: true,
        message: "Project and its tasks deleted successfully.",
      });
    } catch (error) {
      console.error("Delete project error:", error);

      return res.status(500).json({
        message: "Unable to delete the project.",
      });
    }
  }
);

module.exports = router;