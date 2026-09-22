function TaskCard({ task, onStatusChange, onDelete }) {
  if (!task) {
    return null;
  }

  const getStatusLabel = (status) => {
    if (status === "in-progress") {
      return "In Progress";
    }

    if (status === "done") {
      return "Completed";
    }

    return "To Do";
  };

  const getPriorityLabel = (priority) => {
    if (!priority) {
      return "Medium";
    }

    return (
      priority.charAt(0).toUpperCase() +
      priority.slice(1)
    );
  };

  const formatDueDate = (date) => {
    if (!date) {
      return "No due date";
    }

    return new Date(date).toLocaleDateString(
      "en-IN",
      {
        day: "numeric",
        month: "short",
        year: "numeric",
      }
    );
  };

  return (
    <div className="task-list-item">
      <div className="task-main">
        <div
          className={`task-checkbox ${
            task.status === "done" ? "completed" : ""
          }`}
        >
          {task.status === "done" ? "✓" : ""}
        </div>

        <div>
          <h3>{task.title}</h3>

          <p>
            {task.description ||
              "No description provided."}
          </p>

          <div className="task-card-details">
            <span>
              {task.project?.name || "No project"}
            </span>

            <span>
              Due: {formatDueDate(task.dueDate)}
            </span>

            {task.assignee?.name && (
              <span>
                Assigned to: {task.assignee.name}
              </span>
            )}
          </div>
        </div>
      </div>

      <div className="task-meta">
        <span
          className={`task-status ${task.status}`}
        >
          {getStatusLabel(task.status)}
        </span>

        <span
          className={`task-priority ${
            task.priority || "medium"
          }`}
        >
          {getPriorityLabel(task.priority)}
        </span>

        {onStatusChange && (
          <select
            className="task-status-select"
            value={task.status}
            onChange={(event) =>
              onStatusChange(
                task._id,
                event.target.value
              )
            }
          >
            <option value="todo">To Do</option>
            <option value="in-progress">
              In Progress
            </option>
            <option value="done">
              Completed
            </option>
          </select>
        )}

        {onDelete && (
          <button
            className="danger-button"
            type="button"
            onClick={() => onDelete(task._id)}
          >
            Delete
          </button>
        )}
      </div>
    </div>
  );
}

export default TaskCard;