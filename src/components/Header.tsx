"use client";

import Link from "next/link";
import { useRouter, usePathname } from "next/navigation";

interface HeaderProps {
  onRestart?: () => void;
  showStartNew?: boolean;
}

export default function Header({ onRestart, showStartNew = false }: HeaderProps) {
  const router = useRouter();
  const pathname = usePathname();

  const handleLogoClick = () => {
    if (pathname === "/" && onRestart) {
      onRestart();
    } else {
      router.push("/");
    }
  };

  return (
    <header className="w-full bg-[#07080a] border-b border-[#242728] h-14 flex items-center px-6 sticky top-0 z-40">
      {/* Decorative Red Stripes Banner at top (DESIGN.md launch-banner motif) */}
      <div className="absolute top-0 left-0 right-0 overflow-hidden h-2 pointer-events-none select-none flex justify-center gap-1.5 opacity-80 z-50">
        <div className="w-28 h-full bg-gradient-to-r from-[#ff5757] to-[#a1131a] transform -skew-x-12" />
        <div className="w-28 h-full bg-gradient-to-r from-[#ff5757] to-[#a1131a] transform -skew-x-12" />
        <div className="w-28 h-full bg-gradient-to-r from-[#ff5757] to-[#a1131a] transform -skew-x-12" />
      </div>

      <div className="max-w-6xl w-full mx-auto flex items-center justify-between">
        <div className="flex items-center gap-2.5 cursor-pointer" onClick={handleLogoClick}>
          {/* Visual Logo Accent (Hacker News yellow/orange category detail) */}
          <div className="w-6 h-6 rounded bg-[rgba(255,197,51,0.15)] border border-[#ffc533]/20 flex items-center justify-center text-[#ffc533]">
            <svg
              xmlns="http://www.w3.org/2000/svg"
              viewBox="0 0 20 20"
              fill="currentColor"
              className="w-3.5 h-3.5"
            >
              <path d="M10 3.75a2 2 0 1 0-4 0 2 2 0 0 0 4 0ZM17.25 4.5a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0 0 1.5h2.25a.75.75 0 0 0 .75-.75ZM17.25 15.5a.75.75 0 0 0-.75-.75h-2.25a.75.75 0 0 0 0 1.5h2.25a.75.75 0 0 0 .75-.75ZM5.75 16.25a.75.75 0 0 1 .75-.75h2.25a.75.75 0 0 1 0 1.5H6.5a.75.75 0 0 1-.75-.75ZM10 16.25a2 2 0 1 1-4 0 2 2 0 0 1 4 0ZM14.25 10a2 2 0 1 0-4 0 2 2 0 0 0 4 0Z" />
            </svg>
          </div>
          <span className="font-semibold text-[#f4f4f6] text-sm tracking-tight font-sans">
            freevideocropper
          </span>
        </div>

        <div className="flex items-center gap-4">
          <Link
            href="/about"
            className={`text-xs ${pathname === "/about" ? "text-[#f4f4f6]" : "text-[#9c9c9d] hover:text-[#f4f4f6]"} transition-colors font-medium`}
          >
            About
          </Link>
          <Link
            href="/privacy"
            className={`text-xs ${pathname === "/privacy" ? "text-[#f4f4f6]" : "text-[#9c9c9d] hover:text-[#f4f4f6]"} transition-colors font-medium`}
          >
            Privacy
          </Link>
          <Link
            href="/terms"
            className={`text-xs ${pathname === "/terms" ? "text-[#f4f4f6]" : "text-[#9c9c9d] hover:text-[#f4f4f6]"} transition-colors font-medium`}
          >
            Terms
          </Link>
          <Link
            href="/contact"
            className={`text-xs ${pathname === "/contact" ? "text-[#f4f4f6]" : "text-[#9c9c9d] hover:text-[#f4f4f6]"} transition-colors font-medium`}
          >
            Contact
          </Link>
          <a
            href="https://github.com/Srinadh118/video-cropper"
            target="_blank"
            rel="noopener noreferrer"
            className="text-xs text-[#9c9c9d] hover:text-[#f4f4f6] transition-colors font-medium"
          >
            GitHub
          </a>
          {showStartNew && onRestart && (
            <button
              onClick={onRestart}
              className="h-7 px-3 bg-[#ffffff] text-[#000000] hover:bg-[#e8e8e8] text-xs font-semibold rounded-md transition-colors"
            >
              Start New
            </button>
          )}
        </div>
      </div>
    </header>
  );
}
