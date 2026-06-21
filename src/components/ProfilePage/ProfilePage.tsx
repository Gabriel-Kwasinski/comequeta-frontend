import { useAuth } from '../../auth/AuthContext'
import { Button } from '../ui'

function ProfilePage() {
  const { user, logout } = useAuth()

  return (
    <div>
      <h1>Perfil</h1>
      {user && (
        <p>
          Olá, <strong>{user.name}</strong>! ({user.email})
        </p>
      )}
      <Button type="button" variant="outline" onClick={logout}>
        Sair
      </Button>
    </div>
  )
}

export default ProfilePage
