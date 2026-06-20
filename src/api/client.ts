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
