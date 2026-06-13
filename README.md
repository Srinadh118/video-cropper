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

## Deploying to Cloudflare Workers

This project is configured to deploy to Cloudflare Workers with Assets using the `@opennextjs/cloudflare` adapter. This compiles Next.js dynamic routing, server components, and static asset handling to run on the Cloudflare Edge engine.

### Prerequisites

1. A Cloudflare Account.
2. The Wrangler CLI installed (already included as a dev dependency).

### Deployment Steps

#### 1. CLI Deployment (Recommended)

You can build and deploy the application directly from your local environment:

1. **Log in to Cloudflare** via the CLI (if you haven't already):
   ```bash
   npx wrangler login
   ```
2. **Build and Deploy**:
   Run the deployment script:
   ```bash
   npm run deploy-worker
   ```
   This will automatically build the Next.js app with the OpenNext adapter (`npm run build-worker`) and deploy the generated worker and static assets using `wrangler deploy`.

#### 2. CI/CD Deployment (via GitHub Actions)

To deploy automatically on push to your repository:

1. Add your Cloudflare credentials (`CLOUDFLARE_API_TOKEN` and optionally `CLOUDFLARE_ACCOUNT_ID`) to your GitHub repository secrets.
2. Create a GitHub Actions workflow file (e.g. `.github/workflows/deploy.yml`):
   ```yaml
   name: Deploy to Cloudflare Workers
   on:
     push:
       branches:
         - main
   jobs:
     deploy:
       runs-on: ubuntu-latest
       steps:
         - uses: actions/checkout@v4
         - uses: actions/setup-node@v4
           with:
             node-cache: 'npm'
             node-version: 20
         - name: Install dependencies
           run: npm ci
         - name: Build and Deploy
           uses: cloudflare/wrangler-action@v3
           with:
             apiToken: ${{ secrets.CLOUDFLARE_API_TOKEN }}
             accountId: ${{ secrets.CLOUDFLARE_ACCOUNT_ID }}
             command: run deploy-worker
   ```

---

## License

This project is open-source and available under the [MIT License](LICENSE). Feel free to use, modify, and distribute it as needed.
