"use client";

import React, { useRef, useState, useCallback, useEffect } from "react";
import { gsap } from "gsap";
import {
  Maximize2,
  Minimize2,
  RotateCcw,
  ZoomIn,
  ZoomOut,
  Pause,
  Play,
  Move,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { cn, getFrameUrl } from "@/lib/utils";

interface Frame {
  index: number;
  path: string;
}

interface Hotspot {
  frameIndex: number;
  x: number;
  y: number;
  label: string;
  description: string;
}

interface ProductViewer360Props {
  frames: Frame[];
  hotspots?: Hotspot[];
  productName: string;
}

export default function ProductViewer360({
  frames,
  hotspots = [],
  productName,
}: ProductViewer360Props) {
  const containerRef = useRef<HTMLDivElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const imagesRef = useRef<HTMLImageElement[]>([]);
  const animFrameRef = useRef<number>(0);

  const [currentFrame, setCurrentFrame] = useState(0);
  const [isLoading, setIsLoading] = useState(true);
  const [loadProgress, setLoadProgress] = useState(0);
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotating, setIsAutoRotating] = useState(true);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [activeHotspot, setActiveHotspot] = useState<Hotspot | null>(null);

  const lastXRef = useRef(0);
  const velocityRef = useRef(0);
  const autoRotateTimerRef = useRef<ReturnType<typeof setTimeout>>(undefined);
  const frameIndexRef = useRef(0);

  const totalFrames = frames.length;

  // Preload all frame images
  useEffect(() => {
    if (frames.length === 0) return;

    let loaded = 0;
    const images: HTMLImageElement[] = [];

    frames.forEach((frame, i) => {
      const img = new Image();
      img.crossOrigin = "anonymous";
      img.onload = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / totalFrames) * 100));
        if (loaded === totalFrames) {
          imagesRef.current = images;
          setIsLoading(false);
          drawFrame(0);
        }
      };
      img.onerror = () => {
        loaded++;
        setLoadProgress(Math.round((loaded / totalFrames) * 100));
      };
      img.src = getFrameUrl(frame.path);
      images[i] = img;
    });
  }, [frames, totalFrames]);

  // Draw frame on canvas
  const drawFrame = useCallback(
    (index: number) => {
      const canvas = canvasRef.current;
      const ctx = canvas?.getContext("2d");
      const img = imagesRef.current[index];
      if (!canvas || !ctx || !img) return;

      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;

      ctx.clearRect(0, 0, canvas.width, canvas.height);
      ctx.drawImage(img, 0, 0);
    },
    []
  );

  // Update frame and draw
  const goToFrame = useCallback(
    (index: number) => {
      const wrappedIndex = ((index % totalFrames) + totalFrames) % totalFrames;
      frameIndexRef.current = wrappedIndex;
      setCurrentFrame(wrappedIndex);
      drawFrame(wrappedIndex);
    },
    [totalFrames, drawFrame]
  );

  // Auto-rotate
  useEffect(() => {
    if (!isAutoRotating || isLoading || isDragging) return;

    const interval = setInterval(() => {
      goToFrame(frameIndexRef.current + 1);
    }, 80);

    return () => clearInterval(interval);
  }, [isAutoRotating, isLoading, isDragging, goToFrame]);

  // Mouse/touch drag handlers
  const handlePointerDown = useCallback(
    (e: React.PointerEvent) => {
      setIsDragging(true);
      setIsAutoRotating(false);
      lastXRef.current = e.clientX;
      velocityRef.current = 0;
      if (autoRotateTimerRef.current) clearTimeout(autoRotateTimerRef.current);
      (e.target as HTMLElement).setPointerCapture(e.pointerId);
    },
    []
  );

  const handlePointerMove = useCallback(
    (e: React.PointerEvent) => {
      if (!isDragging) return;

      const deltaX = e.clientX - lastXRef.current;
      velocityRef.current = deltaX;
      lastXRef.current = e.clientX;

      const sensitivity = 0.3;
      const frameDelta = Math.round(deltaX * sensitivity);

      if (frameDelta !== 0) {
        goToFrame(frameIndexRef.current - frameDelta);
      }
    },
    [isDragging, goToFrame]
  );

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);

    // Inertia animation with GSAP
    const velocity = velocityRef.current;
    if (Math.abs(velocity) > 2) {
      const inertia = { value: velocity };
      gsap.to(inertia, {
        value: 0,
        duration: 1.2,
        ease: "power3.out",
        onUpdate: () => {
          const frameDelta = Math.round(inertia.value * 0.3);
          if (frameDelta !== 0) {
            goToFrame(frameIndexRef.current - frameDelta);
          }
        },
      });
    }

    // Resume auto-rotate after idle
    autoRotateTimerRef.current = setTimeout(() => {
      setIsAutoRotating(true);
    }, 4000);
  }, [goToFrame]);

  // Zoom
  const handleZoomIn = useCallback(() => {
    setZoom((prev) => Math.min(prev + 0.25, 3));
  }, []);

  const handleZoomOut = useCallback(() => {
    setZoom((prev) => Math.max(prev - 0.25, 1));
  }, []);

  const handleReset = useCallback(() => {
    setZoom(1);
    goToFrame(0);
    setIsAutoRotating(true);
  }, [goToFrame]);

  // Fullscreen
  const toggleFullscreen = useCallback(() => {
    if (!containerRef.current) return;
    if (!document.fullscreenElement) {
      containerRef.current.requestFullscreen();
      setIsFullscreen(true);
    } else {
      document.exitFullscreen();
      setIsFullscreen(false);
    }
  }, []);

  useEffect(() => {
    const handleFSChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFSChange);
    return () =>
      document.removeEventListener("fullscreenchange", handleFSChange);
  }, []);

  // Wheel zoom
  const handleWheel = useCallback(
    (e: React.WheelEvent) => {
      e.preventDefault();
      if (e.deltaY < 0) handleZoomIn();
      else handleZoomOut();
    },
    [handleZoomIn, handleZoomOut]
  );

  // Visible hotspots for current frame
  const visibleHotspots = hotspots.filter(
    (h) => h.frameIndex === currentFrame
  );

  return (
    <div
      ref={containerRef}
      className={cn(
        "relative group rounded-2xl overflow-hidden bg-gradient-to-br from-gray-50 to-gray-100 dark:from-gray-900 dark:to-gray-950",
        isFullscreen && "rounded-none"
      )}
    >
      {/* Loading overlay */}
      {isLoading && (
        <div className="absolute inset-0 z-20 flex flex-col items-center justify-center bg-white/80 dark:bg-gray-950/80 backdrop-blur-sm">
          <div className="w-64 space-y-4">
            <div className="flex items-center justify-center mb-6">
              <div className="relative">
                <div className="w-16 h-16 rounded-full border-4 border-gray-200 dark:border-gray-700" />
                <div
                  className="absolute top-0 left-0 w-16 h-16 rounded-full border-4 border-transparent border-t-primary animate-spin"
                />
              </div>
            </div>
            <Progress value={loadProgress} className="h-1.5" />
            <p className="text-center text-sm text-muted-foreground">
              Loading 360° view... {loadProgress}%
            </p>
          </div>
        </div>
      )}

      {/* Canvas viewer */}
      <div
        className={cn(
          "relative w-full aspect-square md:aspect-[4/3] overflow-hidden viewer-grab",
          isDragging && "cursor-grabbing"
        )}
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onWheel={handleWheel}
      >
        <canvas
          ref={canvasRef}
          className="w-full h-full object-contain transition-transform duration-200"
          style={{ transform: `scale(${zoom})` }}
        />

        {/* Hotspots */}
        {visibleHotspots.map((hotspot, i) => (
          <button
            key={i}
            className="absolute w-6 h-6 -ml-3 -mt-3 z-10"
            style={{ left: `${hotspot.x}%`, top: `${hotspot.y}%` }}
            onClick={(e) => {
              e.stopPropagation();
              setActiveHotspot(activeHotspot === hotspot ? null : hotspot);
            }}
          >
            <span className="flex h-full w-full">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary/40" />
              <span className="relative inline-flex rounded-full h-6 w-6 bg-primary shadow-lg items-center justify-center">
                <span className="text-[10px] font-bold text-primary-foreground">
                  +
                </span>
              </span>
            </span>
          </button>
        ))}

        {/* Hotspot tooltip */}
        {activeHotspot && (
          <div
            className="absolute z-20 glass-strong rounded-xl p-3 max-w-[200px] shadow-xl"
            style={{
              left: `${Math.min(activeHotspot.x, 70)}%`,
              top: `${Math.min(activeHotspot.y + 5, 80)}%`,
            }}
          >
            <p className="font-medium text-sm">{activeHotspot.label}</p>
            {activeHotspot.description && (
              <p className="text-xs text-muted-foreground mt-1">
                {activeHotspot.description}
              </p>
            )}
          </div>
        )}

        {/* Drag hint */}
        {!isLoading && !isDragging && isAutoRotating && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 glass rounded-full px-4 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Move className="w-4 h-4 text-muted-foreground" />
            <span className="text-xs text-muted-foreground">
              Drag to rotate
            </span>
          </div>
        )}
      </div>

      {/* Controls overlay */}
      <div className="absolute top-4 right-4 flex flex-col gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <Button
          variant="glass"
          size="icon"
          onClick={handleZoomIn}
          title="Zoom in"
        >
          <ZoomIn className="h-4 w-4" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          onClick={handleZoomOut}
          title="Zoom out"
        >
          <ZoomOut className="h-4 w-4" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          onClick={() => setIsAutoRotating(!isAutoRotating)}
          title={isAutoRotating ? "Pause" : "Auto-rotate"}
        >
          {isAutoRotating ? (
            <Pause className="h-4 w-4" />
          ) : (
            <Play className="h-4 w-4" />
          )}
        </Button>
        <Button
          variant="glass"
          size="icon"
          onClick={handleReset}
          title="Reset"
        >
          <RotateCcw className="h-4 w-4" />
        </Button>
        <Button
          variant="glass"
          size="icon"
          onClick={toggleFullscreen}
          title="Fullscreen"
        >
          {isFullscreen ? (
            <Minimize2 className="h-4 w-4" />
          ) : (
            <Maximize2 className="h-4 w-4" />
          )}
        </Button>
      </div>

      {/* Frame indicator */}
      <div className="absolute bottom-4 right-4 glass rounded-full px-3 py-1.5 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
        <span className="text-xs font-mono text-muted-foreground">
          {currentFrame + 1} / {totalFrames}
        </span>
      </div>

      {/* Scrubber bar */}
      {!isLoading && (
        <div className="absolute bottom-0 left-0 right-0 h-1 bg-black/10 opacity-0 group-hover:opacity-100 transition-opacity">
          <div
            className="h-full bg-primary/60 transition-all duration-75"
            style={{ width: `${((currentFrame + 1) / totalFrames) * 100}%` }}
          />
        </div>
      )}
    </div>
  );
}
