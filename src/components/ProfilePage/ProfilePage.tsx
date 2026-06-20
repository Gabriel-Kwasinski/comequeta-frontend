import Navigation from '../NavigationBar/Navigation.tsx'
import { useAuth } from '../../auth/AuthContext'

function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div>
      <Navigation />
      <h1>Perfil</h1>
      {user && (
        <p>
          Olá, <strong>{user.name}</strong>! ({user.email})
        </p>
      )}
      <button type="button" onClick={logout}>
        Sair
      </button>
    </div>
  )
}

export default ProfilePage
