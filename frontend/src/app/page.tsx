"use client";

import React, { useEffect, useState, useRef } from "react";
import Link from "next/link";
import { gsap } from "gsap";
import {
  ArrowRight,
  RotateCw,
  Zap,
  Eye,
  Star,
  Upload,
  Shield,
  Smartphone,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import ProductCard from "@/components/ProductCard";
import { productApi, type Product } from "@/lib/api";

const FEATURES = [
  {
    icon: RotateCw,
    title: "360° Rotation",
    desc: "Smooth drag & swipe rotation with GSAP-powered inertia for a natural feel.",
  },
  {
    icon: Zap,
    title: "Auto Frame Extraction",
    desc: "Upload a video and get 72 optimized frames extracted automatically via FFmpeg.",
  },
  {
    icon: Eye,
    title: "Zoom & Fullscreen",
    desc: "Pinch to zoom, scroll to magnify, and go fullscreen for immersive viewing.",
  },
  {
    icon: Star,
    title: "Reviews & Ratings",
    desc: "Community-driven product reviews with ratings, helpful votes, and analytics.",
  },
  {
    icon: Shield,
    title: "Hotspot Annotations",
    desc: "Interactive hotspots on specific frames highlight key product features.",
  },
  {
    icon: Smartphone,
    title: "Mobile Optimized",
    desc: "Touch-friendly controls and responsive design for any device.",
  },
];

export default function HomePage() {
  const [featuredProducts, setFeaturedProducts] = useState<Product[]>([]);
  const heroRef = useRef<HTMLDivElement>(null);
  const featureRefs = useRef<HTMLDivElement[]>([]);

  useEffect(() => {
    // Hero animation
    if (heroRef.current) {
      gsap.fromTo(
        heroRef.current.children,
        { opacity: 0, y: 40 },
        { opacity: 1, y: 0, duration: 1, stagger: 0.15, ease: "power3.out" }
      );
    }

    // Feature cards animation on scroll
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            gsap.fromTo(
              entry.target,
              { opacity: 0, y: 30 },
              { opacity: 1, y: 0, duration: 0.6, ease: "power2.out" }
            );
            observer.unobserve(entry.target);
          }
        });
      },
      { threshold: 0.15 }
    );

    featureRefs.current.forEach((ref) => {
      if (ref) observer.observe(ref);
    });

    return () => observer.disconnect();
  }, []);

  useEffect(() => {
    productApi
      .getAll("limit=4&sort=-averageRating")
      .then((data) => setFeaturedProducts(data.products))
      .catch(() => {});
  }, []);

  return (
    <div className="relative">
      {/* Background gradient */}
      <div className="absolute inset-0 -z-10 overflow-hidden">
        <div className="absolute top-0 left-1/4 w-96 h-96 bg-primary/5 rounded-full blur-3xl" />
        <div className="absolute top-1/4 right-1/4 w-96 h-96 bg-primary/3 rounded-full blur-3xl" />
      </div>

      {/* Hero Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-32">
        <div ref={heroRef} className="text-center max-w-4xl mx-auto space-y-8">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass shadow-glass text-sm">
            <span className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
            Next-generation product visualization
          </div>

          <h1 className="text-5xl sm:text-6xl lg:text-7xl font-bold tracking-tight leading-[1.1]">
            Experience Products
            <br />
            <span className="text-gradient">in Immersive 360°</span>
          </h1>

          <p className="text-lg sm:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
            Upload a product video and transform it into a stunning, interactive
            360° viewer. Drag, zoom, and explore every angle before you buy.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link href="/upload">
              <Button size="xl" className="gap-2 shadow-lg hover:shadow-xl transition-shadow">
                <Upload className="w-5 h-5" />
                Upload Product
              </Button>
            </Link>
            <Link href="/products">
              <Button size="xl" variant="outline" className="gap-2">
                Browse Products
                <ArrowRight className="w-5 h-5" />
              </Button>
            </Link>
          </div>

          {/* Stats */}
          <div className="grid grid-cols-3 gap-8 max-w-md mx-auto pt-8">
            {[
              { label: "Frames", value: "72" },
              { label: "Formats", value: "4+" },
              { label: "Quality", value: "HD" },
            ].map((stat) => (
              <div key={stat.label} className="text-center">
                <p className="text-3xl font-bold">{stat.value}</p>
                <p className="text-sm text-muted-foreground">{stat.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <div className="text-center mb-16">
          <h2 className="text-3xl sm:text-4xl font-bold">
            Everything you need for{" "}
            <span className="text-gradient">product visualization</span>
          </h2>
          <p className="text-muted-foreground mt-4 max-w-xl mx-auto">
            A complete platform for creating, viewing, and reviewing 360° product
            experiences.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {FEATURES.map((feature, i) => (
            <div
              key={feature.title}
              ref={(el) => {
                if (el) featureRefs.current[i] = el;
              }}
              className="opacity-0"
            >
              <Card className="group h-full hover:shadow-lg hover:-translate-y-1 transition-all duration-500 border-border/50">
                <CardContent className="p-6 space-y-4">
                  <div className="w-12 h-12 rounded-2xl bg-primary/10 flex items-center justify-center group-hover:bg-primary/20 transition-colors">
                    <feature.icon className="w-6 h-6 text-primary" />
                  </div>
                  <h3 className="text-lg font-semibold">{feature.title}</h3>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {feature.desc}
                  </p>
                </CardContent>
              </Card>
            </div>
          ))}
        </div>
      </section>

      {/* Featured Products */}
      {featuredProducts.length > 0 && (
        <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold">Featured Products</h2>
              <p className="text-muted-foreground mt-1">Top-rated 360° experiences</p>
            </div>
            <Link href="/products">
              <Button variant="outline" className="gap-2">
                View All <ArrowRight className="w-4 h-4" />
              </Button>
            </Link>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {featuredProducts.map((product) => (
              <ProductCard key={product._id} product={product} />
            ))}
          </div>
        </section>
      )}

      {/* CTA Section */}
      <section className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 pb-24">
        <Card className="bg-gradient-to-br from-primary to-primary/80 text-primary-foreground border-0 overflow-hidden relative">
          <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.1),transparent)]" />
          <CardContent className="p-12 sm:p-16 text-center relative z-10">
            <h2 className="text-3xl sm:text-4xl font-bold mb-4">
              Ready to showcase your product?
            </h2>
            <p className="text-lg opacity-90 mb-8 max-w-lg mx-auto">
              Upload your first 360° product video and create an immersive viewing
              experience in minutes.
            </p>
            <Link href="/upload">
              <Button
                size="xl"
                variant="secondary"
                className="gap-2 shadow-xl"
              >
                <Upload className="w-5 h-5" />
                Get Started Free
              </Button>
            </Link>
          </CardContent>
        </Card>
      </section>
    </div>
  );
}
