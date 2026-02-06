import { Calendar, MapPin } from 'lucide-react'

function PurchaseHistory({ transactions = [] }) {
  if (transactions.length === 0) {
    return (
      <div className="card">
        <h2 className="mb-6 text-title-1 font-semibold text-ink-900">
          Historique d'achat
        </h2>
        <p className="text-center text-body text-ink-500 py-8">
          Aucun achat enregistré
        </p>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="mb-6 text-title-1 font-semibold text-ink-900">
        Historique d'achat
      </h2>
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="border-b border-ink-100">
              <th className="text-left text-sm font-semibold text-ink-600 pb-3">
                Date
              </th>
              <th className="text-left text-sm font-semibold text-ink-600 pb-3">
                Commande
              </th>
              <th className="text-left text-sm font-semibold text-ink-600 pb-3">
                Livres
              </th>
              <th className="text-right text-sm font-semibold text-ink-600 pb-3">
                Montant
              </th>
              <th className="text-center text-sm font-semibold text-ink-600 pb-3">
                Statut
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-ink-100">
            {transactions.map((tx) => (
              <tr key={tx.id} className="hover:bg-ink-50 transition">
                <td className="py-4 text-sm text-ink-900">
                  <div className="flex items-center gap-2">
                    <Calendar className="h-4 w-4 text-ink-400" />
                    {new Date(tx.date).toLocaleDateString('fr-FR')}
                  </div>
                </td>
                <td className="py-4 text-sm font-mono text-ink-600">
                  #{tx.orderId}
                </td>
                <td className="py-4 text-sm text-ink-900">
                  {tx.itemCount} livre{tx.itemCount > 1 ? 's' : ''}
                </td>
                <td className="py-4 text-right text-sm font-semibold text-brand">
                  {tx.total.toFixed(2)}€
                </td>
                <td className="py-4 text-center">
                  <span
                    className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${
                      tx.status === 'completed'
                        ? 'bg-green-50 text-green-700'
                        : tx.status === 'pending'
                          ? 'bg-yellow-50 text-yellow-700'
                          : 'bg-red-50 text-red-700'
                    }`}
                  >
                    {tx.status === 'completed'
                      ? '✓ Terminée'
                      : tx.status === 'pending'
                        ? '⏳ En attente'
                        : '✗ Échouée'}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  )
}

export default PurchaseHistory
