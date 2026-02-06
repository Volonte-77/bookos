import { useEffect, useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import {
  collection,
  doc,
  getDoc,
  getDocs,
  getFirestore,
  query,
  where,
} from 'firebase/firestore'
import { getDownloadURL, getStorage, ref } from 'firebase/storage'
import { AlertCircle, Download, Loader2 } from 'lucide-react'
import app from '../lib/firebase.js'
import { useAuth } from '../context/AuthContext.jsx'
import Card from '../components/Card.jsx'
import Button from '../components/Button.jsx'

function Downloads() {
  const { currentUser } = useAuth()
  const navigate = useNavigate()
  const db = useMemo(() => getFirestore(app), [])
  const storage = useMemo(() => getStorage(app), [])

  const [loading, setLoading] = useState(true)
  const [items, setItems] = useState([])
  const [error, setError] = useState('')
  const [downloading, setDownloading] = useState(null)

  useEffect(() => {
    if (!currentUser) {
      navigate('/connexion')
      return
    }

    const load = async () => {
      setLoading(true)
      setError('')

      try {
        const purchasesRef = collection(db, 'purchases')
        const purchasesQuery = query(
          purchasesRef,
          where('userId', '==', currentUser.uid),
        )
        const snapshot = await getDocs(purchasesQuery)
        const purchases = snapshot.docs.map((docItem) => docItem.data())

        if (purchases.length === 0) {
          setItems([])
          return
        }

        const books = await Promise.all(
          purchases.map(async (purchase) => {
            const bookRef = doc(db, 'books', String(purchase.bookId))
            const bookSnap = await getDoc(bookRef)
            const bookData = bookSnap.exists() ? bookSnap.data() : {}

            return {
              id: String(purchase.bookId),
              title: bookData.title || purchase.title || 'Livre',
              author: bookData.author || purchase.author || 'Auteur',
              cover: bookData.cover || null,
              storagePath:
                purchase.storagePath || bookData.storagePath || `books/${purchase.bookId}.pdf`,
              purchaseId: `${currentUser.uid}_${purchase.bookId}`,
            }
          }),
        )

        setItems(books)
      } catch (err) {
        setError('Impossible de charger votre bibliothèque.')
      } finally {
        setLoading(false)
      }
    }

    load()
  }, [currentUser, db, navigate])

  const handleDownload = async (item) => {
    if (!currentUser) {
      navigate('/connexion')
      return
    }

    setDownloading(item.id)
    setError('')

    try {
      const purchaseRef = doc(db, 'purchases', item.purchaseId)
      const purchaseSnap = await getDoc(purchaseRef)

      if (!purchaseSnap.exists()) {
        setError('Accès refusé. Livre non acheté.')
        return
      }

      const fileRef = ref(storage, item.storagePath)
      const url = await getDownloadURL(fileRef)
      window.location.href = url
    } catch (err) {
      setError('Téléchargement indisponible. Vérifiez votre accès.')
    } finally {
      setDownloading(null)
    }
  }

  return (
    <div className="min-h-screen bg-ink-50">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-12">
        <div className="flex flex-col gap-2">
          <h1 className="text-display-2 font-bold text-ink-900">
            Mes téléchargements
          </h1>
          <p className="text-body text-ink-500">
            Accédez à vos livres numériques achetés.
          </p>
        </div>

        {error ? (
          <Card elevated className="border-l-4 border-red-500">
            <div className="flex gap-3">
              <AlertCircle className="h-5 w-5 flex-shrink-0 text-red-600" />
              <p className="text-sm text-red-700">{error}</p>
            </div>
          </Card>
        ) : null}

        {loading ? (
          <Card>
            <div className="flex items-center gap-3 text-ink-500">
              <Loader2 className="h-5 w-5 animate-spin" />
              Chargement de votre bibliothèque...
            </div>
          </Card>
        ) : items.length === 0 ? (
          <Card>
            <div className="flex flex-col items-center gap-4 py-10">
              <div className="text-5xl">📚</div>
              <p className="text-body text-ink-500">Aucun livre acheté.</p>
              <Button variant="outline" onClick={() => navigate('/catalogue')}>
                Parcourir le catalogue
              </Button>
            </div>
          </Card>
        ) : (
          <div className="grid gap-4 md:grid-cols-2">
            {items.map((item) => (
              <Card key={item.id}>
                <div className="flex gap-4">
                  {item.cover ? (
                    <img
                      src={item.cover}
                      alt={item.title}
                      className="h-28 w-20 rounded-xl object-cover"
                    />
                  ) : (
                    <div className="flex h-28 w-20 items-center justify-center rounded-xl bg-brand-soft text-2xl">
                      📖
                    </div>
                  )}
                  <div className="flex flex-1 flex-col justify-between">
                    <div>
                      <h3 className="text-title-2 font-semibold text-ink-900">
                        {item.title}
                      </h3>
                      <p className="text-sm text-ink-500">{item.author}</p>
                    </div>
                    <Button
                      variant="primary"
                      className="mt-4 w-fit gap-2"
                      onClick={() => handleDownload(item)}
                      loading={downloading === item.id}
                      disabled={downloading === item.id}
                    >
                      <Download className="h-4 w-4" />
                      Télécharger
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

export default Downloads
