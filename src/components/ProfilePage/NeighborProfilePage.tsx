import { Link, useParams } from 'react-router-dom'
import { Button, Icon } from '../ui'
import './ProfilePage.css'
import { useNeighborProfile } from './useNeighborProfile'

/**
 * Public profile of a nearby neighbor (`/profile/:id`), US05 / SCRUM-7.
 *
 * Lets the user inspect a neighbor picked from the map (name, avatar, bio,
 * distance) and decide whether to start a chat. Rendered inside the shared
 * Layout via the router.
 */
function NeighborProfilePage() {
  const { id } = useParams<{ id: string }>()
  const numericId = Number(id)
  const { profile, isError } = useNeighborProfile(numericId)

  if (isError || !profile) {
    return (
      <div className="profile-page">
        <h1 className="profile-page__title">Perfil do vizinho</h1>
        <section className="profile-card" aria-label="Perfil indisponível">
          <p className="profile-card__status">
            Não foi possível encontrar este vizinho.
          </p>
          <div className="profile-card__actions">
            <Button
              variant="outline"
              fullWidth
              onClick={() => window.history.back()}
            >
              Voltar
            </Button>
          </div>
        </section>
      </div>
    )
  }

  return (
    <div className="profile-page">
      <h1 className="profile-page__title">Perfil do vizinho</h1>

      <section
        className="profile-card"
        aria-label={`Perfil de ${profile.name}`}
      >
        <img
          className="profile-card__avatar"
          src={profile.avatarUrl}
          alt={`Foto de ${profile.name}`}
        />

        <h2 className="profile-card__name">{profile.name}</h2>

        <span className="profile-card__meta">
          <Icon name="info" size={16} />
          {profile.distance} de distância
        </span>

        <p className="profile-card__bio">{profile.bio}</p>

        <div className="profile-card__actions">
          {/* Opens the chat thread with this neighbour directly (the ChatPage
              honours the ?peer= deep link and selects the conversation). */}
          <Link
            to={`/chats?peer=${numericId}&name=${encodeURIComponent(profile.name)}`}
            style={{ textDecoration: 'none' }}
          >
            <Button
              variant="primary"
              fullWidth
              leadingIcon={<Icon name="user" size={18} />}
            >
              Conversar
            </Button>
          </Link>
        </div>
      </section>
    </div>
  )
}

export default NeighborProfilePage
