"use client";

import React, { useState, useRef, useEffect } from "react";
import VideoUpload from "@/components/VideoUpload";
import CropWorkspace from "@/components/CropWorkspace";
import TrimTimeline from "@/components/TrimTimeline";
import ExportProgress from "@/components/ExportProgress";
import ExportCompleted from "@/components/ExportCompleted";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import PWAInstallBanner from "@/components/PWAInstallBanner";

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

  // Reset all editor settings without clearing the loaded video
  const handleResetAllSettings = () => {
    setCrop({ x: 0, y: 0, width: 100, height: 100 });
    setAspectRatio("Free");
    setIncludeAudio(true);
    setExportFormat("mp4");
    setStartTime(0);
    setEndTime(duration);
    handleSeek(0);
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
      // If the video is paused/scrubbing or seeking, prevent background events
      // from overwriting the current state.
      if (!isPlaying) return;
      if (video.seeking) return;

      // Auto-loop playhead within trimmed region
      if (video.currentTime >= endTime) {
        video.currentTime = startTime;
        setCurrentTime(startTime);
        return;
      }

      setCurrentTime(video.currentTime);
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
      {/* Navigation Header (DESIGN.md primary-nav) */}
      <Header onRestart={handleRestart} showStartNew={step !== "UPLOAD"} />

      {/* Main Container */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-6 pt-10 pb-12 flex flex-col items-center justify-center gap-12">
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

            {/* PWA Install Banner */}
            <PWAInstallBanner />

            {/* Drag & Drop Area */}
            <VideoUpload onVideoSelected={handleVideoSelected} />

            {/* SEO Content Section */}
            <div className="mt-20 max-w-4xl w-full text-left border-t border-hairline/60 pt-16 flex flex-col gap-12">
              <div className="flex flex-col gap-4">
                <h2 className="text-2xl sm:text-3xl font-semibold text-ink tracking-tight">
                  Free Video Cropper — The Ultimate Online Video Cropper and Editor
                </h2>
                <p className="text-sm sm:text-base text-mute leading-relaxed">
                  Welcome to <strong className="text-ink font-semibold">freevideocropper</strong>, a privacy-first <strong className="text-ink font-semibold">free online video cropper</strong> engineered for lightning-fast edits without compromising your security. Whether you are looking for a reliable <strong className="text-ink font-semibold">video cropper tool</strong> or need to crop clips for social media, our platform performs all processing locally on your device. This means you get a powerful <strong className="text-ink font-semibold">video cropper online free</strong> of server uploads, latency, or tracking. As a client-side <strong className="text-ink font-semibold">video cropper and editor</strong>, your files are never transmitted over the internet, keeping your personal content 100% private.
                </p>
                <p className="text-sm sm:text-base text-mute leading-relaxed">
                  This multi-functional tool serves as a lightweight <strong className="text-ink font-semibold">mp4 video cropper</strong> and a comprehensive web-based video trimmer. By running fully in the web browser, it acts as a native-feeling <strong className="text-ink font-semibold">video cropper windows 10</strong>, macOS, or Linux utility without requiring any installations or setup. From quick trimming to adjusting aspect ratios, our engine makes it easier than ever to <strong className="text-ink font-semibold">video crop online</strong>.
                </p>
              </div>

              {/* Core Features Grid */}
              <div className="flex flex-col gap-6">
                <h3 className="text-lg font-medium text-ink tracking-tight">Core Features & Capabilities</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="bg-surface border border-hairline p-5 rounded-lg flex flex-col gap-2">
                    <h4 className="text-sm font-semibold text-ink">Video Cropper No Watermark</h4>
                    <p className="text-xs text-mute leading-relaxed">
                      Most web tools lock premium files or plaster ugly logos on exports. Our <strong className="text-ink font-medium">video cropper free</strong> tier guarantees high-quality, watermark-free results. Download clean renders that are instantly ready for professional distributions.
                    </p>
                  </div>
                  
                  <div className="bg-surface border border-hairline p-5 rounded-lg flex flex-col gap-2">
                    <h4 className="text-sm font-semibold text-ink">Flexible Crop Presets</h4>
                    <p className="text-xs text-mute leading-relaxed">
                      Easily modify dimensions with our dynamic aspect ratios. Create square outputs as the <strong className="text-ink font-medium">best video cropper for instagram</strong> posts, or switch to portrait for TikTok. Use the <strong className="text-ink font-medium">video crop editor</strong> to drag and scale custom bounds for any destination.
                    </p>
                  </div>

                  <div className="bg-surface border border-hairline p-5 rounded-lg flex flex-col gap-2">
                    <h4 className="text-sm font-semibold text-ink">YouTube Optimized Editing</h4>
                    <p className="text-xs text-mute leading-relaxed">
                      Need to repurpose horizontal content into vertical clips? Load your clips into our web client to use it as a custom <strong className="text-ink font-medium">youtube video cropper</strong>. Trim out unwanted segments, define the target window, and generate clips perfectly optimized for Shorts.
                    </p>
                  </div>

                  <div className="bg-surface border border-hairline p-5 rounded-lg flex flex-col gap-2">
                    <h4 className="text-sm font-semibold text-ink">Instant Local Processing</h4>
                    <p className="text-xs text-mute leading-relaxed">
                      Say goodbye to queues. Our web engine compiles your edits locally in seconds. Whether you need to <strong className="text-ink font-medium">video crop</strong> a single clip or trim long footage, everything finishes in the browser, making it a stellar <strong className="text-ink font-medium">online video cropper</strong>.
                    </p>
                  </div>
                </div>
              </div>

              {/* How to Guide */}
              <div className="bg-surface border border-hairline p-6 rounded-lg flex flex-col gap-4">
                <h3 className="text-sm font-semibold text-ink uppercase tracking-wider">How to Crop Video Online: Step-by-Step</h3>
                <div className="grid grid-cols-1 md:grid-cols-3 gap-6 text-xs text-mute">
                  <div className="flex flex-col gap-2">
                    <div className="font-bold text-accent-blue text-sm">01</div>
                    <h4 className="text-ink font-medium">Select and Load</h4>
                    <p className="leading-relaxed">
                      Drop your files directly into the upload block above. Our interface reads it instantly as a local file, operating as a fast <strong className="text-ink font-medium">free video cropper online</strong> interface.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="font-bold text-accent-blue text-sm">02</div>
                    <h4 className="text-ink font-medium">Crop & Customize</h4>
                    <p className="leading-relaxed">
                      Use the visual workspace to drag and size your cropping boundaries. Choose specific dimensions using the aspect ratio selector or type inputs into the <strong className="text-ink font-medium">video crop online</strong> settings sidebar.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2">
                    <div className="font-bold text-accent-blue text-sm">03</div>
                    <h4 className="text-ink font-medium">Trim & Export</h4>
                    <p className="leading-relaxed">
                      Define the exact playback start and end times on the timeline. Once satisfied, export directly to download your trimmed file, backed by our client-side WebM and <strong className="text-ink font-medium">mp4 video cropper</strong> engines.
                    </p>
                  </div>
                </div>
              </div>

              {/* FAQs Section */}
              <script
                type="application/ld+json"
                dangerouslySetInnerHTML={{
                  __html: JSON.stringify({
                    "@context": "https://schema.org",
                    "@type": "FAQPage",
                    "mainEntity": [
                      {
                        "@type": "Question",
                        "name": "Is this really a free video cropper online with no limitations?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "Absolutely! We designed this utility as a truly free video cropper. There are no registration forms, no subscription prompts, and no watermark injections on exported files. It is an open-source video cropper free of any artificial paywalls."
                        }
                      },
                      {
                        "@type": "Question",
                        "name": "Can I run this video cropper online on Windows 10?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "Yes, our tool runs in all web browsers supporting modern Web standards. It works flawlessly as a video cropper windows 10 solution in Edge, Chrome, or Firefox. Because it executes via WebAssembly locally, there are no heavy software installation files to download."
                        }
                      },
                      {
                        "@type": "Question",
                        "name": "Does it support cropping videos for YouTube and Instagram?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "Yes. The app contains preset aspect ratios specifically tailored for popular platforms. You can load a clip and crop it to 1:1 or 9:16 aspect ratios, making it the best video cropper for instagram Reels or a quick youtube video cropper. Trimming on the timeline also ensures you meet the strict duration constraints."
                        }
                      },
                      {
                        "@type": "Question",
                        "name": "What file formats does the video cropper online tool support?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "The application is optimized as a high-performance mp4 video cropper. It reads and writes MP4 (H.264 video codec with AAC audio) and WebM formats directly. Because conversion happens locally, the export speed depends entirely on your device's hardware capabilities."
                        }
                      },
                      {
                        "@type": "Question",
                        "name": "What is the best video cropper tool?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "The best video cropper tool is one that preserves your privacy, does not force watermarks, and is completely free to use. freevideocropper is highly recommended because it runs 100% locally in your browser, works on any platform, and guarantees a watermark-free export. For users searching for the best video cropper for instagram or TikTok, a client-side tool provides both convenience and security."
                        }
                      },
                      {
                        "@type": "Question",
                        "name": "What is the best way to crop a video?",
                        "acceptedAnswer": {
                          "@type": "Answer",
                          "text": "The best way to video crop is using a secure, client-side editor. With a browser-based video crop editor, you can load your clip, choose a preset ratio (like 16:9, 9:16, or 1:1), and drag the handles to fit the area. This method processes everything locally, so you can video crop online instantly without uploading heavy files to cloud servers."
                        }
                      }
                    ]
                  })
                }}
              />
              <div className="flex flex-col gap-4">
                <h3 className="text-lg font-medium text-ink tracking-tight">Frequently Asked Questions</h3>
                <div className="flex flex-col gap-4">
                  <div className="border-b border-hairline/60 pb-4 flex flex-col gap-1.5">
                    <h4 className="text-sm font-semibold text-ink">Is this really a free video cropper online with no limitations?</h4>
                    <p className="text-xs text-mute leading-relaxed">
                      Absolutely! We designed this utility as a truly <strong className="text-ink font-medium">free video cropper</strong>. There are no registration forms, no subscription prompts, and no watermark injections on exported files. It is an open-source <strong className="text-ink font-medium">video cropper free</strong> of any artificial paywalls.
                    </p>
                  </div>

                  <div className="border-b border-hairline/60 pb-4 flex flex-col gap-1.5">
                    <h4 className="text-sm font-semibold text-ink">Can I run this video cropper online on Windows 10?</h4>
                    <p className="text-xs text-mute leading-relaxed">
                      Yes, our tool runs in all web browsers supporting modern Web standards. It works flawlessly as a <strong className="text-ink font-medium">video cropper windows 10</strong> solution in Edge, Chrome, or Firefox. Because it executes via WebAssembly locally, there are no heavy software installation files to download.
                    </p>
                  </div>

                  <div className="border-b border-hairline/60 pb-4 flex flex-col gap-1.5">
                    <h4 className="text-sm font-semibold text-ink">Does it support cropping videos for YouTube and Instagram?</h4>
                    <p className="text-xs text-mute leading-relaxed">
                      Yes. The app contains preset aspect ratios specifically tailored for popular platforms. You can load a clip and crop it to 1:1 or 9:16 aspect ratios, making it the <strong className="text-ink font-medium">best video cropper for instagram</strong> Reels or a quick <strong className="text-ink font-medium">youtube video cropper</strong>. Trimming on the timeline also ensures you meet the strict duration constraints.
                    </p>
                  </div>

                  <div className="border-b border-hairline/60 pb-4 flex flex-col gap-1.5">
                    <h4 className="text-sm font-semibold text-ink">What file formats does the video cropper online tool support?</h4>
                    <p className="text-xs text-mute leading-relaxed">
                      The application is optimized as a high-performance <strong className="text-ink font-medium">mp4 video cropper</strong>. It reads and writes MP4 (H.264 video codec with AAC audio) and WebM formats directly. Because conversion happens locally, the export speed depends entirely on your device's hardware capabilities.
                    </p>
                  </div>

                  <div className="border-b border-hairline/60 pb-4 flex flex-col gap-1.5">
                    <h4 className="text-sm font-semibold text-ink">What is the best video cropper tool?</h4>
                    <p className="text-xs text-mute leading-relaxed">
                      The best <strong className="text-ink font-medium">video cropper tool</strong> is one that preserves your privacy, does not force watermarks, and is completely free to use. <strong className="text-ink font-medium">freevideocropper</strong> is highly recommended because it runs 100% locally in your browser, works on any platform, and guarantees a watermark-free export. For users searching for the <strong className="text-ink font-medium">best video cropper for instagram</strong> or TikTok, a client-side tool provides both convenience and security.
                    </p>
                  </div>

                  <div className="pb-2 flex flex-col gap-1.5">
                    <h4 className="text-sm font-semibold text-ink">What is the best way to crop a video?</h4>
                    <p className="text-xs text-mute leading-relaxed">
                      The best way to <strong className="text-ink font-medium">video crop</strong> is using a secure, client-side editor. With a browser-based <strong className="text-ink font-medium">video crop editor</strong>, you can load your clip, choose a preset ratio (like 16:9, 9:16, or 1:1), and drag the handles to fit the area. This method processes everything locally, so you can <strong className="text-ink font-medium">video crop online</strong> instantly without uploading heavy files to cloud servers.
                    </p>
                  </div>
                </div>
              </div>

              {/* Quick Navigation Sitemap */}
              <div className="bg-surface border border-hairline p-5 rounded-lg flex flex-col gap-3">
                <h3 className="text-xs font-semibold text-ink uppercase tracking-wider">Quick Sitemap Navigation</h3>
                <p className="text-xs text-mute leading-relaxed">
                  Navigate our resources: learn about our privacy-first local processing on our <a href="/about" className="text-accent-blue hover:underline">About Us</a> page, read our <a href="/privacy" className="text-accent-blue hover:underline">Privacy Policy</a> to understand how your files remain local, check out our <a href="/terms" className="text-accent-blue hover:underline">Terms & Conditions</a> for usage licensing, or reach out to us with suggestions on the <a href="/contact" className="text-accent-blue hover:underline">Contact Us</a> page.
                </p>
              </div>
            </div>
          </div>
        )}

        {step === "EDIT" && (
          <div className="w-full grid grid-cols-1 lg:grid-cols-3 gap-8 items-start">
            {/* Cropping preview & presets workspace */}
            <div className="lg:col-span-2 flex flex-col gap-6 w-full">

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
              {/* Sidebar Header with Master Reset */}
              <div className="flex items-center justify-between pb-3 border-b border-hairline/60">
                <h2 className="text-xs font-semibold uppercase tracking-wider text-ink">Editor Controls</h2>
                <button
                  onClick={handleResetAllSettings}
                  disabled={
                    crop.x === 0 &&
                    crop.y === 0 &&
                    crop.width === 100 &&
                    crop.height === 100 &&
                    aspectRatio === "Free" &&
                    exportFormat === "mp4" &&
                    includeAudio === true &&
                    startTime === 0 &&
                    endTime === duration &&
                    currentTime === 0
                  }
                  title="Reset All Settings"
                  className="flex items-center gap-1 px-2.5 py-1.5 bg-surface border border-hairline text-[11px] font-medium text-mute hover:text-ink hover:border-stone disabled:opacity-30 disabled:hover:border-hairline disabled:hover:text-mute rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                >
                  <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2" stroke="currentColor" className="w-3.5 h-3.5">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                  </svg>
                  <span>Reset All</span>
                </button>
              </div>

              {/* Aspect Ratio Selector (moved to sidebar) */}
              <div className="bg-surface border border-hairline p-4 rounded-lg flex flex-col gap-3">

                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-mute block font-medium">Aspect Ratio Presets</span>
                    <button
                      onClick={() => setAspectRatio("Free")}
                      disabled={aspectRatio === "Free"}
                      title="Reset Aspect Ratio"
                      className="p-1 hover:bg-surface-elevated text-stone hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-mute font-mono">
                    <span>Input Dims:</span>
                    <span className="text-ink">{videoDims.width} × {videoDims.height}</span>
                  </div>
                </div>

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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-mute block font-medium">Precision Controls (Percentages)</span>
                    <button
                      onClick={() => setCrop({ x: 0, y: 0, width: 100, height: 100 })}
                      disabled={crop.x === 0 && crop.y === 0 && crop.width === 100 && crop.height === 100}
                      title="Reset Crop Area"
                      className="p-1 hover:bg-surface-elevated text-stone hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  </div>
                </div>
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
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-1.5">
                    <span className="text-xs text-mute block font-medium">Export Settings</span>
                    <button
                      onClick={() => {
                        setExportFormat("mp4");
                        setIncludeAudio(true);
                      }}
                      disabled={exportFormat === "mp4" && includeAudio === true}
                      title="Reset Export Settings"
                      className="p-1 hover:bg-surface-elevated text-stone hover:text-ink disabled:opacity-30 disabled:hover:bg-transparent rounded transition-all cursor-pointer disabled:cursor-not-allowed"
                    >
                      <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth="2.5" stroke="currentColor" className="w-3.5 h-3.5">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0 3.181 3.183a8.25 8.25 0 0 0 13.803-3.7M4.031 9.865a8.25 8.25 0 0 1 13.803-3.7l3.181 3.182m0-4.991v4.99" />
                      </svg>
                    </button>
                  </div>
                </div>

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
      <Footer />
    </div>
  );
}
