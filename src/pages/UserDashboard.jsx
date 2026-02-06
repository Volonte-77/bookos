import { Settings, LogOut, User, Wallet, Download, History } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import Card from '../components/Card.jsx'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import DownloadList from '../components/DownloadList.jsx'
import PurchaseHistory from '../components/PurchaseHistory.jsx'

// Mock data
const mockUser = {
  id: 1,
  name: 'Jean Dupont',
  email: 'jean.dupont@example.com',
  joinedDate: '2024-03-15',
  creditBalance: 42.50,
}

const mockBooks = [
  {
    id: 1,
    title: 'Les Mystères de l\'Univers',
    author: 'Jean Dupont',
    cover: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=100&h=150&fit=crop',
    purchaseDate: '2025-12-20',
  },
  {
    id: 2,
    title: 'Le Cœur des Tempêtes',
    author: 'Marie Leclerc',
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=100&h=150&fit=crop',
    purchaseDate: '2025-11-10',
  },
  {
    id: 3,
    title: 'Intrigue à Paris',
    author: 'Claude Martin',
    cover: 'https://images.unsplash.com/photo-1516979187457-635ffe35ff15?w=100&h=150&fit=crop',
    purchaseDate: '2025-10-05',
  },
]

const mockTransactions = [
  {
    id: 'tx-001',
    orderId: 'ORD-20251220-001',
    date: '2025-12-20',
    itemCount: 1,
    total: 12.99,
    status: 'completed',
  },
  {
    id: 'tx-002',
    orderId: 'ORD-20251110-002',
    date: '2025-11-10',
    itemCount: 2,
    total: 25.48,
    status: 'completed',
  },
  {
    id: 'tx-003',
    orderId: 'ORD-20251005-003',
    date: '2025-10-05',
    itemCount: 1,
    total: 9.99,
    status: 'completed',
  },
]

function UserDashboard({ user = mockUser, onLogout = () => {} }) {
  const navigate = useNavigate()

  const handleLogout = () => {
    onLogout()
    navigate('/')
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Header */}
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6 py-8 md:flex-row md:items-center md:justify-between">
          <div className="flex items-center gap-4">
            <div className="flex h-16 w-16 items-center justify-center rounded-full bg-gradient-to-br from-brand to-brand-600 text-2xl font-bold text-white">
              {user.name.charAt(0).toUpperCase()}
            </div>
            <div className="flex flex-col gap-1">
              <h1 className="text-display-2 font-bold text-ink-900">
                {user.name}
              </h1>
              <p className="text-body text-ink-500">Membre depuis {new Date(user.joinedDate).toLocaleDateString('fr-FR', { year: 'numeric', month: 'long' })}</p>
            </div>
          </div>
          <div className="flex flex-wrap gap-3">
            <Button
              variant="outline"
              className="gap-2"
              onClick={() => navigate('/profil/parametres')}
            >
              <Settings className="h-4 w-4" />
              <span className="hidden sm:inline">Paramètres</span>
            </Button>
            <Button
              variant="secondary"
              className="gap-2"
              onClick={handleLogout}
            >
              <LogOut className="h-4 w-4" />
              <span className="hidden sm:inline">Déconnexion</span>
            </Button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        {/* Stats Grid */}
        <div className="grid gap-4 sm:grid-cols-3">
          {/* Credit Balance */}
          <Card elevated>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-ink-500">Crédit disponible</p>
                <h3 className="text-display-1 font-bold text-brand">
                  {user.creditBalance.toFixed(2)}€
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                <Wallet className="h-6 w-6 text-brand-700" />
              </div>
            </div>
            <p className="mt-4 text-xs text-ink-400">
              Utilisable pour vos prochains achats
            </p>
          </Card>

          {/* Books Downloaded */}
          <Card elevated>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-ink-500">Livres achetés</p>
                <h3 className="text-display-1 font-bold text-brand">
                  {mockBooks.length}
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                <Download className="h-6 w-6 text-brand-700" />
              </div>
            </div>
            <p className="mt-4 text-xs text-ink-400">
              Accès illimité et permanent
            </p>
          </Card>

          {/* Total Spent */}
          <Card elevated>
            <div className="flex items-start justify-between">
              <div className="flex flex-col gap-2">
                <p className="text-sm text-ink-500">Total dépensé</p>
                <h3 className="text-display-1 font-bold text-brand">
                  {mockTransactions.reduce((sum, tx) => sum + tx.total, 0).toFixed(2)}€
                </h3>
              </div>
              <div className="flex h-12 w-12 items-center justify-center rounded-full bg-brand-soft">
                <History className="h-6 w-6 text-brand-700" />
              </div>
            </div>
            <p className="mt-4 text-xs text-ink-400">
              Depuis votre inscription
            </p>
          </Card>
        </div>

        {/* Download Section */}
        <DownloadList books={mockBooks} />

        {/* Purchase History */}
        <PurchaseHistory transactions={mockTransactions} />

        {/* Account Info */}
        <Card>
          <h2 className="mb-6 text-title-1 font-semibold text-ink-900">
            Informations du compte
          </h2>
          <div className="grid gap-6 sm:grid-cols-2">
            <div className="flex flex-col gap-2">
              <p className="text-sm text-ink-500">Adresse email</p>
              <p className="text-body font-semibold text-ink-900">
                {user.email}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-ink-500">ID Utilisateur</p>
              <p className="text-body font-semibold text-ink-900">
                #{user.id}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-ink-500">Membre depuis</p>
              <p className="text-body font-semibold text-ink-900">
                {new Date(user.joinedDate).toLocaleDateString('fr-FR', {
                  year: 'numeric',
                  month: 'long',
                  day: 'numeric',
                })}
              </p>
            </div>
            <div className="flex flex-col gap-2">
              <p className="text-sm text-ink-500">Statut</p>
              <Badge className="w-fit">Client actif</Badge>
            </div>
          </div>
        </Card>
      </div>
    </div>
  )
}

export default UserDashboard
