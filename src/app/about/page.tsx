import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";

export const metadata: Metadata = {
  title: "About Us — freevideocropper",
  description: "Learn about freevideocropper, the ultimate privacy-first online video cropper and editor tool. Discover our mission to provide high-quality client-side editing.",
  keywords: ["about freevideocropper", "free online video cropper", "video cropper tool", "video crop editor", "mp4 video cropper"],
};

export default function AboutPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07080a] text-[#cdcdcd] selection:bg-[#57c1ff]/20 selection:text-[#f4f4f6]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 flex flex-col gap-10">
        {/* Title Section */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#f4f4f6] tracking-tight">
            About <span className="text-[#57c1ff]">freevideocropper</span>
          </h1>
          <p className="text-sm sm:text-base text-[#9c9c9d] leading-relaxed max-w-2xl">
            We are dedicated to providing fast, watermark-free, and fully private media processing tools directly in your browser.
          </p>
        </div>

        {/* Story Section */}
        <div className="bg-[#0d0d0d] border border-[#242728] p-6 sm:p-8 rounded-lg flex flex-col gap-4">
          <h2 className="text-lg font-medium text-[#f4f4f6] tracking-tight">Our Mission</h2>
          <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
            In an era where personal data and intellectual property are continuously sent to cloud servers, we believe basic utilities should remain local. **freevideocropper** was built as a highly optimized, client-side <strong className="text-[#f4f4f6] font-semibold">free online video cropper</strong> and editor. We utilize modern Web technologies like WebAssembly (WASM) to run rendering and processing libraries directly inside your browser window.
          </p>
          <p className="text-xs sm:text-sm text-[#9c9c9d] leading-relaxed">
            Whether you are using it as an <strong className="text-[#f4f4f6] font-semibold">mp4 video cropper</strong> for personal archives, a quick <strong className="text-[#f4f4f6] font-semibold">video crop editor</strong> for social media formats, or a web-based utility for general work, our goal is to offer a premium, frictionless user experience.
          </p>
        </div>

        {/* Why Us Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="bg-[#0d0d0d] border border-[#242728] p-6 rounded-lg flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-[#f4f4f6]">Privacy First</h3>
            <p className="text-xs text-[#9c9c9d] leading-relaxed">
              Your video files never touch our servers. All rendering, cropping, and trimming calculations occur strictly inside your browser sandbox. This offline capability ensures total security.
            </p>
          </div>

          <div className="bg-[#0d0d0d] border border-[#242728] p-6 rounded-lg flex flex-col gap-2">
            <h3 className="text-sm font-semibold text-[#f4f4f6]">No Restrictions</h3>
            <p className="text-xs text-[#9c9c9d] leading-relaxed">
              We do not lock files behind registration screens, email submissions, or paywalls. This is a fully functional <strong className="text-[#f4f4f6] font-medium">video cropper tool</strong> engineered to deliver raw, water-mark free exports.
            </p>
          </div>
        </div>

        {/* Open Source Footer Note */}
        <div className="border-t border-[#242728]/60 pt-6 text-xs text-[#9c9c9d] leading-relaxed">
          Want to inspect how our client-side processing works? The project is fully transparent and open source. You can view the code, report issues, or contribute features on GitHub.
        </div>
      </main>

      <Footer />
    </div>
  );
}
