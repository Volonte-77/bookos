import { useEffect, useMemo, useState } from 'react'
import { Plus, Edit2, Trash2, Search, Eye, EyeOff, Upload } from 'lucide-react'
import {
  addDoc,
  collection,
  deleteDoc,
  doc,
  getFirestore,
  onSnapshot,
  orderBy,
  query,
  serverTimestamp,
  updateDoc,
} from 'firebase/firestore'
import { getDownloadURL, getStorage, ref, uploadBytes } from 'firebase/storage'
import Card from '../../components/Card.jsx'
import Button from '../../components/Button.jsx'
import app from '../../lib/firebase.js'

function AdminBooks() {
  const firestore = useMemo(() => getFirestore(app), [])
  const storage = useMemo(() => getStorage(app), [])

  const [books, setBooks] = useState([])
  const [searchTerm, setSearchTerm] = useState('')
  const [showModal, setShowModal] = useState(false)
  const [editingBook, setEditingBook] = useState(null)
  const [formData, setFormData] = useState({
    title: '',
    author: '',
    price: '',
    category: '',
    active: true,
  })
  const [coverFile, setCoverFile] = useState(null)
  const [pdfFile, setPdfFile] = useState(null)
  const [saving, setSaving] = useState(false)
  const [error, setError] = useState('')

  useEffect(() => {
    const booksRef = collection(firestore, 'books')
    const booksQuery = query(booksRef, orderBy('createdAt', 'desc'))
    const unsubscribe = onSnapshot(booksQuery, (snapshot) => {
      const data = snapshot.docs.map((docItem) => ({
        id: docItem.id,
        ...docItem.data(),
      }))
      setBooks(data)
    })

    return () => unsubscribe()
  }, [firestore])

  const filteredBooks = books.filter(
    (book) =>
      book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
      book.author.toLowerCase().includes(searchTerm.toLowerCase()),
  )

  const handleEdit = (book) => {
    setEditingBook(book)
    setFormData({
      title: book.title,
      author: book.author,
      price: book.price,
      category: book.category,
      active: book.active ?? true,
    })
    setShowModal(true)
  }

  const uploadFile = async (file, path) => {
    const fileRef = ref(storage, path)
    await uploadBytes(fileRef, file)
    return getDownloadURL(fileRef)
  }

  const handleSave = async () => {
    setError('')
    if (!formData.title || !formData.author || !formData.price) {
      setError('Veuillez remplir les champs obligatoires.')
      return
    }

    setSaving(true)
    try {
      if (editingBook) {
        const bookRef = doc(firestore, 'books', editingBook.id)
        let coverUrl = editingBook.coverUrl || null
        let storagePath = editingBook.storagePath || null

        if (coverFile) {
          const coverPath = `covers/${editingBook.id}`
          coverUrl = await uploadFile(coverFile, coverPath)
        }

        if (pdfFile) {
          const pdfPath = `books/${editingBook.id}.pdf`
          await uploadBytes(ref(storage, pdfPath), pdfFile)
          storagePath = pdfPath
        }

        await updateDoc(bookRef, {
          title: formData.title,
          author: formData.author,
          price: Number(formData.price),
          category: formData.category,
          active: formData.active,
          coverUrl,
          storagePath,
          updatedAt: serverTimestamp(),
        })
      } else {
        const bookRef = await addDoc(collection(firestore, 'books'), {
          title: formData.title,
          author: formData.author,
          price: Number(formData.price),
          category: formData.category,
          active: formData.active,
          coverUrl: null,
          storagePath: null,
          createdAt: serverTimestamp(),
          updatedAt: serverTimestamp(),
        })

        let coverUrl = null
        let storagePath = null

        if (coverFile) {
          const coverPath = `covers/${bookRef.id}`
          coverUrl = await uploadFile(coverFile, coverPath)
        }

        if (pdfFile) {
          const pdfPath = `books/${bookRef.id}.pdf`
          await uploadBytes(ref(storage, pdfPath), pdfFile)
          storagePath = pdfPath
        }

        await updateDoc(bookRef, {
          coverUrl,
          storagePath,
          updatedAt: serverTimestamp(),
        })
      }

      setShowModal(false)
      setEditingBook(null)
      setFormData({ title: '', author: '', price: '', category: '', active: true })
      setCoverFile(null)
      setPdfFile(null)
    } catch (err) {
      setError('Impossible d\'enregistrer ce livre.')
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async (id) => {
    if (confirm('Êtes-vous sûr de vouloir supprimer ce livre ?')) {
      await deleteDoc(doc(firestore, 'books', id))
    }
  }

  const toggleStatus = async (book) => {
    await updateDoc(doc(firestore, 'books', book.id), {
      active: !book.active,
      updatedAt: serverTimestamp(),
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div>
          <h2 className="text-display-1 font-bold text-ink-900">Gestion des livres</h2>
          <p className="mt-1 text-body text-ink-500">{books.length} livres en base</p>
        </div>
        <Button className="gap-2" onClick={() => setShowModal(true)}>
          <Plus className="h-4 w-4" />
          Ajouter un livre
        </Button>
      </div>

      {/* Search */}
      <Card>
        <div className="flex items-center gap-2 rounded-lg border border-ink-200 px-4 py-2">
          <Search className="h-5 w-5 text-ink-400" />
          <input
            type="text"
            placeholder="Chercher par titre ou auteur..."
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
                  Titre
                </th>
                <th className="text-left text-sm font-semibold text-ink-600 pb-3 px-4">
                  Auteur
                </th>
                <th className="text-left text-sm font-semibold text-ink-600 pb-3 px-4">
                  Catégorie
                </th>
                <th className="text-right text-sm font-semibold text-ink-600 pb-3 px-4">
                  Prix
                </th>
                <th className="text-right text-sm font-semibold text-ink-600 pb-3 px-4">
                  Ventes
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
                {filteredBooks.map((book) => (
                <tr key={book.id} className="hover:bg-ink-50 transition">
                  <td className="px-4 py-3 text-sm font-semibold text-ink-900">
                    {book.title}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600">
                    {book.author}
                  </td>
                  <td className="px-4 py-3 text-sm text-ink-600">
                    {book.category}
                  </td>
                  <td className="px-4 py-3 text-right text-sm font-semibold text-brand">
                    {book.price.toFixed(2)}€
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-ink-600">
                    {book.sales ?? '-'}
                  </td>
                  <td className="px-4 py-3 text-center">
                    <span
                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${
                        book.active
                          ? 'bg-green-50 text-green-700'
                          : 'bg-red-50 text-red-700'
                      }`}
                    >
                      {book.active ? '✓ Actif' : '✗ Désactivé'}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <div className="flex items-center justify-center gap-2">
                      <button
                        onClick={() => toggleStatus(book)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-ink-100 text-ink-600 transition"
                        title={book.active ? 'Désactiver' : 'Activer'}
                      >
                        {book.active ? (
                          <Eye className="h-4 w-4" />
                        ) : (
                          <EyeOff className="h-4 w-4" />
                        )}
                      </button>
                      <button
                        onClick={() => handleEdit(book)}
                        className="flex h-8 w-8 items-center justify-center rounded-lg hover:bg-ink-100 text-ink-600 transition"
                      >
                        <Edit2 className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(book.id)}
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

      {/* Modal */}
      {showModal && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 p-4">
          <Card className="w-full max-w-md">
            <div className="mb-4">
              <h3 className="text-title-1 font-semibold text-ink-900">
                {editingBook ? 'Modifier le livre' : 'Ajouter un livre'}
              </h3>
            </div>
            <form className="space-y-4">
              {error ? (
                <div className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-700">
                  {error}
                </div>
              ) : null}
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-2">
                  Titre
                </label>
                <input
                  type="text"
                  value={formData.title}
                  onChange={(e) =>
                    setFormData({ ...formData, title: e.target.value })
                  }
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-body outline-none focus:border-brand focus:shadow-glow"
                />
              </div>
              <div>
                <label className="block text-sm font-semibold text-ink-900 mb-2">
                  Auteur
                </label>
                <input
                  type="text"
                  value={formData.author}
                  onChange={(e) =>
                    setFormData({ ...formData, author: e.target.value })
                  }
                  className="w-full rounded-lg border border-ink-200 px-3 py-2 text-body outline-none focus:border-brand focus:shadow-glow"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-2">
                    Prix
                  </label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) =>
                      setFormData({ ...formData, price: e.target.value })
                    }
                    className="w-full rounded-lg border border-ink-200 px-3 py-2 text-body outline-none focus:border-brand focus:shadow-glow"
                  />
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-2">
                    Catégorie
                  </label>
                  <select
                    value={formData.category}
                    onChange={(e) =>
                      setFormData({ ...formData, category: e.target.value })
                    }
                    className="w-full rounded-lg border border-ink-200 px-3 py-2 text-body outline-none focus:border-brand focus:shadow-glow"
                  >
                    <option>Science-Fiction</option>
                    <option>Romance</option>
                    <option>Thriller</option>
                    <option>Aventure</option>
                    <option>Drame</option>
                  </select>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-2">
                    Couverture
                  </label>
                  <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-ink-200 px-3 py-3 text-sm text-ink-500 cursor-pointer hover:bg-ink-50">
                    <Upload className="h-4 w-4" />
                    {coverFile ? coverFile.name : 'Importer une image'}
                    <input
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={(e) => setCoverFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
                <div>
                  <label className="block text-sm font-semibold text-ink-900 mb-2">
                    PDF
                  </label>
                  <label className="flex items-center justify-center gap-2 rounded-lg border border-dashed border-ink-200 px-3 py-3 text-sm text-ink-500 cursor-pointer hover:bg-ink-50">
                    <Upload className="h-4 w-4" />
                    {pdfFile ? pdfFile.name : 'Importer un PDF'}
                    <input
                      type="file"
                      accept="application/pdf"
                      className="hidden"
                      onChange={(e) => setPdfFile(e.target.files?.[0] || null)}
                    />
                  </label>
                </div>
              </div>
              <div className="flex items-center gap-3">
                <input
                  id="active"
                  type="checkbox"
                  checked={formData.active}
                  onChange={(e) => setFormData({ ...formData, active: e.target.checked })}
                  className="h-4 w-4 rounded border-ink-200 text-brand"
                />
                <label htmlFor="active" className="text-sm text-ink-600">
                  Activer ce livre
                </label>
              </div>
              <div className="flex gap-3 pt-4">
                <Button
                  variant="outline"
                  className="flex-1"
                  onClick={() => setShowModal(false)}
                >
                  Annuler
                </Button>
                <Button
                  className="flex-1"
                  onClick={handleSave}
                  loading={saving}
                  disabled={saving}
                >
                  {editingBook ? 'Mettre à jour' : 'Créer'}
                </Button>
              </div>
            </form>
          </Card>
        </div>
      )}
    </div>
  )
}

export default AdminBooks
