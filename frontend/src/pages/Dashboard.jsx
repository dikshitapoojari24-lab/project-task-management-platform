import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import api from "../services/api";

function Dashboard() {
    const { user, logout } = useAuth();

    const [dashboardData, setDashboardData] = useState(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState("");

    const fetchDashboard = async () => {
        try {
            setLoading(true);
            setError("");

            const response = await api.get("/dashboard/stats");

            setDashboardData(response.data);
        } catch (error) {
            setError(
                error.response?.data?.message ||
                "Unable to load dashboard data."
            );
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboard();
    }, []);

    const stats = dashboardData?.stats || {
        totalProjects: 0,
        totalTasks: 0,
        completedTasks: 0,
        inProgressTasks: 0,
        todoTasks: 0,
        completionPercentage: 0,
    };

    const projectProgress = dashboardData?.projectProgress || [];
    const recentTasks = dashboardData?.recentTasks || [];

    const getStatusLabel = (status) => {
        if (status === "done") {
            return "Completed";
        }

        if (status === "in-progress") {
            return "In Progress";
        }

        return "To Do";
    };

    const getTimeAgo = (date) => {
        if (!date) {
            return "";
        }

        const now = new Date();
        const created = new Date(date);

        const differenceInSeconds = Math.floor(
            (now - created) / 1000
        );

        if (differenceInSeconds < 60) {
            return "Just now";
        }

        const minutes = Math.floor(differenceInSeconds / 60);

        if (minutes < 60) {
            return `${minutes} minute${minutes === 1 ? "" : "s"} ago`;
        }

        const hours = Math.floor(minutes / 60);

        if (hours < 24) {
            return `${hours} hour${hours === 1 ? "" : "s"} ago`;
        }

        const days = Math.floor(hours / 24);

        if (days === 1) {
            return "Yesterday";
        }

        return `${days} days ago`;
    };

    const getProjectColor = (index) => {
        const colors = ["purple", "blue", "green", "orange"];

        return colors[index % colors.length];
    };

    return (
        <div className="app">
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
                        className="nav-item active"
                    >
                        <span>▦</span>
                        Dashboard
                    </Link>

                    <Link
                        to="/projects"
                        className="nav-item"
                    >
                        <span>▣</span>
                        Projects
                    </Link>

                    <Link
                        to="/tasks"
                        className="nav-item"
                    >
                        <span>✓</span>
                        Tasks
                    </Link>

                    <Link
                        to="/ai-assistant"
                        className="nav-item"
                    >
                        <span>✨</span>
                        AI Assistant
                    </Link>


                    <Link
                        to="/activity"
                        className="nav-item"
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
                            {(user?.name || "D")
                                .charAt(0)
                                .toUpperCase()}
                        </div>

                        <div className="user-info">
                            <strong>
                                {user?.name || "Dikshita"}
                            </strong>

                            <span>Workspace owner</span>
                        </div>

                        <button
                            className="logout-button"
                            type="button"
                            onClick={logout}
                        >
                            Logout
                        </button>
                    </div>
                </div>
            </aside>

            <main className="main-content">
                <header className="topbar">
                    <div>
                        <p className="greeting">
                            Good morning, {user?.name || "Dikshita"} 👋
                        </p>

                        <h1>Dashboard</h1>
                    </div>

                    <div className="topbar-actions">
                        <button
                            className="icon-button"
                            type="button"
                        >
                            ⌕
                        </button>

                        <button
                            className="icon-button"
                            type="button"
                        >
                            🔔
                        </button>

                        <Link
                            to="/projects"
                            className="new-project-button"
                        >
                            + New Project
                        </Link>
                    </div>
                </header>

                {loading ? (
                    <div className="page-loading">
                        <div className="loading-spinner"></div>
                        <p>Loading your dashboard...</p>
                    </div>
                ) : error ? (
                    <div className="page-error">
                        <strong>Unable to load dashboard</strong>
                        <p>{error}</p>

                        <button
                            className="primary-button"
                            type="button"
                            onClick={fetchDashboard}
                        >
                            Try Again
                        </button>
                    </div>
                ) : (
                    <>
                        <section className="stats-grid">
                            <div className="stat-card">
                                <div className="stat-header">
                                    <span>Total Projects</span>
                                    <span className="stat-icon">▣</span>
                                </div>

                                <h2>{stats.totalProjects}</h2>

                                <p className="neutral">
                                    Active projects in your workspace
                                </p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-header">
                                    <span>Total Tasks</span>
                                    <span className="stat-icon">✓</span>
                                </div>

                                <h2>{stats.totalTasks}</h2>

                                <p className="neutral">
                                    Tasks across all projects
                                </p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-header">
                                    <span>Completed</span>
                                    <span className="stat-icon">✓</span>
                                </div>

                                <h2>{stats.completedTasks}</h2>

                                <p className="positive">
                                    {stats.completionPercentage}%{" "}
                                    <span>completion rate</span>
                                </p>
                            </div>

                            <div className="stat-card">
                                <div className="stat-header">
                                    <span>In Progress</span>
                                    <span className="stat-icon">◷</span>
                                </div>

                                <h2>{stats.inProgressTasks}</h2>

                                <p className="neutral">
                                    {stats.totalTasks > 0
                                        ? Math.round(
                                            (stats.inProgressTasks /
                                                stats.totalTasks) *
                                            100
                                        )
                                        : 0}
                                    % of total tasks
                                </p>
                            </div>
                        </section>

                        <section className="content-grid">
                            <div className="panel progress-panel">
                                <div className="panel-header">
                                    <div>
                                        <h2>Project Progress</h2>

                                        <p>
                                            Track progress across your active projects.
                                        </p>
                                    </div>

                                    <Link
                                        to="/projects"
                                        className="view-button"
                                    >
                                        View all
                                    </Link>
                                </div>

                                {projectProgress.length === 0 ? (
                                    <div className="panel-empty">
                                        <p>No projects yet.</p>

                                        <Link
                                            to="/projects"
                                            className="primary-button"
                                        >
                                            Create Project
                                        </Link>
                                    </div>
                                ) : (
                                    projectProgress
                                        .slice(0, 5)
                                        .map((project, index) => {
                                            const color = getProjectColor(index);

                                            return (
                                                <div
                                                    className="project-progress"
                                                    key={project.projectId}
                                                >
                                                    <div className="project-row">
                                                        <div className="project-details">
                                                            <div
                                                                className={`project-dot ${color}`}
                                                            ></div>

                                                            <div>
                                                                <strong>
                                                                    {project.projectName}
                                                                </strong>

                                                                <span>
                                                                    {project.completedTasks} of{" "}
                                                                    {project.totalTasks} tasks completed
                                                                </span>
                                                            </div>
                                                        </div>

                                                        <strong>
                                                            {project.progress}%
                                                        </strong>
                                                    </div>

                                                    <div className="progress-bar">
                                                        <div
                                                            className={`progress-fill ${color}-fill`}
                                                            style={{
                                                                width: `${project.progress}%`,
                                                            }}
                                                        ></div>
                                                    </div>
                                                </div>
                                            );
                                        })
                                )}
                            </div>

                            <div className="panel activity-panel">
                                <div className="panel-header">
                                    <div>
                                        <h2>Recent Activity</h2>

                                        <p>
                                            Latest updates from your workspace.
                                        </p>
                                    </div>

                                    <Link
                                        to="/activity"
                                        className="view-button"
                                    >
                                        View all
                                    </Link>
                                </div>

                                {recentTasks.length === 0 ? (
                                    <div className="panel-empty">
                                        <p>No recent task activity yet.</p>
                                    </div>
                                ) : (
                                    recentTasks.map((task, index) => (
                                        <div
                                            className="activity-item"
                                            key={task._id}
                                        >
                                            <div
                                                className={`activity-avatar ${getProjectColor(
                                                    index
                                                )}-avatar`}
                                            >
                                                {(task.assignee?.name ||
                                                    user?.name ||
                                                    "U")
                                                    .charAt(0)
                                                    .toUpperCase()}
                                            </div>

                                            <div>
                                                <p>
                                                    <strong>{task.title}</strong>{" "}
                                                    is{" "}
                                                    <strong>
                                                        {getStatusLabel(task.status)}
                                                    </strong>
                                                </p>

                                                <span>
                                                    {task.project?.name ||
                                                        "No project"}{" "}
                                                    • {getTimeAgo(task.updatedAt)}
                                                </span>
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </section>

                        <section className="ai-section">
                            <div className="ai-content">
                                <div className="ai-icon">✦</div>

                                <div>
                                    <span className="ai-label">
                                        AI ASSISTANT
                                    </span>

                                    <h2>
                                        Need help planning your project?
                                    </h2>

                                    <p>
                                        Let AI generate a structured task list
                                        from your project idea.
                                    </p>
                                </div>
                            </div>

                            <Link
                                to="/ai-assistant"
                                className="ai-button"
                            >
                                Generate Tasks →
                            </Link>
                        </section>
                    </>
                )}
            </main>
        </div>
    );
}

export default Dashboard;