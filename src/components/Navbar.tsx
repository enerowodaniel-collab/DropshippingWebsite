import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Search, ShoppingBag, User, Heart, Menu, X, Zap } from 'lucide-react';
import { useCart } from '@/context/CartContext';
import { useWishlist } from '@/context/WishlistContext';
import { useAuth } from '@/context/AuthContext';

export function Navbar() {
  const { itemCount } = useCart();
  const { count: wishlistCount } = useWishlist();
  const { user, isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [scrolled, setScrolled] = useState(false);
  const navigate = useNavigate();
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 0);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (searchOpen && searchInputRef.current) {
      searchInputRef.current.focus();
    }
  }, [searchOpen]);

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/shop?q=${encodeURIComponent(searchQuery.trim())}`);
      setSearchOpen(false);
      setSearchQuery('');
      setMobileOpen(false);
    }
  };

  const navLinks = [
    { label: 'Shop', path: '/shop' },
    { label: 'Best Sellers', path: '/shop?filter=best-sellers' },
    { label: 'New Arrivals', path: '/shop?filter=new-arrivals' },
    { label: 'About', path: '/about' },
  ];

  return (
    <>
      <header
        className={`sticky top-0 z-50 w-full bg-white transition-all duration-300 ${
          scrolled ? 'shadow-md' : 'border-b border-neutral-200'
        }`}
      >
        <nav className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3.5 sm:px-6">
          {/* Logo */}
          <Link to="/" className="flex items-center gap-2 font-bold text-xl text-neutral-900">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
              <Zap className="h-5 w-5" fill="currentColor" />
            </div>
            <span>NovaShop</span>
          </Link>

          {/* Desktop nav */}
          <div className="hidden lg:flex items-center gap-1">
            {navLinks.map((link) => (
              <Link
                key={link.path}
                to={link.path}
                className="rounded-lg px-3 py-2 text-sm font-medium text-neutral-600 transition-all hover:bg-neutral-100 hover:text-neutral-900"
              >
                {link.label}
              </Link>
            ))}
          </div>

          {/* Actions */}
          <div className="flex items-center gap-1">
            <button
              onClick={() => setSearchOpen(!searchOpen)}
              className="rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Search"
            >
              <Search className="h-5 w-5" />
            </button>

            <Link
              to="/wishlist"
              className="relative hidden sm:flex rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Wishlist"
            >
              <Heart className="h-5 w-5" />
              {wishlistCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-accent-500 px-1 text-[10px] font-bold text-white">
                  {wishlistCount}
                </span>
              )}
            </Link>

            <Link
              to={user ? (isAdmin ? '/admin' : '/account') : '/signin'}
              className="hidden sm:flex rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Account"
            >
              <User className="h-5 w-5" />
            </Link>

            <Link
              to="/cart"
              className="relative rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100 hover:text-neutral-900"
              aria-label="Shopping cart"
            >
              <ShoppingBag className="h-5 w-5" />
              {itemCount > 0 && (
                <span className="absolute -right-0.5 -top-0.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-primary-600 px-1 text-[10px] font-bold text-white">
                  {itemCount}
                </span>
              )}
            </Link>

            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="lg:hidden rounded-lg p-2 text-neutral-600 transition hover:bg-neutral-100"
              aria-label="Menu"
            >
              {mobileOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </button>
          </div>
        </nav>

        {/* Search bar */}
        {searchOpen && (
          <div className="border-t border-neutral-200 bg-white animate-slide-down">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6">
              <form onSubmit={handleSearch} className="flex gap-2">
                <input
                  ref={searchInputRef}
                  type="text"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  placeholder="Search products..."
                  className="input"
                />
                <button type="submit" className="btn-primary px-4">
                  <Search className="h-4 w-4" />
                </button>
              </form>
            </div>
          </div>
        )}

        {/* Mobile menu */}
        {mobileOpen && (
          <div className="lg:hidden border-t border-neutral-200 bg-white animate-slide-down">
            <div className="mx-auto max-w-7xl px-4 py-3 sm:px-6 space-y-1">
              {navLinks.map((link) => (
                <Link
                  key={link.path}
                  to={link.path}
                  onClick={() => setMobileOpen(false)}
                  className="block rounded-lg px-3 py-2.5 text-sm font-medium text-neutral-700 transition hover:bg-neutral-100"
                >
                  {link.label}
                </Link>
              ))}
              <div className="flex items-center gap-2 pt-2 border-t border-neutral-200">
                <Link
                  to="/wishlist"
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-medium text-neutral-700"
                >
                  <Heart className="h-4 w-4" />
                  Wishlist
                </Link>
                <Link
                  to={user ? (isAdmin ? '/admin' : '/account') : '/signin'}
                  onClick={() => setMobileOpen(false)}
                  className="flex flex-1 items-center justify-center gap-2 rounded-lg border border-neutral-300 px-3 py-2.5 text-sm font-medium text-neutral-700"
                >
                  <User className="h-4 w-4" />
                  Account
                </Link>
              </div>
            </div>
          </div>
        )}
      </header>
    </>
  );
}
