export default function ProfileInfo({ user }) {
  return (
    <div className="profile-panel">
      <div className="panel-header"><h3>Личный кабинет</h3></div>
      <div className="profile-grid">
        <div className="info-box"><span>Имя</span><strong>{user.displayName || 'Не указано'}</strong></div>
        <div className="info-box"><span>Email</span><strong>{user.email}</strong></div>
        <div className="info-box"><span>Роль</span><strong>{user.role || 'user'}</strong></div>
        <div className="info-box"><span>Статус</span><strong>Активен</strong></div>
      </div>
    </div>
  )
}
