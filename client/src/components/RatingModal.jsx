import React, { useState } from 'react';
import { Star, X, Sparkles, ThumbsUp } from 'lucide-react';
import confetti from 'canvas-confetti';
import { submitReviewApi } from '../api';

const COMPLIMENT_TAGS = [
  'Clean Car',
  'Smooth Driving',
  'Polite Driver',
  'On Time',
  'Great Conversation',
  'Good Music',
];

const RatingModal = ({ ride, onClose, onReviewSubmitted }) => {
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [comment, setComment] = useState('');
  const [selectedTags, setSelectedTags] = useState(['Clean Car', 'Polite Driver']);
  const [submitting, setSubmitting] = useState(false);

  if (!ride) return null;

  const toggleTag = (tag) => {
    if (selectedTags.includes(tag)) {
      setSelectedTags(selectedTags.filter((t) => t !== tag));
    } else {
      setSelectedTags([...selectedTags, tag]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);

    try {
      await submitReviewApi({
        rideId: ride._id,
        rating,
        comment,
        tags: selectedTags,
      });

      // Confetti burst!
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 },
      });

      if (onReviewSubmitted) onReviewSubmitted();
      setTimeout(onClose, 800);
    } catch (err) {
      console.error('Error submitting review:', err);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70 backdrop-blur-sm animate-fade-in">
      <div className="bg-white rounded-3xl shadow-2xl border border-gray-100 max-w-md w-full overflow-hidden p-6 space-y-5 animate-scale-up">
        {/* Top bar */}
        <div className="flex items-center justify-between">
          <span className="text-xs font-bold uppercase tracking-wider text-gray-400">
            Rate Your Trip
          </span>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-gray-100 hover:bg-gray-200 flex items-center justify-center text-gray-600 transition"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Driver Profile Header */}
        <div className="text-center space-y-2">
          <img
            src={
              ride.driver?.avatar ||
              `https://ui-avatars.com/api/?name=${encodeURIComponent(
                ride.driver?.name || 'Driver'
              )}&background=000&color=fff`
            }
            alt="Driver"
            className="w-16 h-16 rounded-full mx-auto object-cover border-2 border-white shadow-md"
          />
          <h3 className="text-lg font-bold text-gray-900">
            How was your trip with {ride.driver?.name || 'your driver'}?
          </h3>
          <p className="text-xs text-gray-500">
            {ride.driver?.vehicle?.model || 'UberGo'} • {ride.distance} km
          </p>
        </div>

        {/* Star Rating Selection */}
        <div className="flex items-center justify-center space-x-2 py-2">
          {[1, 2, 3, 4, 5].map((star) => (
            <button
              key={star}
              type="button"
              onClick={() => setRating(star)}
              onMouseEnter={() => setHoverRating(star)}
              onMouseLeave={() => setHoverRating(0)}
              className="p-1 focus:outline-none transition-transform hover:scale-125"
            >
              <Star
                className={`w-8 h-8 transition-colors ${
                  (hoverRating || rating) >= star
                    ? 'fill-amber-400 text-amber-400'
                    : 'text-gray-200 fill-gray-100'
                }`}
              />
            </button>
          ))}
        </div>

        {/* Compliment Tag Badges */}
        <div className="space-y-1.5">
          <label className="text-xs font-semibold text-gray-600">What went well?</label>
          <div className="flex flex-wrap gap-1.5">
            {COMPLIMENT_TAGS.map((tag) => {
              const active = selectedTags.includes(tag);
              return (
                <button
                  key={tag}
                  type="button"
                  onClick={() => toggleTag(tag)}
                  className={`text-xs px-3 py-1.5 rounded-full font-medium transition ${
                    active
                      ? 'bg-black text-white'
                      : 'bg-gray-100 text-gray-600 hover:bg-gray-200'
                  }`}
                >
                  {tag}
                </button>
              );
            })}
          </div>
        </div>

        {/* Comment Textarea */}
        <div className="space-y-1">
          <label className="text-xs font-semibold text-gray-600">Add a note (optional)</label>
          <textarea
            value={comment}
            onChange={(e) => setComment(e.target.value)}
            placeholder="Write a compliment or feedback for the driver..."
            rows={3}
            className="w-full text-xs p-3 rounded-2xl bg-gray-50 border border-gray-200 focus:outline-none focus:ring-2 focus:ring-black placeholder-gray-400 resize-none"
          />
        </div>

        {/* Submit */}
        <button
          onClick={handleSubmit}
          disabled={submitting}
          className="w-full py-3.5 rounded-2xl bg-black hover:bg-neutral-800 text-white font-bold text-sm shadow-lg flex items-center justify-center space-x-2 transition"
        >
          {submitting ? (
            <span>Submitting...</span>
          ) : (
            <>
              <Sparkles className="w-4 h-4 text-amber-400" />
              <span>Submit Rating</span>
            </>
          )}
        </button>
      </div>
    </div>
  );
};

export default RatingModal;
