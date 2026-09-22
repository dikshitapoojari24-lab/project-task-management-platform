import Project from "../models/Project.js";
import Task from "../models/Task.js";
// ===============================
// CREATE PROJECT
// ===============================
export const createProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.create({
      name,
      description,
      owner: req.user._id
    });

    res.status(201).json({
      success: true,
      message: "Project created successfully",
      project
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// GET ALL USER PROJECTS
// ===============================
export const getProjects = async (req, res, next) => {
  try {
    const projects = await Project.find({
      owner: req.user._id
    }).sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: projects.length,
      projects
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// GET SINGLE PROJECT
// ===============================
export const getProjectById = async (req, res, next) => {
  try {
    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    res.status(200).json({
      success: true,
      project
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// UPDATE PROJECT
// ===============================
export const updateProject = async (req, res, next) => {
  try {
    const { name, description } = req.body;

    const project = await Project.findOne({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    if (name !== undefined) {
      project.name = name;
    }

    if (description !== undefined) {
      project.description = description;
    }

    const updatedProject = await project.save();

    res.status(200).json({
      success: true,
      message: "Project updated successfully",
      project: updatedProject
    });
  } catch (error) {
    next(error);
  }
};

// ===============================
// DELETE PROJECT
// ===============================
export const deleteProject = async (req, res, next) => {
  try {
    const project = await Project.findOneAndDelete({
      _id: req.params.id,
      owner: req.user._id
    });

    if (!project) {
      return res.status(404).json({
        success: false,
        message: "Project not found"
      });
    }

    await Task.deleteMany({
      project: project._id,
      owner: req.user._id
    });

    res.status(200).json({
      success: true,
      message: "Project and its tasks deleted successfully"
    });
  } catch (error) {
    next(error);
  }
};