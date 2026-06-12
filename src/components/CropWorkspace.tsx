"use client";

import React, { useRef, useEffect, useState, MouseEvent, TouchEvent } from "react";

interface CropRect {
  x: number;      // percent (0-100)
  y: number;      // percent (0-100)
  width: number;  // percent (0-100)
  height: number; // percent (0-100)
}

interface CropWorkspaceProps {
  videoSrc: string;
  crop: CropRect;
  onCropChange: (crop: CropRect) => void;
  videoRef: React.RefObject<HTMLVideoElement | null>;
  onVideoMetadata: (metadata: { duration: number; width: number; height: number }) => void;
  aspectRatio: string;
  onAspectRatioChange: (ratio: string) => void;
}

export default function CropWorkspace({
  videoSrc,
  crop,
  onCropChange,
  videoRef,
  onVideoMetadata,
  aspectRatio,
  onAspectRatioChange,
}: CropWorkspaceProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [videoDims, setVideoDims] = useState({ width: 0, height: 0 });
  const [activeDrag, setActiveDrag] = useState<string | null>(null); // "move" or handle e.g. "top-left", "bottom"
  const [dragStart, setDragStart] = useState({ mouseX: 0, mouseY: 0, cropX: 0, cropY: 0, cropW: 0, cropH: 0 });

  // Ratio mapping (Width / Height)
  const getRatioValue = (ratioStr: string): number | null => {
    switch (ratioStr) {
      case "16:9": return 16 / 9;
      case "9:16": return 9 / 16;
      case "1:1": return 1;
      case "4:3": return 4 / 3;
      default: return null; // Free
    }
  };

  const handleLoadedMetadata = () => {
    if (!videoRef.current) return;
    const { duration, videoWidth, videoHeight } = videoRef.current;
    
    setVideoDims({ width: videoWidth, height: videoHeight });
    onVideoMetadata({ duration, width: videoWidth, height: videoHeight });

    // Set initial full crop
    onCropChange({ x: 10, y: 10, width: 80, height: 80 });
  };

  // Enforce aspect ratio constraints on crop
  const enforceRatio = (rect: CropRect, ratioStr: string, vWidth: number, vHeight: number): CropRect => {
    const targetRatio = getRatioValue(ratioStr);
    if (!targetRatio || vWidth === 0 || vHeight === 0) return rect;

    // ratio_pct = W_pct / H_pct = AR_crop / AR_video
    // ratio_pct = AR_crop * (vHeight / vWidth)
    const videoRatio = vWidth / vHeight;
    const ratioPct = targetRatio / videoRatio;

    let newWidth = rect.width;
    let newHeight = rect.width / ratioPct;

    if (newHeight > 100 - rect.y) {
      newHeight = 100 - rect.y;
      newWidth = newHeight * ratioPct;
    }

    if (newWidth > 100 - rect.x) {
      newWidth = 100 - rect.x;
      newHeight = newWidth / ratioPct;
    }

    return {
      ...rect,
      width: Number(newWidth.toFixed(2)),
      height: Number(newHeight.toFixed(2)),
    };
  };

  // Adjust crop box when aspect ratio changes
  useEffect(() => {
    if (videoDims.width > 0 && videoDims.height > 0) {
      const adjusted = enforceRatio(crop, aspectRatio, videoDims.width, videoDims.height);
      onCropChange(adjusted);
    }
  }, [aspectRatio, videoDims.width, videoDims.height]);

  const startDrag = (handle: string, e: React.MouseEvent<HTMLDivElement> | React.TouchEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    
    const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
    const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

    setActiveDrag(handle);
    setDragStart({
      mouseX: clientX,
      mouseY: clientY,
      cropX: crop.x,
      cropY: crop.y,
      cropW: crop.width,
      cropH: crop.height,
    });
  };

  useEffect(() => {
    const handleMove = (e: MouseEvent | TouchEvent) => {
      if (!activeDrag || !containerRef.current || videoDims.width === 0) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const clientY = "touches" in e ? e.touches[0].clientY : e.clientY;

      const deltaX = ((clientX - dragStart.mouseX) / rect.width) * 100;
      const deltaY = ((clientY - dragStart.mouseY) / rect.height) * 100;

      let nextCrop = { ...crop };

      const minSize = 10; // 10% minimum size

      if (activeDrag === "move") {
        nextCrop.x = Math.min(Math.max(0, dragStart.cropX + deltaX), 100 - dragStart.cropW);
        nextCrop.y = Math.min(Math.max(0, dragStart.cropY + deltaY), 100 - dragStart.cropH);
      } else {
        const targetRatio = getRatioValue(aspectRatio);
        const videoRatio = videoDims.width / videoDims.height;
        const ratioPct = targetRatio ? targetRatio / videoRatio : null;

        // Dynamic edge drag logic
        if (activeDrag.includes("right")) {
          nextCrop.width = Math.min(Math.max(minSize, dragStart.cropW + deltaX), 100 - dragStart.cropX);
          if (ratioPct) {
            nextCrop.height = nextCrop.width / ratioPct;
            if (dragStart.cropY + nextCrop.height > 100) {
              nextCrop.height = 100 - dragStart.cropY;
              nextCrop.width = nextCrop.height * ratioPct;
            }
          }
        }
        if (activeDrag.includes("left")) {
          const maxDeltaX = dragStart.cropW - minSize;
          const clampedDeltaX = Math.min(Math.max(-dragStart.cropX, deltaX), maxDeltaX);
          nextCrop.x = dragStart.cropX + clampedDeltaX;
          nextCrop.width = dragStart.cropW - clampedDeltaX;
          
          if (ratioPct) {
            nextCrop.height = nextCrop.width / ratioPct;
            if (dragStart.cropY + nextCrop.height > 100) {
              nextCrop.height = 100 - dragStart.cropY;
              nextCrop.width = nextCrop.height * ratioPct;
              // Re-adjust X since width was capped
              nextCrop.x = dragStart.cropX + (dragStart.cropW - nextCrop.width);
            }
          }
        }
        if (activeDrag.includes("bottom") && !ratioPct) {
          nextCrop.height = Math.min(Math.max(minSize, dragStart.cropH + deltaY), 100 - dragStart.cropY);
        }
        if (activeDrag.includes("top") && !ratioPct) {
          const maxDeltaY = dragStart.cropH - minSize;
          const clampedDeltaY = Math.min(Math.max(-dragStart.cropY, deltaY), maxDeltaY);
          nextCrop.y = dragStart.cropY + clampedDeltaY;
          nextCrop.height = dragStart.cropH - clampedDeltaY;
        }

        // Handle corner ratios
        if (ratioPct && (activeDrag.includes("top") || activeDrag.includes("bottom"))) {
          // Corner updates with fixed ratio are derived from width changes for simplicity
          if (activeDrag.includes("top-left") || activeDrag.includes("top-right")) {
            // Adjust vertical values based on calculated height
            nextCrop.height = nextCrop.width / ratioPct;
            nextCrop.y = dragStart.cropY + (dragStart.cropH - nextCrop.height);
            if (nextCrop.y < 0) {
              nextCrop.y = 0;
              nextCrop.height = dragStart.cropH + dragStart.cropY;
              nextCrop.width = nextCrop.height * ratioPct;
              if (activeDrag.includes("top-left")) {
                nextCrop.x = dragStart.cropX + (dragStart.cropW - nextCrop.width);
              }
            }
          }
        }
      }

      onCropChange({
        x: Number(nextCrop.x.toFixed(2)),
        y: Number(nextCrop.y.toFixed(2)),
        width: Number(nextCrop.width.toFixed(2)),
        height: Number(nextCrop.height.toFixed(2)),
      });
    };

    const handleUp = () => {
      setActiveDrag(null);
    };

    if (activeDrag) {
      window.addEventListener("mousemove", handleMove);
      window.addEventListener("mouseup", handleUp);
      window.addEventListener("touchmove", handleMove);
      window.addEventListener("touchend", handleUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMove);
      window.removeEventListener("mouseup", handleUp);
      window.removeEventListener("touchmove", handleMove);
      window.removeEventListener("touchend", handleUp);
    };
  }, [activeDrag, dragStart, crop, aspectRatio, videoDims, onCropChange]);

  const handleInputChange = (field: keyof CropRect, val: number) => {
    let nextCrop = { ...crop, [field]: val };
    
    // Validate bounds
    if (field === "x") nextCrop.x = Math.min(Math.max(0, val), 100 - crop.width);
    if (field === "y") nextCrop.y = Math.min(Math.max(0, val), 100 - crop.height);
    if (field === "width") nextCrop.width = Math.min(Math.max(10, val), 100 - crop.x);
    if (field === "height") nextCrop.height = Math.min(Math.max(10, val), 100 - crop.y);

    if (aspectRatio !== "Free") {
      nextCrop = enforceRatio(nextCrop, aspectRatio, videoDims.width, videoDims.height);
    }

    onCropChange({
      x: Number(nextCrop.x.toFixed(2)),
      y: Number(nextCrop.y.toFixed(2)),
      width: Number(nextCrop.width.toFixed(2)),
      height: Number(nextCrop.height.toFixed(2)),
    });
  };

  return (
    <div className="flex flex-col gap-6 w-full">
      {/* Aspect Ratio Toolbar (pill-tab style from DESIGN.md) */}
      <div className="flex flex-wrap items-center gap-2 border-b border-hairline pb-4">
        <span className="text-xs text-mute mr-2 font-medium">Aspect Ratio</span>
        {["Free", "16:9", "9:16", "1:1", "4:3"].map((ratio) => (
          <button
            key={ratio}
            onClick={() => onAspectRatioChange(ratio)}
            className={`px-3 py-1 text-xs rounded-full font-medium transition-all duration-150 border
              ${
                aspectRatio === ratio
                  ? "bg-surface-elevated text-ink border-stone"
                  : "bg-transparent text-mute border-transparent hover:text-ink hover:bg-surface-card"
              }
            `}
          >
            {ratio}
          </button>
        ))}
      </div>

      {/* Video Cropping Box workspace */}
      <div className="flex flex-col items-center justify-center p-6 bg-surface-card border border-hairline rounded-lg overflow-hidden relative">
        <div ref={containerRef} className="relative select-none max-w-full">
          <video
            ref={videoRef}
            src={videoSrc}
            onLoadedMetadata={handleLoadedMetadata}
            className="max-h-[420px] max-w-full rounded-sm shadow-2xl block"
            loop
            muted
            playsInline
          />

          {/* Dims Overlay (Masks) */}
          <div
            className="absolute bg-black/60 pointer-events-none"
            style={{ top: 0, left: 0, right: 0, height: `${crop.y}%` }}
          />
          <div
            className="absolute bg-black/60 pointer-events-none"
            style={{ bottom: 0, left: 0, right: 0, top: `${crop.y + crop.height}%` }}
          />
          <div
            className="absolute bg-black/60 pointer-events-none"
            style={{
              top: `${crop.y}%`,
              bottom: `${100 - crop.y - crop.height}%`,
              left: 0,
              width: `${crop.x}%`,
            }}
          />
          <div
            className="absolute bg-black/60 pointer-events-none"
            style={{
              top: `${crop.y}%`,
              bottom: `${100 - crop.y - crop.height}%`,
              right: 0,
              left: `${crop.x + crop.width}%`,
            }}
          />

          {/* Resizable Crop Box */}
          <div
            className={`absolute border-2 border-accent-blue cursor-grab ${
              activeDrag === "move" ? "cursor-grabbing" : ""
            }`}
            style={{
              left: `${crop.x}%`,
              top: `${crop.y}%`,
              width: `${crop.width}%`,
              height: `${crop.height}%`,
            }}
            onMouseDown={(e) => startDrag("move", e)}
            onTouchStart={(e) => startDrag("move", e)}
          >
            {/* Rule of Thirds Guideline Grid (visible during drag) */}
            {activeDrag && (
              <div className="absolute inset-0 grid grid-cols-3 grid-rows-3 pointer-events-none">
                <div className="border-r border-b border-accent-blue/30" />
                <div className="border-r border-b border-accent-blue/30" />
                <div className="border-b border-accent-blue/30" />
                <div className="border-r border-b border-accent-blue/30" />
                <div className="border-r border-b border-accent-blue/30" />
                <div className="border-b border-accent-blue/30" />
                <div className="border-r border-accent-blue/30" />
                <div className="border-r border-accent-blue/30" />
                <div />
              </div>
            )}

            {/* Corner Resize Handles */}
            <div
              onMouseDown={(e) => startDrag("top-left", e)}
              onTouchStart={(e) => startDrag("top-left", e)}
              className="absolute -top-1.5 -left-1.5 w-3 h-3 bg-white border border-accent-blue rounded-sm cursor-nwse-resize hover:scale-125 transition-transform"
            />
            <div
              onMouseDown={(e) => startDrag("top-right", e)}
              onTouchStart={(e) => startDrag("top-right", e)}
              className="absolute -top-1.5 -right-1.5 w-3 h-3 bg-white border border-accent-blue rounded-sm cursor-nesw-resize hover:scale-125 transition-transform"
            />
            <div
              onMouseDown={(e) => startDrag("bottom-left", e)}
              onTouchStart={(e) => startDrag("bottom-left", e)}
              className="absolute -bottom-1.5 -left-1.5 w-3 h-3 bg-white border border-accent-blue rounded-sm cursor-nesw-resize hover:scale-125 transition-transform"
            />
            <div
              onMouseDown={(e) => startDrag("bottom-right", e)}
              onTouchStart={(e) => startDrag("bottom-right", e)}
              className="absolute -bottom-1.5 -right-1.5 w-3 h-3 bg-white border border-accent-blue rounded-sm cursor-nwse-resize hover:scale-125 transition-transform"
            />

            {/* Edge Resize Handles (Only for Free aspect ratio) */}
            {aspectRatio === "Free" && (
              <>
                <div
                  onMouseDown={(e) => startDrag("top", e)}
                  onTouchStart={(e) => startDrag("top", e)}
                  className="absolute -top-1 left-1/2 -translate-x-1/2 w-6 h-2 hover:bg-white/30 rounded-full cursor-ns-resize"
                />
                <div
                  onMouseDown={(e) => startDrag("bottom", e)}
                  onTouchStart={(e) => startDrag("bottom", e)}
                  className="absolute -bottom-1 left-1/2 -translate-x-1/2 w-6 h-2 hover:bg-white/30 rounded-full cursor-ns-resize"
                />
                <div
                  onMouseDown={(e) => startDrag("left", e)}
                  onTouchStart={(e) => startDrag("left", e)}
                  className="absolute -left-1 top-1/2 -translate-y-1/2 w-2 h-6 hover:bg-white/30 rounded-full cursor-ew-resize"
                />
                <div
                  onMouseDown={(e) => startDrag("right", e)}
                  onTouchStart={(e) => startDrag("right", e)}
                  className="absolute -right-1 top-1/2 -translate-y-1/2 w-2 h-6 hover:bg-white/30 rounded-full cursor-ew-resize"
                />
              </>
            )}
          </div>
        </div>
      </div>

      {/* Coordinate Precision Controllers */}
      <div className="bg-surface border border-hairline p-4 rounded-lg">
        <span className="text-xs text-mute block mb-3 font-medium">Precision Controls (Percentages)</span>
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
          <div>
            <label className="text-[11px] text-mute block mb-1">Offset X</label>
            <input
              type="number"
              min="0"
              max={100 - crop.width}
              step="0.5"
              value={crop.x}
              onChange={(e) => handleInputChange("x", parseFloat(e.target.value) || 0)}
              className="w-full bg-surface-elevated border border-hairline rounded px-2.5 py-1 text-ink font-mono text-sm focus:border-stone outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] text-mute block mb-1">Offset Y</label>
            <input
              type="number"
              min="0"
              max={100 - crop.height}
              step="0.5"
              value={crop.y}
              onChange={(e) => handleInputChange("y", parseFloat(e.target.value) || 0)}
              className="w-full bg-surface-elevated border border-hairline rounded px-2.5 py-1 text-ink font-mono text-sm focus:border-stone outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] text-mute block mb-1">Crop Width</label>
            <input
              type="number"
              min="10"
              max={100 - crop.x}
              step="0.5"
              value={crop.width}
              onChange={(e) => handleInputChange("width", parseFloat(e.target.value) || 0)}
              className="w-full bg-surface-elevated border border-hairline rounded px-2.5 py-1 text-ink font-mono text-sm focus:border-stone outline-none transition-colors"
            />
          </div>
          <div>
            <label className="text-[11px] text-mute block mb-1">Crop Height</label>
            <input
              type="number"
              min="10"
              max={100 - crop.y}
              step="0.5"
              value={crop.height}
              disabled={aspectRatio !== "Free"}
              onChange={(e) => handleInputChange("height", parseFloat(e.target.value) || 0)}
              className="w-full bg-surface-elevated border border-hairline rounded px-2.5 py-1 text-ink font-mono text-sm focus:border-stone outline-none transition-colors disabled:opacity-40"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
