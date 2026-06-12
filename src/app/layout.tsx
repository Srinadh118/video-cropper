import type { Metadata } from "next";
import { Inter } from "next/font/google";
import Script from "next/script";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Free Video Cropper — Best Online Video Cropper & Editor",
  description: "Crop, trim, and edit your MP4 videos online for free. freevideocropper is a private, client-side online video cropper and editor with no watermark.",
  keywords: [
    "video cropper",
    "online video cropper",
    "video cropper online",
    "free video cropper",
    "video cropper free",
    "free online video cropper",
    "youtube video cropper",
    "video cropper online free",
    "video cropper and editor",
    "video cropper no watermark",
    "video cropper tool",
    "video cropper windows 10",
    "mp4 video cropper",
    "free video cropper online",
    "best video cropper for instagram",
    "video crop",
    "video crop online",
    "video crop editor"
  ],
  icons: {
    icon: [
      { url: "/favicon-96x96.png", sizes: "96x96", type: "image/png" },
      { url: "/favicon.svg", type: "image/svg+xml" },
    ],
    shortcut: "/favicon.ico",
    apple: [
      { url: "/apple-touch-icon.png", sizes: "180x180", type: "image/png" },
    ],
  },
  manifest: "/site.webmanifest",
  appleWebApp: {
    title: "VideoCrop",
  },
  openGraph: {
    title: "Free Video Cropper — Free Online Video Cropper & Editor",
    description: "Crop and trim MP4 videos in your browser. Fast, free, and fully client-side. Your videos never touch the cloud. No watermark.",
    type: "website",
    url: "https://freevideocropper.com",
    siteName: "freevideocropper",
  },
  twitter: {
    card: "summary_large_image",
    title: "Free Video Cropper — Free Online Video Cropper & Editor",
    description: "Crop and trim MP4 videos in your browser. Fast, free, and fully client-side. No watermark.",
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
        <Script
          src="https://www.googletagmanager.com/gtag/js?id=G-MLMVCP43P7"
          strategy="afterInteractive"
        />
        <Script id="google-analytics" strategy="afterInteractive">
          {`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            gtag('js', new Date());

            gtag('config', 'G-MLMVCP43P7');
          `}
        </Script>
      </body>
    </html>
  );
}
