import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { render } from '@testing-library/react'
import type { ReactElement } from 'react'
import { AuthProvider } from '../auth/AuthContext'

/**
 * Renders a component inside the providers the auth flow needs:
 * a fresh React Query client (retries disabled for fast, deterministic tests)
 * and the real AuthProvider so the actual auth logic is exercised.
 */
export function renderWithProviders(ui: ReactElement) {
  const queryClient = new QueryClient({
    defaultOptions: {
      queries: { retry: false },
      mutations: { retry: false },
    },
  })

  return render(
    <QueryClientProvider client={queryClient}>
      <AuthProvider>{ui}</AuthProvider>
    </QueryClientProvider>,
  )
}
