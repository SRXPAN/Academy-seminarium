import React, { useState } from 'react'
import { createPortal } from 'react-dom'
import { Star, X, Loader2 } from 'lucide-react'
import { apiPost } from '@/lib/http'
import { cn } from '@/utils/colors'

interface ReviewModalProps {
  isOpen: boolean
  onClose: () => void
  courseId: string
  courseTitle: string
}

export default function ReviewModal({ isOpen, onClose, courseId, courseTitle }: ReviewModalProps) {
  const [rating, setRating] = useState(0)
  const [hoverRating, setHoverRating] = useState(0)
  const [comment, setComment] = useState('')
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [success, setSuccess] = useState(false)

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    if (rating === 0) {
      setError('Please select a rating')
      return
    }

    try {
      setLoading(true)
      setError(null)
      await apiPost('/reviews', { courseId, rating, comment })
      setSuccess(true)
      setTimeout(() => {
        onClose()
        // Reset state after closing
        setRating(0)
        setComment('')
        setSuccess(false)
      }, 2000)
    } catch (err: any) {
      setError(err.message || 'Failed to submit review')
    } finally {
      setLoading(false)
    }
  }

  if (!isOpen) return null

  return createPortal(
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 sm:p-6">
      <div className="absolute inset-0 bg-neutral-900/50 backdrop-blur-sm animate-in fade-in duration-200" onClick={onClose} />
      
      <div className="relative w-full max-w-lg bg-white dark:bg-neutral-900 rounded-[2.5rem] shadow-2xl overflow-hidden animate-in zoom-in-95 duration-200">
        <button 
          onClick={onClose}
          className="absolute right-6 top-6 p-2 text-neutral-400 hover:text-neutral-900 dark:hover:text-white hover:bg-neutral-100 dark:hover:bg-neutral-800 rounded-full transition-colors"
        >
          <X size={20} />
        </button>

        <div className="p-8 sm:p-10">
          {success ? (
            <div className="flex flex-col items-center justify-center py-10 text-center space-y-4">
              <div className="h-16 w-16 bg-emerald-100 dark:bg-emerald-900/30 rounded-full flex items-center justify-center text-emerald-600 dark:text-emerald-400">
                <Star size={32} fill="currentColor" />
              </div>
              <h2 className="text-2xl font-bold text-neutral-900 dark:text-white">Thank you!</h2>
              <p className="text-neutral-600 dark:text-neutral-400">Your review has been submitted successfully.</p>
            </div>
          ) : (
            <form onSubmit={handleSubmit} className="space-y-6">
              <div>
                <h2 className="text-2xl font-black tracking-tight text-neutral-900 dark:text-white sm:text-3xl">
                  Leave a Review
                </h2>
                <p className="mt-2 text-neutral-500 dark:text-neutral-400">
                  How was your experience with <span className="font-bold text-neutral-900 dark:text-white">{courseTitle}</span>?
                </p>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Your Rating
                </label>
                <div className="flex gap-2">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onClick={() => setRating(star)}
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      className="transition-transform hover:scale-110 active:scale-95"
                    >
                      <Star
                        size={32}
                        className={cn(
                          "transition-colors",
                          (hoverRating || rating) >= star 
                            ? "fill-yellow-400 text-yellow-400" 
                            : "text-neutral-200 dark:text-neutral-700"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div className="space-y-3">
                <label className="text-sm font-semibold uppercase tracking-wider text-neutral-500 dark:text-neutral-400">
                  Detailed Feedback
                </label>
                <textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us what you liked or how we can improve..."
                  rows={4}
                  className="w-full rounded-3xl border border-neutral-200 bg-neutral-50 px-5 py-4 text-neutral-900 outline-none transition-colors placeholder:text-neutral-400 focus:border-primary-500 dark:border-neutral-800 dark:bg-neutral-950 dark:text-white"
                />
              </div>

              {error && (
                <div className="rounded-2xl bg-red-50 p-4 text-sm text-red-600 dark:bg-red-900/20 dark:text-red-400">
                  {error}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="inline-flex w-full items-center justify-center gap-2 rounded-2xl bg-neutral-900 px-5 py-4 text-base font-semibold text-white transition-colors hover:bg-neutral-800 dark:bg-white dark:text-neutral-900 dark:hover:bg-neutral-100 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-5 w-5 animate-spin" /> : 'Submit Review'}
              </button>
            </form>
          )}
        </div>
      </div>
    </div>,
    document.body
  )
}
