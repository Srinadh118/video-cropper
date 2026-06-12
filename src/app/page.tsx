"use client";

import React, { useState, useRef, useEffect } from "react";
import VideoUpload from "@/components/VideoUpload";
import CropWorkspace from "@/components/CropWorkspace";
import TrimTimeline from "@/components/TrimTimeline";
import ExportProgress from "@/components/ExportProgress";
import ExportCompleted from "@/components/ExportCompleted";

type AppStep = "UPLOAD" | "EDIT" | "EXPORT" | "COMPLETED";

interface CropRect {
  x: number;
  y: number;
  width: number;
  height: number;
}

export default function Home() {
  const [step, setStep] = useState<AppStep>("UPLOAD");
  const [videoFile, setVideoFile] = useState<File | null>(null);
  const [videoSrc, setVideoSrc] = useState<string>("");

  // Crop Rect in percentages (x, y, width, height)
  const [crop, setCrop] = useState<CropRect>({ x: 0, y: 0, width: 100, height: 100 });
  const [aspectRatio, setAspectRatio] = useState<string>("Free");
  const [includeAudio, setIncludeAudio] = useState<boolean>(true);
  const [exportFormat, setExportFormat] = useState<"mp4" | "webm">("mp4");

  // Timeline Trim Settings (in seconds)
  const [duration, setDuration] = useState<number>(0);
  const [startTime, setStartTime] = useState<number>(0);
  const [endTime, setEndTime] = useState<number>(0);
  const [currentTime, setCurrentTime] = useState<number>(0);
  const [isPlaying, setIsPlaying] = useState<boolean>(false);

  // Export Results
  const [videoDims, setVideoDims] = useState({ width: 0, height: 0 });
  const [exportBlob, setExportBlob] = useState<Blob | null>(null);
  const [exportMimeType, setExportMimeType] = useState<string>("");

  const videoRef = useRef<HTMLVideoElement | null>(null);

  // Reset all states
  const handleRestart = () => {
    if (videoSrc) {
      URL.revokeObjectURL(videoSrc);
    }
    setVideoFile(null);
    setVideoSrc("");
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
    setAspectRatio("Free");
    setIncludeAudio(true);
    setExportFormat("mp4");
    setDuration(0);
    setStartTime(0);
    setEndTime(0);
    setCurrentTime(0);
    setIsPlaying(false);
    setExportBlob(null);
    setExportMimeType("");
    setStep("UPLOAD");
  };

  // Helper to enforce aspect ratio on crop changes
  const enforceRatio = (rect: CropRect, ratioStr: string, vWidth: number, vHeight: number): CropRect => {
    const getRatioValue = (ratio: string): number | null => {
      switch (ratio) {
        case "16:9": return 16 / 9;
        case "9:16": return 9 / 16;
        case "1:1": return 1;
        case "4:3": return 4 / 3;
        default: return null;
      }
    };

    const targetRatio = getRatioValue(ratioStr);
    if (!targetRatio || vWidth === 0 || vHeight === 0) return rect;

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

    setCrop({
      x: Number(nextCrop.x.toFixed(2)),
      y: Number(nextCrop.y.toFixed(2)),
      width: Number(nextCrop.width.toFixed(2)),
      height: Number(nextCrop.height.toFixed(2)),
    });
  };

  const handleVideoSelected = (file: File) => {
    setVideoFile(file);
    const src = URL.createObjectURL(file);
    setVideoSrc(src);
    setStep("EDIT");
  };

  const handleMetadataLoaded = (meta: { duration: number; width: number; height: number }) => {
    setDuration(meta.duration);
    setStartTime(0);
    setEndTime(meta.duration);
    setVideoDims({ width: meta.width, height: meta.height });
  };

  // Video playback loops between startTime and endTime
  useEffect(() => {
    const video = videoRef.current;
    if (!video || step !== "EDIT") return;

    if (isPlaying) {
      video.play().catch((err) => {
        setIsPlaying(false);
        console.warn("Video playback was interrupted:", err);
      });
    } else {
      video.pause();
    }
  }, [isPlaying, step]);

  useEffect(() => {
    const video = videoRef.current;
    if (!video || step !== "EDIT") return;

    const handleTimeUpdate = () => {
      setCurrentTime(video.currentTime);

      // Auto-loop playhead within trimmed region
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
        setCurrentTime(startTime);
        if (!isPlaying) {
          video.pause();
        }
      }
    };

    const handlePauseState = () => {
      if (video.currentTime < endTime) {
        setIsPlaying(false);
      }
    };

    video.addEventListener("timeupdate", handleTimeUpdate);
    video.addEventListener("pause", handlePauseState);

    return () => {
      video.removeEventListener("timeupdate", handleTimeUpdate);
      video.removeEventListener("pause", handlePauseState);
    };
  }, [startTime, endTime, isPlaying, step]);

  const handleTrimChange = (start: number, end: number) => {
    setStartTime(start);
    setEndTime(end);
  };

  const handleSeek = (time: number) => {
    const video = videoRef.current;
    if (video) {
      video.currentTime = time;
      setCurrentTime(time);
    }
  };

  const handleTogglePlay = () => {
    setIsPlaying((prev) => !prev);
  };

  const startExport = () => {
    setIsPlaying(false);
    setStep("EXPORT");
  };

  const handleExportCancel = () => {
    setStep("EDIT");
  };

  const handleExportComplete = (blob: Blob, mimeType: string) => {
    setExportBlob(blob);
    setExportMimeType(mimeType);
    setStep("COMPLETED");
  };

  return (
    <div className="min-h-screen flex flex-col bg-canvas text-body selection:bg-accent-blue/20 selection:text-ink">
      {/* Decorative Red Stripes Banner at top (DESIGN.md launch-banner motif) */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden h-2 pointer-events-none select-none flex justify-center gap-1.5 opacity-80 z-50">
        <div className="w-28 h-full bg-gradient-to-r from-hero-stripe-start to-hero-stripe-end transform -skew-x-12" />
        <div className="w-28 h-full bg-gradient-to-r from-hero-stripe-start to-hero-stripe-end transform -skew-x-12" />
        <div className="w-28 h-full bg-gradient-to-r from-hero-stripe-start to-hero-stripe-end transform -skew-x-12" />
      </div>

      {/* Navigation Header (DESIGN.md primary-nav) */}
      <header className="w-full bg-canvas border-b border-hairline h-14 flex items-center px-6 sticky top-0 z-40">
        <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleRestart}>
            {/* Visual Logo Accent (Hacker News yellow/orange category detail) */}
            <div className="w-6 h-6 rounded bg-accent-yellow-soft border border-accent-yellow/20 flex items-center justify-center text-accent-yellow">
              <svg
                xmlns="http://www.w3.org/2000/svg"
                viewBox="0 0 20 20"
                fill="currentColor"
                className="w-3.5 h-3.5"
              >
                <path d="M10 3.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM17.25 4.5a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0 0 1.5h2.25a.75.75 0 0 0 .75-.75ZM17.25 15.5a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0 0 1.5h2.25a.75.75 0 0 0 .75-.75ZM5.75 16.25a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H6.5a.75.75 0 0 1-.75-.75ZM10 16.25a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14.25 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
              </svg>
            </div>
            <span className="font-semibold text-ink text-sm tracking-tight font-sans">
              VideoCrop
            </span>
          </div>

          <div className="flex items-center gap-4">
            <a
              href="https://github.com"
              target="_blank"
              rel="noopener noreferrer"
              className="text-xs text-mute hover:text-ink transition-colors font-medium"
            >
              GitHub
            </a>
            {step !== "UPLOAD" && (
              <button
                onClick={handleRestart}
                className="h-7 px-3 bg-primary-cta text-on-primary hover:bg-primary-cta-pressed text-xs font-semibold rounded-md transition-colors"
              >
                Start New
              </button>
            )}
          </div>
        </div>
      </header>

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 py-10 flex flex-col items-center justify-center gap-12">
        {step === "UPLOAD" && (
          <div className="flex flex-col gap-10 w-full items-center text-center">
            {/* Hero Section */}
            <div className="flex flex-col gap-4 max-w-2xl">
              <h1 className="text-4xl sm:text-5xl font-semibold text-ink tracking-tight leading-tight">
                Crop videos in your browser. <span className="text-accent-blue">Privately.</span>
              </h1>
              <p className="text-base sm:text-lg text-mute max-w-lg mx-auto leading-relaxed">
                Client-side video trimming and cropping. Your files never touch a server, preserving complete privacy.
              </p>
            </div>

            {/* Drag & Drop Area */}
            <VideoUpload onVideoSelected={handleVideoSelected} />
          </div>
        )}

        {step === "EDIT" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cropping preview & presets workspace */}
            <div className="lg:col-span-2 flex flex-col gap-6 w-full">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-medium text-ink">Crop Video Area</h2>
                <div className="flex items-center gap-2 text-xs text-mute font-mono">
                  <span>Input Dims:</span>
                  <span className="text-ink">{videoDims.width} × {videoDims.height}</span>
                </div>
              </div>

              <CropWorkspace
                videoSrc={videoSrc}
                crop={crop}
                onCropChange={setCrop}
                videoRef={videoRef}
                onVideoMetadata={handleMetadataLoaded}
                aspectRatio={aspectRatio}
                onAspectRatioChange={setAspectRatio}
              />

              {/* Range Trimmer (swapped directly under video) */}
              <TrimTimeline
                videoSrc={videoSrc}
                videoDuration={duration}
                startTime={startTime}
                endTime={endTime}
                currentTime={currentTime}
                onTrimChange={handleTrimChange}
                onSeek={handleSeek}
                isPlaying={isPlaying}
                onTogglePlay={handleTogglePlay}
              />
            </div>

            {/* Editor Control Center Sidebar */}
            <div className="flex flex-col gap-6 w-full lg:sticky lg:top-24">
              <div className="flex items-center justify-between min-h-[28px]">
                <h2 className="text-lg font-medium text-ink">Export Configuration</h2>
              </div>

              {/* Aspect Ratio Selector (moved to sidebar) */}
              <div className="bg-surface border border-hairline p-4 rounded-lg flex flex-col gap-3">
                <span className="text-xs text-mute block font-medium">Aspect Ratio Presets</span>
                <div className="flex flex-wrap gap-1.5">
                  {["Free", "16:9", "9:16", "1:1", "4:3"].map((ratio) => (
                    <button
                      key={ratio}
                      onClick={() => setAspectRatio(ratio)}
                      className={`px-2.5 py-1 text-xs rounded-full font-medium transition-all duration-150 border
                        ${aspectRatio === ratio
                          ? "bg-surface-elevated text-ink border-stone"
                          : "bg-transparent text-mute border-transparent hover:text-ink hover:bg-surface-card"
                        }
                      `}
                    >
                      {ratio}
                    </button>
                  ))}
                </div>
              </div>

              {/* Precision Controls (Percentages) (swapped to sidebar) */}
              <div className="bg-surface border border-hairline p-4 rounded-lg flex flex-col gap-3">
                <span className="text-xs text-mute block font-medium">Precision Controls (Percentages)</span>
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="text-[11px] text-mute block mb-1">Offset X</label>
                    <input
                      type="number"
                      min="0"
                      max={Math.max(0, 100 - crop.width)}
                      step="0.5"
                      value={crop.x}
                      onChange={(e) => handleInputChange("x", parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-elevated border border-hairline rounded px-2.5 py-1.5 text-ink font-mono text-xs focus:border-stone outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-mute block mb-1">Offset Y</label>
                    <input
                      type="number"
                      min="0"
                      max={Math.max(0, 100 - crop.height)}
                      step="0.5"
                      value={crop.y}
                      onChange={(e) => handleInputChange("y", parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-elevated border border-hairline rounded px-2.5 py-1.5 text-ink font-mono text-xs focus:border-stone outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-mute block mb-1">Crop Width</label>
                    <input
                      type="number"
                      min="10"
                      max={Math.max(10, 100 - crop.x)}
                      step="0.5"
                      value={crop.width}
                      onChange={(e) => handleInputChange("width", parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-elevated border border-hairline rounded px-2.5 py-1.5 text-ink font-mono text-xs focus:border-stone outline-none transition-colors"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] text-mute block mb-1">Crop Height</label>
                    <input
                      type="number"
                      min="10"
                      max={Math.max(10, 100 - crop.y)}
                      step="0.5"
                      value={crop.height}
                      disabled={aspectRatio !== "Free"}
                      onChange={(e) => handleInputChange("height", parseFloat(e.target.value) || 0)}
                      className="w-full bg-surface-elevated border border-hairline rounded px-2.5 py-1.5 text-ink font-mono text-xs focus:border-stone outline-none transition-colors disabled:opacity-40"
                    />
                  </div>
                </div>
              </div>

              {/* Export settings panel with Format selector */}
              <div className="bg-surface border border-hairline p-4 rounded-lg flex flex-col gap-4">
                <span className="text-xs text-mute block font-medium">Export Settings</span>

                {/* Format selection */}
                <div className="flex flex-col gap-2 border-b border-hairline/50 pb-3">
                  <span className="text-[11px] text-mute font-medium">Output Format</span>
                  <div className="flex bg-surface-elevated p-0.5 rounded border border-hairline gap-1">
                    <button
                      onClick={() => setExportFormat("mp4")}
                      className={`flex-1 py-1 text-[11px] font-semibold rounded transition-all duration-150
                        ${exportFormat === "mp4"
                          ? "bg-surface text-ink shadow"
                          : "text-mute hover:text-ink"
                        }
                      `}
                    >
                      MP4
                    </button>
                    <button
                      onClick={() => setExportFormat("webm")}
                      className={`flex-1 py-1 text-[11px] font-semibold rounded transition-all duration-150
                        ${exportFormat === "webm"
                          ? "bg-surface text-ink shadow"
                          : "text-mute hover:text-ink"
                        }
                      `}
                    >
                      WebM
                    </button>
                  </div>
                </div>

                {/* Audio settings */}
                <label className="flex items-center justify-between cursor-pointer group py-1">
                  <div className="flex flex-col">
                    <span className="text-xs text-ink font-medium">Retain Audio Track</span>
                    <span className="text-[11px] text-mute mt-0.5">Keep sound in the exported video</span>
                  </div>
                  <div className="relative">
                    <input
                      type="checkbox"
                      checked={includeAudio}
                      onChange={(e) => setIncludeAudio(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-8 h-4.5 bg-surface-elevated rounded-full border border-hairline peer-checked:bg-accent-blue peer-checked:border-accent-blue/30 transition-colors after:content-[''] after:absolute after:top-0.5 after:left-0.5 after:bg-mute peer-checked:after:bg-canvas after:rounded-full after:h-3.5 after:w-3.5 after:transition-transform peer-checked:after:translate-x-3.5" />
                  </div>
                </label>
              </div>

              {/* Primary export action button */}
              <button
                onClick={startExport}
                className="w-full flex items-center justify-center gap-2 h-10 bg-primary-cta text-on-primary hover:bg-primary-cta-pressed text-sm font-semibold rounded-md transition-colors"
              >
                <span>Export Cropped Video</span>
              </button>
            </div>
          </div>
        )}

        {step === "EXPORT" && (
          <ExportProgress
            videoSrc={videoSrc}
            crop={crop}
            startTime={startTime}
            endTime={endTime}
            videoDims={videoDims}
            includeAudio={includeAudio}
            exportFormat={exportFormat}
            onCancel={handleExportCancel}
            onComplete={handleExportComplete}
          />
        )}

        {step === "COMPLETED" && exportBlob && (
          <ExportCompleted
            blob={exportBlob}
            mimeType={exportMimeType}
            originalName={videoFile?.name || "video.mp4"}
            onRestart={handleRestart}
          />
        )}
      </main>

      {/* Footer (DESIGN.md footer-section) */}
      <footer className="w-full bg-canvas border-t border-hairline mt-auto">
        {/* Subtle red stripe gradient echo at footer top */}
        <div className="h-[2px] bg-gradient-to-r from-hero-stripe-start/15 to-hero-stripe-end/15 w-full" />

        <div className="max-w-6xl w-full mx-auto p-6 flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-mute font-sans">
          <div className="flex items-center gap-2.5">
            <span className="font-semibold text-ink">VideoCrop</span>
            <span className="text-stone">|</span>
            <span>Local Web Processing Engine</span>
          </div>
          <div>
            <span>No data uploads. Private. Open-source under MIT license.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
