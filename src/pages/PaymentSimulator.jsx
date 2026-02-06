import { useEffect, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import { CheckCircle, XCircle, Loader2 } from 'lucide-react'
import Button from '../components/Button.jsx'
import Card from '../components/Card.jsx'
import { doc, updateDoc, collection, query, where, getDocs, serverTimestamp } from 'firebase/firestore'
import { firestore } from '../lib/firebase.js'

/**
 * Payment Simulator
 * Simulates MaishaPay hosted checkout for development/testing
 * Replace with actual MaishaPay integration in production
 */
function PaymentSimulator() {
  const navigate = useNavigate()
  const [searchParams] = useSearchParams()
  const [processing, setProcessing] = useState(false)
  const [result, setResult] = useState(null)

  const reference = searchParams.get('reference')
  const amount = searchParams.get('amount')
  const email = searchParams.get('email')

  useEffect(() => {
    if (!reference || !amount) {
      navigate('/panier')
    }
  }, [reference, amount, navigate])

  const handleSimulatePayment = async (success) => {
    setProcessing(true)
    
    try {
      // Simulate payment processing delay
      await new Promise((resolve) => setTimeout(resolve, 2000))

      if (success) {
        // In real MaishaPay integration, this would be done by webhook
        // For simulation, we'll update the payment document directly
        
        // Find payment by reference (in production, this is done server-side)
        const paymentsRef = collection(firestore, 'payments')
        const q = query(paymentsRef, where('reference', '==', reference))
        const snapshot = await getDocs(q)

        if (!snapshot.empty) {
          const paymentDoc = snapshot.docs[0]
          await updateDoc(doc(firestore, 'payments', paymentDoc.id), {
            status: 'completed',
            verified: true,
            updatedAt: serverTimestamp(),
          })
        }

        setResult({
          success: true,
          message: 'Paiement simulé avec succès!',
        })

        // Redirect to callback after short delay
        setTimeout(() => {
          navigate(`/paiement/callback?reference=${reference}&status=success&amount=${amount}`)
        }, 1500)
      } else {
        setResult({
          success: false,
          message: 'Paiement annulé',
        })

        setTimeout(() => {
          navigate('/panier')
        }, 2000)
      }
    } catch (error) {
      console.error('Simulation error:', error)
      setResult({
        success: false,
        message: 'Erreur de simulation',
      })
    } finally {
      setProcessing(false)
    }
  }

  if (result) {
    return (
      <div className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
        <Card elevated className="max-w-md w-full text-center">
          {result.success ? (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-green-100">
                <CheckCircle className="h-10 w-10 text-green-600" />
              </div>
              <h2 className="text-title-1 font-semibold text-ink-900">
                {result.message}
              </h2>
              <p className="text-sm text-ink-600">
                Redirection en cours...
              </p>
            </div>
          ) : (
            <div className="flex flex-col items-center gap-4">
              <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-100">
                <XCircle className="h-10 w-10 text-red-600" />
              </div>
              <h2 className="text-title-1 font-semibold text-ink-900">
                {result.message}
              </h2>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-ink-50 flex items-center justify-center p-6">
      <Card elevated className="max-w-2xl w-full">
        {/* Development Warning Banner */}
        <div className="mb-6 rounded-2xl bg-yellow-50 border-2 border-yellow-200 p-4">
          <div className="flex gap-3">
            <div className="text-2xl">⚠️</div>
            <div>
              <h3 className="font-semibold text-yellow-900">Mode Développement</h3>
              <p className="text-sm text-yellow-800">
                Ceci est un simulateur de paiement pour les tests. En production, 
                vous serez redirigé vers la vraie page de paiement MaishaPay.
              </p>
            </div>
          </div>
        </div>

        {/* Simulated Checkout */}
        <div className="text-center mb-6">
          <h1 className="text-display-2 font-bold text-ink-900 mb-2">
            Simulateur MaishaPay
          </h1>
          <p className="text-body text-ink-600">
            Page de paiement simulée
          </p>
        </div>

        {/* Payment Details */}
        <div className="space-y-4 mb-6">
          <div className="flex justify-between py-3 border-b border-ink-100">
            <span className="text-body text-ink-600">Référence</span>
            <span className="font-semibold text-ink-900">{reference}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-ink-100">
            <span className="text-body text-ink-600">Email</span>
            <span className="font-semibold text-ink-900">{email}</span>
          </div>
          <div className="flex justify-between py-3 border-b border-ink-100">
            <span className="text-body text-ink-600">Montant</span>
            <span className="text-title-1 font-bold text-brand">{amount}€</span>
          </div>
        </div>

        {/* Simulation Actions */}
        <div className="space-y-3">
          <Button
            variant="primary"
            className="w-full"
            onClick={() => handleSimulatePayment(true)}
            disabled={processing}
            loading={processing}
          >
            {processing ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Traitement...
              </>
            ) : (
              <>
                <CheckCircle className="h-4 w-4" />
                Simuler paiement réussi
              </>
            )}
          </Button>
          
          <Button
            variant="outline"
            className="w-full"
            onClick={() => handleSimulatePayment(false)}
            disabled={processing}
          >
            <XCircle className="h-4 w-4" />
            Simuler paiement échoué
          </Button>
        </div>

        {/* Info */}
        <div className="mt-6 text-center">
          <p className="text-xs text-ink-500">
            💡 Ce simulateur met automatiquement à jour le statut du paiement dans Firestore
          </p>
        </div>
      </Card>
    </div>
  )
}

export default PaymentSimulator
