"use client";

import React, { useEffect, useState } from "react";
import { useParams } from "next/navigation";
import {
  ArrowLeft,
  Star,
  Tag,
  User as UserIcon,
  Calendar,
  Loader2,
  RefreshCw,
  AlertCircle,
} from "lucide-react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";
import ProductViewer360 from "@/components/ProductViewer360";
import ReviewSection from "@/components/ReviewSection";
import { productApi, type Product } from "@/lib/api";
import { cn, formatPrice, formatDate } from "@/lib/utils";

export default function ProductDetailPage() {
  const params = useParams();
  const id = params.id as string;

  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    if (!id) return;
    loadProduct();
  }, [id]);

  const loadProduct = async () => {
    try {
      const data = await productApi.getOne(id);
      setProduct(data);
    } catch (err: unknown) {
      setError(err instanceof Error ? err.message : "Failed to load product");
    } finally {
      setIsLoading(false);
    }
  };

  // Poll for processing status
  useEffect(() => {
    if (!product || product.processingStatus === "completed" || product.processingStatus === "failed") return;

    const interval = setInterval(async () => {
      try {
        const status = await productApi.getStatus(product._id);
        if (status.status === "completed") {
          clearInterval(interval);
          loadProduct();
        }
      } catch {
        // ignore
      }
    }, 3000);

    return () => clearInterval(interval);
  }, [product]);

  if (isLoading) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-12">
          <div className="skeleton aspect-[4/3] rounded-2xl" />
          <div className="space-y-4">
            <div className="skeleton h-4 w-24 rounded-full" />
            <div className="skeleton h-10 w-3/4 rounded-full" />
            <div className="skeleton h-4 w-full rounded-full" />
            <div className="skeleton h-4 w-2/3 rounded-full" />
            <div className="skeleton h-10 w-32 rounded-full mt-8" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !product) {
    return (
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-24 text-center">
        <AlertCircle className="w-16 h-16 text-muted-foreground/30 mx-auto mb-4" />
        <h2 className="text-2xl font-bold mb-2">Product Not Found</h2>
        <p className="text-muted-foreground mb-6">{error || "This product does not exist."}</p>
        <Link href="/products">
          <Button variant="outline" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Back to Products
          </Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Breadcrumb */}
      <div className="flex items-center gap-2 mb-8">
        <Link href="/products">
          <Button variant="ghost" size="sm" className="gap-2">
            <ArrowLeft className="w-4 h-4" />
            Products
          </Button>
        </Link>
        <span className="text-muted-foreground">/</span>
        <span className="text-sm text-muted-foreground truncate">
          {product.name}
        </span>
      </div>

      {/* Product layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-16">
        {/* 360 Viewer */}
        <div>
          {product.processingStatus === "completed" &&
          product.frames.length > 0 ? (
            <ProductViewer360
              frames={product.frames}
              hotspots={product.hotspots}
              productName={product.name}
            />
          ) : product.processingStatus === "processing" ||
            product.processingStatus === "pending" ? (
            <Card className="aspect-[4/3] flex items-center justify-center border-dashed">
              <CardContent className="text-center space-y-4">
                <RefreshCw className="w-12 h-12 text-primary animate-spin mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Processing Video</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Extracting frames from your video. This page will update
                    automatically.
                  </p>
                </div>
              </CardContent>
            </Card>
          ) : (
            <Card className="aspect-[4/3] flex items-center justify-center border-dashed">
              <CardContent className="text-center space-y-4">
                <AlertCircle className="w-12 h-12 text-destructive/50 mx-auto" />
                <div>
                  <h3 className="font-semibold text-lg">Processing Failed</h3>
                  <p className="text-sm text-muted-foreground mt-1">
                    Frame extraction failed. Please try uploading again.
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Product info */}
        <div className="space-y-6">
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <Badge variant="outline" className="uppercase text-xs">
                {product.category}
              </Badge>
              {product.brand && (
                <Badge variant="secondary">{product.brand}</Badge>
              )}
            </div>

            <h1 className="text-3xl sm:text-4xl font-bold leading-tight">
              {product.name}
            </h1>

            {/* Rating */}
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-1">
                {[1, 2, 3, 4, 5].map((star) => (
                  <Star
                    key={star}
                    className={cn(
                      "w-5 h-5",
                      star <= Math.round(product.averageRating)
                        ? "fill-amber-400 text-amber-400"
                        : "text-gray-300"
                    )}
                  />
                ))}
              </div>
              <span className="text-sm text-muted-foreground">
                {product.averageRating.toFixed(1)} ({product.reviewCount}{" "}
                review{product.reviewCount !== 1 ? "s" : ""})
              </span>
            </div>
          </div>

          {/* Price */}
          <div className="flex items-baseline gap-2">
            <span className="text-4xl font-bold">
              {formatPrice(product.price)}
            </span>
          </div>

          {/* Description */}
          <div className="prose prose-sm dark:prose-invert max-w-none">
            <p className="text-muted-foreground leading-relaxed whitespace-pre-wrap">
              {product.description}
            </p>
          </div>

          {/* Meta */}
          <Card className="border-border/50">
            <CardContent className="p-4 space-y-3">
              <div className="flex items-center gap-3 text-sm">
                <Tag className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Category:</span>
                <span className="font-medium capitalize">{product.category}</span>
              </div>
              {product.user && (
                <div className="flex items-center gap-3 text-sm">
                  <UserIcon className="w-4 h-4 text-muted-foreground" />
                  <span className="text-muted-foreground">Uploaded by:</span>
                  <span className="font-medium">{product.user.name}</span>
                </div>
              )}
              <div className="flex items-center gap-3 text-sm">
                <Calendar className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Listed:</span>
                <span className="font-medium">{formatDate(product.createdAt)}</span>
              </div>
              <div className="flex items-center gap-3 text-sm">
                <RefreshCw className="w-4 h-4 text-muted-foreground" />
                <span className="text-muted-foreground">Frames:</span>
                <span className="font-medium">{product.frameCount} frames</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Reviews */}
      <ReviewSection
        productId={product._id}
        averageRating={product.averageRating}
        reviewCount={product.reviewCount}
      />
    </div>
  );
}
