"use client";

import React, { useState } from "react";

export default function ContactForm() {
  const [formData, setFormData] = useState({ name: "", email: "", subject: "", message: "" });
  const [status, setStatus] = useState<"IDLE" | "SUCCESS" | "ERROR">("IDLE");

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!formData.name || !formData.email || !formData.message) {
      setStatus("ERROR");
      return;
    }
    // Mock successful submission
    setStatus("SUCCESS");
    setFormData({ name: "", email: "", subject: "", message: "" });
  };

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
  };

  return (
    <div className="bg-[#0d0d0d] border border-[#242728] p-6 sm:p-8 rounded-lg flex flex-col gap-6">
      <div className="flex flex-col gap-1.5">
        <h2 className="text-sm font-semibold text-[#f4f4f6] uppercase tracking-wider">
          Send Us Feedback
        </h2>
        <p className="text-xs text-[#9c9c9d] leading-relaxed">
          Have feedback, bugs, or feature suggestions for our <strong className="text-[#f4f4f6] font-medium">video cropper tool</strong>? Drop us a line below.
        </p>
      </div>

      {status === "SUCCESS" && (
        <div className="bg-[rgba(89,212,153,0.15)] border border-[#59d499]/20 p-4 rounded-lg flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#59d499]">Message Sent Successfully!</span>
          <span className="text-[11px] text-[#9c9c9d]">Thank you for reaching out. We will read your feedback shortly.</span>
        </div>
      )}

      {status === "ERROR" && (
        <div className="bg-[rgba(255,97,97,0.15)] border border-[#ff6161]/20 p-4 rounded-lg flex flex-col gap-1">
          <span className="text-xs font-semibold text-[#ff6161]">Error Submitting Form</span>
          <span className="text-[11px] text-[#9c9c9d]">Please make sure all required fields (Name, Email, Message) are filled correctly.</span>
        </div>
      )}

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div>
            <label className="text-[11px] text-[#9c9c9d] block mb-1">Name <span className="text-[#ff6161]">*</span></label>
            <input
              type="text"
              name="name"
              required
              value={formData.name}
              onChange={handleChange}
              placeholder="Your Name"
              className="w-full bg-[#101111] border border-[#242728] rounded px-3 py-2 text-[#f4f4f6] text-xs focus:border-[#434345] outline-none transition-colors placeholder:text-[#6a6b6c]"
            />
          </div>
          <div>
            <label className="text-[11px] text-[#9c9c9d] block mb-1">Email <span className="text-[#ff6161]">*</span></label>
            <input
              type="email"
              name="email"
              required
              value={formData.email}
              onChange={handleChange}
              placeholder="you@example.com"
              className="w-full bg-[#101111] border border-[#242728] rounded px-3 py-2 text-[#f4f4f6] text-xs focus:border-[#434345] outline-none transition-colors placeholder:text-[#6a6b6c]"
            />
          </div>
        </div>

        <div>
          <label className="text-[11px] text-[#9c9c9d] block mb-1">Subject</label>
          <input
            type="text"
            name="subject"
            value={formData.subject}
            onChange={handleChange}
            placeholder="Feature Request, Bug Report..."
            className="w-full bg-[#101111] border border-[#242728] rounded px-3 py-2 text-[#f4f4f6] text-xs focus:border-[#434345] outline-none transition-colors placeholder:text-[#6a6b6c]"
          />
        </div>

        <div>
          <label className="text-[11px] text-[#9c9c9d] block mb-1">Message <span className="text-[#ff6161]">*</span></label>
          <textarea
            name="message"
            required
            rows={5}
            value={formData.message}
            onChange={handleChange}
            placeholder="Tell us how we can improve our online video cropper and editor tool..."
            className="w-full bg-[#101111] border border-[#242728] rounded px-3 py-2 text-[#f4f4f6] text-xs focus:border-[#434345] outline-none transition-colors placeholder:text-[#6a6b6c] resize-y"
          />
        </div>

        <button
          type="submit"
          className="h-9 px-4 bg-[#ffffff] text-[#000000] hover:bg-[#e8e8e8] text-xs font-semibold rounded-md transition-colors cursor-pointer self-start"
        >
          Send Message
        </button>
      </form>
    </div>
  );
}
