import { useEffect, useState } from "react";
import api from "../services/api";
import ActivityList from "../components/ActivityList";

function Activity() {
  const [activities, setActivities] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  const fetchActivity = async () => {
    try {
      setLoading(true);
      setError("");

      const response = await api.get(
        "/activity?limit=50"
      );

      setActivities(response.data.activities || []);
    } catch (error) {
      setError(
        error.response?.data?.message ||
          "Unable to load activity."
      );
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchActivity();
  }, []);

  if (loading) {
    return (
      <div className="page-loading">
        <div className="loading-spinner"></div>
        <p>Loading activity...</p>
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

          <h1>Activity</h1>

          <p>
            Keep track of recent updates across your
            workspace.
          </p>
        </div>

        <button
          type="button"
          className="secondary-button"
          onClick={fetchActivity}
        >
          Refresh
        </button>
      </div>

      {error && (
        <div className="page-error">
          <strong>Unable to load activity</strong>

          <p>{error}</p>

          <button
            type="button"
            className="primary-button"
            onClick={fetchActivity}
          >
            Try Again
          </button>
        </div>
      )}

      {!error && (
        <div className="panel">
          <div className="panel-header">
            <div>
              <h2>Recent Activity</h2>

              <p>
                Your latest project and task updates.
              </p>
            </div>
          </div>

          <ActivityList
            activities={activities}
          />
        </div>
      )}
    </div>
  );
}

export default Activity;