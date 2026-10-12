import { useState, useEffect } from 'react';
import { Sparkles, X } from 'lucide-react';

const messages = [
  'Free shipping on all orders over $50 across Canada',
  '30-day hassle-free returns on every purchase',
  'New arrivals just dropped — explore the collection',
];

export function AnnouncementBar() {
  const [index, setIndex] = useState(0);
  const [visible, setVisible] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setIndex((prev) => (prev + 1) % messages.length);
    }, 5000);
    return () => clearInterval(interval);
  }, []);

  if (!visible) return null;

  return (
    <div className="relative bg-neutral-900 text-white">
      <div className="mx-auto flex max-w-7xl items-center justify-center px-4 py-2.5 text-center">
        <div className="flex items-center gap-2 overflow-hidden">
          <Sparkles className="h-3.5 w-3.5 flex-shrink-0 text-accent-400" />
          <p className="text-xs font-medium tracking-wide sm:text-sm animate-fade-in" key={index}>
            {messages[index]}
          </p>
        </div>
        <button
          onClick={() => setVisible(false)}
          className="absolute right-3 top-1/2 -translate-y-1/2 rounded p-1 text-white/60 transition hover:text-white"
          aria-label="Dismiss announcement"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </div>
  );
}
