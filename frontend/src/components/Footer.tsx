import { Box } from "lucide-react";
import Link from "next/link";

export default function Footer() {
  return (
    <footer className="border-t border-border/50 bg-background/50 backdrop-blur-sm">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8">
          <div className="space-y-4">
            <Link href="/" className="flex items-center gap-2.5">
              <div className="w-8 h-8 rounded-lg bg-primary flex items-center justify-center">
                <Box className="w-4 h-4 text-primary-foreground" />
              </div>
              <span className="font-semibold text-lg">
                View<span className="text-muted-foreground">360</span>
              </span>
            </Link>
            <p className="text-sm text-muted-foreground leading-relaxed">
              Experience products in immersive 360° before you buy. Upload, view,
              and review with our cutting-edge product viewer.
            </p>
          </div>
          <div>
            <h4 className="font-medium mb-4">Product</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products" className="hover:text-foreground transition-colors">Browse Products</Link></li>
              <li><Link href="/upload" className="hover:text-foreground transition-colors">Upload Product</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Categories</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><Link href="/products?category=electronics" className="hover:text-foreground transition-colors">Electronics</Link></li>
              <li><Link href="/products?category=furniture" className="hover:text-foreground transition-colors">Furniture</Link></li>
              <li><Link href="/products?category=fashion" className="hover:text-foreground transition-colors">Fashion</Link></li>
              <li><Link href="/products?category=automotive" className="hover:text-foreground transition-colors">Automotive</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-4">Platform</h4>
            <ul className="space-y-2 text-sm text-muted-foreground">
              <li><span className="hover:text-foreground transition-colors cursor-pointer">About</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Privacy Policy</span></li>
              <li><span className="hover:text-foreground transition-colors cursor-pointer">Terms of Service</span></li>
            </ul>
          </div>
        </div>
        <div className="mt-12 pt-8 border-t border-border/50 flex flex-col sm:flex-row items-center justify-between gap-4">
          <p className="text-sm text-muted-foreground">
            &copy; {new Date().getFullYear()} View360. All rights reserved.
          </p>
          <p className="text-xs text-muted-foreground">
            Built with Next.js, Three.js & GSAP
          </p>
        </div>
      </div>
    </footer>
  );
}
