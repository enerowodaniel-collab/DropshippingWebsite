import { useState } from 'react';
import { Mail, Phone, MapPin, Send, Loader2, CheckCircle, AlertCircle } from 'lucide-react';
import { supabase } from '@/lib/supabase';

export function ContactPage() {
  const [form, setForm] = useState({ name: '', email: '', subject: '', message: '' });
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setStatus('loading');
    // Save as a newsletter entry with source "contact" for demo purposes
    // In production, this would send an email or create a support ticket
    const { error } = await supabase
      .from('newsletter_subscribers')
      .insert({ email: form.email, consent_given: true, source: `contact:${form.subject}` });

    if (error && error.code !== '23505') {
      setStatus('error');
    } else {
      setStatus('success');
      setForm({ name: '', email: '', subject: '', message: '' });
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 py-12 sm:px-6">
      <div className="text-center mb-12">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Contact Us</h1>
        <p className="mt-3 text-sm text-neutral-600 max-w-lg mx-auto">
          Questions, feedback, or need help with an order? We are here to help.
        </p>
      </div>

      <div className="grid gap-8 lg:grid-cols-3">
        {/* Contact info */}
        <div className="space-y-4">
          {[
            { icon: Mail, label: 'Email', value: 'support@novashop.ca' },
            { icon: Phone, label: 'Phone', value: '1-800-555-NOVA' },
            { icon: MapPin, label: 'Location', value: 'Toronto, Ontario, Canada' },
          ].map((item) => (
            <div key={item.label} className="flex items-start gap-3 rounded-xl border border-neutral-200 p-4">
              <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary-50">
                <item.icon className="h-5 w-5 text-primary-600" />
              </div>
              <div>
                <p className="text-sm font-semibold text-neutral-900">{item.label}</p>
                <p className="text-sm text-neutral-600">{item.value}</p>
              </div>
            </div>
          ))}
        </div>

        {/* Contact form */}
        <div className="lg:col-span-2">
          <form onSubmit={handleSubmit} className="space-y-4 rounded-xl border border-neutral-200 p-6">
            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className="text-sm font-medium text-neutral-700">Name</label>
                <input type="text" required value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} className="input mt-1" />
              </div>
              <div>
                <label className="text-sm font-medium text-neutral-700">Email</label>
                <input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} className="input mt-1" />
              </div>
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">Subject</label>
              <input type="text" required value={form.subject} onChange={(e) => setForm({ ...form, subject: e.target.value })} className="input mt-1" />
            </div>
            <div>
              <label className="text-sm font-medium text-neutral-700">Message</label>
              <textarea required rows={5} value={form.message} onChange={(e) => setForm({ ...form, message: e.target.value })} className="input mt-1 resize-none" />
            </div>

            {status === 'success' && (
              <div className="flex items-center gap-2 rounded-lg bg-success-50 px-4 py-3 text-sm text-success-700">
                <CheckCircle className="h-4 w-4" /> Thank you! We will get back to you within 24 hours.
              </div>
            )}
            {status === 'error' && (
              <div className="flex items-center gap-2 rounded-lg bg-error-50 px-4 py-3 text-sm text-error-600">
                <AlertCircle className="h-4 w-4" /> Something went wrong. Please try again.
              </div>
            )}

            <button type="submit" disabled={status === 'loading'} className="btn-primary">
              {status === 'loading' ? <Loader2 className="h-4 w-4 animate-spin" /> : <><Send className="h-4 w-4" /> Send Message</>}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
