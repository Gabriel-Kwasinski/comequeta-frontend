import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { http, HttpResponse } from 'msw'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getToken } from '../../auth/tokenStorage'
import { renderWithProviders } from '../../test/renderWithProviders'
import { resetUserStore, seedUser } from '../../test/handlers'
import { server } from '../../test/server'
import Login from './Login'

const API = 'http://localhost:8000'

// Navigation now goes through react-router's useNavigate; spy on it.
const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  resetUserStore()
  mockNavigate.mockClear()
})

afterEach(() => {
  vi.restoreAllMocks()
})

function fillLoginForm() {
  return {
    email: screen.getByPlaceholderText('Email'),
    password: screen.getByPlaceholderText('Senha'),
    submit: screen.getByRole('button', { name: /entrar/i }),
  }
}

describe('Login flow', () => {
  it('autentica com sucesso usando credenciais válidas e redireciona', async () => {
    const user = userEvent.setup()
    seedUser({
      email: 'ana@example.com',
      name: 'Ana',
      password: 'senha-segura-1',
    })

    renderWithProviders(<Login />)
    const form = fillLoginForm()

    await user.type(form.email, 'ana@example.com')
    await user.type(form.password, 'senha-segura-1')
    await user.click(form.submit)

    // Token persisted and redirect issued -> authenticated.
    await waitFor(() => expect(getToken()).not.toBeNull())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/map'))
    expect(screen.queryByText(/inválidos/i)).not.toBeInTheDocument()
  })

  it('não autentica com credenciais inválidas e exibe mensagem de erro', async () => {
    const user = userEvent.setup()
    seedUser({
      email: 'ana@example.com',
      name: 'Ana',
      password: 'senha-correta',
    })

    renderWithProviders(<Login />)
    const form = fillLoginForm()

    await user.type(form.email, 'ana@example.com')
    await user.type(form.password, 'senha-errada')
    await user.click(form.submit)

    expect(
      await screen.findByText(
        'E-mail ou senha inválidos. Verifique suas credenciais.',
      ),
    ).toBeInTheDocument()
    expect(getToken()).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('exibe mensagem de erro quando o servidor falha', async () => {
    const user = userEvent.setup()
    server.use(
      http.post(`${API}/auth/login`, () =>
        HttpResponse.json({ detail: 'boom' }, { status: 500 }),
      ),
    )

    renderWithProviders(<Login />)
    const form = fillLoginForm()

    await user.type(form.email, 'ana@example.com')
    await user.type(form.password, 'qualquer-senha')
    await user.click(form.submit)

    expect(
      await screen.findByText(
        'E-mail ou senha inválidos. Verifique suas credenciais.',
      ),
    ).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('exige email e senha (validação nativa do formulário)', async () => {
    renderWithProviders(<Login />)
    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText(
      'Senha',
    ) as HTMLInputElement

    expect(emailInput).toBeRequired()
    expect(emailInput).toHaveAttribute('type', 'email')
    expect(passwordInput).toBeRequired()
    expect(passwordInput).toHaveAttribute('type', 'password')
  })

  it('trata scripts maliciosos como texto comum (sem execução / sem injeção)', async () => {
    const user = userEvent.setup()
    const payload = '<script>window.__xss = true</script>'
    let receivedUsername: string | null = null

    server.use(
      http.post(`${API}/auth/login`, async ({ request }) => {
        const form = new URLSearchParams(await request.text())
        receivedUsername = form.get('username')
        return HttpResponse.json({ detail: 'nope' }, { status: 401 })
      }),
    )

    renderWithProviders(<Login />)
    const emailInput = screen.getByPlaceholderText('Email') as HTMLInputElement
    const passwordInput = screen.getByPlaceholderText(
      'Senha',
    ) as HTMLInputElement

    // Use a real (but script-laden) string in the password to avoid type=email rejection.
    await user.type(emailInput, 'attacker@example.com')
    await user.type(passwordInput, payload)
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await screen.findByText(
      'E-mail ou senha inválidos. Verifique suas credenciais.',
    )

    // The script must never execute...
    expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined()
    // ...and it must be carried as a plain string value, not rendered as DOM.
    expect(passwordInput.value).toBe(payload)
    expect(receivedUsername).toBe('attacker@example.com')
    expect(document.querySelector('script[data-xss]')).toBeNull()
  })
})
