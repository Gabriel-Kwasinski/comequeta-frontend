import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { getToken } from '../../auth/tokenStorage'
import { renderWithProviders } from '../../test/renderWithProviders'
import { resetUserStore, seedUser, userStore } from '../../test/handlers'
import Signup from './Signup'

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

function fields() {
  return {
    name: screen.getByPlaceholderText('Nome completo'),
    email: screen.getByPlaceholderText('Email'),
    password: screen.getByPlaceholderText('Senha'),
    confirm: screen.getByPlaceholderText('Confirmar senha'),
    submit: screen.getByRole('button', { name: /criar conta/i }),
  }
}

describe('Signup flow', () => {
  it('cria conta com dados válidos, persiste o usuário, autentica e redireciona', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Signup />)
    const f = fields()

    await user.type(f.name, 'Bruno')
    await user.type(f.email, 'bruno@example.com')
    await user.type(f.password, 'senha-super-1')
    await user.type(f.confirm, 'senha-super-1')
    await user.click(f.submit)

    // Account persisted by the (mocked) backend...
    await waitFor(() => expect(userStore.has('bruno@example.com')).toBe(true))
    const stored = userStore.get('bruno@example.com')
    expect(stored).toMatchObject({ email: 'bruno@example.com', name: 'Bruno' })

    // ...and the user is authenticated (token set) and redirected.
    await waitFor(() => expect(getToken()).not.toBeNull())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/map'))
  })

  it('não cria conta quando as senhas não coincidem e mostra erro no formulário', async () => {
    const user = userEvent.setup()
    renderWithProviders(<Signup />)
    const f = fields()

    await user.type(f.name, 'Bruno')
    await user.type(f.email, 'bruno@example.com')
    await user.type(f.password, 'senha-super-1')
    await user.type(f.confirm, 'senha-diferente-2')
    await user.click(f.submit)

    expect(
      await screen.findByText('As senhas não coincidem.'),
    ).toBeInTheDocument()
    expect(userStore.has('bruno@example.com')).toBe(false)
    expect(getToken()).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('não cria conta com email já em uso e exibe mensagem de erro', async () => {
    const user = userEvent.setup()
    seedUser({
      email: 'existe@example.com',
      name: 'Existente',
      password: 'senha-antiga-1',
    })

    renderWithProviders(<Signup />)
    const f = fields()

    await user.type(f.name, 'Outro')
    await user.type(f.email, 'existe@example.com')
    await user.type(f.password, 'senha-nova-9')
    await user.type(f.confirm, 'senha-nova-9')
    await user.click(f.submit)

    expect(
      await screen.findByText(
        'Este e-mail já está em uso. Tente entrar ou use outro e-mail.',
      ),
    ).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('exige todos os campos obrigatórios (validação nativa)', () => {
    renderWithProviders(<Signup />)
    const f = fields()

    expect(f.name).toBeRequired()
    expect(f.email).toBeRequired()
    expect(f.email).toHaveAttribute('type', 'email')
    expect(f.password).toBeRequired()
    expect(f.password).toHaveAttribute('type', 'password')
    expect(f.confirm).toBeRequired()
    expect(f.confirm).toHaveAttribute('type', 'password')
  })

  it('trata scripts maliciosos no nome como texto comum (sem execução / sem injeção)', async () => {
    const user = userEvent.setup()
    const payload = '<img src=x onerror="window.__xss=true">'

    renderWithProviders(<Signup />)
    const f = fields()

    await user.type(f.name, payload)
    await user.type(f.email, 'safe@example.com')
    await user.type(f.password, 'senha-super-1')
    await user.type(f.confirm, 'senha-super-1')
    await user.click(f.submit)

    await waitFor(() => expect(userStore.has('safe@example.com')).toBe(true))

    // The payload is stored verbatim as plain text, never executed or rendered as HTML.
    expect(userStore.get('safe@example.com')?.name).toBe(payload)
    expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined()
    expect(document.querySelector('img[onerror]')).toBeNull()
    // The input keeps the raw string value rather than interpreting it as markup.
    expect((f.name as HTMLInputElement).value).toBe(payload)
  })
})
