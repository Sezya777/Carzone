export default function UserListItem({ user }) {
  return (
    <div className="list-row">
      <div><strong>{user.displayName || 'Пользователь'}</strong><span>{user.email || user.role || 'user'}</span></div>
      <span className={`status-pill ${user.role === 'admin' ? 'success' : 'info'}`}>{user.role || 'user'}</span>
    </div>
  )
}
