const express = require("express");

const protect = require("../middleware/authMiddleware");

const router = express.Router();

router.post("/generate-tasks", protect, async (req, res) => {
  try {
    const { projectIdea } = req.body;

    if (!projectIdea || !projectIdea.trim()) {
      return res.status(400).json({
        success: false,
        message: "Project idea is required.",
      });
    }

    const idea = projectIdea.trim();

    const generatedTasks = [
      {
        title: "Define project requirements",
        description: `Identify the main requirements, features, and goals for ${idea}.`,
        priority: "high",
        status: "todo",
      },
      {
        title: "Design project structure",
        description:
          "Plan the application architecture, database structure, and major modules.",
        priority: "high",
        status: "todo",
      },
      {
        title: "Develop core functionality",
        description:
          "Implement the main features and functionality required for the project.",
        priority: "high",
        status: "todo",
      },
      {
        title: "Implement user interface",
        description:
          "Build the user interface and connect it with the application functionality.",
        priority: "medium",
        status: "todo",
      },
      {
        title: "Test the application",
        description:
          "Test the major features, identify issues, and fix bugs.",
        priority: "medium",
        status: "todo",
      },
      {
        title: "Deploy the project",
        description:
          "Prepare the application for production and deploy it to a hosting platform.",
        priority: "medium",
        status: "todo",
      },
    ];

    return res.status(200).json({
      success: true,
      message: "AI task plan generated successfully.",
      projectIdea: idea,
      tasks: generatedTasks,
    });
  } catch (error) {
    console.error("AI TASK GENERATION ERROR:", error);

    return res.status(500).json({
      success: false,
      message: "Unable to generate tasks.",
    });
  }
});

module.exports = router;