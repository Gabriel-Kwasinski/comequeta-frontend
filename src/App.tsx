import { BrowserRouter, Navigate, Route, Routes } from 'react-router-dom'
import './App.css'
import { useAuth } from './auth/AuthContext'
import Layout from './components/Layout/Layout.tsx'
import ProtectedRoute from './components/ProtectedRoute/ProtectedRoute.tsx'
import Login from './components/LoginSignup/Login.tsx'
import Signup from './components/LoginSignup/Signup.tsx'
import TermsPage from './components/TermsPage/TermsPage.tsx'
import MapPage from './components/MapPage/MapPage.tsx'
import ChatPage from './components/ChatPage/ChatPage.tsx'
import ProfilePage from './components/ProfilePage/ProfilePage.tsx'
import NeighborProfilePage from './components/ProfilePage/NeighborProfilePage.tsx'

function PublicRoute({ children }: { children: React.ReactNode }) {
  const { isAuthenticated, isLoading } = useAuth()

  if (isLoading) {
    return <div className="loading">Carregando…</div>
  }

  if (isAuthenticated) {
    return <Navigate to="/map" replace />
  }

  return children
}

function App() {
  return (
    <BrowserRouter>
      <Routes>
        <Route
          path="/"
          element={
            <PublicRoute>
              <Login />
            </PublicRoute>
          }
        />
        <Route
          path="/signup"
          element={
            <PublicRoute>
              <Signup />
            </PublicRoute>
          }
        />
        <Route path="/termos" element={<TermsPage />} />
        <Route element={<ProtectedRoute />}>
          <Route element={<Layout />}>
            <Route path="/map" element={<MapPage />} />
            <Route path="/chats" element={<ChatPage />} />
            <Route path="/profile" element={<ProfilePage />} />
            <Route path="/profile/:id" element={<NeighborProfilePage />} />
          </Route>
        </Route>
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </BrowserRouter>
  )
}

export default App
