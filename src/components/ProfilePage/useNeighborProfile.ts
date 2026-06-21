/**
 * Neighbor profile data layer (SCRUM-7 / US05).
 *
 * The API schema currently only exposes auth + `/users/me`, so there is no
 * endpoint to fetch another user's public profile yet. This hook returns a
 * typed MOCK neighbor profile keyed by id so the UI can be built and reviewed.
 *
 * TODO(backend): replace the mock lookup with a real typed query once the API
 * exposes a public-profile endpoint, e.g.:
 *   const { data } = $api.useQuery('get', '/users/{id}', { params: { path: { id } } })
 */

export interface NeighborProfile {
  /** Stable identifier of the neighbor (matches the route param). */
  id: number
  /** Display name shown on the profile card. */
  name: string
  /** Short free-text bio describing the neighbor. */
  bio: string
  /** Avatar image URL. */
  avatarUrl: string
  /** Human-readable distance from the current user, e.g. "350 m". */
  distance: string
}

export interface UseNeighborProfileResult {
  profile?: NeighborProfile
  isLoading: boolean
  isError: boolean
}

// TODO(backend): remove this fixture once a real profile endpoint exists.
const MOCK_NEIGHBORS: Record<number, NeighborProfile> = {
  1: {
    id: 1,
    name: 'Mariana Silva',
    bio: 'Apaixonada por jardinagem e trocas de mudas. Sempre disposta a ajudar a vizinhança.',
    avatarUrl: 'https://i.pravatar.cc/160?img=47',
    distance: '120 m',
  },
  2: {
    id: 2,
    name: 'Carlos Mendes',
    bio: 'Marceneiro nas horas vagas. Empresto ferramentas e adoro um bom papo sobre reformas.',
    avatarUrl: 'https://i.pravatar.cc/160?img=12',
    distance: '340 m',
  },
  3: {
    id: 3,
    name: 'Beatriz Rocha',
    bio: 'Faço pães artesanais e organizo feirinhas no bairro. Bora se conhecer?',
    avatarUrl: 'https://i.pravatar.cc/160?img=32',
    distance: '780 m',
  },
}

function buildFallbackProfile(id: number): NeighborProfile {
  return {
    id,
    name: `Vizinho #${id}`,
    bio: 'Este vizinho ainda não preencheu uma descrição.',
    avatarUrl: `https://i.pravatar.cc/160?u=${id}`,
    distance: 'Distância indisponível',
  }
}

/**
 * Returns a (mock) neighbor profile by id.
 *
 * Mirrors the shape of a future `$api.useQuery` call so swapping the data
 * source later does not require changes in the consuming component.
 */
export function useNeighborProfile(id: number): UseNeighborProfileResult {
  if (Number.isNaN(id)) {
    return { profile: undefined, isLoading: false, isError: true }
  }

  const profile = MOCK_NEIGHBORS[id] ?? buildFallbackProfile(id)

  return { profile, isLoading: false, isError: false }
}
