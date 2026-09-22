import { useEffect, useState } from "react";
import { Link, useNavigate, useParams } from "react-router-dom";
import api from "../services/api";
import TaskCard from "../components/TaskCard";

function ProjectDetails() {
  const { id } = useParams();
  const navigate = useNavigate();

  const [project, setProject] = useState(null);
  const [tasks, setTasks] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showEditForm, setShowEditForm] = useState(false);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [deleting, setDeleting] = useState(false);

  const fetchProject = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(`/projects/${id}`);

      const projectData = response.data.project;
      const projectTasks = response.data.tasks || [];

      setProject(projectData);
      setTasks(projectTasks);

      setFormData({
        name: projectData.name || "",
        description: projectData.description || "",
      });
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load project details."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProject();
  }, [id]);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const handleUpdateProject = async (event) => {
    event.preventDefault();

    if (!formData.name.trim()) {
      setError("Project name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const response = await api.put(`/projects/${id}`, {
        name: formData.name.trim(),
        description: formData.description.trim(),
      });

      setProject((previous) => ({
        ...previous,
        ...response.data.project,
      }));

      setShowEditForm(false);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update the project."
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDeleteProject = async () => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project?.name}"?\n\nThis will also delete all tasks belonging to this project.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeleting(true);
      setError("");

      await api.delete(`/projects/${id}`);

      navigate("/projects");
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete the project."
      );
      setDeleting(false);
    }
  };

  const handleTaskStatusChange = async (
    taskId,
    status
  ) => {
    try {
      setError("");

      const response = await api.put(
        `/tasks/${taskId}`,
        {
          status,
        }
      );

      const updatedTask = response.data.task;

      setTasks((previous) =>
        previous.map((task) =>
          task._id === updatedTask._id
            ? updatedTask
            : task
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to update task status."
      );
    }
  };

  const handleTaskDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setError("");

      await api.delete(`/tasks/${taskId}`);

      setTasks((previous) =>
        previous.filter(
          (task) => task._id !== taskId
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete the task."
      );
    }
  };

  const completedTasks = tasks.filter(
    (task) => task.status === "done"
  ).length;

  const inProgressTasks = tasks.filter(
    (task) => task.status === "in-progress"
  ).length;

  const todoTasks = tasks.filter(
    (task) => task.status === "todo"
  ).length;

  const progress =
    tasks.length > 0
      ? Math.round(
          (completedTasks / tasks.length) * 100
        )
      : 0;

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading project...</p>
      </div>
    );
  }

  if (!project) {
    return (
      <div className="workspace-page">
        <div className="page-error">
          <strong>Project not found</strong>
          <p>
            The project you are looking for does not
            exist or is no longer available.
          </p>

          <Link
            to="/projects"
            className="primary-button"
          >
            Back to Projects
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <div className="page-header">
        <div>
          <Link
            to="/projects"
            className="back-link"
          >
            ← Back to Projects
          </Link>

          <p className="page-eyebrow">
            PROJECT
          </p>

          <h1>{project.name}</h1>

          <p>
            {project.description ||
              "No description provided."}
          </p>
        </div>

        <div className="page-header-actions">
          <button
            type="button"
            className="secondary-button"
            onClick={() =>
              setShowEditForm(true)
            }
          >
            Edit Project
          </button>

          <button
            type="button"
            className="danger-button"
            onClick={handleDeleteProject}
            disabled={deleting}
          >
            {deleting
              ? "Deleting..."
              : "Delete Project"}
          </button>
        </div>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {showEditForm && (
        <div className="form-panel">
          <div className="form-panel-header">
            <div>
              <h2>Edit Project</h2>
              <p>
                Update your project information.
              </p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={() =>
                setShowEditForm(false)
              }
              disabled={saving}
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleUpdateProject}
            className="project-form"
          >
            <div className="form-group">
              <label htmlFor="project-name">
                Project name
              </label>

              <input
                id="project-name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                disabled={saving}
                maxLength={100}
              />
            </div>

            <div className="form-group">
              <label htmlFor="project-description">
                Description
              </label>

              <textarea
                id="project-description"
                name="description"
                value={formData.description}
                onChange={handleChange}
                disabled={saving}
                rows="4"
                maxLength={500}
              />
            </div>

            <div className="form-actions">
              <button
                type="button"
                className="secondary-button"
                onClick={() =>
                  setShowEditForm(false)
                }
                disabled={saving}
              >
                Cancel
              </button>

              <button
                type="submit"
                className="primary-button"
                disabled={saving}
              >
                {saving
                  ? "Saving..."
                  : "Save Changes"}
              </button>
            </div>
          </form>
        </div>
      )}

      <div className="project-details-grid">
        <div className="stat-card">
          <div className="stat-header">
            <span>Total Tasks</span>
            <span className="stat-icon">
              ✓
            </span>
          </div>

          <h2>{tasks.length}</h2>

          <p className="neutral">
            Tasks in this project
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>Completed</span>
            <span className="stat-icon">
              ✓
            </span>
          </div>

          <h2>{completedTasks}</h2>

          <p className="positive">
            {progress}% completion
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>In Progress</span>
            <span className="stat-icon">
              ◷
            </span>
          </div>

          <h2>{inProgressTasks}</h2>

          <p className="neutral">
            Currently being worked on
          </p>
        </div>

        <div className="stat-card">
          <div className="stat-header">
            <span>To Do</span>
            <span className="stat-icon">
              ○
            </span>
          </div>

          <h2>{todoTasks}</h2>

          <p className="neutral">
            Tasks waiting to start
          </p>
        </div>
      </div>

      <div className="panel">
        <div className="panel-header">
          <div>
            <h2>Project Progress</h2>

            <p>
              {completedTasks} of {tasks.length} tasks
              completed.
            </p>
          </div>

          <strong>{progress}%</strong>
        </div>

        <div className="progress-bar">
          <div
            className="progress-fill purple-fill"
            style={{
              width: `${progress}%`,
            }}
          ></div>
        </div>
      </div>

      <div className="panel project-tasks-panel">
        <div className="panel-header">
          <div>
            <h2>Project Tasks</h2>

            <p>
              Manage the tasks belonging to this
              project.
            </p>
          </div>

          <Link
            to={`/tasks?project=${project._id}`}
            className="primary-button"
          >
            + Manage Tasks
          </Link>
        </div>

        {tasks.length === 0 ? (
          <div className="panel-empty">
            <div className="empty-icon">
              ✓
            </div>

            <h3>No tasks yet</h3>

            <p>
              Create your first task for this
              project.
            </p>

            <Link
              to={`/tasks?project=${project._id}`}
              className="primary-button"
            >
              + Create Task
            </Link>
          </div>
        ) : (
          <div className="tasks-list">
            {tasks.map((task) => (
              <TaskCard
                key={task._id}
                task={task}
                onStatusChange={
                  handleTaskStatusChange
                }
                onDelete={handleTaskDelete}
              />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

export default ProjectDetails;