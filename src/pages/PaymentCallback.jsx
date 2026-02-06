import { useEffect, useMemo, useState } from 'react'
import { useNavigate, useSearchParams } from 'react-router-dom'
import {
  doc,
  getDoc,
  getFirestore,
  increment,
  serverTimestamp,
  setDoc,
  updateDoc,
  writeBatch,
} from 'firebase/firestore'
import { CheckCircle, AlertCircle, Loader2 } from 'lucide-react'
import app from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'

function PaymentCallback() {
  const [searchParams] = useSearchParams()
  const navigate = useNavigate()
  const { currentUser } = useAuth()
  const db = useMemo(() => getFirestore(app), [])

  const [state, setState] = useState('loading')
  const [message, setMessage] = useState('Validation du paiement...')

  const reference =
    searchParams.get('reference') ||
    searchParams.get('ref') ||
    searchParams.get('transaction_ref') ||
    searchParams.get('orderId') ||
    ''

  const paymentStatus =
    searchParams.get('status') || searchParams.get('payment_status') || ''

  const amountParam = searchParams.get('amount')

  useEffect(() => {
    if (!currentUser) {
      navigate('/connexion')
    }
  }, [currentUser, navigate])

  useEffect(() => {
    const run = async () => {
      if (!reference) {
        setState('failed')
        setMessage('Référence de transaction manquante.')
        return
      }

      const paymentRef = doc(db, 'payments', reference)
      const paymentSnap = await getDoc(paymentRef)

      if (!paymentSnap.exists()) {
        setState('failed')
        setMessage('Transaction introuvable.')
        return
      }

      const payment = paymentSnap.data()

      if (!currentUser || payment.userId !== currentUser.uid) {
        setState('failed')
        setMessage('Utilisateur non autorisé pour cette transaction.')
        return
      }

      if (amountParam && Number(amountParam) !== Number(payment.amount)) {
        setState('failed')
        setMessage('Montant invalide pour cette transaction.')
        return
      }

      if (payment.status !== 'completed' || payment.verified !== true) {
        setState('processing')
        setMessage(
          paymentStatus === 'success'
            ? 'Paiement reçu, validation en cours...'
            : 'Paiement en attente de validation.',
        )
        return
      }

      const items = Array.isArray(payment.items)
        ? payment.items
        : payment.bookId
          ? [
              {
                bookId: payment.bookId,
                downloadUrl: payment.downloadUrl || null,
                title: payment.title || '',
              },
            ]
          : []

      if (items.length === 0) {
        setState('failed')
        setMessage('Aucun livre associé à cette transaction.')
        return
      }

      const batch = writeBatch(db)
      const purchaseIds = items.map(
        (item) => `${currentUser.uid}_${String(item.bookId)}`,
      )

      const existing = await Promise.all(
        purchaseIds.map((id) => getDoc(doc(db, 'purchases', id))),
      )

      items.forEach((item, index) => {
        if (existing[index].exists()) {
          return
        }

        batch.set(doc(db, 'purchases', purchaseIds[index]), {
          userId: currentUser.uid,
          bookId: String(item.bookId),
          title: item.title || '',
          downloadUrl: item.downloadUrl || null,
          paymentRef: reference,
          createdAt: serverTimestamp(),
        })
      })

      await batch.commit()

      await updateDoc(doc(db, 'users', currentUser.uid), {
        credits: increment(-Number(payment.amount || 0)),
        updatedAt: serverTimestamp(),
      })

      setState('success')
      setMessage('Paiement confirmé. Vos livres sont disponibles.')
    }

    run().catch(() => {
      setState('failed')
      setMessage('Une erreur est survenue lors de la validation.')
    })
  }, [amountParam, currentUser, db, paymentStatus, reference])

  const icon =
    state === 'success' ? (
      <CheckCircle className="h-8 w-8 text-green-600" />
    ) : state === 'failed' ? (
      <AlertCircle className="h-8 w-8 text-red-600" />
    ) : (
      <Loader2 className="h-8 w-8 animate-spin text-brand" />
    )

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto flex w-full max-w-3xl flex-col gap-6 px-6 py-12">
        <Card elevated>
          <div className="flex flex-col items-center gap-4 text-center">
            {icon}
            <h1 className="text-display-2 font-bold text-ink-900">
              {state === 'success'
                ? 'Paiement réussi'
                : state === 'failed'
                  ? 'Paiement échoué'
                  : 'Traitement en cours'}
            </h1>
            <p className="text-body text-ink-600">{message}</p>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                variant="primary"
                onClick={() => navigate('/profil')}
                disabled={state !== 'success'}
              >
                Accéder à ma bibliothèque
              </Button>
              <Button variant="outline" onClick={() => navigate('/catalogue')}>
                Retour au catalogue
              </Button>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default PaymentCallback
