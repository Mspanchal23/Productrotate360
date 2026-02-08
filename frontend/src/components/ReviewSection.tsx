"use client";

import React, { useState, useEffect } from "react";
import { Star, ThumbsUp, Send, MessageSquare } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Progress } from "@/components/ui/progress";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { cn, formatDate } from "@/lib/utils";
import { reviewApi, type Review } from "@/lib/api";

interface ReviewSectionProps {
  productId: string;
  averageRating: number;
  reviewCount: number;
}

export default function ReviewSection({
  productId,
  averageRating,
  reviewCount,
}: ReviewSectionProps) {
  const [reviews, setReviews] = useState<Review[]>([]);
  const [distribution, setDistribution] = useState<Record<number, number>>({});
  const [isLoading, setIsLoading] = useState(true);
  const [showForm, setShowForm] = useState(false);
  const [rating, setRating] = useState(5);
  const [hoverRating, setHoverRating] = useState(0);
  const [title, setTitle] = useState("");
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isLoggedIn = typeof window !== "undefined" && !!localStorage.getItem("token");

  useEffect(() => {
    loadReviews();
  }, [productId]);

  const loadReviews = async () => {
    try {
      const data = await reviewApi.getForProduct(productId);
      setReviews(data.reviews);
      setDistribution(data.ratingDistribution);
    } catch {
      // Reviews may fail if product has none yet
    } finally {
      setIsLoading(false);
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setIsSubmitting(true);

    try {
      const newReview = await reviewApi.create(productId, {
        rating,
        title,
        comment,
      });
      setReviews((prev) => [newReview, ...prev]);
      setTitle("");
      setComment("");
      setRating(5);
      setShowForm(false);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to submit review");
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleHelpful = async (reviewId: string) => {
    try {
      const updated = await reviewApi.markHelpful(reviewId);
      setReviews((prev) =>
        prev.map((r) => (r._id === reviewId ? { ...r, helpful: (updated as Review).helpful } : r))
      );
    } catch {
      // Ignore
    }
  };

  return (
    <div className="space-y-8">
      {/* Rating summary */}
      <Card className="glass border-border/50">
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <MessageSquare className="w-5 h-5" />
            Reviews & Ratings
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-8">
            {/* Average score */}
            <div className="flex flex-col items-center justify-center min-w-[140px]">
              <span className="text-5xl font-bold">{averageRating.toFixed(1)}</span>
              <div className="flex items-center gap-0.5 mt-2">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-5 h-5",
                      star <= Math.round(averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground mt-1">
                {reviewCount} review{reviewCount !== 1 ? "s" : ""}
              </span>
            </div>

            {/* Distribution bars */}
            <div className="flex-1 space-y-2">
              {[5, 4, 3, 2, 1].map((star) => {
                const count = distribution[star] || 0;
                const pct = reviewCount > 0 ? (count / reviewCount) * 100 : 0;
                return (
                  <div key={star} className="flex items-center gap-3">
                    <span className="text-sm w-3">{star}</span>
                    <Star className="w-3.5 h-3.5 fill-amber-400 text-amber-400" />
                    <Progress value={pct} className="flex-1 h-2" />
                    <span className="text-xs text-muted-foreground w-8 text-right">
                      {count}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Write review button */}
          <div className="mt-6 pt-6 border-t border-border/50">
            {isLoggedIn ? (
              <Button
                onClick={() => setShowForm(!showForm)}
                variant={showForm ? "secondary" : "default"}
                className="gap-2"
              >
                <Star className="w-4 h-4" />
                {showForm ? "Cancel" : "Write a Review"}
              </Button>
            ) : (
              <p className="text-sm text-muted-foreground">
                Please sign in to write a review.
              </p>
            )}
          </div>

          {/* Review form */}
          {showForm && (
            <form onSubmit={handleSubmit} className="mt-6 space-y-4 animate-fade-in">
              {error && (
                <div className="bg-destructive/10 text-destructive text-sm p-3 rounded-lg">
                  {error}
                </div>
              )}

              {/* Star rating selector */}
              <div>
                <label className="text-sm font-medium mb-2 block">Rating</label>
                <div className="flex gap-1">
                  {[1, 2, 3, 4, 5].map((star) => (
                    <button
                      key={star}
                      type="button"
                      onMouseEnter={() => setHoverRating(star)}
                      onMouseLeave={() => setHoverRating(0)}
                      onClick={() => setRating(star)}
                    >
                      <Star
                        className={cn(
                          "w-8 h-8 transition-all duration-150 cursor-pointer",
                          star <= (hoverRating || rating)
                            ? "fill-amber-400 text-amber-400 scale-110"
                            : "text-gray-300 hover:text-amber-200"
                        )}
                      />
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Title</label>
                <Input
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Summarize your experience"
                  required
                />
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Review</label>
                <Textarea
                  value={comment}
                  onChange={(e) => setComment(e.target.value)}
                  placeholder="Tell us more about your experience..."
                  rows={4}
                  required
                />
              </div>

              <Button
                type="submit"
                disabled={isSubmitting || !title || !comment}
                className="gap-2"
              >
                <Send className="w-4 h-4" />
                {isSubmitting ? "Submitting..." : "Submit Review"}
              </Button>
            </form>
          )}
        </CardContent>
      </Card>

      {/* Reviews list */}
      <div className="space-y-4">
        {isLoading ? (
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="skeleton h-32 rounded-2xl" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <Card className="border-dashed">
            <CardContent className="py-12 text-center">
              <MessageSquare className="w-12 h-12 text-muted-foreground/30 mx-auto mb-4" />
              <p className="text-muted-foreground">
                No reviews yet. Be the first to review this product!
              </p>
            </CardContent>
          </Card>
        ) : (
          reviews.map((review) => (
            <Card
              key={review._id}
              className="border-border/50 hover:shadow-md transition-shadow duration-300"
            >
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-3">
                    <div className="w-10 h-10 rounded-full bg-gradient-to-br from-primary/20 to-primary/5 flex items-center justify-center">
                      <span className="text-sm font-semibold text-primary">
                        {review.user?.name?.charAt(0)?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <div>
                      <p className="font-medium text-sm">{review.user?.name || "Anonymous"}</p>
                      <p className="text-xs text-muted-foreground">
                        {formatDate(review.createdAt)}
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center gap-0.5">
                    {[1, 2, 3, 4, 5].map((star) => (
                      <Star
                        key={star}
                        className={cn(
                          "w-4 h-4",
                          star <= review.rating
                            ? "fill-amber-400 text-amber-400"
                            : "text-gray-300"
                        )}
                      />
                    ))}
                  </div>
                </div>

                <h4 className="font-semibold mt-4">{review.title}</h4>
                <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
                  {review.comment}
                </p>

                <div className="flex items-center gap-4 mt-4 pt-4 border-t border-border/50">
                  <button
                    onClick={() => handleHelpful(review._id)}
                    className="flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground transition-colors"
                  >
                    <ThumbsUp className="w-3.5 h-3.5" />
                    Helpful ({review.helpful})
                  </button>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );
}
