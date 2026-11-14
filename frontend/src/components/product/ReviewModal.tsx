'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import { X, Star, CheckCircle, Video, Camera, ThumbsUp } from 'lucide-react';
import { CustomerReview } from '@/types';

interface ReviewModalProps {
  selectedReview: CustomerReview | null;
  onClose: () => void;
  onWriteReview?: boolean;
  onCloseWriteReview?: () => void;
  onSubmitReview?: (review: Partial<CustomerReview>) => void;
  productName?: string;
}

export const ReviewModal: React.FC<ReviewModalProps> = ({
  selectedReview,
  onClose,
  onWriteReview,
  onCloseWriteReview,
  onSubmitReview,
  productName,
}) => {
  // Write Review Form State
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState('');
  const [comment, setComment] = useState('');
  const [authorName, setAuthorName] = useState('');
  const [authorCity, setAuthorCity] = useState('');
  const [mediaPreview, setMediaPreview] = useState<string | null>(null);
  const [mediaType, setMediaType] = useState<'photo' | 'video'>('photo');
  const [submitted, setSubmitted] = useState(false);

  // Review Media Lightbox
  if (selectedReview) {
    const hasMedia = selectedReview.media && selectedReview.media.length > 0;
    const mediaItem = hasMedia ? selectedReview.media![0] : null;

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/80 backdrop-blur-xs">
        <div className="relative w-full max-w-2xl bg-canvas-card border border-line rounded-lg shadow-lift overflow-hidden z-10 my-8">
          <button
            type="button"
            onClick={onClose}
            className="absolute top-4 right-4 z-20 p-2 text-ink-muted hover:text-ink rounded-full bg-canvas/80"
            aria-label="Close review modal"
          >
            <X className="w-5 h-5" />
          </button>

          <div className="grid grid-cols-1 md:grid-cols-2">
            {/* Media side */}
            <div className="relative aspect-square md:aspect-auto bg-black flex items-center justify-center min-h-[300px]">
              {mediaItem?.type === 'video' ? (
                <video
                  src={mediaItem.url}
                  controls
                  autoPlay
                  className="w-full h-full object-cover"
                />
              ) : mediaItem?.url ? (
                <Image
                  src={mediaItem.url}
                  alt={mediaItem.caption || selectedReview.title}
                  fill
                  decoding="async"
                  className="object-cover"
                />
              ) : (
                <div className="p-8 text-center text-ink-muted">
                  <Camera className="w-10 h-10 mx-auto mb-2 opacity-50" />
                  <p className="text-xs">Customer Verified Purchase</p>
                </div>
              )}
            </div>

            {/* Content side */}
            <div className="p-6 flex flex-col justify-between space-y-4">
              <div>
                <div className="flex items-center gap-2 mb-2">
                  <div className="flex">
                    {[1, 2, 3, 4, 5].map((s) => (
                      <Star
                        key={s}
                        className={`w-4 h-4 ${s <= selectedReview.rating
                          ? 'fill-zimor-orange text-zimor-orange'
                          : 'text-line'
                          }`}
                      />
                    ))}
                  </div>
                  <span className="text-xs text-ink-muted">{selectedReview.date}</span>
                </div>

                <h3 className="text-sm font-bold text-ink">{selectedReview.title}</h3>
                <p className="text-xs text-ink-secondary mt-2 leading-relaxed">
                  "{selectedReview.comment}"
                </p>

                {mediaItem?.caption && (
                  <p className="text-[11px] text-brand-700 mt-2 font-normal">
                    Note: {mediaItem.caption}
                  </p>
                )}
              </div>

              <div className="pt-4 border-t border-line">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs font-semibold text-ink flex items-center gap-1.5">
                      {selectedReview.userName}
                      {selectedReview.verifiedPurchase && (
                        <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-normal">
                          <CheckCircle className="w-3 h-3 text-emerald-600" />
                          Verified
                        </span>
                      )}
                    </p>
                    {selectedReview.userCity && (
                      <p className="text-[11px] text-ink-muted">{selectedReview.userCity}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-1 text-xs text-ink-muted">
                    <ThumbsUp className="w-3.5 h-3.5" />
                    <span>{selectedReview.helpfulCount || 12} found helpful</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  // Write Review Modal
  if (onWriteReview) {
    const handleFormSubmit = (e: React.FormEvent) => {
      e.preventDefault();
      if (onSubmitReview) {
        onSubmitReview({
          userName: authorName.trim() || 'Valued Customer',
          userCity: authorCity.trim() || 'Verified Buyer',
          rating,
          title: title.trim() || 'Outstanding Work Bag',
          comment: comment.trim(),
          verifiedPurchase: true,
          date: 'Just now',
          media: mediaPreview
            ? [
              {
                type: mediaType,
                url: mediaPreview,
                caption: 'Customer uploaded review photo',
              },
            ]
            : undefined,
        });
      }
      setSubmitted(true);
      setTimeout(() => {
        if (onCloseWriteReview) onCloseWriteReview();
      }, 1800);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-xs">
        <div className="relative w-full max-w-lg bg-canvas-card border border-line rounded-lg shadow-lift p-6 z-10 max-h-[90vh] overflow-y-auto">
          <button
            type="button"
            onClick={onCloseWriteReview}
            className="absolute top-4 right-4 p-2 text-ink-muted hover:text-ink"
            aria-label="Close form"
          >
            <X className="w-5 h-5" />
          </button>

          {submitted ? (
            <div className="text-center py-12 space-y-3">
              <div className="w-12 h-12 mx-auto rounded-full bg-emerald-100 text-emerald-700 flex items-center justify-center">
                <CheckCircle className="w-6 h-6" />
              </div>
              <h3 className="text-base font-bold text-ink">Thank you for your review!</h3>
              <p className="text-xs text-ink-muted">
                Your feedback and photos help fellow professionals make informed decisions.
              </p>
            </div>
          ) : (
            <form onSubmit={handleFormSubmit} className="space-y-4">
              <div>
                <h3 className="text-base font-bold text-ink">Write a Customer Review</h3>
                <p className="text-xs text-ink-muted">
                  Sharing your experience for {productName || 'Zimor Bag'}
                </p>
              </div>

              {/* Star Rating Selector */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Overall Rating *
                </label>
                <div className="flex items-center gap-1.5">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                      className="p-1 hover:scale-110 transition-transform"
                      aria-label={`${star} star rating`}
                    >
                      <Star
                        className={`w-6 h-6 ${star <= (hoverRating || rating)
                          ? 'fill-zimor-orange text-zimor-orange'
                          : 'text-line'
                          }`}
                      />
                    </button>
                  ))}
                  <span className="text-xs font-semibold text-ink ml-2">
                    {rating} out of 5 stars
                  </span>
                </div>
              </div>

              {/* Title & Comment */}
              <div className="space-y-3">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Review Headline *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Superior craftsmanship & perfect laptop protection"
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    className="w-full text-xs p-2.5 border border-line bg-canvas rounded focus:outline-none focus:border-brand-600"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Your Review *
                  </label>
                  <textarea
                    rows={4}
                    required
                    placeholder="How does it fit your daily commute? How is the leather feel, stitching, and laptop capacity?"
                    value={comment}
                    onChange={(e) => setComment(e.target.value)}
                    className="w-full text-xs p-2.5 border border-line bg-canvas rounded focus:outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              {/* Media Upload Simulation */}
              <div>
                <label className="block text-xs font-semibold text-ink mb-1">
                  Add Review Photo or Video
                </label>
                <div className="flex items-center gap-3">
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPreview('/products/delo-4.jpg');
                      setMediaType('photo');
                    }}
                    className="flex items-center gap-2 px-3 py-2 border border-line bg-canvas hover:bg-canvas-alt text-xs rounded text-ink-secondary"
                  >
                    <Camera className="w-4 h-4 text-brand-600" />
                    <span>Upload Bag Photo</span>
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      setMediaPreview('https://assets.mixkit.co/videos/preview/mixkit-woman-holding-a-leather-handbag-40294-large.mp4');
                      setMediaType('video');
                    }}
                    className="flex items-center gap-2 px-3 py-2 border border-line bg-canvas hover:bg-canvas-alt text-xs rounded text-ink-secondary"
                  >
                    <Video className="w-4 h-4 text-brand-600" />
                    <span>Upload Video Clip</span>
                  </button>
                </div>
                {mediaPreview && (
                  <p className="text-[11px] text-emerald-700 font-medium mt-1.5 flex items-center gap-1">
                    <CheckCircle className="w-3.5 h-3.5" /> Media attached successfully ({mediaType})
                  </p>
                )}
              </div>

              {/* Author details */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    Your Name *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Radhika Sen"
                    value={authorName}
                    onChange={(e) => setAuthorName(e.target.value)}
                    className="w-full text-xs p-2.5 border border-line bg-canvas rounded focus:outline-none focus:border-brand-600"
                  />
                </div>
                <div>
                  <label className="block text-xs font-semibold text-ink mb-1">
                    City *
                  </label>
                  <input
                    type="text"
                    required
                    placeholder="e.g. Mumbai"
                    value={authorCity}
                    onChange={(e) => setAuthorCity(e.target.value)}
                    className="w-full text-xs p-2.5 border border-line bg-canvas rounded focus:outline-none focus:border-brand-600"
                  />
                </div>
              </div>

              <button
                type="submit"
                className="w-full bg-ink hover:bg-ink-secondary text-white font-primary font-medium text-sm tracking-normal py-3 rounded transition-colors"
              >
                Submit Verified Review
              </button>
            </form>
          )}
        </div>
      </div>
    );
  }

  return null;
};

export default ReviewModal;

