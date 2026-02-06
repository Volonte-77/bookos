import { BrowserRouter, Routes, Route } from 'react-router-dom'
import './App.css'
import Layout from './layout/Layout.jsx'
import AdminLayout from './layout/AdminLayout.jsx'
import BookList from './pages/BookList.jsx'
import BookDetail from './pages/BookDetail.jsx'
import Login from './pages/Login.jsx'
import Register from './pages/Register.jsx'
import Checkout from './pages/Checkout.jsx'
import UserDashboard from './pages/UserDashboard.jsx'
import PaymentCallback from './pages/PaymentCallback.jsx'
import PaymentSimulator from './pages/PaymentSimulator.jsx'
import Downloads from './pages/Downloads.jsx'
import AdminDashboard from './pages/admin/AdminDashboard.jsx'
import AdminBooks from './pages/admin/AdminBooks.jsx'
import AdminUsers from './pages/admin/AdminUsers.jsx'
import AdminPayments from './pages/admin/AdminPayments.jsx'
import { AuthProvider, useAuth } from './context/AuthContext.jsx'
import { AdminRoute, ProtectedRoute, PublicRoute } from './components/RouteGuards.jsx'
import { CartProvider } from './context/CartContext.jsx'
import useCart from './hooks/useCart.js'

function AppContent() {
  const { currentUser, logout } = useAuth()
  const { cartCount } = useCart()

  return (
    <Layout user={currentUser} cartCount={cartCount} onLogout={logout}>
      <Routes>
        <Route path="/" element={<BookList />} />
        <Route path="/catalogue" element={<BookList />} />
        <Route path="/livre/:id" element={<BookDetail />} />
        <Route element={<PublicRoute />}>
          <Route path="/connexion" element={<Login />} />
          <Route path="/inscription" element={<Register />} />
        </Route>
        <Route element={<ProtectedRoute />}>
          <Route path="/panier" element={<Checkout user={currentUser} />} />
          <Route path="/profil" element={<UserDashboard user={currentUser} onLogout={logout} />} />
          <Route path="/bibliotheque" element={<Downloads />} />
          <Route path="/paiement/callback" element={<PaymentCallback />} />
          <Route path="/paiement/simulateur" element={<PaymentSimulator />} />
        </Route>
      </Routes>
    </Layout>
  )
}

function App() {
  return (
    <BrowserRouter>
      <AppContent />
    </BrowserRouter>
  )
}

function AppWithAdmin() {
  return (
    <AuthProvider>
      <CartProvider>
        <BrowserRouter>
          <Routes>
            <Route element={<AdminRoute />}>
              <Route path="/admin/*" element={<AdminContent />} />
            </Route>
            <Route path="/*" element={<AppContent />} />
          </Routes>
        </BrowserRouter>
      </CartProvider>
    </AuthProvider>
  )
}

function AdminContent() {
  const { currentUser, logout } = useAuth()

  return (
    <AdminLayout user={currentUser} onLogout={logout}>
      <Routes>
        <Route path="/" element={<AdminDashboard />} />
        <Route path="/livres" element={<AdminBooks />} />
        <Route path="/utilisateurs" element={<AdminUsers />} />
        <Route path="/paiements" element={<AdminPayments />} />
      </Routes>
    </AdminLayout>
  )
}

export default AppWithAdmin
