import { ShoppingCart, Star } from 'lucide-react'
import Button from './Button.jsx'

function BookCard({ book, onAddToCart = () => {}, inCart = false }) {
  const { id, title, author, price, cover, rating, reviews } = book

  return (
    <div className="group flex flex-col overflow-hidden rounded-3xl bg-white shadow-card transition-all duration-300 hover:shadow-elevated hover:-translate-y-1">
      <div className="relative h-64 w-full overflow-hidden bg-gradient-to-br from-brand-100 to-brand-200">
        {cover ? (
          <img
            src={cover}
            alt={title}
            className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-110"
          />
        ) : (
          <div className="flex h-full w-full items-center justify-center">
            <div className="text-center">
              <div className="text-4xl font-bold text-brand-400">📚</div>
              <p className="mt-2 text-xs text-brand-600">{title}</p>
            </div>
          </div>
        )}

        <div className="absolute inset-0 bg-gradient-to-t from-black/40 to-transparent opacity-0 transition-opacity duration-300 group-hover:opacity-100" />
      </div>

      <div className="flex flex-1 flex-col gap-3 p-4">
        <div className="flex flex-col gap-1">
          <h3 className="line-clamp-2 text-title-2 font-semibold text-ink-900">
            {title}
          </h3>
          <p className="text-sm text-ink-500">{author}</p>
        </div>

        {rating ? (
          <div className="flex items-center gap-1">
            <div className="flex items-center gap-0.5">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  className={`h-3.5 w-3.5 ${
                    i < Math.floor(rating)
                      ? 'fill-brand text-brand'
                      : 'text-ink-200'
                  }`}
                />
              ))}
            </div>
            <span className="text-xs text-ink-500">
              ({reviews || 0})
            </span>
          </div>
        ) : null}

        <div className="mt-auto flex items-baseline justify-between">
          <div className="flex flex-col">
            <span className="text-2xl font-bold text-brand-600">
              {price.toFixed(2)}€
            </span>
            <span className="text-xs text-ink-400">PDF illimité</span>
          </div>
        </div>

        <Button
          variant={inCart ? 'outline' : 'primary'}
          className="w-full gap-2"
          onClick={() => onAddToCart(book)}
          disabled={inCart}
        >
          <ShoppingCart className="h-4 w-4" />
          {inCart ? 'Ajouté' : 'Ajouter'}
        </Button>
      </div>
    </div>
  )
}

export default BookCard
