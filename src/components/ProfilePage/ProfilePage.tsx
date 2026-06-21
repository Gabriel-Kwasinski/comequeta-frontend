import { useAuth } from '../../auth/AuthContext'
import { Button, Icon } from '../ui'
import './ProfilePage.css'

/**
 * Authenticated user's own profile (`/profile`).
 *
 * Presents the current user's info from `useAuth().user` using design-system
 * components and exposes the logout action.
 */
function ProfilePage() {
  const { user, logout } = useAuth()

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?'

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Meu perfil</h1>

      <section className="profile-card" aria-label="Meu perfil">
        <div
          className="profile-card__avatar"
          aria-hidden="true"
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: 'var(--ds-font-size-2xl)',
            color: 'var(--ds-color-primary)',
          }}
        >
          {initial}
        </div>

        {user ? (
          <>
            <h2 className="profile-card__name">{user.name}</h2>
            <span className="profile-card__meta">
              <Icon name="mail" size={16} />
              {user.email}
            </span>
          </>
        ) : (
          <p className="profile-card__status">Carregando seus dados…</p>
        )}

        <div className="profile-card__actions">
          <Button
            variant="outline"
            fullWidth
            onClick={logout}
            leadingIcon={<Icon name="close" size={18} />}
          >
            Sair
          </Button>
        </div>
      </section>
    </div>
  )
}

export default ProfilePage
