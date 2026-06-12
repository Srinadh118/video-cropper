import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "VideoCrop — Privacy-First Client-Side Video Cropping",
  description: "Crop and trim your videos directly in your browser. Fast, free, and fully client-side. Your videos never touch the cloud.",
  keywords: ["video crop", "video trim", "client side", "privacy first", "mp4 cropper", "browser cropper"],
  openGraph: {
    title: "VideoCrop — Privacy-First Client-Side Video Cropping",
    description: "Crop and trim your videos directly in your browser. Fast, free, and fully client-side. Your videos never touch the cloud.",
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "VideoCrop — Privacy-First Client-Side Video Cropping",
    description: "Crop and trim your videos directly in your browser. Fast, free, and fully client-side. Your videos never touch the cloud.",
  }
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${inter.variable} h-full antialiased dark`}
      suppressHydrationWarning
    >
      <body className="min-h-full flex flex-col bg-[#07080a] text-[#cdcdcd]" suppressHydrationWarning>
        {children}
      </body>
    </html>
  );
}
