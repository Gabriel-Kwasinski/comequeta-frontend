import { type FormEvent, useState } from 'react'
import { useAuth } from '../../auth/AuthContext'
import './Login.css'

function Login() {
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState<string>()
  const [isSubmitting, setIsSubmitting] = useState(false)

  async function handleSubmit(event: FormEvent) {
    event.preventDefault()
    setError(undefined)
    setIsSubmitting(true)
    try {
      await login(email, password)
      window.location.href = '/map'
    } catch {
      setError('Email ou senha inválidos.')
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form className="container" onSubmit={handleSubmit}>
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
            required
          />
        </div>
      </div>
      <div className="inputs">
        <div className="input">
          <input
            type="password"
            placeholder="Senha"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            minLength={8}
            required
          />
        </div>
      </div>
      <div className="forgot-password">
        <span> Esqueci minha senha</span>
      </div>
      {error && <p className="auth-error">{error}</p>}
      <div className="submit-container">
        <button className="submit" type="submit" disabled={isSubmitting}>
          {isSubmitting ? 'Entrando…' : 'Entrar'}
        </button>
      </div>
      <div className="register">
        Nao tem uma conta?
        <a className="register-btn" href="/signup"> Registre-se</a>
      </div>
    </form>
  )
}

export default Login
