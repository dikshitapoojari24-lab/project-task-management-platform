function StatCard({
  title,
  value,
  icon,
  description,
  descriptionType = "neutral",
}) {
  return (
    <div className="stat-card">
      <div className="stat-header">
        <span>{title}</span>

        <span className="stat-icon">
          {icon}
        </span>
      </div>

      <h2>{value}</h2>

      <p className={descriptionType}>
        {description}
      </p>
    </div>
  );
}

export default StatCard;

