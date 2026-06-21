import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import { Button, Input, useOptionalToast } from '../ui'
import './Login.css'
import { validateEmail, validateLoginPassword } from './validation'

interface FieldErrors {
  email?: string
  password?: string
}

function Login() {
  const { login } = useAuth()
  const navigate = useNavigate()
  const toast = useOptionalToast()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [remember, setRemember] = useState(true)
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
      await login(email, password, remember)
      setIsSuccess(true)
      toast?.success('Login realizado! Redirecionando…')
      navigate('/map')
    } catch {
      const message = 'E-mail ou senha inválidos. Verifique suas credenciais.'
      setFormError(message)
      toast?.error(message)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="container" onSubmit={handleSubmit} noValidate>
      <img src="/logo.png" alt="Comé que Tá" className="auth-logo" />
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <Input
            bare
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
            invalid={!!fieldErrors.email}
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
          <Input
            bare
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
            invalid={!!fieldErrors.password}
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
      <label className="remember-me">
        <input
          type="checkbox"
          checked={remember}
          onChange={(e) => setRemember(e.target.checked)}
        />
        <span>Lembrar de mim</span>
      </label>
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
        <Button
          className="submit"
          variant="primary"
          pill
          type="submit"
          disabled={isSubmitting || isSuccess}
        >
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </Button>
      </div>
      {/* SCRUM-18: placeholder de login social — OAuth ainda não implementado. */}
      <div className="oauth-container">
        <Button
          type="button"
          variant="outline"
          pill
          fullWidth
          title="Em breve"
          onClick={() =>
            toast?.info('Login com Google estará disponível em breve.')
          }
        >
          Continuar com Google
        </Button>
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
