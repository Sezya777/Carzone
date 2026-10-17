import StatCard from './StatCard'

export default function AdminStatsGrid({ stats }) {
  return (
    <div className="admin-stats">
      {stats.map((stat) => <StatCard key={stat.label} {...stat} />)}
    </div>
  )
}
