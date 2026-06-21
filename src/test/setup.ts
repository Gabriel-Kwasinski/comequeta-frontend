import '@testing-library/jest-dom/vitest'
import { afterEach } from 'vitest'

// Auth tests hit the real backend (see src/test/backend.ts globalSetup); there
// is no network mock to reset. Just clear persisted auth state between tests.
afterEach(() => {
  localStorage.clear()
})
