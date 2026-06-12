"use client";

import React, { useState, useRef, DragEvent, ChangeEvent } from "react";

interface VideoUploadProps {
  onVideoSelected: (file: File) => void;
}

export default function VideoUpload({ onVideoSelected }: VideoUploadProps) {
  const [isDragActive, setIsDragActive] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setIsDragActive(true);
    } else if (e.type === "dragleave") {
      setIsDragActive(false);
    }
  };

  const processFile = (file: File) => {
    if (!file.type.startsWith("video/")) {
      setError("Please upload a valid video file (MP4, WebM, etc.)");
      return;
    }
    
    // Reset error
    setError(null);
    onVideoSelected(file);
  };

  const handleDrop = (e: DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragActive(false);

    if (e.dataTransfer.files && e.dataTransfer.files[0]) {
      processFile(e.dataTransfer.files[0]);
    }
  };

  const handleChange = (e: ChangeEvent<HTMLInputElement>) => {
    e.preventDefault();
    if (e.target.files && e.target.files[0]) {
      processFile(e.target.files[0]);
    }
  };

  const onButtonClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <div className="w-full max-w-2xl mx-auto">
      <div
        onDragEnter={handleDrag}
        onDragOver={handleDrag}
        onDragLeave={handleDrag}
        onDrop={handleDrop}
        onClick={onButtonClick}
        className={`relative flex flex-col items-center justify-center w-full min-h-[320px] rounded-lg border-2 border-dashed transition-all duration-200 cursor-pointer p-8 text-center
          ${
            isDragActive
              ? "border-accent-blue bg-accent-blue/5"
              : "border-hairline bg-surface hover:border-stone hover:bg-surface-elevated"
          }
        `}
      >
        <input
          ref={fileInputRef}
          type="file"
          className="hidden"
          accept="video/*"
          onChange={handleChange}
        />

        {/* Hero visual representation (Hacker News yellow/orange style card accent) */}
        <div className="mb-6 flex items-center justify-center w-14 h-14 rounded-lg bg-accent-yellow-soft text-accent-yellow border border-accent-yellow/20">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth={1.5}
            stroke="currentColor"
            className="w-7 h-7"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M3 16.5v2.25A2.25 2.25 0 0 0 5.25 21h13.5A2.25 2.25 0 0 0 21 18.75V16.5m-13.5-9L12 3m0 0 4.5 4.5M12 3v13.5"
            />
          </svg>
        </div>

        <h3 className="text-lg font-medium text-ink mb-2">
          Import video file to crop
        </h3>
        
        <p className="text-sm text-mute max-w-sm mb-6 leading-relaxed">
          Drag & drop your video here, or click to browse files.
        </p>

        {/* Fine-grain meta tags style instructions */}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-card text-mute border border-hairline">
            MP4, WebM supported
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-card text-mute border border-hairline">
            100% Client-side processing
          </span>
          <span className="inline-flex items-center px-2 py-0.5 rounded text-xs font-medium bg-surface-card text-mute border border-hairline">
            Max recommended: 100MB
          </span>
        </div>

        {error && (
          <div className="absolute bottom-4 left-4 right-4 py-2 px-3 rounded bg-accent-red-soft text-accent-red border border-accent-red/20 text-xs font-medium flex items-center gap-2">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-4 h-4 shrink-0"
            >
              <path
                fillRule="evenodd"
                d="M10 18a8 8 0 1 0 0-16 8 8 0 0 0 0 16ZM8.28 7.22a.75.75 0 0 0-1.06 1.06L8.94 10l-1.72 1.72a.75.75 0 1 0 1.06 1.06L10 11.06l1.72 1.72a.75.75 0 1 0 1.06-1.06L11.06 10l1.72-1.72a.75.75 0 0 0-1.06-1.06L10 8.94 8.28 7.22Z"
                clipRule="evenodd"
              />
            </svg>
            <span>{error}</span>
          </div>
        )}
      </div>
    </div>
  );
}
