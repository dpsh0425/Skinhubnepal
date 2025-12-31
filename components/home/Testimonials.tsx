'use client'

import { Star, Quote } from 'lucide-react'
import Image from 'next/image'

const testimonials = [
  {
    id: 1,
    name: 'Priya Shrestha',
    location: 'Kathmandu',
    rating: 5,
    comment: 'I\'ve been using SkinHub for 6 months now and my skin has never looked better! The products are authentic and the delivery is always on time.',
    image: '👩‍🦰',
  },
  {
    id: 2,
    name: 'Suman Thapa',
    location: 'Pokhara',
    rating: 5,
    comment: 'Great selection of Korean skincare products. The customer service team helped me find the perfect routine for my oily skin. Highly recommend!',
    image: '👨',
  },
  {
    id: 3,
    name: 'Anita Gurung',
    location: 'Lalitpur',
    rating: 5,
    comment: 'Finally found a place in Nepal that sells genuine skincare products. The prices are reasonable and the quality is amazing. My skin is glowing!',
    image: '👩',
  },
  {
    id: 4,
    name: 'Rajesh Maharjan',
    location: 'Bhaktapur',
    rating: 5,
    comment: 'Best skincare store in Nepal! Fast delivery, authentic products, and excellent customer support. I\'m a loyal customer now.',
    image: '👨‍🦱',
  },
]

export const Testimonials = () => {
  return (
    <section className="mb-16">
      <div className="text-center mb-10">
        <h2 className="text-3xl md:text-4xl font-bold mb-3">
          <span className="bg-gradient-to-r from-primary-600 to-pink-600 bg-clip-text text-transparent">
            Loved by Thousands
          </span>
        </h2>
        <p className="text-gray-600 text-lg max-w-2xl mx-auto">
          Join over 10,000+ happy customers who trust SkinHub for their skincare journey
        </p>
      </div>

      <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
        {testimonials.map((testimonial, index) => (
          <div
            key={testimonial.id}
            className="bg-white rounded-2xl p-6 shadow-lg hover:shadow-xl transition-all duration-300 transform hover:-translate-y-1 border border-gray-100"
            style={{ animationDelay: `${index * 100}ms` }}
          >
            <div className="flex items-center gap-1 mb-4">
              {[...Array(testimonial.rating)].map((_, i) => (
                <Star
                  key={i}
                  size={16}
                  className="fill-yellow-400 text-yellow-400"
                />
              ))}
            </div>
            <Quote className="text-primary-200 mb-3" size={24} />
            <p className="text-gray-700 mb-4 text-sm leading-relaxed italic">
              "{testimonial.comment}"
            </p>
            <div className="flex items-center gap-3 pt-4 border-t border-gray-100">
              <div className="w-10 h-10 bg-gradient-to-br from-primary-400 to-pink-400 rounded-full flex items-center justify-center text-xl">
                {testimonial.image}
              </div>
              <div>
                <p className="font-semibold text-gray-900 text-sm">{testimonial.name}</p>
                <p className="text-xs text-gray-500">{testimonial.location}</p>
              </div>
            </div>
          </div>
        ))}
      </div>
    </section>
  )
}

