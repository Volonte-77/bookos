import { useState } from 'react'
import { useNavigate, Link } from 'react-router-dom'
import { Mail, Lock, User, AlertCircle, CheckCircle } from 'lucide-react'
import Button from '../components/Button.jsx'
import { useAuth } from '../context/AuthContext.jsx'

function Register() {
  const navigate = useNavigate()
  const { register } = useAuth()
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    password: '',
    passwordConfirm: '',
  })
  const [errors, setErrors] = useState({})
  const [loading, setLoading] = useState(false)
  const [generalError, setGeneralError] = useState('')
  const [agreedToTerms, setAgreedToTerms] = useState(false)

  const passwordStrength = (pwd) => {
    if (!pwd) return 0
    let strength = 0
    if (pwd.length >= 8) strength++
    if (/[a-z]/.test(pwd) && /[A-Z]/.test(pwd)) strength++
    if (/\d/.test(pwd)) strength++
    if (/[^a-zA-Z\d]/.test(pwd)) strength++
    return strength
  }

  const validateForm = () => {
    const newErrors = {}

    if (!formData.name.trim()) {
      newErrors.name = 'Nom requis'
    } else if (formData.name.trim().length < 2) {
      newErrors.name = 'Minimum 2 caractères'
    }

    if (!formData.email.trim()) {
      newErrors.email = 'Email requis'
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = 'Email invalide'
    }

    if (!formData.password) {
      newErrors.password = 'Mot de passe requis'
    } else if (formData.password.length < 6) {
      newErrors.password = 'Minimum 6 caractères'
    }

    if (!formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Confirmer le mot de passe'
    } else if (formData.password !== formData.passwordConfirm) {
      newErrors.passwordConfirm = 'Les mots de passe ne correspondent pas'
    }

    if (!agreedToTerms) {
      newErrors.terms = 'Acceptez les conditions'
    }

    setErrors(newErrors)
    return Object.keys(newErrors).length === 0
  }

  const handleChange = (e) => {
    const { name, value } = e.target
    setFormData((prev) => ({ ...prev, [name]: value }))
  }

  const handleSubmit = async (e) => {
    e.preventDefault()
    setGeneralError('')

    if (!validateForm()) {
      return
    }

    setLoading(true)

    try {
      await register(formData.email, formData.password, formData.name)
      navigate('/')
    } catch (error) {
      setGeneralError('Erreur lors de l\'inscription. Veuillez réessayer.')
    } finally {
      setLoading(false)
    }
  }

  const strength = passwordStrength(formData.password)
  const strengthLabels = ['Très faible', 'Faible', 'Moyen', 'Fort', 'Très fort']
  const strengthColors = [
    'bg-red-500',
    'bg-orange-500',
    'bg-yellow-500',
    'bg-lime-500',
    'bg-green-500',
  ]

  return (
    <div className="flex min-h-screen items-center justify-center bg-ink-50 px-6 py-12">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="mb-8 flex flex-col gap-2">
          <h1 className="text-display-2 font-bold text-ink-900">S'inscrire</h1>
          <p className="text-body text-ink-500">
            Créez votre compte Bookos en quelques secondes
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
          {/* Name Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="name"
              className="text-sm font-semibold text-ink-900"
            >
              Nom
            </label>
            <div className="relative flex items-center">
              <User className="absolute left-4 h-5 w-5 text-ink-400" />
              <input
                id="name"
                name="name"
                type="text"
                value={formData.name}
                onChange={handleChange}
                placeholder="Jean Dupont"
                className={`w-full rounded-2xl border bg-white py-3 pl-12 pr-4 text-body outline-none transition ${
                  errors.name
                    ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                    : 'border-ink-200 focus:border-brand focus:shadow-glow'
                }`}
              />
            </div>
            {errors.name ? (
              <p className="text-sm text-red-600">{errors.name}</p>
            ) : null}
          </div>

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
                name="email"
                type="email"
                value={formData.email}
                onChange={handleChange}
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
                name="password"
                type="password"
                value={formData.password}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full rounded-2xl border bg-white py-3 pl-12 pr-4 text-body outline-none transition ${
                  errors.password
                    ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                    : 'border-ink-200 focus:border-brand focus:shadow-glow'
                }`}
              />
            </div>

            {/* Password Strength Indicator */}
            {formData.password ? (
              <div className="flex gap-2">
                {[...Array(4)].map((_, i) => (
                  <div
                    key={i}
                    className={`h-1 flex-1 rounded-full transition ${
                      i < strength ? strengthColors[strength - 1] : 'bg-ink-100'
                    }`}
                  />
                ))}
              </div>
            ) : null}

            {formData.password ? (
              <span className="text-xs text-ink-500">
                Force : <span className="font-semibold">{strengthLabels[strength]}</span>
              </span>
            ) : null}

            {errors.password ? (
              <p className="text-sm text-red-600">{errors.password}</p>
            ) : null}
          </div>

          {/* Confirm Password Field */}
          <div className="flex flex-col gap-2">
            <label
              htmlFor="passwordConfirm"
              className="text-sm font-semibold text-ink-900"
            >
              Confirmer le mot de passe
            </label>
            <div className="relative flex items-center">
              <Lock className="absolute left-4 h-5 w-5 text-ink-400" />
              <input
                id="passwordConfirm"
                name="passwordConfirm"
                type="password"
                value={formData.passwordConfirm}
                onChange={handleChange}
                placeholder="••••••••"
                className={`w-full rounded-2xl border bg-white py-3 pl-12 pr-4 text-body outline-none transition ${
                  errors.passwordConfirm
                    ? 'border-red-300 focus:border-red-500 focus:shadow-[0_0_0_3px_rgba(239,68,68,0.1)]'
                    : 'border-ink-200 focus:border-brand focus:shadow-glow'
                }`}
              />
              {formData.passwordConfirm &&
              formData.password === formData.passwordConfirm ? (
                <CheckCircle className="absolute right-4 h-5 w-5 text-green-500" />
              ) : null}
            </div>
            {errors.passwordConfirm ? (
              <p className="text-sm text-red-600">{errors.passwordConfirm}</p>
            ) : null}
          </div>

          {/* Terms Checkbox */}
          <div className="flex items-start gap-3">
            <input
              id="terms"
              type="checkbox"
              checked={agreedToTerms}
              onChange={(e) => setAgreedToTerms(e.target.checked)}
              className="mt-1 h-4 w-4 rounded border-ink-200 text-brand focus:ring-brand"
            />
            <label htmlFor="terms" className="text-sm text-ink-600">
              J'accepte les{' '}
              <Link to="#" className="font-semibold text-brand hover:text-brand-700">
                conditions d'utilisation
              </Link>{' '}
              et la{' '}
              <Link to="#" className="font-semibold text-brand hover:text-brand-700">
                politique de confidentialité
              </Link>
            </label>
          </div>
          {errors.terms ? (
            <p className="text-sm text-red-600">{errors.terms}</p>
          ) : null}

          {/* Submit */}
          <Button
            variant="primary"
            className="mt-2 w-full"
            loading={loading}
            disabled={loading}
          >
            Créer mon compte
          </Button>
        </form>

        {/* Login Link */}
        <div className="mt-6 text-center">
          <p className="text-body text-ink-500">
            Déjà un compte ?{' '}
            <Link
              to="/connexion"
              className="font-semibold text-brand hover:text-brand-700"
            >
              Connexion
            </Link>
          </p>
        </div>
      </div>
    </div>
  )
}

export default Register
