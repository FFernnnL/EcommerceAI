import { Truck, Shield, Headphones, RotateCcw } from 'lucide-react';

const features = [
  {
    icon: Truck,
    title: 'Free Global Shipping',
    description: 'Free standard shipping on all orders over $50. Express delivery available worldwide.',
  },
  {
    icon: Shield,
    title: '2-Year Warranty',
    description: 'All products come with a comprehensive 2-year manufacturer warranty.',
  },
  {
    icon: Headphones,
    title: '24/7 AI Support',
    description: 'Our AI assistant Nova is always available to help with your questions and orders.',
  },
  {
    icon: RotateCcw,
    title: '30-Day Returns',
    description: 'Not satisfied? Return any product within 30 days for a full refund.',
  },
];

export default function WhyChooseUs() {
  return (
    <section className="bg-gray-50 py-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12">
          <h2 className="text-3xl font-bold text-gray-900 mb-4">Why Choose TechStore</h2>
          <p className="text-gray-600 max-w-2xl mx-auto">
            We&apos;re committed to providing the best shopping experience with premium products and exceptional service.
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          {features.map((feature) => (
            <div
              key={feature.title}
              className="bg-white rounded-xl p-6 text-center shadow-sm hover:shadow-md transition-shadow"
            >
              <div className="inline-flex items-center justify-center w-12 h-12 bg-blue-100 text-blue-600 rounded-lg mb-4">
                <feature.icon className="h-6 w-6" />
              </div>
              <h3 className="text-lg font-semibold text-gray-900 mb-2">{feature.title}</h3>
              <p className="text-sm text-gray-600">{feature.description}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
