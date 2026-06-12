"use client";

import React, { useEffect } from "react";
import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

interface ErrorProps {
  error: Error & { digest?: string };
  reset: () => void;
}

export default function ErrorBoundary({ error, reset }: ErrorProps) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error("Unhandled runtime error:", error);
  }, [error]);

  return (
    <div className="min-h-screen flex flex-col bg-[#07080a] text-[#cdcdcd] selection:bg-[#57c1ff]/20 selection:text-[#f4f4f6]">
      <title>Application Error — freevideocropper</title>
      
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-20 flex flex-col items-center justify-center text-center gap-6">
        <div className="flex flex-col gap-3 max-w-md">
          {/* Saturated Accent detail */}
          <div className="text-4xl font-bold text-[#ff6161] font-mono tracking-wider">
            500
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#f4f4f6] tracking-tight">
            Something went wrong
          </h1>
          <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
            An unexpected error occurred while running the local processing engine. Try reloading the application workspace or returning to the home page.
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-center gap-3">
          <button
            onClick={() => reset()}
            className="h-10 px-6 bg-[#ffffff] text-[#000000] hover:bg-[#e8e8e8] text-sm font-semibold rounded-md flex items-center justify-center transition-colors shadow cursor-pointer"
          >
            Try Again
          </button>
          
          <Link
            href="/"
            className="h-10 px-6 bg-[#101111] border border-[#242728] text-[#f4f4f6] hover:bg-[#121212] hover:border-[#434345] text-sm font-semibold rounded-md flex items-center justify-center transition-colors cursor-pointer"
          >
            Go to Homepage
          </Link>
        </div>
      </main>

      <Footer />
    </div>
  );
}
