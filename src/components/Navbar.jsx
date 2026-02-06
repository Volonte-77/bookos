import { useMemo, useState } from 'react'
import { Link, NavLink } from 'react-router-dom'
import { Dropdown, Avatar } from 'flowbite-react'
import { Menu, X, ShoppingCart, User } from 'lucide-react'

const defaultLinks = [
  { label: 'Accueil', to: '/' },
  { label: 'Catalogue', to: '/catalogue' },
  { label: 'Nouveautés', to: '/nouveautes' },
  { label: 'Offres', to: '/offres' },
]

const defaultAdminLinks = [
  { label: 'Dashboard', to: '/admin' },
  { label: 'Livres', to: '/admin/livres' },
  { label: 'Commandes', to: '/admin/commandes' },
]

function Navbar({
  variant = 'public',
  user = null,
  cartCount = 0,
  navLinks,
  adminLinks,
  onLogout,
}) {
  const [open, setOpen] = useState(false)
  const links = useMemo(() => navLinks || defaultLinks, [navLinks])
  const adminItems = useMemo(
    () => adminLinks || defaultAdminLinks,
    [adminLinks],
  )

  const showAdmin = variant === 'admin'

  return (
    <header className="sticky top-0 z-40 w-full border-b border-white/10 bg-brand backdrop-blur">
      <nav className="mx-auto flex w-full max-w-6xl items-center justify-between px-6 py-4">
        <Link to="/" className="flex items-center gap-2 text-white">
          <div className="flex h-9 w-9 items-center justify-center rounded-2xl bg-white/15 text-lg font-bold">
            B
          </div>
          <div className="flex flex-col leading-none">
            <span className="text-lg font-semibold">Bookos</span>
            <span className="text-xs text-white/70">Digital books</span>
          </div>
        </Link>

        <div className="hidden items-center gap-6 md:flex">
          {(showAdmin ? adminItems : links).map((item) => (
            <NavLink
              key={item.to}
              to={item.to}
              className={({ isActive }) =>
                `text-sm font-medium transition ${
                  isActive
                    ? 'text-white'
                    : 'text-white/70 hover:text-white'
                }`
              }
            >
              {item.label}
            </NavLink>
          ))}
        </div>

        <div className="flex items-center gap-3">
          <Link
            to="/panier"
            className="relative flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white transition hover:bg-white/25"
            aria-label="Panier"
          >
            <ShoppingCart className="h-5 w-5" />
            {cartCount > 0 ? (
              <span className="absolute -right-1 -top-1 flex h-5 min-w-[1.25rem] items-center justify-center rounded-full bg-white px-1 text-[10px] font-bold text-brand-700">
                {cartCount}
              </span>
            ) : null}
          </Link>

          {user ? (
            <Dropdown
              inline
              label={
                <Avatar
                  img={user.avatar || undefined}
                  rounded
                  alt={user.name || 'Profil'}
                  className="border border-white/20"
                />
              }
            >
              <Dropdown.Header>
                <span className="block text-sm">{user.name || 'Compte'}</span>
                <span className="block truncate text-xs font-medium text-gray-500">
                  {user.email || ''}
                </span>
              </Dropdown.Header>
              <Dropdown.Item as={Link} to="/profil">
                Profil
              </Dropdown.Item>
              <Dropdown.Item as={Link} to="/bibliotheque">
                Ma bibliothèque
              </Dropdown.Item>
              {showAdmin ? (
                <Dropdown.Item as={Link} to="/admin">
                  Admin
                </Dropdown.Item>
              ) : null}
              <Dropdown.Divider />
              <Dropdown.Item onClick={onLogout}>Déconnexion</Dropdown.Item>
            </Dropdown>
          ) : (
            <div className="hidden items-center gap-2 md:flex">
              <Link
                to="/connexion"
                className="btn btn-ghost text-white"
              >
                Connexion
              </Link>
              <Link
                to="/inscription"
                className="btn btn-primary"
              >
                S'inscrire
              </Link>
            </div>
          )}

          <button
            type="button"
            className="flex h-10 w-10 items-center justify-center rounded-2xl bg-white/15 text-white transition hover:bg-white/25 md:hidden"
            onClick={() => setOpen((prev) => !prev)}
            aria-label="Menu"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </nav>

      {open ? (
        <div className="border-t border-white/10 bg-white/10 md:hidden">
          <div className="mx-auto flex w-full max-w-6xl flex-col gap-3 px-6 py-4">
            {(showAdmin ? adminItems : links).map((item) => (
              <NavLink
                key={item.to}
                to={item.to}
                className={({ isActive }) =>
                  `rounded-2xl px-3 py-2 text-sm font-medium transition ${
                    isActive
                      ? 'bg-white/20 text-white'
                      : 'text-white/80 hover:bg-white/15 hover:text-white'
                  }`
                }
                onClick={() => setOpen(false)}
              >
                {item.label}
              </NavLink>
            ))}

            {!user ? (
              <div className="flex flex-col gap-2 pt-2">
                <Link
                  to="/connexion"
                  className="btn btn-outline bg-white/10 text-white"
                  onClick={() => setOpen(false)}
                >
                  Connexion
                </Link>
                <Link
                  to="/inscription"
                  className="btn btn-primary"
                  onClick={() => setOpen(false)}
                >
                  S'inscrire
                </Link>
              </div>
            ) : (
              <div className="flex items-center gap-3 rounded-2xl bg-white/15 px-3 py-3 text-white">
                <div className="flex h-10 w-10 items-center justify-center rounded-full bg-white/25">
                  <User className="h-5 w-5" />
                </div>
                <div className="flex flex-1 flex-col">
                  <span className="text-sm font-semibold">
                    {user.name || 'Compte'}
                  </span>
                  <span className="text-xs text-white/70">
                    {user.email || ''}
                  </span>
                </div>
              </div>
            )}
          </div>
        </div>
      ) : null}
    </header>
  )
}

export default Navbar
