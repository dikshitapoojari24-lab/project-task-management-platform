const express = require("express");
const { body, validationResult } = require("express-validator");

const Task = require("../models/Task");
const Project = require("../models/Project");
const User = require("../models/User");
const Activity = require("../models/Activity");
const protect = require("../middleware/authMiddleware");

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

const getStatusLabel = (status) => {
  if (status === "in-progress") return "In Progress";
  if (status === "done") return "Completed";
  return "To Do";
};

router.get("/", protect, async (req, res) => {
  try {
    const {
      search,
      status,
      priority,
      project,
    } = req.query;

    const userId = req.user._id;

    const userProjects = await Project.find({
      owner: userId,
    }).select("_id");

    const projectIds = userProjects.map(
      (item) => item._id
    );

    const filter = {
      $or: [
        {
          owner: userId,
        },
        {
          assignee: userId,
        },
        {
          project: {
            $in: projectIds,
          },
        },
      ],
    };

    if (status && status !== "all") {
      filter.status = status;
    }

    if (priority && priority !== "all") {
      filter.priority = priority;
    }

    if (project) {
      filter.project = project;
    }

    if (search && search.trim()) {
      const searchRegex = new RegExp(
        search.trim(),
        "i"
      );

      filter.$and = [
        {
          $or: [
            {
              title: searchRegex,
            },
            {
              description: searchRegex,
            },
          ],
        },
      ];
    }

    const tasks = await Task.find(filter)
      .populate("project", "name description owner")
      .populate("assignee", "name email")
      .populate("owner", "name email")
      .sort({ createdAt: -1 });

    return res.status(200).json({
      success: true,
      count: tasks.length,
      tasks,
    });
  } catch (error) {
    console.error("GET TASKS ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch tasks.",
    });
  }
});

router.get("/:id", protect, async (req, res) => {
  try {
    const task = await Task.findById(req.params.id)
      .populate("project", "name description owner")
      .populate("assignee", "name email")
      .populate("owner", "name email");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found.",
      });
    }

    const userId = req.user._id.toString();

    const hasAccess =
      task.owner?._id?.toString() === userId ||
      task.assignee?._id?.toString() === userId ||
      task.project?.owner?.toString() === userId;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        message: "You do not have access to this task.",
      });
    }

    return res.status(200).json({
      success: true,
      task,
    });
  } catch (error) {
    console.error("GET TASK ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to fetch the task.",
    });
  }
});

router.post(
  "/",
  protect,
  [
    body("title")
      .trim()
      .notEmpty()
      .withMessage("Task title is required.")
      .isLength({ max: 150 })
      .withMessage(
        "Task title cannot exceed 150 characters."
      ),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage(
        "Task description cannot exceed 1000 characters."
      ),

    body("status")
      .optional()
      .isIn(["todo", "in-progress", "done"])
      .withMessage("Invalid task status."),

    body("priority")
      .optional()
      .isIn([
        "low",
        "medium",
        "high",
        "urgent",
      ])
      .withMessage("Invalid task priority."),

    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid due date."),

    body("project")
      .notEmpty()
      .withMessage("Project is required."),

    body("assignee")
      .optional()
      .isMongoId()
      .withMessage("Invalid assignee."),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const {
        title,
        description,
        status,
        priority,
        dueDate,
        project,
        assignee,
      } = req.body;

      const projectRecord =
        await Project.findById(project);

      if (!projectRecord) {
        return res.status(404).json({
          success: false,
          message: "Project not found.",
        });
      }

      if (
        projectRecord.owner.toString() !==
        req.user._id.toString()
      ) {
        return res.status(403).json({
          success: false,
          message:
            "You can only create tasks in your own projects.",
        });
      }

      let assigneeRecord = null;

      if (assignee) {
        assigneeRecord =
          await User.findById(assignee);

        if (!assigneeRecord) {
          return res.status(404).json({
            success: false,
            message: "Assignee not found.",
          });
        }
      }

      const task = await Task.create({
        title,
        description,
        status: status || "todo",
        priority: priority || "medium",
        dueDate: dueDate || null,
        project,
        owner: req.user._id,
        assignee: assignee || null,
      });

      const populatedTask =
        await Task.findById(task._id)
          .populate(
            "project",
            "name description owner"
          )
          .populate(
            "assignee",
            "name email"
          )
          .populate(
            "owner",
            "name email"
          );

      await Activity.create({
        user: req.user._id,
        action: "created",
        entityType: "task",
        entityId: task._id,
        message: `Created task "${task.title}" — Status: ${getStatusLabel(
          task.status
        )}.`,
      });

      return res.status(201).json({
        success: true,
        message: "Task created successfully.",
        task: populatedTask,
      });
    } catch (error) {
      console.error("CREATE TASK ERROR:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to create task.",
      });
    }
  }
);

router.put(
  "/:id",
  protect,
  [
    body("title")
      .optional()
      .trim()
      .notEmpty()
      .withMessage("Task title cannot be empty.")
      .isLength({ max: 150 })
      .withMessage(
        "Task title cannot exceed 150 characters."
      ),

    body("description")
      .optional()
      .trim()
      .isLength({ max: 1000 })
      .withMessage(
        "Task description cannot exceed 1000 characters."
      ),

    body("status")
      .optional()
      .isIn(["todo", "in-progress", "done"])
      .withMessage("Invalid task status."),

    body("priority")
      .optional()
      .isIn([
        "low",
        "medium",
        "high",
        "urgent",
      ])
      .withMessage("Invalid task priority."),

    body("dueDate")
      .optional()
      .isISO8601()
      .withMessage("Invalid due date."),

    body("project")
      .optional()
      .isMongoId()
      .withMessage("Invalid project."),

    body("assignee")
      .optional({ nullable: true })
      .isMongoId()
      .withMessage("Invalid assignee."),
  ],
  handleValidationErrors,
  async (req, res) => {
    try {
      const task =
        await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found.",
        });
      }

      const userId =
        req.user._id.toString();

      const canEdit =
        task.owner.toString() === userId ||
        task.assignee?.toString() === userId;

      if (!canEdit) {
        return res.status(403).json({
          success: false,
          message:
            "You do not have permission to update this task.",
        });
      }

      const previousStatus = task.status;

      if (
        req.body.project &&
        req.body.project !==
          task.project.toString()
      ) {
        const newProject =
          await Project.findById(
            req.body.project
          );

        if (!newProject) {
          return res.status(404).json({
            success: false,
            message: "New project not found.",
          });
        }

        if (
          newProject.owner.toString() !==
          userId
        ) {
          return res.status(403).json({
            success: false,
            message:
              "You can only move tasks to projects you own.",
          });
        }
      }

      if (req.body.assignee) {
        const assigneeUser =
          await User.findById(
            req.body.assignee
          );

        if (!assigneeUser) {
          return res.status(404).json({
            success: false,
            message: "Assignee not found.",
          });
        }
      }

      Object.keys(req.body).forEach(
        (key) => {
          if (
            req.body[key] !== undefined
          ) {
            task[key] = req.body[key];
          }
        }
      );

      await task.save();

      const updatedTask =
        await Task.findById(task._id)
          .populate(
            "project",
            "name description owner"
          )
          .populate(
            "assignee",
            "name email"
          )
          .populate(
            "owner",
            "name email"
          );

      let activityMessage;

      if (
        req.body.status &&
        req.body.status !== previousStatus
      ) {
        activityMessage = `Moved "${task.title}" from ${getStatusLabel(
          previousStatus
        )} → ${getStatusLabel(task.status)}.`;
      } else {
        activityMessage = `Updated task "${task.title}".`;
      }

      await Activity.create({
        user: req.user._id,
        action: "updated",
        entityType: "task",
        entityId: task._id,
        message: activityMessage,
      });

      return res.status(200).json({
        success: true,
        message: "Task updated successfully.",
        task: updatedTask,
      });
    } catch (error) {
      console.error("UPDATE TASK ERROR:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to update task.",
      });
    }
  }
);

router.delete(
  "/:id",
  protect,
  async (req, res) => {
    try {
      const task =
        await Task.findById(req.params.id);

      if (!task) {
        return res.status(404).json({
          success: false,
          message: "Task not found.",
        });
      }

      const userId =
        req.user._id.toString();

      const canDelete =
        task.owner.toString() === userId;

      if (!canDelete) {
        return res.status(403).json({
          success: false,
          message:
            "Only the task owner can delete this task.",
        });
      }

      const deletedTaskTitle = task.title;
      const deletedTaskId = task._id;

      await Task.findByIdAndDelete(
        req.params.id
      );

      await Activity.create({
        user: req.user._id,
        action: "deleted",
        entityType: "task",
        entityId: deletedTaskId,
        message: `Deleted task "${deletedTaskTitle}".`,
      });

      return res.status(200).json({
        success: true,
        message: "Task deleted successfully.",
      });
    } catch (error) {
      console.error("DELETE TASK ERROR:", error);

      return res.status(500).json({
        success: false,
        message:
          error.message ||
          "Unable to delete task.",
      });
    }
  }
);

module.exports = router;