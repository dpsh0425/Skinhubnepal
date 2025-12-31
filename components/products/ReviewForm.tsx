'use client'

import { useState } from 'react'
import { Review } from '@/lib/types'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Star, X, Camera, Loader2 } from 'lucide-react'
import { uploadMultipleImages } from '@/lib/utils/imgbb'
import { setDocument, updateDocument } from '@/lib/utils/firestore'
import { Timestamp } from 'firebase/firestore'
import toast from 'react-hot-toast'
import Image from 'next/image'

interface ReviewFormProps {
  productId: string
  userId: string
  userName: string
  existingReview?: Review | null
  onSuccess: () => void
  onCancel: () => void
}

export const ReviewForm = ({
  productId,
  userId,
  userName,
  existingReview,
  onSuccess,
  onCancel,
}: ReviewFormProps) => {
  const [rating, setRating] = useState(existingReview?.rating || 0)
  const [hoveredRating, setHoveredRating] = useState(0)
  const [comment, setComment] = useState(existingReview?.comment || '')
  const [photos, setPhotos] = useState<File[]>([])
  const [existingPhotos, setExistingPhotos] = useState<string[]>(existingReview?.photos || [])
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handlePhotoSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || [])
    if (photos.length + files.length > 5) {
      toast.error('Maximum 5 photos allowed')
      return
    }
    setPhotos([...photos, ...files])
  }

  const removePhoto = (index: number) => {
    setPhotos(photos.filter((_, i) => i !== index))
  }

  const removeExistingPhoto = (photoUrl: string) => {
    setExistingPhotos(existingPhotos.filter(url => url !== photoUrl))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    
    if (rating === 0) {
      toast.error('Please select a rating')
      return
    }
    
    if (!comment.trim()) {
      toast.error('Please write a review comment')
      return
    }

    setIsSubmitting(true)

    try {
      let photoUrls = [...existingPhotos]

      // Upload new photos
      if (photos.length > 0) {
        const uploadedUrls = await uploadMultipleImages(photos)
        photoUrls = [...photoUrls, ...uploadedUrls]
      }

      const reviewData = {
        productId,
        userId,
        userName,
        rating,
        comment: comment.trim(),
        photos: photoUrls.length > 0 ? photoUrls : undefined,
        verified: false, // Can be set based on order history
        updatedAt: Timestamp.now(),
      }

      if (existingReview) {
        // Update existing review
        await updateDocument('reviews', existingReview.id, reviewData)
        toast.success('Review updated successfully!')
      } else {
        // Create new review
        const reviewId = `REV-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`
        await setDocument('reviews', reviewId, {
          ...reviewData,
          createdAt: Timestamp.now(),
        })
        toast.success('Review submitted successfully!')
      }

      // Update product rating (will be handled by a function or on the product page)
      onSuccess()
    } catch (error) {
      toast.error('Failed to submit review')
      console.error(error)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="bg-white rounded-2xl p-6 shadow-sm border border-gray-100">
      <h3 className="text-xl font-bold mb-4">
        {existingReview ? 'Edit Your Review' : 'Write a Review'}
      </h3>

      {/* Rating Selection */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Rating *
        </label>
        <div className="flex items-center gap-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoveredRating(star)}
              onMouseLeave={() => setHoveredRating(0)}
              className="transition-transform hover:scale-110"
            >
              <Star
                size={32}
                className={
                  star <= (hoveredRating || rating)
                    ? 'fill-yellow-400 text-yellow-400'
                    : 'text-gray-300'
                }
              />
            </button>
          ))}
          {rating > 0 && (
            <span className="ml-2 text-sm text-gray-600">
              {rating === 5 ? 'Excellent' : rating === 4 ? 'Good' : rating === 3 ? 'Average' : rating === 2 ? 'Poor' : 'Very Poor'}
            </span>
          )}
        </div>
      </div>

      {/* Comment */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Your Review *
        </label>
        <textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          className="w-full px-4 py-3 border rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500"
          rows={5}
          placeholder="Share your experience with this product..."
          required
        />
      </div>

      {/* Photo Upload */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Photos (Optional - Max 5)
        </label>
        
        {/* Existing Photos */}
        {existingPhotos.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-3">
            {existingPhotos.map((photoUrl, index) => (
              <div key={index} className="relative group aspect-square">
                <Image
                  src={photoUrl}
                  alt={`Review photo ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 20vw, 10vw"
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removeExistingPhoto(photoUrl)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {/* New Photos Preview */}
        {photos.length > 0 && (
          <div className="grid grid-cols-5 gap-2 mb-3">
            {photos.map((photo, index) => (
              <div key={index} className="relative group aspect-square">
                <Image
                  src={URL.createObjectURL(photo)}
                  alt={`New photo ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 20vw, 10vw"
                  className="object-cover rounded-lg"
                />
                <button
                  type="button"
                  onClick={() => removePhoto(index)}
                  className="absolute top-1 right-1 bg-red-500 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity z-10"
                >
                  <X size={14} />
                </button>
              </div>
            ))}
          </div>
        )}

        {photos.length + existingPhotos.length < 5 && (
          <label className="inline-flex items-center gap-2 px-4 py-2 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-primary-500 transition-colors">
            <Camera size={20} className="text-gray-400" />
            <span className="text-sm text-gray-600">Add Photos</span>
            <input
              type="file"
              accept="image/*"
              multiple
              onChange={handlePhotoSelect}
              className="hidden"
            />
          </label>
        )}
        <p className="text-xs text-gray-500 mt-1">
          {photos.length + existingPhotos.length} / 5 photos
        </p>
      </div>

      {/* Actions */}
      <div className="flex gap-3">
        <Button type="submit" isLoading={isSubmitting} disabled={isSubmitting}>
          {isSubmitting ? (
            <>
              <Loader2 size={16} className="mr-2 animate-spin" />
              Submitting...
            </>
          ) : existingReview ? (
            'Update Review'
          ) : (
            'Submit Review'
          )}
        </Button>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancel
        </Button>
      </div>
    </form>
  )
}

