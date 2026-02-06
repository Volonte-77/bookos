import { Download, Calendar, AlertCircle } from 'lucide-react'
import Button from '../components/Button.jsx'

function DownloadList({ books = [] }) {
  if (books.length === 0) {
    return (
      <div className="card">
        <h2 className="mb-6 text-title-1 font-semibold text-ink-900">
          Mes téléchargements
        </h2>
        <div className="flex flex-col items-center gap-4 rounded-2xl bg-ink-50 py-12">
          <div className="text-5xl">📚</div>
          <h3 className="text-title-2 font-semibold text-ink-900">
            Aucun livre acheté
          </h3>
          <p className="text-center text-body text-ink-500">
            Explorez notre catalogue et achetez vos premiers livres
          </p>
          <Button>Découvrir le catalogue</Button>
        </div>
      </div>
    )
  }

  return (
    <div className="card">
      <h2 className="mb-6 text-title-1 font-semibold text-ink-900">
        Mes téléchargements
      </h2>
      <div className="space-y-4">
        {books.map((book) => (
          <div
            key={book.id}
            className="flex flex-col gap-4 rounded-2xl border border-ink-100 bg-white p-4 sm:flex-row sm:items-center sm:justify-between"
          >
            <div className="flex gap-4">
              {book.cover ? (
                <img
                  src={book.cover}
                  alt={book.title}
                  className="h-24 w-16 rounded-xl object-cover"
                />
              ) : (
                <div className="flex h-24 w-16 items-center justify-center rounded-xl bg-brand-100 text-2xl">
                  📖
                </div>
              )}
              <div className="flex flex-1 flex-col justify-center">
                <h3 className="text-title-2 font-semibold text-ink-900">
                  {book.title}
                </h3>
                <p className="text-sm text-ink-500">{book.author}</p>
                <div className="mt-2 flex items-center gap-2 text-xs text-ink-400">
                  <Calendar className="h-3.5 w-3.5" />
                  <span>
                    Acheté le{' '}
                    {new Date(book.purchaseDate).toLocaleDateString('fr-FR')}
                  </span>
                </div>
              </div>
            </div>
            <div className="flex gap-2 flex-shrink-0">
              <Button
                variant="secondary"
                className="gap-2"
                onClick={() => console.log(`Download ${book.id}`)}
              >
                <Download className="h-4 w-4" />
                <span className="hidden sm:inline">Télécharger</span>
              </Button>
            </div>
          </div>
        ))}
      </div>
    </div>
  )
}

export default DownloadList
