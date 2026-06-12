"use client";

import Link from "next/link";

export default function Footer() {
  return (
    <footer className="w-full bg-[#07080a] border-t border-[#242728] mt-auto">
      {/* Subtle red stripe gradient echo at footer top */}
      <div className="h-[2px] bg-gradient-to-r from-[#ff5757]/15 to-[#a1131a]/15 w-full" />

      <div className="max-w-6xl w-full mx-auto py-8 px-6 md:py-10 md:px-8 flex flex-col md:flex-row items-center justify-between gap-6 md:gap-4 text-xs text-[#9c9c9d] font-sans">
        <div className="flex flex-col sm:flex-row items-center gap-2 sm:gap-2.5 text-center sm:text-left">
          <span className="font-semibold text-[#f4f4f6]">freevideocropper</span>
          <span className="hidden sm:inline text-[#242728] sm:text-[#434345]">|</span>
          <span className="text-[#6e6e73] sm:text-[#9c9c9d]">Local Web Processing Engine</span>
        </div>

        <div className="flex flex-wrap gap-x-6 gap-y-3 justify-center text-center max-w-md py-1">
          <Link href="/" className="hover:text-[#f4f4f6] transition-colors">
            Home
          </Link>
          <Link href="/about" className="hover:text-[#f4f4f6] transition-colors">
            About Us
          </Link>
          <Link href="/privacy" className="hover:text-[#f4f4f6] transition-colors">
            Privacy Policy
          </Link>
          <Link href="/terms" className="hover:text-[#f4f4f6] transition-colors">
            Terms & Conditions
          </Link>
          <Link href="/contact" className="hover:text-[#f4f4f6] transition-colors">
            Contact Us
          </Link>
        </div>

        <div className="text-center md:text-right text-[#6e6e73] max-w-xs leading-relaxed">
          <span>No data uploads. Private. Open-source under MIT license.</span>
        </div>
      </div>
    </footer>
  );
}
