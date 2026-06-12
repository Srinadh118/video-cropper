import type { Metadata } from "next";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import ContactForm from "@/components/ContactForm";

export const metadata: Metadata = {
  title: "Contact Us — freevideocropper",
  description: "Get in touch with the freevideocropper team. Send us feedback, report issues, or suggest new features for our online video cropper.",
  keywords: ["contact us", "freevideocropper contact", "video cropper tool", "best video cropper for instagram", "youtube video cropper"],
};

export default function ContactPage() {
  return (
    <div className="min-h-screen flex flex-col bg-[#07080a] text-[#cdcdcd] selection:bg-[#57c1ff]/20 selection:text-[#f4f4f6]">
      <Header />

      <main className="flex-1 max-w-4xl w-full mx-auto px-6 py-16 flex flex-col gap-10">
        {/* Title Section */}
        <div className="flex flex-col gap-3">
          <h1 className="text-3xl sm:text-4xl font-semibold text-[#f4f4f6] tracking-tight">
            Contact Us
          </h1>
          <p className="text-sm sm:text-base text-[#9c9c9d] leading-relaxed max-w-2xl">
            We value your suggestions and feedback. Tell us how we can make our client-side editor even better.
          </p>
        </div>

        {/* Contact Form */}
        <ContactForm />
      </main>

      <Footer />
    </div>
  );
}
