export default function StatCard({ label, value, growth }) {
  return (
    <div className="stat-card">
      <div className="stat-card-top"><span>{label}</span><strong>{growth}</strong></div>
      <div className="stat-card-value">{value}</div>
    </div>
  )
}
