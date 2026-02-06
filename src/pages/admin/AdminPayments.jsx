import { useEffect, useMemo, useState } from 'react'
import { Search, Eye } from 'lucide-react'
import {
  collection,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
} from 'firebase/firestore'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import app from '../../lib/firebase.js'

function AdminPayments() {
  const firestore = useMemo(() => getFirestore(app), [])
  const [payments, setPayments] = useState([])
  const [purchases, setPurchases] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedPayment, setSelectedPayment] = useState(null)

  useEffect(() => {
    const paymentsQuery = query(
      collection(firestore, 'payments'),
      orderBy('createdAt', 'desc'),
    )
    const purchasesQuery = query(
      collection(firestore, 'purchases'),
      orderBy('createdAt', 'desc'),
    )

    const unsubPayments = onSnapshot(paymentsQuery, (snapshot) => {
      setPayments(
        snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })),
      )
    })

    const unsubPurchases = onSnapshot(purchasesQuery, (snapshot) => {
      setPurchases(
        snapshot.docs.map((docItem) => ({ id: docItem.id, ...docItem.data() })),
      )
    })

    return () => {
      unsubPayments()
      unsubPurchases()
    }
  }, [firestore])

  const filteredPayments = payments.filter((payment) => {
    const userField = (payment.userEmail || payment.userName || '').toLowerCase()
    const orderField = String(payment.orderId || payment.id || '').toLowerCase()
    return (
      userField.includes(searchTerm.toLowerCase()) ||
      orderField.includes(searchTerm.toLowerCase())
    )
  })

  const totalRevenue = payments
    .filter((p) => p.status === 'completed')
    .reduce((sum, p) => sum + Number(p.amount || 0), 0)

  const completedCount = payments.filter((p) => p.status === 'completed').length
  const pendingCount = payments.filter((p) => p.status === 'pending').length
  const failedCount = payments.filter((p) => p.status === 'failed').length

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display-1 font-bold text-ink-900">Gestion des paiements</h2>
        <p className="mt-1 text-body text-ink-500">{payments.length} transactions</p>
      </div>

      {/* Stats */}
      <div className="grid gap-4 sm:grid-cols-4">
        <Card elevated>
          <p className="text-sm text-ink-500 mb-1">Revenu total</p>
          <h3 className="text-display-2 font-bold text-ink-900">
            {totalRevenue.toFixed(2)}€
          </h3>
          <p className="text-xs text-green-600 mt-2">✓ Complétées</p>
        </Card>
        <Card elevated>
          <p className="text-sm text-ink-500 mb-1">Complétées</p>
          <h3 className="text-display-2 font-bold text-green-600">{completedCount}</h3>
          <p className="text-xs text-ink-400 mt-2">Transactions réussies</p>
        </Card>
        <Card elevated>
          <p className="text-sm text-ink-500 mb-1">En attente</p>
          <h3 className="text-display-2 font-bold text-yellow-600">{pendingCount}</h3>
          <p className="text-xs text-ink-400 mt-2">À valider</p>
        </Card>
        <Card elevated>
          <p className="text-sm text-ink-500 mb-1">Échouées</p>
          <h3 className="text-display-2 font-bold text-red-600">{failedCount}</h3>
          <p className="text-xs text-ink-400 mt-2">Nécessitent action</p>
        </Card>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-2 rounded-lg border border-ink-200 px-4 py-2">
          <Search className="h-5 w-5 text-ink-400" />
          <input
            type="text"
            placeholder="Chercher par utilisateur ou ID commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-body outline-none placeholder-ink-400"
          />
        </div>
      </Card>

      {/* Table */}
      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="text-left text-sm font-semibold text-ink-600 pb-3 px-4">
                  Utilisateur
                </th>
                <th className="text-left text-sm font-semibold text-ink-600 pb-3 px-4">
                  Commande
                </th>
                <th className="text-center text-sm font-semibold text-ink-600 pb-3 px-4">
                  Date
                </th>
                <th className="text-center text-sm font-semibold text-ink-600 pb-3 px-4">
                  Montant
                </th>
                <th className="text-center text-sm font-semibold text-ink-600 pb-3 px-4">
                  Méthode
                </th>
                <th className="text-center text-sm font-semibold text-ink-600 pb-3 px-4">
                  Statut
                </th>
                <th className="text-center text-sm font-semibold text-ink-600 pb-3 px-4">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {filteredPayments.map((payment) => (
                <tr key={payment.id} className="hover:bg-ink-50 transition">
                  <td className="px-4 py-3 text-sm font-semibold text-ink-900">
                    {payment.userEmail || payment.userName || payment.userId || 'Client'}
                  </td>
                  <td className="px-4 py-3 text-sm font-mono text-ink-600">
                    {payment.orderId || payment.id}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-ink-600">
                    {payment.createdAt?.toDate
                      ? payment.createdAt.toDate().toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-brand">
                    {Number(payment.amount || 0).toFixed(2)}€
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-ink-600">
                    {payment.method || '—'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        payment.status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : payment.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {payment.status === 'completed'
                        ? '✓ Complétée'
                        : payment.status === 'pending'
                          ? '⏳ En attente'
                          : '✗ Échouée'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button
                      onClick={() => setSelectedPayment(payment)}
                      className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-ink-100 text-ink-600 transition"
                      title="Voir détails"
                    >
                      <Eye className="h-4 w-4" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      <Card>
        <h3 className="mb-4 text-title-2 font-semibold text-ink-900">
          Achats récents
        </h3>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="text-left text-sm font-semibold text-ink-600 pb-3 px-4">
                  Utilisateur
                </th>
                <th className="text-left text-sm font-semibold text-ink-600 pb-3 px-4">
                  Livre
                </th>
                <th className="text-center text-sm font-semibold text-ink-600 pb-3 px-4">
                  Date
                </th>
                <th className="text-center text-sm font-semibold text-ink-600 pb-3 px-4">
                  Référence
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-ink-100">
              {purchases.slice(0, 10).map((purchase) => (
                <tr key={purchase.id} className="hover:bg-ink-50 transition">
                  <td className="px-4 py-3 text-sm text-ink-900">
                    {purchase.userId}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600">
                    {purchase.title || purchase.bookId}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-ink-600">
                    {purchase.createdAt?.toDate
                      ? purchase.createdAt.toDate().toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-xs text-ink-500">
                    {purchase.paymentRef || purchase.id}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {/* Details Modal */}
      {selectedPayment && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="mb-6">
              <h3 className="text-title-1 font-semibold text-ink-900">
                Détails de la transaction
              </h3>
            </div>
            <div className="space-y-4">
              <div className="rounded-lg bg-ink-50 p-4">
                <div className="grid gap-3 text-sm">
                  <div className="flex justify-between">
                    <span className="text-ink-600">Utilisateur</span>
                    <span className="font-semibold text-ink-900">
                      {selectedPayment.userEmail ||
                        selectedPayment.userName ||
                        selectedPayment.userId ||
                        'Client'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Commande</span>
                    <span className="font-mono text-ink-900">
                      {selectedPayment.orderId || selectedPayment.id}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Date</span>
                    <span className="font-semibold text-ink-900">
                      {selectedPayment.createdAt?.toDate
                        ? selectedPayment.createdAt.toDate().toLocaleDateString('fr-FR')
                        : '-'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Montant</span>
                    <span className="font-bold text-brand">
                      {Number(selectedPayment.amount || 0).toFixed(2)}€
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Méthode</span>
                    <span className="font-semibold text-ink-900">
                      {selectedPayment.method || '—'}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-ink-600">Articles</span>
                    <span className="font-semibold text-ink-900">
                      {Array.isArray(selectedPayment.items)
                        ? selectedPayment.items.length
                        : selectedPayment.items || selectedPayment.bookId || 1}
                    </span>
                  </div>
                  <div className="border-t border-ink-200 pt-3 flex justify-between">
                    <span className="text-ink-600">Statut</span>
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        selectedPayment.status === 'completed'
                          ? 'bg-green-50 text-green-700'
                          : selectedPayment.status === 'pending'
                            ? 'bg-yellow-50 text-yellow-700'
                            : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {selectedPayment.status === 'completed'
                        ? '✓ Complétée'
                        : selectedPayment.status === 'pending'
                          ? '⏳ En attente'
                          : '✗ Échouée'}
                    </span>
                  </div>
                </div>
              </div>
              <Button
                variant="outline"
                className="w-full"
                onClick={() => setSelectedPayment(null)}
              >
                Fermer
              </Button>
            </div>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AdminPayments
