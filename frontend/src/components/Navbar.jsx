import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";

function Navbar({
  title = "Dashboard",
  showNewProject = true,
}) {
  const { user } = useAuth();

  return (
    <header className="topbar">
      <div>
        <p className="greeting">
          Good morning, {user?.name || "User"} 👋
        </p>

        <h1>{title}</h1>
      </div>

      <div className="topbar-actions">
        <button
          className="icon-button"
          type="button"
          title="Search"
        >
          ⌕
        </button>

        <button
          className="icon-button"
          type="button"
          title="Notifications"
        >
          🔔
        </button>

        {showNewProject && (
          <Link
            to="/projects"
            className="new-project-button"
          >
            + New Project
          </Link>
        )}
      </div>
    </header>
  );
}

export default Navbar;

