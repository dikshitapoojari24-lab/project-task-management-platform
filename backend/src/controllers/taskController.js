import Task from "../models/Task.js";
import Project from "../models/Project.js";

// ===============================
// CREATE TASK
// ===============================
export const createTask = async (req, res, next) => {
  try {
    const { title, description, status, projectId } = req.body;

    // Check that the project belongs to the logged-in user
    const project = await Project.findOne({
      _id: projectId,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    const task = await Task.create({
      title,
      description,
      status,
      project: projectId,
      owner: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Task created successfully",
      task
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// GET ALL TASKS
// ===============================
export const getTasks = async (req, res, next) => {
  try {
    const filter = {
      owner: req.user._id
    };

    // Optional project filter
    if (req.query.projectId) {
      filter.project = req.query.projectId;
    }

    const tasks = await Task.find(filter)
      .populate("project", "name")
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: tasks.length,
      tasks
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// GET SINGLE TASK
// ===============================
export const getTaskById = async (req, res, next) => {
  try {
    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    }).populate("project", "name");

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      task
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// UPDATE TASK
// ===============================
export const updateTask = async (req, res, next) => {
  try {
    const { title, description, status, projectId } = req.body;

    const task = await Task.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    // If project is being changed, verify ownership
    if (projectId !== undefined) {
      const project = await Project.findOne({
        _id: projectId,
        owner: req.user._id
      });

      if (!project) {
        return res.status(404).json({
          success: false,
          message: "Project not found"
        });
      }

      task.project = projectId;
    }

    if (title !== undefined) {
      task.title = title;
    }

    if (description !== undefined) {
      task.description = description;
    }

    if (status !== undefined) {
      task.status = status;
    }

    const updatedTask = await task.save();

    res.status(200).json({
      success: true,
      message: "Task updated successfully",
      task: updatedTask
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// DELETE TASK
// ===============================
export const deleteTask = async (req, res, next) => {
  try {
    const task = await Task.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!task) {
      return res.status(404).json({
        success: false,
        message: "Task not found"
      });
    }

    res.status(200).json({
      success: true,
      message: "Task deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};