import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AlertCircle, CheckCircle, Lock, CreditCard } from 'lucide-react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import useCart from '../hooks/useCart.js'
import { useAuth } from '../context/AuthContext.jsx'
import { initializePayment } from '../services/maishapay.js'

function Checkout() {
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const {
    items,
    removeItem,
    validateCartForPurchase,
  } = useCart()
  const [loading, setLoading] = useState(false)
  const [paymentMethod, setPaymentMethod] = useState('maishapay')
  const [errors, setErrors] = useState({})
  const [purchaseError, setPurchaseError] = useState('')

  const cartItems = items
  const subtotal = useMemo(
    () => cartItems.reduce((sum, item) => sum + item.price, 0),
    [cartItems],
  )
  const tax = subtotal * 0.2
  const total = subtotal + tax

  useEffect(() => {
    if (!currentUser) {
      navigate('/connexion')
    }
  }, [currentUser, navigate])

  if (!currentUser) {
    return (
      <div className="min-h-screen bg-ink-50">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
          <div className="flex flex-col gap-2">
            <h1 className="text-display-2 font-bold text-ink-900">Panier</h1>
            <p className="text-body text-ink-500">
              Finalisez votre commande
            </p>
          </div>

          <div className="grid gap-6 lg:grid-cols-3">
            {/* Main Content */}
            <div className="lg:col-span-2">
              {/* Auth Required Alert */}
              <Card elevated className="mb-6 border-l-4 border-brand">
                <div className="flex gap-4">
                  <div className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-full bg-brand-soft">
                    <Lock className="h-6 w-6 text-brand-700" />
                  </div>
                  <div className="flex-1">
                    <h3 className="text-title-2 font-semibold text-ink-900">
                      Créer un compte est requis
                    </h3>
                    <p className="mt-1 text-body text-ink-600">
                      Pour des raisons de sécurité et pour accéder à votre
                      bibliothèque de livres, veuillez vous connecter ou
                      créer un compte.
                    </p>
                    <div className="mt-4 flex flex-wrap gap-3">
                      <Button
                        onClick={() => navigate('/connexion')}
                      >
                        Connexion
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => navigate('/inscription')}
                      >
                        Créer un compte
                      </Button>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Cart Items */}
              <div className="card">
                <h2 className="mb-4 text-title-1 font-semibold text-ink-900">
                  Votre panier
                </h2>
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b border-ink-100 pb-4 last:border-0"
                    >
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="h-20 w-14 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-ink-900">
                          {item.title}
                        </h4>
                        <p className="text-sm text-ink-500">{item.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand">
                          {item.price.toFixed(2)}€
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Sidebar */}
            <div className="flex flex-col gap-4">
              {/* Summary */}
              <Card elevated>
                <h3 className="mb-4 text-title-2 font-semibold text-ink-900">
                  Résumé
                </h3>
                <div className="space-y-3 border-t border-ink-100 pt-4">
                  <div className="flex justify-between text-body text-ink-600">
                    <span>Sous-total</span>
                    <span>{subtotal.toFixed(2)}€</span>
                  </div>
                  <div className="flex justify-between text-body text-ink-600">
                    <span>Taxes (20%)</span>
                    <span>{tax.toFixed(2)}€</span>
                  </div>
                  <div className="border-t border-ink-100 pt-3">
                    <div className="flex justify-between text-title-2 font-bold text-brand">
                      <span>Total</span>
                      <span>{total.toFixed(2)}€</span>
                    </div>
                  </div>
                </div>
              </Card>

              {/* Info */}
              <Card className="bg-brand-soft">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-brand-700" />
                  <p className="text-sm text-brand-900">
                    Accès immédiat à tous vos fichiers après paiement.
                  </p>
                </div>
              </Card>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // Authenticated user checkout
  const handlePayment = async () => {
    setPurchaseError('')
    setLoading(true)

    try {
      // Validate cart before initiating payment
      const validation = await validateCartForPurchase()
      if (!validation.ok) {
        setPurchaseError(
          'Un ou plusieurs livres ont déjà été achetés. Veuillez mettre à jour votre panier.',
        )
        setLoading(false)
        return
      }

      // Initialize MaishaPay payment
      const paymentResult = await initializePayment({
        userId: currentUser.uid,
        amount: total,
        currency: 'EUR',
        userEmail: currentUser.email,
        userName: currentUser.displayName || currentUser.name,
        items: cartItems,
      })

      if (paymentResult.success && paymentResult.checkoutUrl) {
        // Redirect to MaishaPay hosted checkout page
        window.location.href = paymentResult.checkoutUrl
      } else {
        setPurchaseError('Échec de l\'initialisation du paiement. Veuillez réessayer.')
      }
    } catch (error) {
      console.error('Payment error:', error)
      setPurchaseError(
        error.message || 'Une erreur est survenue lors du paiement.',
      )
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        {/* Header */}
        <div className="flex flex-col gap-2">
          <h1 className="text-display-2 font-bold text-ink-900">Panier</h1>
          <p className="text-body text-ink-500">
            Connecté en tant que {currentUser?.email}
          </p>
        </div>

        <div className="grid gap-6 lg:grid-cols-3">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {purchaseError ? (
              <Card elevated className="border-l-4 border-red-500">
                <div className="flex gap-3">
                  <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
                  <p className="text-sm text-red-700">{purchaseError}</p>
                </div>
              </Card>
            ) : null}
            {/* Cart Items */}
            <Card>
              <h2 className="mb-4 text-title-1 font-semibold text-ink-900">
                Vos livres
              </h2>
              {cartItems.length === 0 ? (
                <div className="flex flex-col items-center gap-3 rounded-2xl bg-ink-50 py-10">
                  <div className="text-4xl">🛒</div>
                  <p className="text-body text-ink-500">Votre panier est vide</p>
                  <Button variant="outline" onClick={() => navigate('/catalogue')}>
                    Parcourir le catalogue
                  </Button>
                </div>
              ) : (
                <div className="space-y-3">
                  {cartItems.map((item) => (
                    <div
                      key={item.id}
                      className="flex gap-4 border-b border-ink-100 pb-4 last:border-0"
                    >
                      <img
                        src={item.cover}
                        alt={item.title}
                        className="h-20 w-14 rounded-xl object-cover"
                      />
                      <div className="flex-1">
                        <h4 className="font-semibold text-ink-900">
                          {item.title}
                        </h4>
                        <p className="text-sm text-ink-500">{item.author}</p>
                      </div>
                      <div className="text-right">
                        <p className="font-bold text-brand">
                          {item.price.toFixed(2)}€
                        </p>
                        <button
                          onClick={() => removeItem(item.id)}
                          className="mt-2 text-xs text-ink-400 hover:text-red-600"
                        >
                          Retirer
                        </button>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </Card>

            {/* Payment Method */}
            <Card>
              <h2 className="mb-4 text-title-1 font-semibold text-ink-900">
                Méthode de paiement
              </h2>
              <div className="space-y-3">
                <label className="flex items-center gap-3 rounded-2xl border border-brand bg-brand-soft p-4 cursor-pointer transition">
                  <input
                    type="radio"
                    name="paymentMethod"
                    value="maishapay"
                    checked={paymentMethod === 'maishapay'}
                    onChange={(e) => setPaymentMethod(e.target.value)}
                    className="text-brand"
                  />
                  <CreditCard className="h-5 w-5 text-brand-700" />
                  <div className="flex-1">
                    <span className="font-semibold text-ink-900">MaishaPay</span>
                    <p className="text-xs text-ink-600">Paiement sécurisé avec carte bancaire ou mobile money</p>
                  </div>
                </label>
              </div>
            </Card>

            {/* Payment Info & Button */}
            <Card>
              {/* Secure Info */}
              <div className="mb-4 flex gap-3 rounded-2xl bg-green-50 p-4">
                <Lock className="h-5 w-5 flex-shrink-0 text-green-600" />
                <div>
                  <p className="text-sm font-semibold text-green-900">
                    Paiement 100% sécurisé
                  </p>
                  <p className="text-xs text-green-700">
                    Vos données sont protégées par chiffrement SSL et traitées par MaishaPay
                  </p>
                </div>
              </div>

              {/* Submit Button */}
              <Button
                variant="primary"
                className="w-full"
                loading={loading}
                disabled={loading || cartItems.length === 0}
                onClick={handlePayment}
              >
                <Lock className="h-4 w-4" />
                {loading ? 'Initialisation...' : `Payer ${total.toFixed(2)}€`}
              </Button>

              <p className="mt-3 text-center text-xs text-ink-500">
                En cliquant sur "Payer", vous serez redirigé vers la page de paiement sécurisée MaishaPay
              </p>
            </Card>
          </div>

          {/* Sidebar */}
          <div className="flex flex-col gap-4">
            {/* Summary */}
            <Card elevated>
              <h3 className="mb-4 text-title-2 font-semibold text-ink-900">
                Résumé
              </h3>
              <div className="space-y-3 border-t border-ink-100 pt-4">
                <div className="flex justify-between text-body text-ink-600">
                  <span>Sous-total</span>
                  <span>{subtotal.toFixed(2)}€</span>
                </div>
                <div className="flex justify-between text-body text-ink-600">
                  <span>Taxes (20%)</span>
                  <span>{tax.toFixed(2)}€</span>
                </div>
                <div className="border-t border-ink-100 pt-3">
                  <div className="flex justify-between text-title-2 font-bold text-brand">
                    <span>Total</span>
                    <span>{total.toFixed(2)}€</span>
                  </div>
                </div>
              </div>
            </Card>

            {/* Guarantees */}
            <Card>
              <h3 className="mb-3 text-sm font-semibold text-ink-900">
                Avantages
              </h3>
              <ul className="space-y-2 text-sm text-ink-600">
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                  Accès illimité
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                  Téléchargement immédiat
                </li>
                <li className="flex gap-2">
                  <CheckCircle className="h-4 w-4 flex-shrink-0 text-green-600" />
                  Paiement sécurisé
                </li>
              </ul>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}

export default Checkout
