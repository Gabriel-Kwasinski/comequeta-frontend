import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import './Login.css'
import { validateEmail, validateLoginPassword } from './validation'

interface FieldErrors {
  email?: string
  password?: string
}

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  function validate(): FieldErrors {
    return {
      email: validateEmail(email),
      password: validateLoginPassword(password),
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(undefined)

    const errors = validate()
    setFieldErrors(errors)
    if (errors.email || errors.password) {
      return
    }

    setIsSubmitting(true)
    try {
      await login(email, password)
      setIsSuccess(true)
      navigate('/map')
    } catch {
      setFormError('E-mail ou senha inválidos. Verifique suas credenciais.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="container" onSubmit={handleSubmit} noValidate>
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            onBlur={() =>
              setFieldErrors((prev) => ({
                ...prev,
                email: validateEmail(email),
              }))
            }
            aria-label="E-mail"
            aria-required="true"
            aria-invalid={!!fieldErrors.email}
            aria-describedby={
              fieldErrors.email ? 'login-email-error' : undefined
            }
            required
          />
        </div>
        {fieldErrors.email && (
          <p id="login-email-error" className="field-error" role="alert">
            {fieldErrors.email}
          </p>
        )}
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            onBlur={() =>
              setFieldErrors((prev) => ({
                ...prev,
                password: validateLoginPassword(password),
              }))
            }
            aria-label="Senha"
            aria-required="true"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={
              fieldErrors.password ? 'login-password-error' : undefined
            }
            required
          />
        </div>
        {fieldErrors.password && (
          <p id="login-password-error" className="field-error" role="alert">
            {fieldErrors.password}
          </p>
        )}
      </div>
      <div className="forgot-password">
        <span> Esqueci minha senha</span>
      </div>
      {formError && (
        <p className="auth-error" role="alert">
          {formError}
        </p>
      )}
      {isSuccess && (
        <p className="auth-success" role="status">
          Login realizado! Redirecionando…
        </p>
      )}
      <div className="submit-container">
        <button
          className="submit"
          type="submit"
          disabled={isSubmitting || isSuccess}
        >
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
      <div className="register">
        Nao tem uma conta?
        <Link className="register-btn" to="/signup">
          {' '}
          Registre-se
        </Link>
      </div>
    </form>
  )
}

export default Login
