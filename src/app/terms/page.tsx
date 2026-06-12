import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Terms & Conditions — freevideocropper",
  description: "Terms and conditions of using freevideocropper. Read about our open source license, usage rights, and non-liability terms.",
  keywords: ["terms and conditions", "freevideocropper terms", "video cropper and editor", "video cropper no watermark", "free video cropper"],
};

export default function TermsPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07080a] text-[#cdcdcd] selection:bg-[#57c1ff]/20 selection:text-[#f4f4f6]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 flex flex-col gap-10">
        {/* Title Section */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#f4f4f6] tracking-tight">
            Terms & Conditions
          </h1>
          <p className="text-sm sm:text-base text-[#9c9c9d] leading-relaxed max-w-2xl">
            Please read these terms carefully before using our local web application.
          </p>
        </div>

        {/* Terms Contents */}
        <div className="flex flex-col gap-8">
          <div className="bg-[#0d0d0d] border border-[#242728] p-6 rounded-lg flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[#f4f4f6] uppercase tracking-wider">
              1. Acceptance of Terms
            </h2>
            <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
              By visiting and using **freevideocropper**, you accept and agree to follow these Terms & Conditions. If you do not agree, please do not use this site. This is a client-side <strong className="text-[#f4f4f6] font-medium">free video cropper</strong> application provided to users without fees or registration.
            </p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#242728] p-6 rounded-lg flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[#f4f4f6] uppercase tracking-wider">
              2. License and Usage Rights
            </h2>
            <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
              This <strong className="text-[#f4f4f6] font-medium">video cropper and editor</strong> is fully open-source and released under the permissive MIT license. You are free to view, copy, modify, and integrate our client-side modules into your own web projects.
            </p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#242728] p-6 rounded-lg flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[#f4f4f6] uppercase tracking-wider">
              3. Watermark-Free Export Rights
            </h2>
            <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
              All outputs produced by this website are provided as a <strong className="text-[#f4f4f6] font-medium">video cropper no watermark</strong> service. You retain full intellectual property ownership over any raw media files loaded and exported.
            </p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#242728] p-6 rounded-lg flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[#f4f4f6] uppercase tracking-wider">
              4. Disclaimer of Warranties
            </h2>
            <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
              THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE, AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES, OR OTHER LIABILITY.
            </p>
          </div>
        </div>

        <div className="border-t border-[#242728]/60 pt-6 text-xs text-[#9c9c9d] leading-relaxed">
          Last Updated: June 12, 2026.
        </div>
      </main>

      <Footer />
    </div>
  );
}
