import { Outlet } from 'react-router-dom'
import Footer from '../components/Footer.jsx'
import Navbar from '../components/Navbar.jsx'

function Layout({
  variant = 'public',
  user = null,
  cartCount = 0,
  navLinks,
  adminLinks,
  children,
  onLogout,
}) {
  const content = children || <Outlet />

  return (
    <div className="flex min-h-screen flex-col bg-ink-50">
      <Navbar
        variant={variant}
        user={user}
        cartCount={cartCount}
        navLinks={navLinks}
        adminLinks={adminLinks}
        onLogout={onLogout}
      />
      <main className="flex-1">{content}</main>
      <Footer />
    </div>
  )
}

export default Layout
