import { Outlet } from 'react-router-dom'
import Navigation from '../NavigationBar/Navigation.tsx'

function Layout() {
  return (
    <div>
      <Navigation />
      <Outlet />
    </div>
  )
}

export default Layout
