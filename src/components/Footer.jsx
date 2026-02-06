function Footer() {
  return (
    <footer className="border-t border-ink-100 bg-white">
      <div className="mx-auto flex w-full max-w-6xl flex-col gap-4 px-6 py-8 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2">
          <div className="h-2 w-2 rounded-full bg-brand" />
          <span className="text-sm font-semibold text-ink-900">Bookos</span>
          <span className="text-xs text-ink-500">© 2026</span>
        </div>
        <div className="flex flex-wrap gap-4 text-xs text-ink-500">
          <span>Livres numériques PDF</span>
          <span>Support 24/7</span>
          <span>Mentions légales</span>
        </div>
      </div>
    </footer>
  )
}

export default Footer
