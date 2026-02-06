import { useState, useMemo } from 'react'
import { Search } from 'lucide-react'
import BookCard from '../components/BookCard.jsx'
import Badge from '../components/Badge.jsx'
import Button from '../components/Button.jsx'
import useCart from '../hooks/useCart.js'

// Mock data
const mockBooks = [
  {
    id: 1,
    title: 'Les Mystères de l\'Univers',
    author: 'Jean Dupont',
    price: 12.99,
    cover: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=400&fit=crop',
    rating: 4.5,
    reviews: 128,
    category: 'Science-Fiction',
  },
  {
    id: 2,
    title: 'Le Cœur des Tempêtes',
    author: 'Marie Leclerc',
    price: 14.99,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
    rating: 4.8,
    reviews: 245,
    category: 'Romance',
  },
  {
    id: 3,
    title: 'Intrigue à Paris',
    author: 'Claude Martin',
    price: 9.99,
    cover: 'https://images.unsplash.com/photo-1516979187457-635ffe35ff15?w=300&h=400&fit=crop',
    rating: 4.2,
    reviews: 87,
    category: 'Thriller',
  },
  {
    id: 4,
    title: 'Au-delà des Montagnes',
    author: 'Sophie Rousseau',
    price: 13.49,
    cover: 'https://images.unsplash.com/photo-1541961017774-22349e4a1262?w=300&h=400&fit=crop',
    rating: 4.6,
    reviews: 156,
    category: 'Aventure',
  },
  {
    id: 5,
    title: 'Les Secrets du Temps',
    author: 'Antoine Blanc',
    price: 11.99,
    cover: 'https://images.unsplash.com/photo-1507842217343-583f20270319?w=300&h=400&fit=crop',
    rating: 4.7,
    reviews: 203,
    category: 'Science-Fiction',
  },
  {
    id: 6,
    title: 'Le Dernier Jour',
    author: 'Isabelle Moreau',
    price: 10.49,
    cover: 'https://images.unsplash.com/photo-1512820790803-83ca734da794?w=300&h=400&fit=crop',
    rating: 4.3,
    reviews: 112,
    category: 'Drame',
  },
]

const categories = [
  'Tous',
  'Science-Fiction',
  'Romance',
  'Thriller',
  'Aventure',
  'Drame',
]

function BookList() {
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('Tous')
  const [sortBy, setSortBy] = useState('featured')
  const { addItem, isInCart } = useCart()

  const filteredBooks = useMemo(() => {
    let filtered = mockBooks

    // Search filter
    if (searchTerm) {
      filtered = filtered.filter(
        (book) =>
          book.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
          book.author.toLowerCase().includes(searchTerm.toLowerCase()),
      )
    }

    // Category filter
    if (selectedCategory !== 'Tous') {
      filtered = filtered.filter((book) => book.category === selectedCategory)
    }

    // Sort
    if (sortBy === 'price-low') {
      filtered.sort((a, b) => a.price - b.price)
    } else if (sortBy === 'price-high') {
      filtered.sort((a, b) => b.price - a.price)
    } else if (sortBy === 'rating') {
      filtered.sort((a, b) => b.rating - a.rating)
    }

    return filtered
  }, [searchTerm, selectedCategory, sortBy])

  const handleAddToCart = (book) => {
    addItem(book)
  }

  return (
    <div className="min-h-screen bg-ink-50">
      {/* Hero Section */}
      <div className="bg-gradient-to-r from-brand to-brand-600 py-12 md:py-16">
        <div className="mx-auto flex w-full max-w-6xl flex-col gap-6 px-6">
          <div>
            <h1 className="text-display-1 font-bold text-white">Catalogue</h1>
            <p className="mt-2 text-body-lg text-white/80">
              Découvrez nos milliers de livres numériques
            </p>
          </div>

          <div className="relative flex items-center gap-2 rounded-full bg-white/15 px-4 py-2 backdrop-blur">
            <Search className="h-5 w-5 text-white/70" />
            <input
              type="text"
              placeholder="Chercher un livre, un auteur..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="flex-1 bg-transparent text-body text-white placeholder-white/50 outline-none"
            />
          </div>
        </div>
      </div>

      <div className="mx-auto w-full max-w-6xl px-6 py-8">
        <div className="flex flex-col gap-6 lg:flex-row">
          {/* Sidebar */}
          <aside className="flex flex-col gap-6 lg:w-64">
            {/* Categories */}
            <div className="card">
              <h3 className="mb-3 text-title-2 font-semibold text-ink-900">
                Catégories
              </h3>
              <div className="flex flex-wrap gap-2 lg:flex-col">
                {categories.map((cat) => (
                  <button
                    key={cat}
                    onClick={() => setSelectedCategory(cat)}
                    className={`rounded-2xl px-3 py-2 text-sm font-medium transition ${
                      selectedCategory === cat
                        ? 'bg-brand text-white'
                        : 'bg-ink-100 text-ink-900 hover:bg-ink-200'
                    }`}
                  >
                    {cat}
                  </button>
                ))}
              </div>
            </div>

            {/* Sort */}
            <div className="card">
              <h3 className="mb-3 text-title-2 font-semibold text-ink-900">
                Trier par
              </h3>
              <select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                className="w-full rounded-2xl border border-ink-200 bg-white px-3 py-2 text-body text-ink-900 outline-none transition focus:border-brand focus:shadow-glow"
              >
                <option value="featured">Populaire</option>
                <option value="price-low">Prix : bas → haut</option>
                <option value="price-high">Prix : haut → bas</option>
                <option value="rating">Mieux notés</option>
              </select>
            </div>
          </aside>

          {/* Main Content */}
          <div className="flex-1">
            <div className="mb-6 flex items-center justify-between">
              <span className="text-body text-ink-500">
                {filteredBooks.length} livres trouvés
              </span>
              <Badge>{selectedCategory}</Badge>
            </div>

            {filteredBooks.length > 0 ? (
              <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
                {filteredBooks.map((book) => (
                  <BookCard
                    key={book.id}
                    book={book}
                    onAddToCart={handleAddToCart}
                    inCart={isInCart(book.id)}
                  />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center gap-4 rounded-3xl bg-white py-12">
                <div className="text-5xl">📚</div>
                <h3 className="text-title-2 font-semibold text-ink-900">
                  Aucun livre trouvé
                </h3>
                <p className="text-body text-ink-500">
                  Essayez une autre recherche ou catégorie
                </p>
                <Button
                  variant="outline"
                  onClick={() => {
                    setSearchTerm('')
                    setSelectedCategory('Tous')
                  }}
                >
                  Réinitialiser les filtres
                </Button>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

export default BookList
