import { Link } from 'react-router-dom';
import { Zap, Mail, Phone, MapPin, Instagram, Twitter, Facebook, Youtube } from 'lucide-react';
import { NewsletterForm } from '@/components/NewsletterForm';

export function Footer() {
  const shopLinks = [
    { label: 'All Products', path: '/shop' },
    { label: 'Best Sellers', path: '/shop?filter=best-sellers' },
    { label: 'New Arrivals', path: '/shop?filter=new-arrivals' },
    { label: 'Categories', path: '/shop' },
  ];

  const helpLinks = [
    { label: 'Shipping Policy', path: '/legal/shipping' },
    { label: 'Return & Refund Policy', path: '/legal/returns' },
    { label: 'Privacy Policy', path: '/legal/privacy' },
    { label: 'Terms of Service', path: '/legal/terms' },
    { label: 'FAQ', path: '/faq' },
    { label: 'Contact Us', path: '/contact' },
  ];

  return (
    <footer className="border-t border-neutral-200 bg-neutral-50">
      {/* Newsletter section */}
      <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h3 className="text-2xl font-bold text-neutral-900">Stay in the loop</h3>
            <p className="mt-2 text-sm text-neutral-600">
              Subscribe for product updates, tips, and exclusive offers. No spam, ever.
            </p>
          </div>
          <NewsletterForm />
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
          <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-4">
            {/* Brand */}
            <div className="space-y-4">
              <Link to="/" className="flex items-center gap-2 font-bold text-xl text-neutral-900">
                <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary-600 text-white">
                  <Zap className="h-5 w-5" fill="currentColor" />
                </div>
                <span>NovaShop</span>
              </Link>
              <p className="text-sm text-neutral-600 max-w-xs">
                Premium everyday gadgets and lifestyle products, carefully curated and shipped
                across Canada.
              </p>
              <div className="flex gap-3">
                <a href="#" className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-900" aria-label="Instagram">
                  <Instagram className="h-5 w-5" />
                </a>
                <a href="#" className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-900" aria-label="Twitter">
                  <Twitter className="h-5 w-5" />
                </a>
                <a href="#" className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-900" aria-label="Facebook">
                  <Facebook className="h-5 w-5" />
                </a>
                <a href="#" className="rounded-lg p-2 text-neutral-400 transition hover:bg-neutral-200 hover:text-neutral-900" aria-label="YouTube">
                  <Youtube className="h-5 w-5" />
                </a>
              </div>
            </div>

            {/* Shop */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Shop</h4>
              <ul className="mt-4 space-y-2">
                {shopLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm text-neutral-600 transition hover:text-neutral-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Help */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Customer Care</h4>
              <ul className="mt-4 space-y-2">
                {helpLinks.map((link) => (
                  <li key={link.label}>
                    <Link to={link.path} className="text-sm text-neutral-600 transition hover:text-neutral-900">
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>

            {/* Contact */}
            <div>
              <h4 className="text-sm font-semibold text-neutral-900">Contact</h4>
              <ul className="mt-4 space-y-3">
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Mail className="h-4 w-4 mt-0.5 flex-shrink-0 text-neutral-400" />
                  <span>support@novashop.ca</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <Phone className="h-4 w-4 mt-0.5 flex-shrink-0 text-neutral-400" />
                  <span>1-800-555-NOVA</span>
                </li>
                <li className="flex items-start gap-2 text-sm text-neutral-600">
                  <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-neutral-400" />
                  <span>Toronto, Ontario, Canada</span>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>

      <div className="border-t border-neutral-200">
        <div className="mx-auto max-w-7xl px-4 py-6 sm:px-6">
          <div className="flex flex-col items-center justify-between gap-4 text-xs text-neutral-500 sm:flex-row">
            <p>&copy; {new Date().getFullYear()} NovaShop. All rights reserved.</p>
            <p>Prices in CAD. Ships within Canada.</p>
          </div>
        </div>
      </div>
    </footer>
  );
}
