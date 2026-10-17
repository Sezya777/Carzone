export default function Skeleton({ width = '100%', height = '20px', borderRadius = '6px' }) {
  return (
    <div
      className="skeleton"
      style={{width, height, borderRadius}}
      role="status"
      aria-label="Loading..."
    />
  )
}
