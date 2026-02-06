import { useEffect, useMemo, useState } from 'react'
import { Search, Mail, Trash2, Lock, Pencil } from 'lucide-react'
import {
  collection,
  doc,
  getDocs,
  getFirestore,
  onSnapshot,
  query,
  updateDoc,
  where,
} from 'firebase/firestore'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import app from '../../lib/firebase.js'

function AdminUsers() {
  const firestore = useMemo(() => getFirestore(app), [])
  const [users, setUsers] = useState([])
  const [purchaseCounts, setPurchaseCounts] = useState({})
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedUser, setSelectedUser] = useState(null)
  const [creditsInput, setCreditsInput] = useState('')
  const [roleInput, setRoleInput] = useState('user')
  const [saving, setSaving] = useState(false)

  useEffect(() => {
    const usersRef = collection(firestore, 'users')
    const usersQuery = query(usersRef)
    const unsubscribe = onSnapshot(usersQuery, (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
      setUsers(data)
    })

    return () => unsubscribe()
  }, [firestore])

  useEffect(() => {
    const loadCounts = async () => {
      const counts = {}
      await Promise.all(
        users.map(async (user) => {
          const purchasesRef = collection(firestore, 'purchases')
          const purchaseQuery = query(
            purchasesRef,
            where('userId', '==', user.id),
          )
          const snapshot = await getDocs(purchaseQuery)
          counts[user.id] = snapshot.size
        }),
      )
      setPurchaseCounts(counts)
    }

    if (users.length > 0) {
      loadCounts()
    }
  }, [firestore, users])

  const filteredUsers = users.filter(
    (user) =>
      (user.name || '').toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.email || '').toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir désactiver cet utilisateur ?')) {
      await updateDoc(doc(firestore, 'users', id), {
        disabled: true,
      })
    }
  }

  const handleLock = async (user) => {
    await updateDoc(doc(firestore, 'users', user.id), {
      disabled: !user.disabled,
    })
  }

  const openEdit = (user) => {
    setSelectedUser(user)
    setCreditsInput(String(user.credits ?? 0))
    setRoleInput(user.role || 'user')
  }

  const handleSave = async () => {
    if (!selectedUser) return
    setSaving(true)
    try {
      await updateDoc(doc(firestore, 'users', selectedUser.id), {
        credits: Number(creditsInput || 0),
        role: roleInput,
      })
      setSelectedUser(null)
    } finally {
      setSaving(false)
    }
  }

  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-display-1 font-bold text-ink-900">Gestion des utilisateurs</h2>
        <p className="mt-1 text-body text-ink-500">
          {users.length} utilisateurs enregistrés
        </p>
      </div>

      <Card>
        <div className="flex items-center gap-2 rounded-lg border border-ink-200 px-4 py-2">
          <Search className="h-5 w-5 text-ink-400" />
          <input
            type="text"
            placeholder="Chercher par nom ou email..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 bg-transparent text-body outline-none placeholder-ink-400"
          />
        </div>
      </Card>

      <Card>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-ink-100">
                <th className="text-left text-sm font-semibold text-ink-600 pb-3 px-4">
                  Utilisateur
                </th>
                <th className="text-left text-sm font-semibold text-ink-600 pb-3 px-4">
                  Email
                </th>
                <th className="text-center text-sm font-semibold text-ink-600 pb-3 px-4">
                  Inscription
                </th>
                <th className="text-center text-sm font-semibold text-ink-600 pb-3 px-4">
                  Achats
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
              {filteredUsers.map((user) => (
                <tr key={user.id} className="hover:bg-ink-50 transition">
                  <td className="px-4 py-3 text-sm font-semibold text-ink-900">
                    {user.name || 'Utilisateur'}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600 flex items-center gap-2">
                    <Mail className="h-4 w-4 text-ink-400" />
                    {user.email}
                  </td>
                  <td className="px-4 py-3 text-center text-sm text-ink-600">
                    {user.createdAt?.toDate
                      ? user.createdAt.toDate().toLocaleDateString('fr-FR')
                      : '-'}
                  </td>
                  <td className="px-4 py-3 text-center text-sm font-semibold text-brand">
                    {purchaseCounts[user.id] ?? 0}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        user.disabled
                          ? 'bg-red-50 text-red-700'
                          : 'bg-green-50 text-green-700'
                      }`}
                    >
                      {user.disabled ? '🔒 Verrouillé' : '✓ Actif'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => openEdit(user)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-ink-100 text-ink-600 transition"
                        title="Modifier crédits / rôle"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleLock(user)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-ink-100 text-ink-600 transition"
                        title={user.disabled ? 'Déverrouiller' : 'Verrouiller'}
                      >
                        <Lock className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(user.id)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-red-50 text-red-600 transition"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </Card>

      {selectedUser ? (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="mb-4">
              <h3 className="text-title-1 font-semibold text-ink-900">
                Modifier l'utilisateur
              </h3>
              <p className="text-sm text-ink-500">{selectedUser.email}</p>
            </div>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-2">
                  Crédits
                </label>
                <input
                  type="number"
                  value={creditsInput}
                  onChange={(e) => setCreditsInput(e.target.value)}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-body outline-none focus:border-brand focus:shadow-glow"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-2">
                  Rôle
                </label>
                <select
                  value={roleInput}
                  onChange={(e) => setRoleInput(e.target.value)}
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-body outline-none focus:border-brand focus:shadow-glow"
                >
                  <option value="user">Utilisateur</option>
                  <option value="admin">Admin</option>
                </select>
              </div>
              <div className="flex gap-3 pt-2">
                <Button variant="outline" className="flex-1" onClick={() => setSelectedUser(null)}>
                  Annuler
                </Button>
                <Button className="flex-1" onClick={handleSave} loading={saving} disabled={saving}>
                  Enregistrer
                </Button>
              </div>
            </div>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

export default AdminUsers
