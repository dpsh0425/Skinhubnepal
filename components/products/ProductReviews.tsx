'use client'

import { useState } from 'react'
import { Review } from '@/lib/types'
import { Star, CheckCircle, Edit, Trash2 } from 'lucide-react'
import { deleteDocument } from '@/lib/utils/firestore'
import { getAuthInstance } from '@/lib/firebase/config'
import toast from 'react-hot-toast'
import Image from 'next/image'
import { ReviewForm } from './ReviewForm'

interface ProductReviewsProps {
  productId: string
  reviews: Review[]
  averageRating: number
  totalReviews: number
  onReviewUpdate: () => void
}

export const ProductReviews = ({ 
  productId, 
  reviews, 
  averageRating, 
  totalReviews,
  onReviewUpdate 
}: ProductReviewsProps) => {
  const [editingReview, setEditingReview] = useState<Review | null>(null)
  const [showReviewForm, setShowReviewForm] = useState(false)
  const auth = getAuthInstance()
  const currentUser = auth?.currentUser || null
  const currentUserId = currentUser?.uid
  const currentUserName = currentUser?.displayName || currentUser?.email?.split('@')[0] || 'User'

  // Check if user has already reviewed
  const userReview = reviews.find(r => r.userId === currentUserId)

  // Calculate rating distribution
  const ratingDistribution = [5, 4, 3, 2, 1].map(rating => ({
    rating,
    count: reviews.filter(r => r.rating === rating).length,
    percentage: totalReviews > 0 ? (reviews.filter(r => r.rating === rating).length / totalReviews) * 100 : 0,
  }))

  const handleDelete = async (reviewId: string) => {
    if (!confirm('Are you sure you want to delete this review?')) return

    try {
      await deleteDocument('reviews', reviewId)
      toast.success('Review deleted successfully')
      onReviewUpdate()
    } catch (error) {
      toast.error('Failed to delete review')
    }
  }

  const handleEdit = (review: Review) => {
    setEditingReview(review)
    setShowReviewForm(true)
  }

  const handleFormSuccess = () => {
    setShowReviewForm(false)
    setEditingReview(null)
    onReviewUpdate()
  }

  const handleFormCancel = () => {
    setShowReviewForm(false)
    setEditingReview(null)
  }

  return (
    <div className="bg-white rounded-2xl p-6 md:p-8 shadow-sm border border-gray-100">
      <div className="mb-8">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-2xl font-bold text-gray-900">Customer Reviews</h2>
          {currentUser && !userReview && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-4 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Write a Review
            </button>
          )}
        </div>

        {/* Review Form */}
        {showReviewForm && currentUser && (
          <div className="mb-8">
            <ReviewForm
              productId={productId}
              userId={currentUserId!}
              userName={currentUserName}
              existingReview={editingReview}
              onSuccess={handleFormSuccess}
              onCancel={handleFormCancel}
            />
          </div>
        )}
        
        {/* Rating Summary */}
        <div className="grid md:grid-cols-2 gap-8 mb-8 pb-8 border-b border-gray-200">
          <div className="text-center md:text-left">
            <div className="text-5xl font-bold text-gray-900 mb-2">{averageRating.toFixed(1)}</div>
            <div className="flex items-center justify-center md:justify-start gap-1 mb-2">
              {[...Array(5)].map((_, i) => (
                <Star
                  key={i}
                  size={24}
                  className={i < Math.round(averageRating) ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                />
              ))}
            </div>
            <p className="text-gray-600">Based on {totalReviews} {totalReviews === 1 ? 'review' : 'reviews'}</p>
          </div>

          {/* Rating Distribution */}
          <div className="space-y-2">
            {ratingDistribution.map(({ rating, count, percentage }) => (
              <div key={rating} className="flex items-center gap-3">
                <div className="flex items-center gap-1 w-20">
                  <span className="text-sm font-medium text-gray-700">{rating}</span>
                  <Star size={14} className="fill-yellow-400 text-yellow-400" />
                </div>
                <div className="flex-1 bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-yellow-400 h-2 rounded-full transition-all"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
                <span className="text-sm text-gray-600 w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Reviews List */}
      {reviews.length > 0 ? (
        <div className="space-y-6">
          {reviews.map((review) => {
            const isOwner = review.userId === currentUserId
            return (
              <div key={review.id} className="border-b border-gray-100 pb-6 last:border-0 last:pb-0">
                <div className="flex items-start gap-4">
                  <div className="w-12 h-12 bg-gradient-to-br from-primary-400 to-pink-400 rounded-full flex items-center justify-center text-white font-bold text-lg flex-shrink-0">
                    {review.userName.charAt(0).toUpperCase()}
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between mb-2 flex-wrap gap-2">
                      <div className="flex items-center gap-3 flex-wrap">
                        <span className="font-semibold text-gray-900">{review.userName}</span>
                        <div className="flex items-center gap-1">
                          {[...Array(5)].map((_, i) => (
                            <Star
                              key={i}
                              size={16}
                              className={i < review.rating ? 'fill-yellow-400 text-yellow-400' : 'text-gray-300'}
                            />
                          ))}
                        </div>
                        {review.verified && (
                          <span className="flex items-center gap-1 text-xs text-green-600 font-medium">
                            <CheckCircle size={14} />
                            Verified Purchase
                          </span>
                        )}
                      </div>
                      {isOwner && (
                        <div className="flex items-center gap-2">
                          <button
                            onClick={() => handleEdit(review)}
                            className="p-1.5 text-primary-600 hover:bg-primary-50 rounded transition-colors"
                            title="Edit review"
                          >
                            <Edit size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(review.id)}
                            className="p-1.5 text-red-600 hover:bg-red-50 rounded transition-colors"
                            title="Delete review"
                          >
                            <Trash2 size={16} />
                          </button>
                        </div>
                      )}
                    </div>
                    <p className="text-gray-700 leading-relaxed mb-3">{review.comment}</p>
                    
                    {/* Review Photos */}
                    {review.photos && review.photos.length > 0 && (
                      <div className="grid grid-cols-4 gap-2 mb-3">
                        {review.photos.map((photoUrl, index) => (
                          <div key={index} className="relative aspect-square rounded-lg overflow-hidden border border-gray-200">
                            <Image
                              src={photoUrl}
                              alt={`Review photo ${index + 1}`}
                              fill
                              sizes="(max-width: 768px) 25vw, (max-width: 1200px) 12.5vw, 8vw"
                              className="object-cover"
                            />
                          </div>
                        ))}
                      </div>
                    )}

                    {(review.createdAt || review.updatedAt) && (
                      <p className="text-xs text-gray-500">
                        {(() => {
                          const createdAt = review.createdAt instanceof Date 
                            ? review.createdAt 
                            : review.createdAt 
                              ? new Date(review.createdAt as any) 
                              : null
                          const updatedAt = review.updatedAt instanceof Date 
                            ? review.updatedAt 
                            : review.updatedAt 
                              ? new Date(review.updatedAt as any) 
                              : null
                          
                          if (!createdAt && !updatedAt) return null
                          
                          const displayDate = updatedAt && createdAt && updatedAt.getTime() !== createdAt.getTime() 
                            ? updatedAt 
                            : createdAt
                          
                          if (!displayDate || isNaN(displayDate.getTime())) return null
                          
                          return (
                            <>
                              {updatedAt && createdAt && updatedAt.getTime() !== createdAt.getTime() ? 'Updated ' : ''}
                              {displayDate.toLocaleDateString('en-US', {
                                year: 'numeric',
                                month: 'long',
                                day: 'numeric',
                              })}
                            </>
                          )
                        })()}
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )
          })}
        </div>
      ) : (
        <div className="text-center py-12">
          <p className="text-gray-500 mb-4">
            {currentUser 
              ? "No reviews yet. Be the first to review this product!" 
              : "No reviews yet. Sign in to write a review!"}
          </p>
          {currentUser && !showReviewForm && (
            <button
              onClick={() => setShowReviewForm(true)}
              className="px-6 py-2 bg-primary-600 text-white rounded-lg hover:bg-primary-700 transition-colors font-medium"
            >
              Write First Review
            </button>
          )}
        </div>
      )}
    </div>
  )
}

