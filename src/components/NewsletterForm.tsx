import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Mail, CheckCircle, AlertCircle, Loader2 } from 'lucide-react';

export function NewsletterForm() {
  const [email, setEmail] = useState('');
  const [consent, setConsent] = useState(false);
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [errorMsg, setErrorMsg] = useState('');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!consent) {
      setStatus('error');
      setErrorMsg('Please consent to receive emails to subscribe.');
      return;
    }

    setStatus('loading');
    setErrorMsg('');

    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email, consent_given: true, source: 'footer' });

    if (error) {
      if (error.code === '23505') {
        setStatus('success');
        setEmail('');
      } else {
        setStatus('error');
        setErrorMsg('Something went wrong. Please try again.');
      }
    } else {
      setStatus('success');
      setEmail('');
    }
  };

  if (status === 'success') {
    return (
      <div className="flex items-center gap-3 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700">
        <CheckCircle className="h-5 w-5 flex-shrink-0" />
        <span>Thanks for subscribing! Check your inbox for a confirmation.</span>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="w-full">
      <div className="flex flex-col gap-3 sm:flex-row">
        <div className="relative flex-1">
          <Mail className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-neutral-400" />
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="Enter your email"
            className="input pl-10"
            disabled={status === 'loading'}
          />
        </div>
        <button type="submit" className="btn-primary" disabled={status === 'loading'}>
          {status === 'loading' ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            'Subscribe'
          )}
        </button>
      </div>
      <label className="mt-3 flex items-start gap-2 text-xs text-neutral-500">
        <input
          type="checkbox"
          checked={consent}
          onChange={(e) => setConsent(e.target.checked)}
          className="mt-0.5 h-4 w-4 rounded border-neutral-300 text-primary-600 focus:ring-primary-500"
        />
        <span>I agree to receive marketing emails from NovaShop. I can unsubscribe at any time.</span>
      </label>
      {status === 'error' && (
        <div className="mt-2 flex items-center gap-2 text-xs text-error-600">
          <AlertCircle className="h-4 w-4 flex-shrink-0" />
          <span>{errorMsg}</span>
        </div>
      )}
    </form>
  );
}
