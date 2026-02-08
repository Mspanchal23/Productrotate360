"use client";

import React from "react";
import Link from "next/link";
import { Star, Eye } from "lucide-react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { cn, formatPrice, getFrameUrl } from "@/lib/utils";
import { useIntersectionObserver } from "@/hooks/useIntersectionObserver";
import type { Product } from "@/lib/api";

interface ProductCardProps {
  product: Product;
}

export default function ProductCard({ product }: ProductCardProps) {
  const { ref, isVisible } = useIntersectionObserver({ threshold: 0.1 });

  const statusColors = {
    completed: "success" as const,
    processing: "warning" as const,
    pending: "secondary" as const,
    failed: "destructive" as const,
  };

  return (
    <div ref={ref}>
      <Link href={`/products/${product._id}`}>
        <Card
          className={cn(
            "group overflow-hidden hover:shadow-xl hover:-translate-y-1 transition-all duration-500 cursor-pointer border-border/50",
            isVisible ? "opacity-100 translate-y-0" : "opacity-0 translate-y-8"
          )}
          style={{ transitionDelay: "100ms" }}
        >
          {/* Thumbnail */}
          <div className="relative aspect-square overflow-hidden bg-gradient-to-br from-gray-100 to-gray-50 dark:from-gray-800 dark:to-gray-900">
            {product.thumbnail ? (
              <img
                src={getFrameUrl(product.thumbnail)}
                alt={product.name}
                className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                loading="lazy"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Eye className="w-12 h-12 text-muted-foreground/30" />
              </div>
            )}

            {/* Overlay on hover */}
            <div className="absolute inset-0 bg-black/0 group-hover:bg-black/10 transition-colors duration-300 flex items-center justify-center">
              <div className="glass rounded-full px-4 py-2 opacity-0 group-hover:opacity-100 translate-y-4 group-hover:translate-y-0 transition-all duration-300">
                <span className="text-sm font-medium flex items-center gap-2">
                  <Eye className="w-4 h-4" />
                  View 360°
                </span>
              </div>
            </div>

            {/* Status badge */}
            <div className="absolute top-3 left-3">
              <Badge variant={statusColors[product.processingStatus]}>
                {product.processingStatus === "completed"
                  ? `${product.frameCount} frames`
                  : product.processingStatus}
              </Badge>
            </div>
          </div>

          <CardContent className="p-4 space-y-2">
            {/* Category */}
            <p className="text-xs uppercase tracking-wider text-muted-foreground font-medium">
              {product.category}
            </p>

            {/* Name */}
            <h3 className="font-semibold text-lg leading-tight line-clamp-1 group-hover:text-primary transition-colors">
              {product.name}
            </h3>

            {/* Rating */}
            <div className="flex items-center gap-2">
              <div className="flex items-center gap-0.5">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-3.5 h-3.5",
                      star <= Math.round(product.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300 dark:text-gray-600"
                    )}
                  />
                ))}
              </div>
              <span className="text-xs text-muted-foreground">
                ({product.reviewCount})
              </span>
            </div>

            {/* Price */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xl font-bold">{formatPrice(product.price)}</span>
              {product.brand && (
                <span className="text-xs text-muted-foreground bg-secondary px-2 py-0.5 rounded-full">
                  {product.brand}
                </span>
              )}
            </div>
          </CardContent>
        </Card>
      </Link>
    </div>
  );
}
