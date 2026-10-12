import { Link } from 'react-router-dom';
import { Home } from 'lucide-react';

export function NotFoundPage() {
  return (
    <div className="flex min-h-[60vh] flex-col items-center justify-center px-4 text-center">
      <p className="text-6xl font-bold text-primary-600">404</p>
      <h1 className="mt-4 text-xl font-bold text-neutral-900">Page not found</h1>
      <p className="mt-2 text-sm text-neutral-600">The page you are looking for does not exist or has been moved.</p>
      <Link to="/" className="mt-6 inline-block btn-primary">
        <Home className="h-4 w-4" /> Back to Home
      </Link>
    </div>
  );
}
