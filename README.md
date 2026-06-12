# Free Video Cropper

A privacy-first, high-performance online video cropper and trimmer built with Next.js, Tailwind CSS v4, and TypeScript. All video processing and rendering happens 100% locally in your web browser—your video files never touch the cloud, ensuring absolute privacy.

Designed with a premium developer-tool aesthetic inspired by Raycast, this web app functions as a native utility on any platform.

---

## Key Features

- **🔒 100% Client-Side Privacy**: Video files are processed entirely in the browser using modern web standards. No server uploads, no cookies, no tracking, and no watermark on exports.
- **📐 Precise Visual Cropping**: Scale and position your video crops using fluid handles or precise numeric percentage offsets. Supports aspect ratio presets (`Free`, `16:9`, `9:16`, `1:1`, `4:3`).
- **✂️ Timeline Trimming**: Cut out unwanted sections of your video. Use visual timeline handles to drag start and end points with live preview looping.
- **⚙️ Custom Export Controls**:
  - Export to **MP4** or **WebM** formats.
  - Option to retain or strip the audio track.
- **📱 PWA (Progressive Web App) Support**: Fully installable as a standalone app on your desktop, mobile, or tablet with offline launch capabilities.
- **✨ Premium Raycast UI/UX**: Built with an inky, high-contrast dark theme using monochrome surfaces, hairline 1px borders, keycap glyphs, and micro-animations.

---

## Tech Stack

- **Framework**: [Next.js](https://nextjs.org/) (App Router)
- **UI Library**: [React](https://react.dev/)
- **Styling**: [Tailwind CSS v4](https://tailwindcss.com/) (using PostCSS integration)
- **Language**: [TypeScript](https://www.typescriptlang.org/)
- **PWA & Offline Capability**: Service Worker API, Cache Storage API, and Web App Manifests
- **Deployment Adapter**: [OpenNext](https://open-next.js.org/) (`@opennextjs/cloudflare`)

---

## Getting Started

### Local Development

1. **Clone the repository**:
   ```bash
   git clone https://github.com/Srinadh118/video-cropper.git
   cd video-cropper
   ```

2. **Install dependencies**:
   ```bash
   npm install
   ```

3. **Start the development server**:
   ```bash
   npm run dev
   ```

4. Open [http://localhost:3000](http://localhost:3000) in your browser.

---

## Deploying to Cloudflare Pages (via GitHub)

This project is configured to deploy to Cloudflare Pages as a Cloudflare Worker using the recommended `@opennextjs/cloudflare` adapter. This compiles Next.js dynamic routing, server components, and asset handling to run on the Cloudflare Edge engine.

### Setup Instructions

1. **Push your code to GitHub**: Put your repository online.
2. **Log into Cloudflare**: Go to the Cloudflare Dashboard and select **Workers & Pages**.
3. **Create a Page**: Click **Create** -> **Pages** -> **Connect to Git** and select your repository.
4. **Configure Build Settings**:
   - **Framework Preset**: `None`
   - **Build Command**: `npm run build-pages`
   - **Build Output Directory**: `.open-next/assets`
5. **Configure Compatibility Flags**:
   - In the Cloudflare Pages settings, under **Settings** -> **Build & deployments** -> **Compatibility flags**:
     - Add the `nodejs_compat` flag under **Production compatibility flags** and **Preview compatibility flags** (this is required to execute Next.js Node.js polyfills on the V8 worker engine).
6. **Save and Deploy**: Click **Save and Deploy**. Cloudflare will pull your commits, compile the worker bundle, and deploy your site under a free `*.pages.dev` subdomain (with support for custom domains in the future).

---

## License

This project is open-source and available under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as needed.
