import { useEffect, useMemo, useState } from 'react'
import { TrendingUp, Users as UsersIcon, BookOpen, CreditCard, AlertCircle } from 'lucide-react'
import {
  collection,
  getDocs,
  getFirestore,
  limit,
  orderBy,
  query,
} from 'firebase/firestore'
import Card from '../../components/Card.jsx'
import app from '../../lib/firebase.js'

function StatCard({ label, value, change, icon: Icon }) {
  return (
    <Card elevated>
      <div className="flex items-start justify-between">
        <div className="flex flex-col gap-2">
          <p className="text-sm text-ink-500">{label}</p>
          <h3 className="text-display-2 font-bold text-ink-900">{value}</h3>
          {change !== undefined && (
            <p className={`text-xs font-semibold ${change >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {change >= 0 ? '↑' : '↓'} {Math.abs(change).toFixed(1)}% ce mois
            </p>
          )}
        </div>
        <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
          <Icon className="h-6 w-6 text-brand-700" />
        </div>
      </div>
    </Card>
  )
}

function AdminDashboard() {
  const firestore = useMemo(() => getFirestore(app), [])
  const [stats, setStats] = useState({
    totalRevenue: 0,
    totalUsers: 0,
    totalBooks: 0,
    totalTransactions: 0,
    pendingPayments: 0,
  })
  const [recentPayments, setRecentPayments] = useState([])

  useEffect(() => {
    const loadStats = async () => {
      const usersSnap = await getDocs(collection(firestore, 'users'))
      const booksSnap = await getDocs(collection(firestore, 'books'))
      const paymentsSnap = await getDocs(collection(firestore, 'payments'))

      const payments = paymentsSnap.docs.map((docItem) => docItem.data())
      const totalRevenue = payments
        .filter((p) => p.status === 'completed')
        .reduce((sum, p) => sum + Number(p.amount || 0), 0)
      const pendingPayments = payments.filter((p) => p.status === 'pending').length

      setStats({
        totalRevenue,
        totalUsers: usersSnap.size,
        totalBooks: booksSnap.size,
        totalTransactions: paymentsSnap.size,
        pendingPayments,
      })
    }

    const loadRecent = async () => {
      const paymentsQuery = query(
        collection(firestore, 'payments'),
        orderBy('createdAt', 'desc'),
        limit(5),
      )
      const snapshot = await getDocs(paymentsQuery)
      setRecentPayments(snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      })))
    }

    loadStats()
    loadRecent()
  }, [firestore])

  return (
    <div className="space-y-6">
      <div className="flex flex-col gap-2">
        <h2 className="text-display-1 font-bold text-ink-900">Bienvenue</h2>
        <p className="text-body text-ink-500">
          Voici un aperçu de votre marketplace
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
        <StatCard
          label="Revenu total"
          value={`${stats.totalRevenue.toFixed(2)}€`}
          icon={CreditCard}
        />
        <StatCard
          label="Utilisateurs"
          value={stats.totalUsers}
          icon={UsersIcon}
        />
        <StatCard
          label="Livres"
          value={stats.totalBooks}
          icon={BookOpen}
        />
        <StatCard
          label="Transactions"
          value={stats.totalTransactions}
          icon={TrendingUp}
        />
      </div>

      <div className="grid gap-6 lg:grid-cols-3">
        <Card elevated className="lg:col-span-1">
          <h3 className="mb-4 text-title-2 font-semibold text-ink-900">Alertes</h3>
          <div className="space-y-3">
            <div className="flex gap-3 rounded-lg border border-yellow-200 bg-yellow-50 p-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-yellow-600" />
              <div>
                <p className="text-xs font-semibold text-yellow-900">
                  {stats.pendingPayments} paiement(s) en attente
                </p>
                <p className="text-xs text-yellow-700">À valider</p>
              </div>
            </div>
          </div>
        </Card>

        <Card elevated className="lg:col-span-2">
          <h3 className="mb-4 text-title-2 font-semibold text-ink-900">
            Transactions récentes
          </h3>
          <div className="space-y-3">
            {recentPayments.map((tx) => (
              <div
                key={tx.id}
                className="flex items-center justify-between rounded-lg border border-ink-100 p-3 hover:bg-ink-50 transition"
              >
                <div className="flex-1">
                  <p className="text-sm font-semibold text-ink-900">
                    {tx.userEmail || tx.userName || 'Client'}
                  </p>
                  <p className="text-xs text-ink-500">
                    {tx.createdAt?.toDate
                      ? tx.createdAt.toDate().toLocaleDateString('fr-FR')
                      : '-'}
                  </p>
                </div>
                <div className="text-right">
                  <p className="text-sm font-bold text-brand">
                    {Number(tx.amount || 0).toFixed(2)}€
                  </p>
                  <span
                    className={`text-xs font-semibold ${
                      tx.status === 'completed'
                        ? 'text-green-600'
                        : 'text-yellow-600'
                    }`}
                  >
                    {tx.status === 'completed' ? '✓ Complétée' : '⏳ En attente'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>
    </div>
  )
}

export default AdminDashboard
