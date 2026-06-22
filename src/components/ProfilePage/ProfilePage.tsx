import { useQueryClient } from '@tanstack/react-query'
import { useState } from 'react'
import { $api } from '../../api/client'
import { useAuth } from '../../auth/AuthContext'
import { Button, Icon } from '../ui'
import { useOptionalToast } from '../ui/Toast/useToast'
import './ProfilePage.css'

const BIO_MAX_LENGTH = 500

/**
 * Authenticated user's own profile (`/profile`).
 *
 * Presents the current user's info from `useAuth().user` using design-system
 * components, lets them edit their bio (PUT `/users/me`) and exposes logout.
 */
function ProfilePage() {
  const { user, logout } = useAuth()
  const queryClient = useQueryClient()
  const toast = useOptionalToast()

  const initial = user?.name?.charAt(0).toUpperCase() ?? '?'

  const [isEditing, setIsEditing] = useState(false)
  const [draft, setDraft] = useState('')

  const startEditing = () => {
    setDraft(user?.bio ?? '')
    setIsEditing(true)
  }

  const updateProfile = $api.useMutation('put', '/users/me', {
    onSuccess: async () => {
      await queryClient.invalidateQueries({ queryKey: ['get', '/users/me'] })
      setIsEditing(false)
      toast?.success('Perfil salvo com sucesso!')
    },
    onError: () => {
      toast?.error('Não foi possível salvar. Tente novamente.')
    },
  })

  const save = () => {
    if (!user) return
    const trimmed = draft.trim()
    updateProfile.mutate({
      body: { name: user.name, bio: trimmed === '' ? null : trimmed },
    })
  }

  const cancel = () => {
    setDraft(user?.bio ?? '')
    setIsEditing(false)
  }

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

            {isEditing ? (
              <div className="profile-card__bio-edit">
                <label className="profile-card__bio-label" htmlFor="bio">
                  Sua bio
                </label>
                <textarea
                  id="bio"
                  className="profile-card__bio-input"
                  value={draft}
                  maxLength={BIO_MAX_LENGTH}
                  rows={4}
                  placeholder="Conte um pouco sobre você para os vizinhos…"
                  onChange={(e) => setDraft(e.target.value)}
                />
                <span className="profile-card__bio-count">
                  {draft.length}/{BIO_MAX_LENGTH}
                </span>
              </div>
            ) : (
              <p className="profile-card__bio">
                {user.bio?.trim()
                  ? user.bio
                  : 'Você ainda não preencheu uma bio.'}
              </p>
            )}
          </>
        ) : (
          <p className="profile-card__status">Carregando seus dados…</p>
        )}

        <div className="profile-card__actions">
          {user &&
            (isEditing ? (
              <>
                <Button
                  variant="primary"
                  fullWidth
                  onClick={save}
                  disabled={updateProfile.isPending}
                  leadingIcon={<Icon name="info" size={18} />}
                >
                  {updateProfile.isPending ? 'Salvando…' : 'Salvar'}
                </Button>
                <Button
                  variant="outline"
                  fullWidth
                  onClick={cancel}
                  disabled={updateProfile.isPending}
                >
                  Cancelar
                </Button>
              </>
            ) : (
              <Button
                variant="primary"
                fullWidth
                onClick={startEditing}
                leadingIcon={<Icon name="user" size={18} />}
              >
                Editar bio
              </Button>
            ))}

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
