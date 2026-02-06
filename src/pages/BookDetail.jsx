import { useParams, useNavigate } from 'react-router-dom'
import { Star, ShoppingCart, ArrowLeft, Download, Share2 } from 'lucide-react'
import Button from '../components/Button.jsx'
import Badge from '../components/Badge.jsx'
import useCart from '../hooks/useCart.js'

// Mock data - in reality this would come from an API
const mockBooks = {
  1: {
    id: 1,
    title: 'Les Mystères de l\'Univers',
    author: 'Jean Dupont',
    price: 12.99,
    cover:
      'https://images.unsplash.com/photo-1507842217343-583f20270319?w=500&h=700&fit=crop',
    rating: 4.5,
    reviews: 128,
    category: 'Science-Fiction',
    description: `Plongez dans un voyage fascinant à travers les mystères les plus profonds de l'univers. 
    
    Ce livre explore les dernières découvertes scientifiques, des trous noirs aux exoplanètes, en passant par les origines du Big Bang. Jean Dupont, astrophysicien renommé, décortique les concepts complexes avec une clarté et une poésie remarquables.
    
    Parfait pour les curieux de tous niveaux, ce récit captivant vous fera redécouvrir notre place dans le cosmos.`,
    pages: 384,
    isbn: '978-2-12345-678-9',
    published: '2023-03-15',
    language: 'Français',
    format: 'PDF',
    features: [
      '384 pages',
      'Illustrations haute qualité',
      'Table des matières interactive',
      'Accès illimité',
      'Téléchargement immédiat',
    ],
  },
  2: {
    id: 2,
    title: 'Le Cœur des Tempêtes',
    author: 'Marie Leclerc',
    price: 14.99,
    cover:
      'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=500&h=700&fit=crop',
    rating: 4.8,
    reviews: 245,
    category: 'Romance',
    description: `Une histoire d'amour déchirante entre deux âmes perdues dans les tourments de la vie.
    
    Sur les côtes de Bretagne, Emma et Lucas se rencontrent par hasard, au cœur d'une tempête qui ravage le littoral. Entre passion interdite et secrets enfouis, leur amour devra survivre aux éléments et aux malentendus.
    
    Un roman poignant qui redéfinit ce qu'aimer signifie vraiment.`,
    pages: 352,
    isbn: '978-2-23456-789-0',
    published: '2023-06-20',
    language: 'Français',
    format: 'PDF',
    features: [
      '352 pages',
      'Accès illimité',
      'Téléchargement immédiat',
      'Mise en page optimisée',
      'Police adaptable',
    ],
  },
}

function BookDetail() {
  const { id } = useParams()
  const navigate = useNavigate()
  const book = mockBooks[id] || mockBooks[1]
  const { addItem, isInCart } = useCart()

  const handleAddToCart = () => {
    addItem(book)
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Breadcrumb / Back Button */}
      <div className="border-b border-ink-100 bg-white">
        <div className="mx-auto flex w-full max-w-6xl items-center gap-4 px-6 py-4">
          <button
            onClick={() => navigate('/catalogue')}
            className="flex items-center gap-2 text-brand hover:text-brand-700"
          >
            <ArrowLeft className="h-5 w-5" />
            <span className="text-sm font-medium">Catalogue</span>
          </button>
          <span className="text-ink-300">/</span>
          <span className="text-sm text-ink-500">{book.category}</span>
        </div>
      </div>

      <div className="mx-auto flex w-full max-w-6xl flex-col gap-8 px-6 py-8 md:gap-12 lg:flex-row">
        {/* Left: Cover Image */}
        <div className="flex flex-col gap-4 lg:w-1/3">
          <div className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-brand-100 to-brand-200 shadow-elevated">
            {book.cover ? (
              <img
                src={book.cover}
                alt={book.title}
                className="h-auto w-full"
              />
            ) : (
              <div className="flex aspect-[3/4] w-full items-center justify-center text-6xl">
                📚
              </div>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="primary"
              className="flex-1"
              onClick={handleAddToCart}
              disabled={isInCart(book.id)}
            >
              <ShoppingCart className="h-5 w-5" />
              {isInCart(book.id) ? 'Ajouté' : 'Ajouter au panier'}
            </Button>
            <button className="flex h-12 w-12 items-center justify-center rounded-2xl border border-ink-200 bg-white text-ink-900 transition hover:bg-ink-50">
              <Share2 className="h-5 w-5" />
            </button>
          </div>
        </div>

        {/* Right: Book Info */}
        <div className="flex flex-1 flex-col gap-6">
          <div className="flex flex-col gap-3">
            <Badge className="w-fit">{book.category}</Badge>
            <h1 className="text-display-2 font-bold text-ink-900">
              {book.title}
            </h1>
            <p className="text-body-lg text-ink-600">par {book.author}</p>
          </div>

          {/* Rating */}
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-5 w-5 ${
                    i < Math.floor(book.rating)
                      ? 'fill-brand text-brand'
                      : 'text-ink-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-body font-semibold text-ink-900">
              {book.rating}
            </span>
            <span className="text-body text-ink-500">
              ({book.reviews} avis)
            </span>
          </div>

          {/* Price */}
          <div className="rounded-3xl bg-gradient-to-r from-brand-50 to-brand-100 p-6">
            <div className="flex items-baseline gap-2">
              <span className="text-display-1 font-bold text-brand-600">
                {book.price.toFixed(2)}€
              </span>
              <span className="text-body text-brand-700">
                Accès illimité & PDF
              </span>
            </div>
            <p className="mt-2 text-sm text-brand-600">
              ✓ Téléchargement immédiat
            </p>
          </div>

          {/* Description */}
          <div className="flex flex-col gap-3">
            <h3 className="text-title-2 font-semibold text-ink-900">
              À propos
            </h3>
            <p className="whitespace-pre-line text-body text-ink-700">
              {book.description}
            </p>
          </div>

          {/* Features */}
          <div className="flex flex-col gap-3">
            <h3 className="text-title-2 font-semibold text-ink-900">
              Ce que tu reçois
            </h3>
            <ul className="flex flex-col gap-2">
              {book.features.map((feature) => (
                <li
                  key={feature}
                  className="flex items-center gap-3 text-body text-ink-700"
                >
                  <span className="flex h-6 w-6 items-center justify-center rounded-full bg-brand-soft text-brand-700">
                    ✓
                  </span>
                  {feature}
                </li>
              ))}
            </ul>
          </div>

          {/* Book Details */}
          <div className="rounded-3xl border border-ink-100 bg-white p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <p className="text-sm text-ink-500">Pages</p>
                <p className="text-body font-semibold text-ink-900">
                  {book.pages}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-500">Langue</p>
                <p className="text-body font-semibold text-ink-900">
                  {book.language}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-500">Format</p>
                <p className="text-body font-semibold text-ink-900">
                  {book.format}
                </p>
              </div>
              <div>
                <p className="text-sm text-ink-500">ISBN</p>
                <p className="text-body font-semibold text-ink-900">
                  {book.isbn}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookDetail
