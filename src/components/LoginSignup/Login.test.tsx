import { screen, waitFor } from '@testing-library/react'
import userEvent from '@testing-library/user-event'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { getToken } from '../../auth/tokenStorage'
import { renderWithProviders } from '../../test/renderWithProviders'
import { registerUser, uniqueEmail } from '../../test/api'
import Login from './Login'

// Navigation now goes through react-router's useNavigate; spy on it.
const { mockNavigate } = vi.hoisted(() => ({ mockNavigate: vi.fn() }))

vi.mock('react-router-dom', async (importOriginal) => {
  const actual = await importOriginal<typeof import('react-router-dom')>()
  return { ...actual, useNavigate: () => mockNavigate }
})

beforeEach(() => {
  mockNavigate.mockClear()
})

function fillLoginForm() {
  return {
    email: screen.getByPlaceholderText('Email'),
    password: screen.getByPlaceholderText('Senha'),
    submit: screen.getByRole('button', { name: /entrar/i }),
  }
}

// These tests run against the REAL backend (booted by the vitest globalSetup).
describe('Login flow (real backend)', () => {
  it('autentica com sucesso usando credenciais válidas e redireciona', async () => {
    const user = userEvent.setup()
    const email = uniqueEmail('login-ok')
    const password = 'senha-super-1'
    const res = await registerUser({ email, name: 'Ana', password })
    expect(res.status).toBe(201)

    renderWithProviders(<Login />)
    const form = fillLoginForm()

    await user.type(form.email, email)
    await user.type(form.password, password)
    await user.click(form.submit)

    // A real JWT was issued and persisted, and the redirect was triggered.
    await waitFor(() => expect(getToken()).not.toBeNull())
    await waitFor(() => expect(mockNavigate).toHaveBeenCalledWith('/map'))
    expect(screen.queryByText(/inválidos/i)).not.toBeInTheDocument()
  })

  it('não autentica com senha incorreta e exibe mensagem de erro', async () => {
    const user = userEvent.setup()
    const email = uniqueEmail('login-badpass')
    await registerUser({ email, name: 'Ana', password: 'senha-correta-1' })

    renderWithProviders(<Login />)
    const form = fillLoginForm()

    await user.type(form.email, email)
    await user.type(form.password, 'senha-errada-9')
    await user.click(form.submit)

    expect(
      await screen.findByText(
        'E-mail ou senha inválidos. Verifique suas credenciais.',
      ),
    ).toBeInTheDocument()
    expect(getToken()).toBeNull()
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it('não autentica um e-mail inexistente e exibe mensagem de erro', async () => {
    const user = userEvent.setup()

    renderWithProviders(<Login />)
    const form = fillLoginForm()

    await user.type(form.email, uniqueEmail('ghost'))
    await user.type(form.password, 'qualquer-senha-1')
    await user.click(form.submit)

    expect(
      await screen.findByText(
        'E-mail ou senha inválidos. Verifique suas credenciais.',
      ),
    ).toBeInTheDocument()
    expect(getToken()).toBeNull()
  })

  it('exige email e senha (atributos do formulário)', () => {
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

    renderWithProviders(<Login />)
    const passwordInput = screen.getByPlaceholderText(
      'Senha',
    ) as HTMLInputElement

    // A script-laden password against an unknown account: rejected as bad creds.
    await user.type(screen.getByPlaceholderText('Email'), uniqueEmail('xss'))
    await user.type(passwordInput, payload)
    await user.click(screen.getByRole('button', { name: /entrar/i }))

    await screen.findByText(
      'E-mail ou senha inválidos. Verifique suas credenciais.',
    )

    // The script must never execute, and is kept as a plain string value.
    expect((window as unknown as { __xss?: boolean }).__xss).toBeUndefined()
    expect(passwordInput.value).toBe(payload)
    expect(document.querySelector('script[data-xss]')).toBeNull()
  })
})
