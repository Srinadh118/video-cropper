import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "Privacy Policy — freevideocropper",
  description: "Our privacy policy explains why freevideocropper is 100% private. We use client-side processing, meaning your videos are never uploaded to any server.",
  keywords: ["privacy policy", "freevideocropper privacy", "online video cropper", "free video cropper online", "video crop online"],
};

export default function PrivacyPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07080a] text-[#cdcdcd] selection:bg-[#57c1ff]/20 selection:text-[#f4f4f6]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 flex flex-col gap-10">
        {/* Title Section */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#f4f4f6] tracking-tight">
            Privacy Policy
          </h1>
          <p className="text-sm sm:text-base text-[#9c9c9d] leading-relaxed max-w-2xl">
            At freevideocropper, privacy is not a feature—it is our core architecture.
          </p>
        </div>

        {/* Policy Contents */}
        <div className="flex flex-col gap-8">
          <div className="bg-[#0d0d0d] border border-[#242728] p-6 rounded-lg flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[#f4f4f6] uppercase tracking-wider">
              1. 100% Client-Side Processing
            </h2>
            <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
              When you load our <strong className="text-[#f4f4f6] font-medium">free video cropper online</strong> engine, your files are processed locally inside your web browser. We utilize WebAssembly scripts that compilation engines use to crop and trim media. Your videos are **never uploaded to any server, cloud storage, or third-party processor**. All editing tasks occur strictly on your physical device.
            </p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#242728] p-6 rounded-lg flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[#f4f4f6] uppercase tracking-wider">
              2. No Data Collection
            </h2>
            <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
              Because we don't transmit your files, we do not inspect, collect, or store any content. You can run this <strong className="text-[#f4f4f6] font-medium">online video cropper</strong> fully offline once the initial page load completes.
            </p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#242728] p-6 rounded-lg flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[#f4f4f6] uppercase tracking-wider">
              3. Analytics & Infrastructure
            </h2>
            <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
              Our website uses basic static web hosting. We do not use trackers or advertising scripts. Anonymous server logs (such as request timestamps and IP addresses) might be logged by our hosting provider for infrastructure health purposes only, but no file contents or personal metadata are ever collected.
            </p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#242728] p-6 rounded-lg flex flex-col gap-3">
            <h2 className="text-sm font-semibold text-[#f4f4f6] uppercase tracking-wider">
              4. Local Storage Usage
            </h2>
            <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
              Any workspace state or settings (such as chosen aspect ratios or trim timestamps) are saved in your browser's local cache memory. You can clear this data at any time by clearing your browser site cache or closing the browser tab.
            </p>
          </div>
        </div>

        <div className="border-t border-[#242728]/60 pt-6 text-xs text-[#9c9c9d] leading-relaxed">
          Last Updated: June 12, 2026. If you have questions about how our privacy-first local <strong className="text-[#f4f4f6] font-medium">video crop online</strong> engine works, you can inspect the code repository directly or reach out via our contact page.
        </div>
      </main>

      <Footer />
    </div>
  );
}
