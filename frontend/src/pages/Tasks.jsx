import { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import api from "../services/api";
import TaskCard from "../components/TaskCard";

function Tasks() {
  const [searchParams] = useSearchParams();

  const [tasks, setTasks] = useState([]);
  const [projects, setProjects] = useState([]);
  const [users, setUsers] = useState([]);

  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const [showForm, setShowForm] = useState(false);
  const [editingTask, setEditingTask] = useState(null);

  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [priorityFilter, setPriorityFilter] = useState("all");

  const [formData, setFormData] = useState({
    title: "",
    description: "",
    project: searchParams.get("project") || "",
    assignee: "",
    status: "todo",
    priority: "medium",
    dueDate: "",
  });

  const [saving, setSaving] = useState(false);
  const [deletingId, setDeletingId] = useState(null);

  const fetchData = async () => {
    try {
      setLoading(true);
      setError("");

      const [
        tasksResponse,
        projectsResponse,
        usersResponse,
      ] = await Promise.all([
        api.get("/tasks"),
        api.get("/projects"),
        api.get("/users"),
      ]);

      setTasks(tasksResponse.data.tasks || []);
      setProjects(
        projectsResponse.data.projects || []
      );
      setUsers(usersResponse.data.users || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load your tasks."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const handleChange = (event) => {
    const { name, value } = event.target;

    setFormData((previous) => ({
      ...previous,
      [name]: value,
    }));
  };

  const openCreateForm = () => {
    setEditingTask(null);

    setFormData({
      title: "",
      description: "",
      project: searchParams.get("project") || "",
      assignee: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    });

    setError("");
    setShowForm(true);
  };

  const openEditForm = (task) => {
    setEditingTask(task);

    setFormData({
      title: task.title || "",
      description: task.description || "",
      project: task.project?._id || "",
      assignee: task.assignee?._id || "",
      status: task.status || "todo",
      priority: task.priority || "medium",
      dueDate: task.dueDate
        ? task.dueDate.slice(0, 10)
        : "",
    });

    setError("");
    setShowForm(true);
  };

  const closeForm = () => {
    if (saving) {
      return;
    }

    setShowForm(false);
    setEditingTask(null);

    setFormData({
      title: "",
      description: "",
      project: "",
      assignee: "",
      status: "todo",
      priority: "medium",
      dueDate: "",
    });
  };

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (!formData.title.trim()) {
      setError("Task title is required.");
      return;
    }

    if (!formData.project) {
      setError("Please select a project.");
      return;
    }

    try {
      setSaving(true);
      setError("");

      const payload = {
        title: formData.title.trim(),
        description: formData.description.trim(),
        project: formData.project,
        status: formData.status,
        priority: formData.priority,
      };

      if (formData.assignee) {
        payload.assignee = formData.assignee;
      }

      if (formData.dueDate) {
        payload.dueDate = formData.dueDate;
      }

      if (editingTask) {
        const response = await api.put(
          `/tasks/${editingTask._id}`,
          payload
        );

        const updatedTask = response.data.task;

        setTasks((previous) =>
          previous.map((task) =>
            task._id === updatedTask._id
              ? updatedTask
              : task
          )
        );
      } else {
        const response = await api.post(
          "/tasks",
          payload
        );

        setTasks((previous) => [
          response.data.task,
          ...previous,
        ]);
      }

      closeForm();
    } catch (error) {
      setError(
        error.response?.data?.message ||
          `Unable to ${
            editingTask ? "update" : "create"
          } the task.`
      );
    } finally {
      setSaving(false);
    }
  };

  const handleStatusChange = async (
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

  const handleDelete = async (taskId) => {
    const confirmed = window.confirm(
      "Are you sure you want to delete this task?"
    );

    if (!confirmed) {
      return;
    }

    try {
      setDeletingId(taskId);
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
    } finally {
      setDeletingId(null);
    }
  };

  const filteredTasks = tasks.filter((task) => {
    const searchValue = search
      .trim()
      .toLowerCase();

    const matchesSearch =
      !searchValue ||
      task.title
        ?.toLowerCase()
        .includes(searchValue) ||
      task.description
        ?.toLowerCase()
        .includes(searchValue) ||
      task.project?.name
        ?.toLowerCase()
        .includes(searchValue);

    const matchesStatus =
      statusFilter === "all" ||
      task.status === statusFilter;

    const matchesPriority =
      priorityFilter === "all" ||
      task.priority === priorityFilter;

    return (
      matchesSearch &&
      matchesStatus &&
      matchesPriority
    );
  });

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading tasks...</p>
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

          <h1>Tasks</h1>

          <p>
            Manage, prioritize and track all your
            tasks.
          </p>
        </div>

        <button
          className="primary-button"
          type="button"
          onClick={openCreateForm}
        >
          + New Task
        </button>
      </div>

      {error && (
        <div className="page-error">
          {error}
        </div>
      )}

      <div className="task-toolbar">
        <input
          type="text"
          placeholder="Search tasks..."
          className="search-input"
          value={search}
          onChange={(event) =>
            setSearch(event.target.value)
          }
        />

        <select
          className="filter-select"
          value={statusFilter}
          onChange={(event) =>
            setStatusFilter(event.target.value)
          }
        >
          <option value="all">
            All statuses
          </option>

          <option value="todo">
            To Do
          </option>

          <option value="in-progress">
            In Progress
          </option>

          <option value="done">
            Completed
          </option>
        </select>

        <select
          className="filter-select"
          value={priorityFilter}
          onChange={(event) =>
            setPriorityFilter(event.target.value)
          }
        >
          <option value="all">
            All priorities
          </option>

          <option value="low">
            Low
          </option>

          <option value="medium">
            Medium
          </option>

          <option value="high">
            High
          </option>

          <option value="urgent">
            Urgent
          </option>
        </select>
      </div>

      {showForm && (
        <div className="form-panel">
          <div className="form-panel-header">
            <div>
              <h2>
                {editingTask
                  ? "Edit Task"
                  : "Create New Task"}
              </h2>

              <p>
                {editingTask
                  ? "Update task details."
                  : "Add a task to your project."}
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
              <label htmlFor="task-title">
                Task title
              </label>

              <input
                id="task-title"
                name="title"
                type="text"
                placeholder="e.g. Design login page"
                value={formData.title}
                onChange={handleChange}
                disabled={saving}
                maxLength={150}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-description">
                Description
              </label>

              <textarea
                id="task-description"
                name="description"
                placeholder="Describe the task..."
                value={formData.description}
                onChange={handleChange}
                disabled={saving}
                rows="4"
                maxLength={1000}
              />
            </div>

            <div className="form-group">
              <label htmlFor="task-project">
                Project
              </label>

              <select
                id="task-project"
                name="project"
                value={formData.project}
                onChange={handleChange}
                disabled={saving}
              >
                <option value="">
                  Select a project
                </option>

                {projects.map((project) => (
                  <option
                    key={project._id}
                    value={project._id}
                  >
                    {project.name}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-assignee">
                  Assign to
                </label>

                <select
                  id="task-assignee"
                  name="assignee"
                  value={formData.assignee}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="">
                    Unassigned
                  </option>

                  {users.map((user) => (
                    <option
                      key={user._id}
                      value={user._id}
                    >
                      {user.name} ({user.email})
                    </option>
                  ))}
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-status">
                  Status
                </label>

                <select
                  id="task-status"
                  name="status"
                  value={formData.status}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="todo">
                    To Do
                  </option>

                  <option value="in-progress">
                    In Progress
                  </option>

                  <option value="done">
                    Completed
                  </option>
                </select>
              </div>
            </div>

            <div className="form-row">
              <div className="form-group">
                <label htmlFor="task-priority">
                  Priority
                </label>

                <select
                  id="task-priority"
                  name="priority"
                  value={formData.priority}
                  onChange={handleChange}
                  disabled={saving}
                >
                  <option value="low">
                    Low
                  </option>

                  <option value="medium">
                    Medium
                  </option>

                  <option value="high">
                    High
                  </option>

                  <option value="urgent">
                    Urgent
                  </option>
                </select>
              </div>

              <div className="form-group">
                <label htmlFor="task-due-date">
                  Due date
                </label>

                <input
                  id="task-due-date"
                  name="dueDate"
                  type="date"
                  value={formData.dueDate}
                  onChange={handleChange}
                  disabled={saving}
                />
              </div>
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
                  ? editingTask
                    ? "Saving..."
                    : "Creating..."
                  : editingTask
                    ? "Save Changes"
                    : "Create Task"}
              </button>
            </div>
          </form>
        </div>
      )}

      {!error &&
        filteredTasks.length === 0 && (
          <div className="empty-state">
            <div className="empty-icon">
              ✓
            </div>

            <h2>
              {tasks.length === 0
                ? "No tasks yet"
                : "No matching tasks"}
            </h2>

            <p>
              {tasks.length === 0
                ? "Create your first task to start tracking your project work."
                : "Try changing your search or filters."}
            </p>

            {tasks.length === 0 && (
              <button
                className="primary-button"
                type="button"
                onClick={openCreateForm}
              >
                + Create Task
              </button>
            )}
          </div>
        )}

      {filteredTasks.length > 0 && (
        <div className="tasks-list">
          {filteredTasks.map((task) => (
            <div
              key={task._id}
              className="task-card-wrapper"
            >
              <TaskCard
                task={task}
                onStatusChange={
                  handleStatusChange
                }
                onDelete={handleDelete}
              />

              <div className="task-card-actions">
                <button
                  type="button"
                  className="secondary-button"
                  onClick={() =>
                    openEditForm(task)
                  }
                  disabled={
                    deletingId === task._id
                  }
                >
                  Edit
                </button>

                {deletingId === task._id && (
                  <span className="task-delete-status">
                    Deleting...
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default Tasks;