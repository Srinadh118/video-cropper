"use client";

import React from "react";
import { usePWAInstall } from "@/providers/PWAProvider";

export default function PWAInstallBanner() {
  const { showInstallBanner, installApp, dismissInstallBanner } = usePWAInstall();

  if (!showInstallBanner) return null;

  return (
    <div className="w-full max-w-2xl bg-[#0d0d0d] border border-[#242728] rounded-lg p-5 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 animate-fade-in transition-all">
      <div className="flex items-start gap-4">
        {/* Visual Logo Accent (Blue category detail) */}
        <div className="w-10 h-10 rounded-md bg-[rgba(87,193,255,0.15)] border border-[#57c1ff]/20 flex items-center justify-center text-[#57c1ff] shrink-0 mt-0.5 sm:mt-0">
          <svg
            xmlns="http://www.w3.org/2000/svg"
            fill="none"
            viewBox="0 0 24 24"
            strokeWidth="2"
            stroke="currentColor"
            className="w-5 h-5"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              d="M9 8.25H7.5a2.25 2.25 0 0 0-2.25 2.25v9a2.25 2.25 0 0 0 2.25 2.25h10.5A2.25 2.25 0 0 0 20 19.5v-9A2.25 2.25 0 0 0 17.75 8.25H16.5M9 8.25V6a2.25 2.25 0 0 1 2.25-2.25h1.5A2.25 2.25 0 0 1 15 6v2.25m-6 0h6M9 8.25h6m-3 6.75v3M9 14.25l3 3 3-3"
            />
          </svg>
        </div>

        <div className="flex flex-col gap-1 text-left">
          <h3 className="text-sm font-semibold text-[#f4f4f6] tracking-tight font-sans">
            Install Video Cropper App
          </h3>
          <p className="text-xs text-[#9c9c9d] leading-relaxed max-w-md">
            Install this tool as a desktop or mobile application for instant offline access, full-screen workspace, and faster load times.
          </p>
        </div>
      </div>

      <div className="flex items-center gap-3 w-full sm:w-auto shrink-0 justify-end">
        <button
          onClick={dismissInstallBanner}
          className="h-8 px-3.5 bg-transparent text-[#9c9c9d] hover:text-[#f4f4f6] text-xs font-medium rounded-md transition-colors cursor-pointer"
        >
          Not Now
        </button>
        <button
          onClick={installApp}
          className="h-8 px-4 bg-[#ffffff] text-[#000000] hover:bg-[#e8e8e8] text-xs font-semibold rounded-md transition-colors cursor-pointer"
        >
          Install
        </button>
      </div>
    </div>
  );
}
