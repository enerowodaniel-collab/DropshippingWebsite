import { Link } from 'react-router-dom';
import { Zap, ShieldCheck, Truck, RefreshCw, Headphones, Sparkles } from 'lucide-react';

export function AboutPage() {
  return (
    <div>
      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-3xl px-4 text-center sm:px-6">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary-600">
            <Zap className="h-6 w-6 text-white" fill="currentColor" />
          </div>
          <h1 className="mt-4 text-3xl font-bold text-neutral-900 sm:text-4xl">About NovaShop</h1>
          <p className="mt-4 text-lg text-neutral-600">
            We believe great products should be accessible, reliable, and genuinely useful.
            NovaShop curates everyday gadgets and lifestyle accessories that make a real difference
            in your daily routine.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-7xl px-4 py-16 sm:px-6">
        <div className="grid gap-8 lg:grid-cols-2 lg:items-center">
          <div>
            <h2 className="text-2xl font-bold text-neutral-900">Our Mission</h2>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
              NovaShop was founded with a simple goal: to make premium tech accessories accessible
              to everyone. We partner with trusted suppliers to bring you carefully selected products
              at fair prices, without compromising on quality or service.
            </p>
            <p className="mt-3 text-sm text-neutral-600 leading-relaxed">
              Every product in our catalog goes through a vetting process. We evaluate quality,
              value, and real-world utility before listing anything. If we would not use it ourselves,
              we do not sell it.
            </p>
          </div>
          <div className="overflow-hidden rounded-2xl">
            <img
              src="https://images.pexels.com/photos/3184451/pexels-photo-3184451.jpeg?auto=compress&cs=tinysrgb&h=650&w=940"
              alt="Tech products"
              className="h-full w-full object-cover"
            />
          </div>
        </div>
      </section>

      <section className="bg-neutral-50 py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6">
          <h2 className="text-center text-2xl font-bold text-neutral-900">Our Values</h2>
          <div className="mt-10 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { icon: ShieldCheck, title: 'Quality First', desc: 'We vet every product before it reaches our store.' },
              { icon: Truck, title: 'Reliable Shipping', desc: 'Fast, tracked shipping across Canada with care.' },
              { icon: RefreshCw, title: 'Support & Warranty', desc: 'Contact our team for warranty claims and product issues.' },
              { icon: Headphones, title: 'Real Support', desc: 'A dedicated team ready to help when you need it.' },
            ].map((v) => (
              <div key={v.title} className="rounded-xl bg-white p-6 text-center border border-neutral-200">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-lg bg-primary-50">
                  <v.icon className="h-6 w-6 text-primary-600" />
                </div>
                <h3 className="mt-4 text-sm font-semibold text-neutral-900">{v.title}</h3>
                <p className="mt-1 text-xs text-neutral-600">{v.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="mx-auto max-w-3xl px-4 py-16 text-center sm:px-6">
        <Sparkles className="mx-auto h-8 w-8 text-accent-500" />
        <h2 className="mt-4 text-2xl font-bold text-neutral-900">Ready to explore?</h2>
        <p className="mt-2 text-sm text-neutral-600">Browse our curated collection of premium gadgets.</p>
        <Link to="/shop" className="mt-6 inline-block btn-primary">Shop Now</Link>
      </section>
    </div>
  );
}
