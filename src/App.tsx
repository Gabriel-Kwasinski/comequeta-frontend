import './App.css'
import { useAuth } from './auth/AuthContext'
import Login from './components/LoginSignup/Login.tsx'
import Signup from './components/LoginSignup/Signup.tsx'
import MapPage from './components/MapPage/MapPage.tsx'
import ChatPage from './components/ChatPage/ChatPage.tsx'
import ProfilePage from './components/ProfilePage/ProfilePage.tsx'

function App() {
  const { isAuthenticated, isLoading } = useAuth()
  const path = window.location.pathname

  if (isLoading) {
    return <div className="loading">Carregando…</div>
  }

  if (!isAuthenticated) {
    if (path === '/signup') {
      return <Signup />
    }
    return <Login />
  }

  switch (path) {
    case '/chats':
      return <ChatPage />
    case '/profile':
      return <ProfilePage />
    default:
      return <MapPage />
  }
}

export default App
