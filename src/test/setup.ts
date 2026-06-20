import '@testing-library/jest-dom/vitest'
import { afterAll, afterEach } from 'vitest'
import { server } from './server'

// Start MSW at module-evaluation time (before app modules are imported) so the
// openapi-fetch client, which captures globalThis.fetch when it is created,
// picks up MSW's patched fetch rather than the real network implementation.
server.listen({ onUnhandledRequest: 'error' })

// Reset any per-test handler overrides and clear auth state between tests.
afterEach(() => {
  server.resetHandlers()
  localStorage.clear()
})

afterAll(() => server.close())
