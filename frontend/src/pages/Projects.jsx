import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import api from "../services/api";
import ProjectCard from "../components/ProjectCard";

function Projects() {
  const [projects, setProjects] = useState([]);
  const [projectProgress, setProjectProgress] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingProject, setEditingProject] = useState(null);

  const [formData, setFormData] = useState({
    name: "",
    description: "",
  });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchProjects = async () => {
    try {
      setLoading(true);
      setError("");

      const [projectsResponse, dashboardResponse] =
        await Promise.all([
          api.get("/projects"),
          api.get("/dashboard/stats"),
        ]);

      setProjects(projectsResponse.data.projects || []);
      setProjectProgress(
        dashboardResponse.data.projectProgress || []
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load your projects."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchProjects();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingProject(null);

    setFormData({
      name: "",
      description: "",
    });

    setError("");
    setShowForm(true);
  };

  const openEditForm = (project) => {
    setEditingProject(project);

    setFormData({
      name: project.name || "",
      description: project.description || "",
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingProject(null);

    setFormData({
      name: "",
      description: "",
    });

    setError("");
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    const name = formData.name.trim();
    const description = formData.description.trim();

    if (!name) {
      setError("Project name is required.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      if (editingProject) {
        const response = await api.put(
          `/projects/${editingProject._id}`,
          {
            name,
            description,
          }
        );

        const updatedProject = response.data.project;

        setProjects((previous) =>
          previous.map((project) =>
            project._id === updatedProject._id
              ? updatedProject
              : project
          )
        );
      } else {
        const response = await api.post("/projects", {
          name,
          description,
        });

        setProjects((previous) => [
          response.data.project,
          ...previous,
        ]);
      }

      closeForm();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          `Unable to ${
            editingProject ? "update" : "create"
          } the project.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async (project) => {
    const confirmed = window.confirm(
      `Are you sure you want to delete "${project.name}"?\n\nThis will also delete all tasks belonging to this project.`
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(project._id);
      setError("");

      await api.delete(`/projects/${project._id}`);

      setProjects((previous) =>
        previous.filter(
          (item) => item._id !== project._id
        )
      );

      setProjectProgress((previous) =>
        previous.filter(
          (item) => item.projectId !== project._id
        )
      );
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to delete the project."
      );
    } finally {
      setDeletingId(null);
    }
  };

  const getProjectProgress = (projectId) => {
    const progress = projectProgress.find(
      (item) => item.projectId === projectId
    );

    if (!progress) {
      return {
        progress: 0,
        completedTasks: 0,
        totalTasks: 0,
      };
    }

    return {
      progress: progress.progress || 0,
      completedTasks: progress.completedTasks || 0,
      totalTasks: progress.totalTasks || 0,
    };
  };

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading projects...</p>
      </div>
    );
  }

  return (
    <div className="workspace-page">
      <div className="page-header">
        <div>
          <p className="page-eyebrow">
            WORKSPACE
          </p>

          <h1>Projects</h1>

          <p>
            Create, manage and track all your projects
            in one place.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={openCreateForm}
        >
          + New Project
        </button>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-header">
            <div>
              <h2>
                {editingProject
                  ? "Edit Project"
                  : "Create New Project"}
              </h2>

              <p>
                {editingProject
                  ? "Update your project details."
                  : "Add a new project to your workspace."}
              </p>
            </div>

            <button
              type="button"
              className="close-button"
              onClick={closeForm}
              disabled={saving}
            >
              ×
            </button>
          </div>

          <form
            onSubmit={handleSubmit}
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
                placeholder="e.g. Website Redesign"
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
                placeholder="Describe your project..."
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
                onClick={closeForm}
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
                  ? editingProject
                    ? "Saving..."
                    : "Creating..."
                  : editingProject
                    ? "Save Changes"
                    : "Create Project"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!error &&
        projects.length === 0 &&
        !showForm && (
          <div className="empty-state">
            <div className="empty-icon">
              ▣
            </div>

            <h2>No projects yet</h2>

            <p>
              Create your first project to start
              organizing your tasks and workflow.
            </p>

            <button
              className="primary-button"
              type="button"
              onClick={openCreateForm}
            >
              + Create Project
            </button>
          </div>
        )}

      {projects.length > 0 && (
        <div className="projects-grid">
          {projects.map((project) => {
            const progress =
              getProjectProgress(project._id);

            return (
              <div
                key={project._id}
                className="project-card-wrapper"
              >
                <ProjectCard
                  project={project}
                  progress={progress.progress}
                  completedTasks={
                    progress.completedTasks
                  }
                  totalTasks={progress.totalTasks}
                />

                <div className="project-card-actions">
                  <button
                    type="button"
                    className="secondary-button"
                    onClick={() =>
                      openEditForm(project)
                    }
                    disabled={
                      deletingId === project._id
                    }
                  >
                    Edit
                  </button>

                  <button
                    type="button"
                    className="danger-button"
                    onClick={() =>
                      handleDelete(project)
                    }
                    disabled={
                      deletingId === project._id
                    }
                  >
                    {deletingId === project._id
                      ? "Deleting..."
                      : "Delete"}
                  </button>
                </div>

                <Link
                  to={`/projects/${project._id}`}
                  className="project-open-link"
                >
                  Open Project →
                </Link>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default Projects;