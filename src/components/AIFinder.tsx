import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Search, Loader2, X } from 'lucide-react';
import { useProducts } from '@/lib/hooks';
import { ProductCard } from '@/components/ProductCard';
import type { Product } from '@/types';
import { formatPrice } from '@/lib/format';

type Step = 'intro' | 'category' | 'budget' | 'use' | 'results';

const categories = [
  { id: 'audio', label: 'Audio & Sound', desc: 'Earbuds, headphones, speakers' },
  { id: 'desk-accessories', label: 'Desk & Workspace', desc: 'Lamps, stands, keyboards' },
  { id: 'wearables', label: 'Wearables', desc: 'Smart watches, fitness trackers' },
  { id: 'power-charging', label: 'Power & Charging', desc: 'Chargers, power banks' },
  { id: 'lifestyle', label: 'Everyday Lifestyle', desc: 'Mug warmers, gadgets' },
  { id: 'all', label: 'Show me everything', desc: 'I am open to suggestions' },
];

const budgets = [
  { id: 'under50', label: 'Under $50', min: 0, max: 50 },
  { id: '50-100', label: '$50 - $100', min: 50, max: 100 },
  { id: '100-200', label: '$100 - $200', min: 100, max: 200 },
  { id: 'any', label: 'No preference', min: 0, max: 9999 },
];

const useCases = [
  { id: 'work', label: 'For work / productivity' },
  { id: 'travel', label: 'For travel / on-the-go' },
  { id: 'home', label: 'For home / everyday' },
  { id: 'fitness', label: 'For fitness / health' },
  { id: 'gift', label: 'As a gift' },
];

export function AIFinder() {
  const { products } = useProducts();
  const [step, setStep] = useState<Step>('intro');
  const [category, setCategory] = useState('');
  const [budget, setBudget] = useState('');
  const [useCase, setUseCase] = useState('');
  const [results, setResults] = useState<Product[]>([]);

  const findProducts = () => {
    let filtered = [...products];
    const cat = categories.find((c) => c.id === category);
    if (cat && cat.id !== 'all') {
      filtered = filtered.filter((p) => {
        return p.specifications && Object.values(p.specifications).some(
          (v) => typeof v === 'string' && v.toLowerCase().includes(cat.id.split('-')[0])
        ) || p.name.toLowerCase().includes(cat.id.split('-')[0]) ||
        p.description.toLowerCase().includes(cat.label.toLowerCase().split(' ')[0]);
      });
    }
    const bud = budgets.find((b) => b.id === budget);
    if (bud) {
      filtered = filtered.filter((p) => Number(p.price) >= bud.min && Number(p.price) <= bud.max);
    }
    if (useCase === 'travel') {
      filtered = filtered.filter((p) =>
        /portable|compact|wireless|mini|travel/i.test(p.name + p.description)
      );
    } else if (useCase === 'fitness') {
      filtered = filtered.filter((p) =>
        /watch|fitness|water|sport|active/i.test(p.name + p.description)
      );
    } else if (useCase === 'work') {
      filtered = filtered.filter((p) =>
        /desk|keyboard|lamp|stand|charging|laptop/i.test(p.name + p.description)
      );
    }
    setResults(filtered.length > 0 ? filtered.slice(0, 4) : products.slice(0, 4));
    setStep('results');
  };

  const reset = () => {
    setStep('intro');
    setCategory('');
    setBudget('');
    setUseCase('');
    setResults([]);
  };

  if (step === 'intro') {
    return (
      <div className="mx-auto max-w-2xl">
        <div className="rounded-2xl bg-neutral-800 p-8 text-center">
          <p className="text-sm text-neutral-400 mb-6">
            Get personalized product recommendations in 3 quick steps.
          </p>
          <button
            onClick={() => setStep('category')}
            className="inline-flex items-center gap-2 rounded-lg bg-primary-600 px-8 py-3 text-sm font-semibold text-white transition hover:bg-primary-700"
          >
            <Search className="h-4 w-4" />
            Start Finding
          </button>
        </div>
      </div>
    );
  }

  if (step === 'results') {
    return (
      <div className="mx-auto max-w-7xl">
        <div className="mb-6 flex items-center justify-between">
          <p className="text-sm text-neutral-400">
            {results.length} {results.length === 1 ? 'match' : 'matches'} found for you
          </p>
          <button onClick={reset} className="text-sm text-primary-400 hover:text-primary-300">
            Start over
          </button>
        </div>
        {results.length === 0 ? (
          <div className="rounded-xl bg-neutral-800 p-8 text-center">
            <p className="text-sm text-neutral-400">No products matched your criteria. Try adjusting your preferences.</p>
            <button onClick={reset} className="mt-4 text-sm text-primary-400 hover:text-primary-300">Start over</button>
          </div>
        ) : (
          <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
            {results.map((p) => (
              <Link key={p.id} to={`/product/${p.slug}`} className="group block overflow-hidden rounded-xl bg-neutral-800 transition hover:bg-neutral-700">
                <div className="aspect-square overflow-hidden bg-neutral-700">
                  <img src={p.images[0]} alt={p.name} loading="lazy" className="h-full w-full object-cover transition group-hover:scale-105" />
                </div>
                <div className="p-3">
                  <h3 className="text-sm font-semibold text-white line-clamp-1">{p.name}</h3>
                  <p className="mt-1 text-sm font-bold text-primary-400">{formatPrice(Number(p.price))}</p>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    );
  }

  const options = step === 'category' ? categories : step === 'budget' ? budgets : useCases;
  const title = step === 'category' ? 'What are you looking for?' : step === 'budget' ? 'What is your budget?' : 'How will you use it?';
  const selected = step === 'category' ? category : step === 'budget' ? budget : useCase;
  const setter = step === 'category' ? setCategory : step === 'budget' ? setBudget : setUseCase;

  const next = () => {
    if (step === 'category') setStep('budget');
    else if (step === 'budget') setStep('use');
    else if (step === 'use') findProducts();
  };

  return (
    <div className="mx-auto max-w-2xl">
      <div className="rounded-2xl bg-neutral-800 p-6 sm:p-8">
        <div className="mb-6 flex items-center justify-between">
          <h3 className="text-lg font-semibold text-white">{title}</h3>
          <div className="flex gap-1.5">
            {['category', 'budget', 'use'].map((s, i) => (
              <div
                key={s}
                className={`h-1.5 w-8 rounded-full ${step === s ? 'bg-primary-500' : ['category', 'budget', 'use'].indexOf(step) > i ? 'bg-primary-700' : 'bg-neutral-600'}`}
              />
            ))}
          </div>
        </div>
        <div className="grid gap-2 sm:grid-cols-2">
          {options.map((opt: any) => (
            <button
              key={opt.id}
              onClick={() => setter(opt.id)}
              className={`rounded-lg border p-4 text-left transition ${
                selected === opt.id
                  ? 'border-primary-500 bg-primary-500/10 text-white'
                  : 'border-neutral-600 text-neutral-300 hover:border-neutral-500'
              }`}
            >
              <p className="text-sm font-semibold">{opt.label}</p>
              {opt.desc && <p className="mt-0.5 text-xs text-neutral-400">{opt.desc}</p>}
            </button>
          ))}
        </div>
        <div className="mt-6 flex gap-3">
          {step !== 'category' && (
            <button
              onClick={() => setStep(step === 'budget' ? 'category' : 'budget')}
              className="rounded-lg border border-neutral-600 px-4 py-2 text-sm font-medium text-neutral-300 transition hover:border-neutral-500"
            >
              Back
            </button>
          )}
          <button
            onClick={next}
            disabled={!selected}
            className="btn-primary flex-1"
          >
            Continue
          </button>
        </div>
      </div>
    </div>
  );
}
