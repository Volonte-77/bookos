import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, AlertCircle } from 'lucide-react'
import Button from '../components/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function Login() {
  const navigate = useNavigate()
  const { login } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')

  const validateForm = () => {
    const newErrors = {}

    if (!email.trim()) {
      newErrors.email = 'Email requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = 'Email invalide'
    }

    if (!password) {
      newErrors.password = 'Mot de passe requis'
    } else if (password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await login(email, password)
      navigate('/')
    } catch (error) {
      setGeneralError('Identifiants incorrects. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-display-2 font-bold text-ink-900">Connexion</h1>
          <p className="text-body text-ink-500">
            Accédez à votre compte Bookos
          </p>
        </div>

        {/* Error Alert */}
        {generalError ? (
          <div className="mb-6 flex gap-3 rounded-2xl bg-red-50 p-4">
            <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
            <p className="text-sm text-red-700">{generalError}</p>
          </div>
        ) : null}

        {/* Form */}
        <form onSubmit={handleSubmit} className="flex flex-col gap-5">
          {/* Email Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="email"
              className="text-sm font-semibold text-ink-900"
            >
              Email
            </label>
            <div className="relative flex items-center">
              <Mail className="absolute left-4 h-5 w-5 text-ink-400" />
              <input
                id="email"
                type="email"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="votre@email.com"
                className={`w-full rounded-2xl border bg-white py-3 pl-12 pr-4 text-body outline-none transition ${
                  errors.email
                    ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                    : 'border-ink-200 focus:border-brand focus:shadow-glow'
                }`}
              />
            </div>
            {errors.email ? (
              <p className="text-sm text-red-600">{errors.email}</p>
            ) : null}
          </div>

          {/* Password Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="password"
              className="text-sm font-semibold text-ink-900"
            >
              Mot de passe
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-5 w-5 text-ink-400" />
              <input
                id="password"
                type="password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                placeholder="••••••••"
                className={`w-full rounded-2xl border bg-white py-3 pl-12 pr-4 text-body outline-none transition ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                    : 'border-ink-200 focus:border-brand focus:shadow-glow'
                }`}
              />
            </div>
            {errors.password ? (
              <p className="text-sm text-red-600">{errors.password}</p>
            ) : null}
          </div>

          {/* Forgot Password */}
          <Link
            to="#"
            className="text-sm font-medium text-brand hover:text-brand-700"
          >
            Mot de passe oublié ?
          </Link>

          {/* Submit */}
          <Button
            variant="primary"
            className="mt-2 w-full"
            loading={loading}
            disabled={loading}
          >
            Connexion
          </Button>
        </form>

        {/* Register Link */}
        <div className="mt-6 text-center">
          <p className="text-body text-ink-500">
            Pas encore de compte ?{' '}
            <Link
              to="/inscription"
              className="font-semibold text-brand hover:text-brand-700"
            >
              S'inscrire
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Login
