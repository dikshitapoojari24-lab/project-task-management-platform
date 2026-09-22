import { Link, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Sidebar() {
  const location = useLocation();
  const { user, logout } = useAuth();

  const isActive = (path) => {
    if (path === "/dashboard") {
      return location.pathname === "/dashboard";
    }

    return location.pathname.startsWith(path);
  };

  return (
    <aside className="sidebar">
      <div className="brand">
        <div className="brand-logo">P</div>

        <div>
          <h2>ProjectFlow</h2>
          <span>Workspace</span>
        </div>
      </div>

      <nav className="navigation">
        <Link
          to="/dashboard"
          className={`nav-item ${
            isActive("/dashboard") ? "active" : ""
          }`}
        >
          <span>▦</span>
          Dashboard
        </Link>

        <Link
          to="/projects"
          className={`nav-item ${
            isActive("/projects") ? "active" : ""
          }`}
        >
          <span>▣</span>
          Projects
        </Link>

        <Link
          to="/tasks"
          className={`nav-item ${
            isActive("/tasks") ? "active" : ""
          }`}
        >
          <span>✓</span>
          Tasks
        </Link>

        <Link
          to="/ai-assistant"
          className={`nav-item ${
            isActive("/ai-assistant") ? "active" : ""
          }`}
        >
          <span>✨</span>
          AI Assistant
        </Link>

        <Link
          to="/activity"
          className={`nav-item ${
            isActive("/activity") ? "active" : ""
          }`}
        >
          <span>◉</span>
          Activity
        </Link>
      </nav>

      <div className="sidebar-bottom">
        <button
          className="nav-item"
          type="button"
        >
          <span>⚙</span>
          Settings
        </button>

        <div className="user-card">
          <div className="avatar">
            {(user?.name || "U")
              .charAt(0)
              .toUpperCase()}
          </div>

          <div className="user-info">
            <strong>
              {user?.name || "User"}
            </strong>

            <span>Workspace owner</span>
          </div>

          <button
            className="logout-button"
            type="button"
            onClick={logout}
            title="Logout"
          >
            Logout
          </button>
        </div>
      </div>
    </aside>
  );
}

export default Sidebar;