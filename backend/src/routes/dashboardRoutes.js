const express = require("express");

const protect = require("../middleware/authMiddleware");
const Project = require("../models/Project");
const Task = require("../models/Task");

const router = express.Router();

router.get("/stats", protect, async (req, res) => {
  try {
    // Always return fresh dashboard data
    res.set("Cache-Control", "no-store, no-cache, must-revalidate, proxy-revalidate");
    res.set("Pragma", "no-cache");
    res.set("Expires", "0");

    const userId = req.user._id;

    const ownedProjects = await Project.find({
      owner: userId,
    }).sort({ createdAt: -1 });

    const ownedProjectIds = ownedProjects.map(
      (project) => project._id
    );

    const tasks = await Task.find({
      $or: [
        { owner: userId },
        { assignee: userId },
        {
          project: {
            $in: ownedProjectIds,
          },
        },
      ],
    })
      .populate("project", "name description owner")
      .populate("assignee", "name email")
      .populate("owner", "name email")
      .sort({ updatedAt: -1 });

    const totalProjects = ownedProjects.length;

    const totalTasks = tasks.length;

    const completedTasks = tasks.filter(
      (task) => task.status === "done"
    ).length;

    const inProgressTasks = tasks.filter(
      (task) => task.status === "in-progress"
    ).length;

    const todoTasks = tasks.filter(
      (task) => task.status === "todo"
    ).length;

    const completionPercentage =
      totalTasks > 0
        ? Math.round(
            (completedTasks / totalTasks) * 100
          )
        : 0;

    const projectProgress = await Promise.all(
      ownedProjects.map(async (project) => {
        const projectTasks = await Task.find({
          project: project._id,
        });

        const totalProjectTasks =
          projectTasks.length;

        const completedProjectTasks =
          projectTasks.filter(
            (task) => task.status === "done"
          ).length;

        const progress =
          totalProjectTasks > 0
            ? Math.round(
                (completedProjectTasks /
                  totalProjectTasks) *
                  100
              )
            : 0;

        return {
          projectId: project._id,
          projectName: project.name,
          totalTasks: totalProjectTasks,
          completedTasks: completedProjectTasks,
          progress,
        };
      })
    );

    const recentTasks = tasks.slice(0, 5);

    return res.status(200).json({
      success: true,

      stats: {
        totalProjects,
        totalTasks,
        completedTasks,
        inProgressTasks,
        todoTasks,
        completionPercentage,
      },

      projectProgress,

      recentTasks,
    });
  } catch (error) {
    console.error("DASHBOARD ERROR:", error);

    return res.status(500).json({
      success: false,
      message:
        error.message ||
        "Unable to load dashboard statistics.",
    });
  }
});

module.exports = router;