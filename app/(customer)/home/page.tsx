import { Header } from '@/components/layout/Header'
import { BottomNav } from '@/components/layout/BottomNav'
import { StickyCart } from '@/components/layout/StickyCart'
import { HeroBanner } from '@/components/home/HeroBanner'
import { FeaturedProducts } from '@/components/home/FeaturedProducts'
import { BestSellers } from '@/components/home/BestSellers'
import { SkinTypeCollections } from '@/components/home/SkinTypeCollections'
import { Testimonials } from '@/components/home/Testimonials'
import { WhyChooseUs } from '@/components/home/WhyChooseUs'

export const dynamic = 'force-dynamic'

export default function HomePage() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-white to-gray-50">
      <Header />
      <main className="container mx-auto px-4 py-6 pb-24">
        <HeroBanner />
        
        {/* Trust Badges */}
        <div className="mb-12 flex flex-wrap items-center justify-center gap-8 md:gap-12 py-6 border-y border-gray-200">
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-1">10,000+</div>
            <div className="text-sm text-gray-600">Happy Customers</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-1">500+</div>
            <div className="text-sm text-gray-600">Products</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-1">4.8★</div>
            <div className="text-sm text-gray-600">Average Rating</div>
          </div>
          <div className="text-center">
            <div className="text-3xl font-bold text-primary-600 mb-1">24/7</div>
            <div className="text-sm text-gray-600">Support</div>
          </div>
        </div>

        <FeaturedProducts />
        <BestSellers />
        <SkinTypeCollections />
        <WhyChooseUs />
        <Testimonials />
        
        {/* Newsletter Section */}
        <section className="mb-16 relative overflow-hidden">
          <div className="bg-gradient-to-br from-primary-600 via-blue-600 to-indigo-600 rounded-3xl p-8 md:p-12 text-white text-center relative">
            <div className="absolute inset-0 opacity-10" style={{
              backgroundImage: `url("data:image/svg+xml,%3Csvg width='60' height='60' viewBox='0 0 60 60' xmlns='http://www.w3.org/2000/svg'%3E%3Cg fill='none' fill-rule='evenodd'%3E%3Cg fill='%23ffffff' fill-opacity='0.4'%3E%3Cpath d='M36 34v-4h-2v4h-4v2h4v4h2v-4h4v-2h-4zm0-30V0h-2v4h-4v2h4v4h2V6h4V4h-4zM6 34v-4H4v4H0v2h4v4h2v-4h4v-2H6zM6 4V0H4v4H0v2h4v4h2V6h4V4H6z'/%3E%3C/g%3E%3C/g%3E%3C/svg%3E")`,
            }} />
            <div className="relative z-10">
              <h2 className="text-3xl md:text-4xl font-bold mb-3">
                Stay Updated with Skincare Tips
              </h2>
              <p className="text-lg md:text-xl mb-6 opacity-95 max-w-2xl mx-auto">
                Join our newsletter and get expert skincare advice, exclusive discounts, and early access to new products delivered to your inbox.
              </p>
              <div className="flex flex-col sm:flex-row gap-4 max-w-md mx-auto">
                <input
                  type="email"
                  placeholder="Enter your email address"
                  className="flex-1 px-5 py-3.5 rounded-xl text-gray-900 focus:outline-none focus:ring-2 focus:ring-white placeholder-gray-400"
                />
                <button className="px-8 py-3.5 bg-white text-primary-600 rounded-xl font-semibold hover:bg-gray-100 transition-colors shadow-lg hover:shadow-xl">
                  Subscribe
                </button>
              </div>
              <p className="text-sm opacity-75 mt-4">
                We respect your privacy. Unsubscribe at any time.
              </p>
            </div>
          </div>
        </section>
      </main>
      <StickyCart />
      <BottomNav />
    </div>
  )
}
