import { useState } from "react";
import api from "../services/api";

function AIAssistant() {
  const [projectIdea, setProjectIdea] = useState("");
  const [tasks, setTasks] = useState([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [generated, setGenerated] = useState(false);

  const handleGenerateTasks = async (event) => {
    event.preventDefault();

    if (!projectIdea.trim()) {
      setError("Please enter a project idea.");
      return;
    }

    try {
      setLoading(true);
      setError("");
      setGenerated(false);

      const response = await api.post("/ai/generate-tasks", {
        projectIdea: projectIdea.trim(),
      });

      setTasks(response.data.tasks || []);
      setGenerated(true);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to generate tasks."
      );
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="workspace-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">AI ASSISTANT</p>

          <h1>AI Task Generator</h1>

          <p>
            Describe your project idea and generate a structured
            task plan.
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Describe Your Project</h2>

            <p>
              Enter a project idea and let the assistant create
              an initial task plan.
            </p>
          </div>
        </div>

        <form
          onSubmit={handleGenerateTasks}
          className="project-form"
        >
          <div className="form-group">
            <label htmlFor="project-idea">
              Project idea
            </label>

            <textarea
              id="project-idea"
              value={projectIdea}
              onChange={(event) =>
                setProjectIdea(event.target.value)
              }
              placeholder="Example: Build an e-commerce website with user authentication, product management, shopping cart and online payments."
              rows="6"
              disabled={loading}
            />
          </div>

          {error && (
            <div className="page-error">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="primary-button"
            disabled={loading}
          >
            {loading
              ? "Generating Tasks..."
              : "✨ Generate Tasks"}
          </button>
        </form>
      </div>

      {generated && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Generated Task Plan</h2>

              <p>
                Review the suggested tasks before adding them
                to your project.
              </p>
            </div>

            <span>
              {tasks.length} tasks
            </span>
          </div>

          {tasks.length === 0 ? (
            <div className="panel-empty">
              <h3>No tasks generated</h3>

              <p>
                Try describing your project in more detail.
              </p>
            </div>
          ) : (
            <div className="tasks-list">
              {tasks.map((task, index) => (
                <div
                  className="task-list-item"
                  key={`${task.title}-${index}`}
                >
                  <div className="task-main">
                    <div className="task-checkbox">
                      {index + 1}
                    </div>

                    <div>
                      <h3>{task.title}</h3>

                      <p>
                        {task.description}
                      </p>
                    </div>
                  </div>

                  <div className="task-meta">
                    <span
                      className={`task-priority ${
                        task.priority || "medium"
                      }`}
                    >
                      {(task.priority || "medium")
                        .charAt(0)
                        .toUpperCase() +
                        (task.priority || "medium").slice(1)}
                    </span>

                    <span className="task-status todo">
                      To Do
                    </span>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  );
}

export default AIAssistant;