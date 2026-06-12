"use client";

import React, { useRef, useEffect, useState } from "react";

interface TrimTimelineProps {
  videoSrc: string;
  videoDuration: number;
  startTime: number;
  endTime: number;
  currentTime: number;
  onTrimChange: (start: number, end: number) => void;
  onSeek: (time: number) => void;
  isPlaying: boolean;
  onTogglePlay: () => void;
}

export default function TrimTimeline({
  videoSrc,
  videoDuration,
  startTime,
  endTime,
  currentTime,
  onTrimChange,
  onSeek,
  isPlaying,
  onTogglePlay,
}: TrimTimelineProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [activeDrag, setActiveDrag] = useState<"start" | "end" | "playhead" | null>(null);
  const [thumbnails, setThumbnails] = useState<string[]>([]);
  const [isLoadingThumbs, setIsLoadingThumbs] = useState<boolean>(false);

  // Generate timeline thumbnails asynchronously
  useEffect(() => {
    if (videoDuration === 0 || !videoSrc) {
      setThumbnails([]);
      return;
    }

    let active = true;
    setIsLoadingThumbs(true);
    const generatedThumbs: string[] = [];
    const numFrames = 10; // Number of frames to display in the strip
    const interval = videoDuration / numFrames;
    const times = Array.from({ length: numFrames }, (_, i) => i * interval + 0.05); // slight offset from 0

    const tempVideo = document.createElement("video");
    tempVideo.src = videoSrc;
    tempVideo.muted = true;
    tempVideo.playsInline = true;
    tempVideo.preload = "auto";

    const canvas = document.createElement("canvas");
    const ctx = canvas.getContext("2d");
    
    // Scale canvas to a small thumbnail resolution (low-res is perfect and extremely fast)
    canvas.width = 80;
    canvas.height = 45;

    let currentIndex = 0;

    const captureNextFrame = () => {
      if (!active) return;
      if (currentIndex >= times.length) {
        setThumbnails(generatedThumbs);
        setIsLoadingThumbs(false);
        tempVideo.remove();
        return;
      }
      tempVideo.currentTime = times[currentIndex];
    };

    const handleSeeked = () => {
      if (!active) return;
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        ctx.drawImage(tempVideo, 0, 0, canvas.width, canvas.height);
        try {
          const dataUrl = canvas.toDataURL("image/jpeg", 0.4);
          generatedThumbs.push(dataUrl);
        } catch (e) {
          console.warn("Failed to capture timeline frame:", e);
        }
      }
      currentIndex++;
      captureNextFrame();
    };

    tempVideo.addEventListener("seeked", handleSeeked);
    
    tempVideo.addEventListener("loadedmetadata", () => {
      if (!active) return;
      captureNextFrame();
    });

    tempVideo.load();

    return () => {
      active = false;
      tempVideo.removeEventListener("seeked", handleSeeked);
      tempVideo.remove();
    };
  }, [videoSrc, videoDuration]);

  // Format seconds to MM:SS.CC (Minutes, Seconds, Centiseconds)
  const formatTime = (time: number) => {
    const minutes = Math.floor(time / 60);
    const seconds = Math.floor(time % 60);
    const centiseconds = Math.floor((time % 1) * 100);
    return `${minutes.toString().padStart(2, "0")}:${seconds
      .toString()
      .padStart(2, "0")}.${centiseconds.toString().padStart(2, "0")}`;
  };

  const handleMouseDown = (type: "start" | "end" | "playhead", e: React.MouseEvent | React.TouchEvent) => {
    e.preventDefault();
    setActiveDrag(type);
    if (isPlaying) {
      onTogglePlay();
    }
  };

  useEffect(() => {
    const handleMouseMove = (e: MouseEvent | TouchEvent) => {
      if (!activeDrag || !containerRef.current) return;

      const rect = containerRef.current.getBoundingClientRect();
      const clientX = "touches" in e ? e.touches[0].clientX : e.clientX;
      const x = clientX - rect.left;
      const percentage = Math.min(100, Math.max(0, x / rect.width));
      const targetTime = percentage * videoDuration;

      const minClipDuration = 0.5; // half a second minimum

      if (activeDrag === "start") {
        const newStart = Math.min(targetTime, endTime - minClipDuration);
        onTrimChange(Math.max(0, newStart), endTime);
        if (currentTime < newStart) {
          onSeek(newStart);
        }
      } else if (activeDrag === "end") {
        const newEnd = Math.max(targetTime, startTime + minClipDuration);
        onTrimChange(startTime, Math.min(videoDuration, newEnd));
        if (currentTime > newEnd) {
          onSeek(startTime);
        }
      } else if (activeDrag === "playhead") {
        const newPlay = Math.min(Math.max(startTime, targetTime), endTime);
        onSeek(newPlay);
      }
    };

    const handleMouseUp = () => {
      setActiveDrag(null);
    };

    if (activeDrag) {
      window.addEventListener("mousemove", handleMouseMove);
      window.addEventListener("mouseup", handleMouseUp);
      window.addEventListener("touchmove", handleMouseMove);
      window.addEventListener("touchend", handleMouseUp);
    }

    return () => {
      window.removeEventListener("mousemove", handleMouseMove);
      window.removeEventListener("mouseup", handleMouseUp);
      window.removeEventListener("touchmove", handleMouseMove);
      window.removeEventListener("touchend", handleMouseUp);
    };
  }, [activeDrag, videoDuration, startTime, endTime, currentTime, onTrimChange, onSeek]);

  const handleTrackClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (e.target !== containerRef.current && !(e.target as HTMLElement).classList.contains("timeline-fill")) {
      return;
    }
    if (!containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const percentage = x / rect.width;
    const clickedTime = percentage * videoDuration;
    
    // Position playhead closest to click if it's within range
    const targetPlay = Math.min(Math.max(startTime, clickedTime), endTime);
    onSeek(targetPlay);
  };

  const startPercent = (startTime / videoDuration) * 100;
  const endPercent = (endTime / videoDuration) * 100;
  const playheadPercent = (currentTime / videoDuration) * 100;

  // Fine adjustments helper
  const adjustTime = (type: "start" | "end", amount: number) => {
    const minClipDuration = 0.5;
    if (type === "start") {
      const newStart = Math.min(Math.max(0, startTime + amount), endTime - minClipDuration);
      onTrimChange(newStart, endTime);
      onSeek(newStart);
    } else {
      const newEnd = Math.min(Math.max(startTime + minClipDuration, endTime + amount), videoDuration);
      onTrimChange(startTime, newEnd);
      onSeek(startTime);
    }
  };

  return (
    <div className="flex flex-col gap-4 w-full bg-surface border border-hairline p-4 rounded-lg">
      <div className="flex items-center justify-between text-xs text-mute">
        <div className="flex items-center gap-1.5">
          <span>Timeline Settings</span>
          <button
            onClick={() => {
              onTrimChange(0, videoDuration);
              onSeek(0);
            }}
            disabled={startTime === 0 && endTime === videoDuration && currentTime === 0}
            title="Reset Timeline Trimming"
            className="p-1 hover:bg-surface-elevated text-stone hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent rounded transition-all cursor-pointer disabled:cursor-not-allowed"
          >
            <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3 h-3">
              <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
            </svg>
          </button>
        </div>
        <div className="flex items-center gap-1.5 bg-surface-elevated px-2 py-0.5 rounded border border-hairline">
          <span className="text-ink font-mono">{formatTime(currentTime)}</span>
          <span className="text-stone">/</span>
          <span className="font-mono">{formatTime(videoDuration)}</span>
        </div>
      </div>

      {/* Timeline track wrapper */}
      <div className="relative h-16 flex items-center select-none py-2">
        <div
          ref={containerRef}
          onClick={handleTrackClick}
          className="relative w-full h-12 bg-surface-elevated rounded-sm border border-hairline cursor-pointer"
        >
          {/* Timeline background thumbnails */}
          {thumbnails.length > 0 && (
            <div className="absolute inset-0 flex overflow-hidden opacity-30 pointer-events-none">
              {thumbnails.map((src, index) => (
                <img
                  key={index}
                  src={src}
                  alt=""
                  className="h-full flex-1 object-cover border-r border-hairline/10 last:border-r-0"
                />
              ))}
            </div>
          )}

          {/* Trimmed selection highlight */}
          <div
            className="timeline-fill absolute h-full bg-accent-blue-soft border-l border-r border-accent-blue/30"
            style={{
              left: `${startPercent}%`,
              width: `${endPercent - startPercent}%`,
            }}
          />

          {/* Unselected darker region: Left */}
          <div
            className="absolute left-0 top-0 h-full bg-black/40 pointer-events-none rounded-l-sm"
            style={{ width: `${startPercent}%` }}
          />

          {/* Unselected darker region: Right */}
          <div
            className="absolute right-0 top-0 h-full bg-black/40 pointer-events-none rounded-r-sm"
            style={{ left: `${endPercent}%` }}
          />

          {/* Left Handle (Start Trim) */}
          <div
            onMouseDown={(e) => handleMouseDown("start", e)}
            onTouchStart={(e) => handleMouseDown("start", e)}
            className="absolute top-1/2 -translate-y-1/2 -ml-2.5 w-5 h-7 rounded-sm bg-ink border border-hairline hover:bg-white flex items-center justify-center cursor-ew-resize transition-colors z-10"
            style={{ left: `${startPercent}%` }}
          >
            <div className="flex flex-col gap-0.5 pointer-events-none">
              <span className="w-0.5 h-3 bg-stone rounded-full" />
            </div>
          </div>

          {/* Right Handle (End Trim) */}
          <div
            onMouseDown={(e) => handleMouseDown("end", e)}
            onTouchStart={(e) => handleMouseDown("end", e)}
            className="absolute top-1/2 -translate-y-1/2 -mr-2.5 w-5 h-7 rounded-sm bg-ink border border-hairline hover:bg-white flex items-center justify-center cursor-ew-resize transition-colors z-10"
            style={{ left: `${endPercent}%` }}
          >
            <div className="flex flex-col gap-0.5 pointer-events-none">
              <span className="w-0.5 h-3 bg-stone rounded-full" />
            </div>
          </div>

          {/* Playhead */}
          <div
            onMouseDown={(e) => handleMouseDown("playhead", e)}
            onTouchStart={(e) => handleMouseDown("playhead", e)}
            className="absolute top-0 bottom-0 -ml-1.5 w-3 pointer-events-auto cursor-col-resize z-20"
            style={{ left: `${playheadPercent}%` }}
          >
            <div className="w-[2px] h-[calc(100%+8px)] -mt-[4px] mx-auto bg-accent-red" />
            <div className="w-2.5 h-2.5 rounded-full bg-accent-red mx-auto -mt-[58px]" />
          </div>
        </div>
      </div>

      {/* Control row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
        {/* Fine-tune Start */}
        <div className="flex items-center gap-2 justify-between md:justify-start">
          <div className="flex flex-col">
            <span className="text-xs text-mute">Start Trim</span>
            <span className="text-sm text-ink font-mono mt-0.5">{formatTime(startTime)}</span>
          </div>
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustTime("start", -0.1)}
              className="px-2 py-1 bg-surface-elevated border border-hairline text-xs font-mono text-mute hover:text-ink hover:border-stone rounded transition-colors"
            >
              -0.1s
            </button>
            <button
              onClick={() => adjustTime("start", 0.1)}
              className="px-2 py-1 bg-surface-elevated border border-hairline text-xs font-mono text-mute hover:text-ink hover:border-stone rounded transition-colors"
            >
              +0.1s
            </button>
          </div>
        </div>

        {/* Play/Pause Center */}
        <div className="flex justify-center">
          <button
            onClick={onTogglePlay}
            className="flex items-center gap-2 px-4 py-1.5 bg-surface-elevated border border-hairline hover:bg-surface-card hover:border-stone text-sm text-ink rounded-md transition-colors font-medium"
          >
            {isPlaying ? (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M6.75 5.25a.75.75 0 0 1 .75-.75H9a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H7.5a.75.75 0 0 1-.75-.75V5.25Zm7.5 0A.75.75 0 0 1 15 4.5h1.5a.75.75 0 0 1 .75.75v13.5a.75.75 0 0 1-.75.75H15a.75.75 0 0 1-.75-.75V5.25Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Pause</span>
              </>
            ) : (
              <>
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path
                    fillRule="evenodd"
                    d="M4.5 5.653c0-1.427 1.529-2.33 2.779-1.643l11.54 6.347c1.295.712 1.295 2.573 0 3.286L7.28 19.99c-1.25.687-2.779-.217-2.779-1.643V5.653Z"
                    clipRule="evenodd"
                  />
                </svg>
                <span>Play</span>
              </>
            )}
          </button>
        </div>

        {/* Fine-tune End */}
        <div className="flex items-center gap-2 justify-between md:justify-end">
          <div className="flex items-center gap-1">
            <button
              onClick={() => adjustTime("end", -0.1)}
              className="px-2 py-1 bg-surface-elevated border border-hairline text-xs font-mono text-mute hover:text-ink hover:border-stone rounded transition-colors"
            >
              -0.1s
            </button>
            <button
              onClick={() => adjustTime("end", 0.1)}
              className="px-2 py-1 bg-surface-elevated border border-hairline text-xs font-mono text-mute hover:text-ink hover:border-stone rounded transition-colors"
            >
              +0.1s
            </button>
          </div>
          <div className="flex flex-col text-right">
            <span className="text-xs text-mute">End Trim</span>
            <span className="text-sm text-ink font-mono mt-0.5">{formatTime(endTime)}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
