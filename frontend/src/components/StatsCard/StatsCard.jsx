import "./StatsCard.css";

function StatsCard({
  title,
  count,
}) {
  return (
    <div className="stats-card">
      <h4>{title}</h4>

      <p>{count}</p>
    </div>
  );
}

export default StatsCard;