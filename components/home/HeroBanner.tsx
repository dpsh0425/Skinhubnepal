'use client'

import { useEffect, useState } from 'react'
import { getCollection } from '@/lib/utils/firestore'
import { Banner } from '@/lib/types'
import Image from 'next/image'
import { ChevronLeft, ChevronRight, ArrowRight } from 'lucide-react'
import Link from 'next/link'
import { Button } from '@/components/ui/Button'

export const HeroBanner = () => {
  const [banners, setBanners] = useState<Banner[]>([])
  const [currentIndex, setCurrentIndex] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const fetchBanners = async () => {
      try {
        const data = await getCollection<Banner>('banners')
        // Filter active banners and sort by order
        const activeBanners = data
          .filter(b => b.active === true)
          .sort((a, b) => (a.order || 0) - (b.order || 0))
        setBanners(activeBanners)
      } catch (error) {
        console.error('Error fetching banners:', error)
        setBanners([])
      } finally {
        setIsLoading(false)
      }
    }
    fetchBanners()
  }, [])

  // Auto-rotate banners if more than one
  useEffect(() => {
    if (banners.length <= 1) return

    const interval = setInterval(() => {
      setCurrentIndex((prev) => (prev + 1) % banners.length)
    }, 6000) // Change banner every 6 seconds

    return () => clearInterval(interval)
  }, [banners.length])

  // Show default banner if no banners or loading
  if (isLoading) {
    return (
      <div className="relative w-full h-80 md:h-[550px] rounded-3xl overflow-hidden mb-12 bg-gradient-to-br from-primary-500 via-blue-500 to-indigo-600 flex items-center animate-pulse">
        <div className="absolute inset-0 bg-gradient-to-r from-black/20 to-transparent" />
        <div className="relative z-10 container mx-auto px-8 text-center text-white">
          <div className="h-12 bg-white/20 rounded-lg w-3/4 mx-auto mb-4" />
          <div className="h-6 bg-white/20 rounded-lg w-1/2 mx-auto" />
        </div>
      </div>
    )
  }

  if (banners.length === 0) {
    return (
      <div className="relative w-full h-80 md:h-[550px] rounded-3xl overflow-hidden mb-12 bg-gradient-to-br from-primary-500 via-blue-500 to-indigo-600 flex items-center">
        <div className="absolute inset-0 bg-gradient-to-r from-black/30 to-transparent" />
        <div className="relative z-10 container mx-auto px-8 text-center text-white">
          <h1 className="text-4xl md:text-6xl font-bold mb-4 leading-tight">
            Your Journey to
            <br />
            <span className="text-yellow-200">Beautiful Skin</span> Starts Here
          </h1>
          <p className="text-xl md:text-2xl mb-8 opacity-95 max-w-2xl mx-auto">
            Discover authentic skincare products, expert advice, and personalized routines for every skin type
          </p>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/products">
              <Button className="bg-white text-primary-600 hover:bg-gray-100 px-8 py-4 text-lg font-semibold shadow-xl">
                Shop Now
                <ArrowRight className="ml-2" size={20} />
              </Button>
            </Link>
            <Link href="/products?skinType=oily">
              <Button variant="outline" className="border-2 border-white text-white hover:bg-white/10 px-8 py-4 text-lg font-semibold">
                Find Your Routine
              </Button>
            </Link>
          </div>
        </div>
        <div className="absolute bottom-0 left-0 right-0 h-32 bg-gradient-to-t from-white to-transparent" />
      </div>
    )
  }

  const currentBanner = banners[currentIndex]

  return (
    <div className="relative w-full h-80 md:h-[550px] rounded-3xl overflow-hidden mb-12 shadow-2xl">
      {banners.map((banner, index) => (
        <div
          key={banner.id}
          className={`absolute inset-0 transition-all duration-1000 ease-in-out ${
            index === currentIndex 
              ? 'opacity-100 scale-100 z-10' 
              : 'opacity-0 scale-105 z-0'
          }`}
        >
          {banner.link ? (
            <Link href={banner.link} className="block h-full">
              <Image
                src={banner.image}
                alt={banner.title || `Banner ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              {banner.title && (
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4 md:px-8 text-white">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-3xl leading-tight">
                      {banner.title}
                    </h2>
                    <Link href={banner.link}>
                      <Button className="bg-white text-primary-600 hover:bg-gray-100 px-6 md:px-8 py-3 md:py-4 text-base md:text-lg font-semibold shadow-xl">
                        Shop Now
                        <ArrowRight className="ml-2" size={20} />
                      </Button>
                    </Link>
                  </div>
                </div>
              )}
            </Link>
          ) : (
            <>
              <Image
                src={banner.image}
                alt={banner.title || `Banner ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
                sizes="100vw"
              />
              <div className="absolute inset-0 bg-gradient-to-r from-black/60 via-black/30 to-transparent" />
              {banner.title && (
                <div className="absolute inset-0 flex items-center">
                  <div className="container mx-auto px-4 md:px-8 text-white">
                    <h2 className="text-3xl md:text-5xl lg:text-6xl font-bold mb-4 max-w-3xl leading-tight">
                      {banner.title}
                    </h2>
                  </div>
                </div>
              )}
            </>
          )}
        </div>
      ))}

      {/* Navigation controls - only show if more than 1 banner */}
      {banners.length > 1 && (
        <>
          <button
            onClick={() =>
              setCurrentIndex((prev) => (prev - 1 + banners.length) % banners.length)
            }
            className="absolute left-2 md:left-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-xl transition-all hover:scale-110 z-20"
            aria-label="Previous banner"
          >
            <ChevronLeft size={20} className="md:w-6 md:h-6 text-gray-800" />
          </button>
          <button
            onClick={() => setCurrentIndex((prev) => (prev + 1) % banners.length)}
            className="absolute right-2 md:right-4 top-1/2 -translate-y-1/2 bg-white/90 hover:bg-white rounded-full p-2 md:p-3 shadow-xl transition-all hover:scale-110 z-20"
            aria-label="Next banner"
          >
            <ChevronRight size={20} className="md:w-6 md:h-6 text-gray-800" />
          </button>

          {/* Indicator dots */}
          <div className="absolute bottom-4 md:bottom-6 left-1/2 -translate-x-1/2 flex gap-2 z-20">
            {banners.map((_, index) => (
              <button
                key={index}
                onClick={() => setCurrentIndex(index)}
                className={`rounded-full transition-all duration-300 ${
                  index === currentIndex 
                    ? 'w-8 h-2 bg-white shadow-lg' 
                    : 'w-2 h-2 bg-white/50 hover:bg-white/75'
                }`}
                aria-label={`Go to slide ${index + 1}`}
              />
            ))}
          </div>

          {/* Banner counter */}
          <div className="absolute top-4 right-4 bg-black/40 backdrop-blur-sm text-white text-xs px-3 py-1.5 rounded-full z-20">
            {currentIndex + 1} / {banners.length}
          </div>
        </>
      )}
    </div>
  )
}
