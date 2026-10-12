import { useState } from 'react';
import { ChevronDown } from 'lucide-react';

const faqs = [
  { q: 'How long does shipping take?', a: 'Orders typically ship within 1-3 business days. Standard delivery takes 3-7 business days across Canada. You will receive a tracking number once your order ships.' },
  { q: 'Do you offer free shipping?', a: 'Yes, we offer free shipping on all orders over $50 within Canada. Orders under $50 have a flat shipping rate of $5.' },
  { q: 'What is your return policy?', a: 'We offer a 30-day return policy on all products. Items must be in original condition with all packaging included. Return shipping costs are the responsibility of the customer unless the item is defective.' },
  { q: 'How do I track my order?', a: 'Once your order ships, you will receive an email with a tracking number. You can also view your order status in your account page.' },
  { q: 'Do you ship internationally?', a: 'Currently, we only ship within Canada. We are working on expanding to other regions and will announce international shipping when available.' },
  { q: 'What payment methods do you accept?', a: 'We accept all major credit cards through our secure payment processor, Stripe. Your payment information is encrypted and never stored on our servers.' },
  { q: 'Are the products covered by warranty?', a: 'Most products come with a manufacturer warranty. Please check individual product pages for specific warranty information.' },
  { q: 'Can I change or cancel my order?', a: 'Orders can be changed or cancelled within 2 hours of placing them. Please contact us immediately if you need to make changes.' },
];

export function FAQPage() {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <div className="text-center mb-10">
        <h1 className="text-3xl font-bold text-neutral-900 sm:text-4xl">Frequently Asked Questions</h1>
        <p className="mt-3 text-sm text-neutral-600">Everything you need to know about shopping with NovaShop</p>
      </div>

      <div className="space-y-3">
        {faqs.map((faq, i) => (
          <div key={i} className="rounded-xl border border-neutral-200 overflow-hidden">
            <button
              onClick={() => setOpenIndex(openIndex === i ? null : i)}
              className="flex w-full items-center justify-between p-4 text-left"
            >
              <span className="text-sm font-semibold text-neutral-900">{faq.q}</span>
              <ChevronDown className={`h-5 w-5 flex-shrink-0 text-neutral-400 transition-transform ${openIndex === i ? 'rotate-180' : ''}`} />
            </button>
            {openIndex === i && (
              <div className="px-4 pb-4 animate-slide-down">
                <p className="text-sm text-neutral-600">{faq.a}</p>
              </div>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
