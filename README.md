This is a [Next.js](https://nextjs.org) project bootstrapped with [`create-next-app`](https://nextjs.org/docs/app/api-reference/cli/create-next-app).

## Getting Started

First, run the development server:

```bash
npm run dev
# or
yarn dev
# or
pnpm dev
# or
bun dev
```

Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

You can start editing the page by modifying `app/page.tsx`. The page auto-updates as you edit the file.

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

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

