'use client'

import { Shield, Truck, Heart, Award, Clock, Headphones } from 'lucide-react'

const features = [
  {
    icon: Shield,
    title: '100% Authentic Products',
    description: 'We guarantee genuine products sourced directly from authorized distributors. Your trust is our priority.',
    color: 'from-blue-500 to-cyan-500',
  },
  {
    icon: Truck,
    title: 'Fast & Free Delivery',
    description: 'Free delivery across Nepal. Orders placed before 2 PM are delivered the next day in major cities.',
    color: 'from-green-500 to-emerald-500',
  },
  {
    icon: Heart,
    title: 'Expert Skincare Advice',
    description: 'Our team of skincare enthusiasts is here to help you find the perfect products for your skin type.',
    color: 'from-pink-500 to-rose-500',
  },
  {
    icon: Award,
    title: 'Best Prices Guaranteed',
    description: 'We offer competitive prices and regular discounts. Find a lower price? We\'ll match it!',
    color: 'from-yellow-500 to-orange-500',
  },
  {
    icon: Clock,
    title: 'Easy Returns',
    description: 'Not satisfied? Return unused products within 7 days for a full refund. No questions asked.',
    color: 'from-purple-500 to-indigo-500',
  },
  {
    icon: Headphones,
    title: '24/7 Customer Support',
    description: 'Have questions? Our friendly support team is available round the clock to assist you.',
    color: 'from-primary-500 to-blue-500',
  },
]

export const WhyChooseUs = () => {
  return (
    <section className="mb-16">
      <div className="text-center mb-12">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-primary-600 to-blue-600 bg-clip-text text-transparent">
            Why Choose SkinHub?
          </span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          We're not just another skincare store. We're your trusted partner in your journey to healthy, glowing skin.
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
        {features.map((feature, index) => {
          const Icon = feature.icon
          return (
            <div
              key={index}
              className="group bg-white rounded-2xl p-6 shadow-md hover:shadow-xl transition-all duration-300 border border-gray-100 hover:border-primary-200"
            >
              <div className={`w-14 h-14 bg-gradient-to-br ${feature.color} rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform shadow-lg`}>
                <Icon className="text-white" size={28} />
              </div>
              <h3 className="font-bold text-lg mb-2 text-gray-900">{feature.title}</h3>
              <p className="text-gray-600 text-sm leading-relaxed">{feature.description}</p>
            </div>
          )
        })}
      </div>
    </section>
  )
}
