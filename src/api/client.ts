import createFetchClient from 'openapi-fetch'
import createQueryClient from 'openapi-react-query'
import { clearToken, getToken } from '../auth/tokenStorage'
import type { paths } from './schema'

export const fetchClient = createFetchClient<paths>({
  baseUrl: import.meta.env.VITE_API_URL ?? 'http://localhost:8000',
})

fetchClient.use({
  onRequest({ request }) {
    const token = getToken()
    if (token) {
      request.headers.set('Authorization', `Bearer ${token}`)
    }
    // Skip ngrok's browser-warning interstitial when the API is tunneled.
    request.headers.set('ngrok-skip-browser-warning', 'true')
    return request
  },
  onResponse({ response }) {
    if (response.status === 401) {
      clearToken()
    }
    return response
  },
})

export const $api = createQueryClient(fetchClient)
