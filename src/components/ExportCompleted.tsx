"use client";

import React from "react";

interface ExportCompletedProps {
  blob: Blob;
  mimeType: string;
  originalName: string;
  onRestart: () => void;
}

export default function ExportCompleted({
  blob,
  mimeType,
  originalName,
  onRestart,
}: ExportCompletedProps) {
  const blobUrl = URL.createObjectURL(blob);
  
  // Format file size
  const formatSize = (bytes: number) => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  // Determine file extension
  const getExtension = () => {
    if (mimeType.includes("mp4")) return "mp4";
    if (mimeType.includes("webm")) return "webm";
    return "mp4"; // default fallback
  };

  const handleDownload = () => {
    const a = document.createElement("a");
    a.href = blobUrl;
    
    // Create new name: originalname_cropped.ext
    const nameWithoutExt = originalName.substring(0, originalName.lastIndexOf(".")) || originalName;
    a.download = `${nameWithoutExt}_cropped.${getExtension()}`;
    
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <div className="w-full max-w-xl mx-auto flex flex-col gap-6">
      {/* Success banner (green accent soft in DESIGN.md) */}
      <div className="flex items-center gap-3 py-3 px-4 rounded bg-accent-green-soft text-accent-green border border-accent-green/20 text-sm font-medium">
        <svg
          xmlns="http://www.w3.org/2000/svg"
          viewBox="0 0 20 20"
          fill="currentColor"
          className="w-5 h-5 shrink-0"
        >
          <path
            fillRule="evenodd"
            d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16Zm3.857-9.809a.75.75 0 0 0-1.214-.882l-3.483 4.79-1.88-1.88a.75.75 0 1 0-1.06 1.061l2.5 2.5a.75.75 0 0 0 1.137-.089l4-5.5Z"
            clipRule="evenodd"
          />
        </svg>
        <span>Video successfully cropped and rendered locally!</span>
      </div>

      <div className="bg-surface border border-hairline p-6 rounded-lg flex flex-col items-center gap-6">
        <div className="flex flex-col gap-1 text-center">
          <h2 className="text-xl font-medium text-ink">Ready for Download</h2>
          <p className="text-sm text-mute">Review the cropped video below before saving.</p>
        </div>

        {/* Video Preview */}
        <div className="relative border border-hairline bg-canvas rounded-sm overflow-hidden flex items-center justify-center max-w-full shadow-2xl">
          <video
            src={blobUrl}
            className="max-h-[260px] max-w-full object-contain block"
            controls
            playsInline
          />
        </div>

        {/* File Details Grid */}
        <div className="w-full grid grid-cols-2 gap-4 bg-surface-card border border-hairline p-4 rounded text-xs text-mute font-mono">
          <div>
            <span className="block text-stone mb-0.5">Format</span>
            <span className="text-ink uppercase">{getExtension()} ({mimeType.split(";")[0]})</span>
          </div>
          <div>
            <span className="block text-stone mb-0.5">File Size</span>
            <span className="text-ink">{formatSize(blob.size)}</span>
          </div>
        </div>

        {/* CTA Buttons */}
        <div className="flex flex-col sm:flex-row gap-3 w-full mt-2">
          {/* Restart CTA */}
          <button
            onClick={onRestart}
            className="flex-1 order-2 sm:order-1 flex items-center justify-center gap-2 h-9 px-4 bg-surface-elevated border border-hairline hover:bg-surface-card hover:border-stone text-xs font-medium text-ink rounded-md transition-colors"
          >
            Crop Another Video
          </button>

          {/* Download Primary CTA (white pill in DESIGN.md) */}
          <button
            onClick={handleDownload}
            className="flex-1 order-1 sm:order-2 flex items-center justify-center gap-2 h-9 px-4 bg-primary-cta text-on-primary hover:bg-primary-cta-pressed text-xs font-semibold rounded-md transition-colors"
          >
            <svg
              xmlns="http://www.w3.org/2000/svg"
              fill="none"
              viewBox="0 0 24 24"
              strokeWidth={2}
              stroke="currentColor"
              className="w-4 h-4"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5M16.5 12 12 16.5m0 0L7.5 12m4.5 4.5V3"
              />
            </svg>
            <span>Download Video</span>
          </button>
        </div>
      </div>
    </div>
  );
}
