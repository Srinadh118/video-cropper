"use client";

import Link from "next/link";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export default function NotFound() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07080a] text-[#cdcdcd] selection:bg-[#57c1ff]/20 selection:text-[#f4f4f6]">
      <title>404 Page Not Found — freevideocropper</title>
      <meta name="description" content="The page you are looking for does not exist on freevideocropper." />
      
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-20 flex flex-col items-center justify-center text-center gap-6">
        <div className="flex flex-col gap-3 max-w-md">
          {/* Saturated Accent detail */}
          <div className="text-4xl font-bold text-[#ff6161] font-mono tracking-wider">
            404
          </div>
          <h1 className="text-2xl sm:text-3xl font-semibold text-[#f4f4f6] tracking-tight">
            Page Not Found
          </h1>
          <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
            The page you are looking for does not exist, has been removed, or has had its name changed. Use the link below to return to our online video cropper home page.
          </p>
        </div>

        <Link
          href="/"
          className="h-10 px-6 bg-[#ffffff] text-[#000000] hover:bg-[#e8e8e8] text-sm font-semibold rounded-md flex items-center justify-center transition-colors shadow"
        >
          Return to Home Page
        </Link>
      </main>

      <Footer />
    </div>
  );
}
