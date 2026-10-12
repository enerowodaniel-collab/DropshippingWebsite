import { useParams, Link } from 'react-router-dom';
import { ChevronRight } from 'lucide-react';

const legalContent: Record<string, { title: string; lastUpdated: string; sections: { heading: string; body: string }[] }> = {
  privacy: {
    title: 'Privacy Policy',
    lastUpdated: 'October 2026',
    sections: [
      { heading: 'Information We Collect', body: 'We collect information you provide directly to us, such as your name, email address, shipping address, and payment information when you place an order. We also automatically collect certain information about your device and browsing activity.' },
      { heading: 'How We Use Your Information', body: 'We use your information to process orders, communicate with you about your purchases, provide customer support, send marketing communications (with your consent), and improve our products and services.' },
      { heading: 'Information Sharing', body: 'We do not sell your personal information. We share information with trusted third parties who help us operate our business, such as payment processors and shipping carriers. These parties are bound by confidentiality obligations.' },
      { heading: 'Data Security', body: 'We implement reasonable security measures to protect your personal information, including encryption, access controls, and regular security assessments. However, no method of transmission over the internet is completely secure.' },
      { heading: 'Your Rights', body: 'You have the right to access, correct, or delete your personal information. You can unsubscribe from marketing communications at any time. Contact us at support@novashop.ca to exercise these rights.' },
      { heading: 'Cookies', body: 'We use cookies and similar technologies to enhance your browsing experience, remember your preferences, and analyze site traffic. You can control cookies through your browser settings.' },
    ],
  },
  terms: {
    title: 'Terms of Service',
    lastUpdated: 'October 2026',
    sections: [
      { heading: 'Acceptance of Terms', body: 'By accessing and using NovaShop, you accept and agree to be bound by these Terms of Service. If you do not agree, please do not use our service.' },
      { heading: 'Products and Pricing', body: 'We strive to display accurate product information and pricing. However, errors may occur. We reserve the right to correct errors and update pricing without notice. All prices are in Canadian dollars (CAD).' },
      { heading: 'Orders', body: 'Placing an order constitutes an offer to purchase. We reserve the right to accept or decline orders. Order confirmation does not guarantee availability. We will notify you if an order cannot be fulfilled.' },
      { heading: 'Payment', body: 'Payment is processed securely through our payment provider. We do not store credit card information. You authorize us to charge the selected payment method for the full order amount.' },
      { heading: 'Shipping and Delivery', body: 'Shipping times are estimates and not guaranteed. We are not responsible for delays caused by carriers or circumstances beyond our control. Risk of loss passes to you upon delivery.' },
      { heading: 'Limitation of Liability', body: 'NovaShop shall not be liable for any indirect, incidental, or consequential damages. Our total liability shall not exceed the amount you paid for the product in question.' },
    ],
  },
  shipping: {
    title: 'Shipping Policy',
    lastUpdated: 'October 2026',
    sections: [
      { heading: 'Shipping Destinations', body: 'We currently ship to all provinces and territories within Canada. International shipping is not available at this time.' },
      { heading: 'Processing Time', body: 'Orders are processed within 1-3 business days. Processing time does not include weekends or holidays. Orders placed on weekends or holidays will be processed on the next business day.' },
      { heading: 'Shipping Rates', body: 'Free standard shipping is available on orders over $50 CAD. Orders under $50 have a flat shipping rate of $5 CAD. Express shipping options may be available at checkout for an additional fee.' },
      { heading: 'Delivery Times', body: 'Standard shipping typically takes 3-7 business days after processing. Remote areas may require additional time. You will receive a tracking number by email once your order ships.' },
      { heading: 'Order Tracking', body: 'Once your order ships, you will receive an email with tracking information. You can track your package through the carrier website. You can also view order status in your account.' },
      { heading: 'Shipping Issues', body: 'If your package is lost, damaged, or delayed, please contact us at support@novashop.ca. We will work with the carrier to resolve the issue as quickly as possible.' },
    ],
  },
  returns: {
    title: 'Refund and Return Policy',
    lastUpdated: 'October 2026',
    sections: [
      { heading: 'Return Period', body: 'You may return any item within 30 days of delivery for a full refund. Items must be in their original condition with all packaging and accessories included.' },
      { heading: 'How to Initiate a Return', body: 'To start a return, contact us at support@novashop.ca with your order number and the reason for return. We will provide return instructions and a return authorization.' },
      { heading: 'Refund Processing', body: 'Refunds are processed within 5 business days of receiving the returned item. The refund will be credited to your original payment method. Processing time may vary depending on your bank.' },
      { heading: 'Return Shipping Costs', body: 'Return shipping costs are the responsibility of the customer, unless the item is defective or we shipped the wrong product. In such cases, we will provide a prepaid return label.' },
      { heading: 'Non-Returnable Items', body: 'Certain items cannot be returned for hygiene or safety reasons. This includes opened earbuds with ear tips and items that have been personally used or modified.' },
      { heading: 'Exchanges', body: 'We do not offer direct exchanges. To exchange an item, please return the original item for a refund and place a new order for the desired product.' },
    ],
  },
};

export function LegalPage() {
  const { type } = useParams();
  const content = legalContent[type || ''];

  if (!content) {
    return (
      <div className="mx-auto max-w-7xl px-4 py-16 text-center">
        <p className="text-lg font-semibold text-neutral-900">Page not found</p>
        <Link to="/" className="mt-4 inline-block text-sm font-medium text-primary-600">Back home</Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <nav className="flex items-center gap-1 text-xs text-neutral-500 mb-6">
        <Link to="/" className="hover:text-neutral-900">Home</Link>
        <ChevronRight className="h-3 w-3" />
        <span className="text-neutral-900">{content.title}</span>
      </nav>

      <div className="rounded-xl border border-warning-200 bg-warning-50 px-4 py-3 mb-8">
        <p className="text-xs text-warning-700">
          This is a template document provided for reference. It must be reviewed by a qualified
          legal professional before use. NovaShop is not responsible for the legal adequacy of this
          template.
        </p>
      </div>

      <h1 className="text-3xl font-bold text-neutral-900">{content.title}</h1>
      <p className="mt-2 text-sm text-neutral-500">Last updated: {content.lastUpdated}</p>

      <div className="mt-8 space-y-6">
        {content.sections.map((section, i) => (
          <div key={i}>
            <h2 className="text-lg font-semibold text-neutral-900">{section.heading}</h2>
            <p className="mt-2 text-sm text-neutral-600 leading-relaxed">{section.body}</p>
          </div>
        ))}
      </div>
    </div>
  );
}
