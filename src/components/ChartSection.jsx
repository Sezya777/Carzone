import { BarChart, Bar, XAxis, YAxis, Tooltip, CartesianGrid, ResponsiveContainer } from 'recharts'

export default function ChartSection({ requests }) {
  // Build data: count requests by date
  const data = (() => {
    const counts = {}
    requests.forEach((r) => {
      const date = r.date || (r.createdAt?.toDate ? r.createdAt.toDate().toLocaleDateString('ru-RU') : 'Н/Д')
      counts[date] = (counts[date] || 0) + 1
    })
    // If no data, show demo
    if (Object.keys(counts).length === 0) {
      return [
        { date: '01.06', count: 3 },
        { date: '02.06', count: 7 },
        { date: '03.06', count: 2 },
        { date: '04.06', count: 9 },
        { date: '05.06', count: 5 },
        { date: '06.06', count: 11 },
        { date: '07.06', count: 4 },
      ]
    }
    return Object.entries(counts).slice(0, 10).map(([date, count]) => ({ date, count }))
  })()

  return (
    <div className="panel-card chart-section">
      <div className="panel-header"><h3>Заявки по датам</h3></div>
      <ResponsiveContainer width="100%" height={220}>
        <BarChart data={data} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
          <CartesianGrid strokeDasharray="3 3" stroke="rgba(255,255,255,0.1)" />
          <XAxis dataKey="date" tick={{ fill: 'var(--muted)', fontSize: 12 }} />
          <YAxis tick={{ fill: 'var(--muted)', fontSize: 12 }} allowDecimals={false} />
          <Tooltip contentStyle={{ background: 'var(--bg-panel)', border: '1px solid var(--line)', color: 'var(--text)' }} />
          <Bar dataKey="count" fill="var(--accent)" radius={[4, 4, 0, 0]} />
        </BarChart>
      </ResponsiveContainer>
    </div>
  )
}
