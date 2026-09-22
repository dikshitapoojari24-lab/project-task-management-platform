function ActivityList({ activities = [] }) {
  const formatTime = (date) => {
    if (!date) {
      return "";
    }

    return new Date(date).toLocaleString("en-IN", {
      day: "numeric",
      month: "short",
      year: "numeric",
      hour: "numeric",
      minute: "2-digit",
    });
  };

  if (activities.length === 0) {
    return (
      <div className="panel-empty">
        <div className="empty-icon">◉</div>

        <p>No activity yet.</p>

        <span>
          Your project and task updates will appear here.
        </span>
      </div>
    );
  }

  return (
    <div className="activity-page-list">
      {activities.map((activity) => (
        <div
          className="activity-page-item"
          key={activity._id}
        >
          <div className="activity-avatar">
            {(activity.user?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="activity-content">
            <p>
              {activity.message ||
                "Workspace activity updated."}
            </p>

            <span>
              {formatTime(activity.createdAt)}
            </span>
          </div>
        </div>
      ))}
    </div>
  );
}

export default ActivityList;