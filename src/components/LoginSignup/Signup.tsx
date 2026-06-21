import { type FormEvent, useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { useAuth } from '../../auth/AuthContext'
import './Signup.css'
import {
  describeRegisterError,
  PASSWORD_MIN_LENGTH,
  validateConfirmPassword,
  validateEmail,
  validateName,
  validatePassword,
} from './validation'

interface FieldErrors {
  name?: string
  email?: string
  password?: string
  confirmPassword?: string
}

function Signup() {
  const { register } = useAuth()
  const navigate = useNavigate()
  const [name, setName] = useState('')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [confirmPassword, setConfirmPassword] = useState('')
  const [fieldErrors, setFieldErrors] = useState<FieldErrors>({})
  const [formError, setFormError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSuccess, setIsSuccess] = useState(false)

  function validate(): FieldErrors {
    return {
      name: validateName(name),
      email: validateEmail(email),
      password: validatePassword(password),
      confirmPassword: validateConfirmPassword(password, confirmPassword),
    }
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setFormError(undefined)

    const errors = validate()
    setFieldErrors(errors)
    if (
      errors.name ||
      errors.email ||
      errors.password ||
      errors.confirmPassword
    ) {
      return
    }

    setIsSubmitting(true)
    try {
      await register(email, name, password)
      setIsSuccess(true)
      navigate('/map')
    } catch (error) {
      setFormError(describeRegisterError(error))
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="container" onSubmit={handleSubmit} noValidate>
      <div className="header">
        <div className="text">Signup</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="text"
            placeholder="Nome completo"
            value={name}
            onChange={(e) => setName(e.target.value)}
            onBlur={() =>
              setFieldErrors((prev) => ({ ...prev, name: validateName(name) }))
            }
            aria-label="Nome completo"
            aria-required="true"
            aria-invalid={!!fieldErrors.name}
            aria-describedby={
              fieldErrors.name ? 'signup-name-error' : undefined
            }
            required
          />
        </div>
        {fieldErrors.name && (
          <p id="signup-name-error" className="field-error" role="alert">
            {fieldErrors.name}
          </p>
        )}
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
              fieldErrors.email ? 'signup-email-error' : undefined
            }
            required
          />
        </div>
        {fieldErrors.email && (
          <p id="signup-email-error" className="field-error" role="alert">
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
                password: validatePassword(password),
              }))
            }
            aria-label="Senha"
            aria-required="true"
            aria-invalid={!!fieldErrors.password}
            aria-describedby={
              fieldErrors.password
                ? 'signup-password-error'
                : 'signup-password-hint'
            }
            required
          />
        </div>
        {fieldErrors.password ? (
          <p id="signup-password-error" className="field-error" role="alert">
            {fieldErrors.password}
          </p>
        ) : (
          <p id="signup-password-hint" className="field-hint">
            Mínimo de {PASSWORD_MIN_LENGTH} caracteres.
          </p>
        )}
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="password"
            placeholder="Confirmar senha"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            onBlur={() =>
              setFieldErrors((prev) => ({
                ...prev,
                confirmPassword: validateConfirmPassword(
                  password,
                  confirmPassword,
                ),
              }))
            }
            aria-label="Confirmar senha"
            aria-required="true"
            aria-invalid={!!fieldErrors.confirmPassword}
            aria-describedby={
              fieldErrors.confirmPassword ? 'signup-confirm-error' : undefined
            }
            required
          />
        </div>
        {fieldErrors.confirmPassword && (
          <p id="signup-confirm-error" className="field-error" role="alert">
            {fieldErrors.confirmPassword}
          </p>
        )}
      </div>
      {formError && (
        <p className="auth-error" role="alert">
          {formError}
        </p>
      )}
      {isSuccess && (
        <p className="auth-success" role="status">
          Conta criada com sucesso! Redirecionando…
        </p>
      )}
      <div className="submit-container">
        <button
          className="submit"
          type="submit"
          disabled={isSubmitting || isSuccess}
        >
          {isSubmitting ? 'Criando…' : 'Criar Conta'}
        </button>
      </div>
      <div className="register">
        Ja tem uma conta?
        <Link className="login-btn" to="/">
          {' '}
          Entrar
        </Link>
      </div>
    </form>
  )
}

export default Signup
