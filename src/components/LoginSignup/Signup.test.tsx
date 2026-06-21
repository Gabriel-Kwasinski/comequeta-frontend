import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getToken } from '../../auth/tokenStorage'
import { renderWithProviders } from '../../test/renderWithProviders'
import { fetchMe, registerUser, uniqueEmail } from '../../test/api'
import Signup from './Signup'

// Navigation now goes through react-router's useNavigate; spy on it.
const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  mockNavigate.mockClear()
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

// These tests run against the REAL backend (booted by the vitest globalSetup).
describe('Signup flow (real backend)', () => {
  it('cria conta com dados válidos, persiste o usuário, autentica e redireciona', async () => {
    const user = userEvent.setup()
    const email = uniqueEmail('signup-ok')

    renderWithProviders(<Signup />)
    const f = fields()

    await user.type(f.name, 'Bruno')
    await user.type(f.email, email)
    await user.type(f.password, 'senha-super-1')
    await user.type(f.confirm, 'senha-super-1')
    await user.click(f.submit)

    // Authenticated (real JWT persisted) and redirected.
    await waitFor(() => expect(getToken()).not.toBeNull())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/map'))

    // The account was actually persisted by the backend.
    const me = await fetchMe(getToken() as string)
    expect(me).toMatchObject({ email, name: 'Bruno' })
  })

  it('não cria conta quando as senhas não coincidem e mostra erro no formulário', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Signup />)
    const f = fields()

    await user.type(f.name, 'Bruno')
    await user.type(f.email, uniqueEmail('signup-mismatch'))
    await user.type(f.password, 'senha-super-1')
    await user.type(f.confirm, 'senha-diferente-2')
    await user.click(f.submit)

    expect(
      await screen.findByText('As senhas não coincidem.'),
    ).toBeInTheDocument()
    expect(getToken()).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('não cria conta com email já em uso e exibe mensagem de erro', async () => {
    const user = userEvent.setup()
    const email = uniqueEmail('signup-dup')
    const res = await registerUser({
      email,
      name: 'Existente',
      password: 'senha-antiga-1',
    })
    expect(res.status).toBe(201)

    renderWithProviders(<Signup />)
    const f = fields()

    await user.type(f.name, 'Outro')
    await user.type(f.email, email)
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

  it('exige todos os campos obrigatórios (atributos do formulário)', () => {
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
    const email = uniqueEmail('signup-xss')

    renderWithProviders(<Signup />)
    const f = fields()

    await user.type(f.name, payload)
    await user.type(f.email, email)
    await user.type(f.password, 'senha-super-1')
    await user.type(f.confirm, 'senha-super-1')
    await user.click(f.submit)

    await waitFor(() => expect(getToken()).not.toBeNull())

    // The backend stored the payload verbatim as plain text (read it back).
    const me = await fetchMe(getToken() as string)
    expect(me?.name).toBe(payload)
    // It never executed, and the input kept the raw string rather than markup.
    expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined()
    expect(document.querySelector('img[onerror]')).toBeNull()
    expect((f.name as HTMLInputElement).value).toBe(payload)
  })
})
