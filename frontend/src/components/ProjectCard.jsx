import { Link } from "react-router-dom";

function ProjectCard({
  project,
  progress = 0,
  completedTasks = 0,
  totalTasks = 0,
}) {
  if (!project) {
    return null;
  }

  const safeProgress = Math.min(
    Math.max(Number(progress) || 0, 0),
    100
  );

  return (
    <Link
      to={`/projects/${project._id}`}
      className="project-card-link"
    >
      <div className="project-card">
        <div className="project-card-top">
          <div className="project-card-icon">
            ▣
          </div>

          <span className="project-status">
            Active
          </span>
        </div>

        <h2>{project.name}</h2>

        <p>
          {project.description ||
            "No description provided."}
        </p>

        <div className="project-progress-info">
          <div className="project-progress-label">
            <span>Progress</span>
            <strong>{safeProgress}%</strong>
          </div>

          <div className="progress-bar">
            <div
              className="progress-fill purple-fill"
              style={{
                width: `${safeProgress}%`,
              }}
            ></div>
          </div>

          <span className="project-task-count">
            {completedTasks} of {totalTasks} tasks completed
          </span>
        </div>

        <div className="project-card-footer">
          <span>View project →</span>
        </div>
      </div>
    </Link>
  );
}

export default ProjectCard;