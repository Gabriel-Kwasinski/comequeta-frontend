import { useState } from 'react'
import './Login.css'

function Login() {
  return (
    <div className="container">
      <div className="header">
        <div className="text">Login</div>
        <div className="underline"></div>
      </div>
      <div className="inputs">
        <div className="input">
          <input type="text" placeholder="Email"></input>
        </div>
      </div>
      <div className="inputs">
        <div className="input">
          <input type="email" placeholder="Senha"></input>
        </div>
      </div>
      <div className="forgot-password">
        <span> Esqueci minha senha</span>
      </div>
      <div className="submit-container">
        <a className="submit" href="/map">
          Entrar
        </a>
      </div>
      <div className="register">
        Nao tem uma conta?
        <a className="register-btn" href="/signup">
          {' '}
          Registre-se
        </a>
      </div>
    </div>
  )
}

export default Login
