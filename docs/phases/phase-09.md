# Phase 8: PWA Configuration & Deployment

**Status:** Not Started  
**Estimated Time:** 2-3 hours  
**Dependencies:** Phase 7

---

## Objectives

- Configure PWA manifest
- Set up service worker for offline caching
- Generate app icons
- Deploy to Vercel
- Test PWA installation on tablet

---

## Tasks

### 8.1 Install PWA Plugin

```bash
npm install vite-plugin-pwa workbox-window -D
```

---

### 8.2 Configure Vite PWA Plugin

**vite.config.ts:**
```typescript
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'robots.txt', 'icons/*.png'],
      manifest: {
        name: 'Calendiq',
        short_name: 'Calendiq',
        description: 'Local-first AI-powered calendar for tablets',
        theme_color: '#4f46e5',
        background_color: '#ffffff',
        display: 'standalone',
        orientation: 'landscape',
        start_url: '/',
        icons: [
          {
            src: '/icons/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
          },
          {
            src: '/icons/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable',
          },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff,woff2}'],
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/fonts\.googleapis\.com\/.*/i,
            handler: 'CacheFirst',
            options: {
              cacheName: 'google-fonts-cache',
              expiration: {
                maxEntries: 10,
                maxAgeSeconds: 60 * 60 * 24 * 365, // 1 year
              },
              cacheableResponse: {
                statuses: [0, 200],
              },
            },
          },
        ],
      },
    }),
  ],
});
```

---

### 8.3 Generate App Icons

Use a tool like [PWA Asset Generator](https://github.com/elegantapp/pwa-asset-generator):

```bash
npx pwa-asset-generator logo.svg public/icons --background "#4f46e5" --splash-only false
```

Or create manually:
- 192x192 icon
- 512x512 icon
- favicon.ico

Place in `public/icons/`

---

### 8.4 Create robots.txt

**public/robots.txt:**
```
User-agent: *
Allow: /
```

---

### 8.5 Update index.html

**index.html:**
```html
<!DOCTYPE html>
<html lang="en">
  <head>
    <meta charset="UTF-8" />
    <link rel="icon" type="image/x-icon" href="/favicon.ico" />
    <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    <meta name="description" content="Local-first AI calendar for tablets" />
    <meta name="theme-color" content="#4f46e5" />
    <link rel="apple-touch-icon" href="/icons/icon-192.png" />
    <title>Calendiq</title>
  </head>
  <body>
    <div id="root"></div>
    <script type="module" src="/src/main.tsx"></script>
  </body>
</html>
```

---

### 8.6 Configure Vercel Deployment

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "headers": [
    {
      "source": "/sw.js",
      "headers": [
        {
          "key": "Cache-Control",
          "value": "public, max-age=0, must-revalidate"
        }
      ]
    },
    {
      "source": "/(.*)",
      "headers": [
        {
          "key": "X-Content-Type-Options",
          "value": "nosniff"
        },
        {
          "key": "X-Frame-Options",
          "value": "DENY"
        }
      ]
    }
  ]
}
```

---

### 8.7 Deploy to Vercel

```bash
# Install Vercel CLI
npm i -g vercel

# Login
vercel login

# Deploy
vercel

# Deploy to production
vercel --prod
```

---

### 8.8 Add Environment Variables on Vercel

1. Go to Vercel Dashboard
2. Select project
3. Settings → Environment Variables
4. Add:
   - `OPENAI_API_KEY`
   - `DEEPGRAM_API_KEY`
5. Redeploy

---

### 8.9 Test PWA Installation

**On iPad/Android Tablet:**

1. Open in Safari/Chrome
2. Tap Share → Add to Home Screen
3. Open from home screen
4. Verify standalone mode (no browser UI)
5. Test offline functionality

---

### 8.10 Create .env.example

**.env.example:**
```
# OpenAI API Key for AI chat functionality
OPENAI_API_KEY=

# Deepgram API Key for speech-to-text
DEEPGRAM_API_KEY=
```

---

## Acceptance Criteria

- [ ] PWA manifest configured correctly
- [ ] Icons generated and placed
- [ ] Service worker caches assets
- [ ] App works offline (calendar & manual CRUD)
- [ ] App installable on tablet
- [ ] Standalone mode works (no browser chrome)
- [ ] Landscape orientation enforced
- [ ] Deployed to Vercel successfully
- [ ] Environment variables configured

---

## Testing Checklist

- [ ] Install on tablet home screen
- [ ] Open from home screen (fullscreen)
- [ ] Create event offline
- [ ] Go online, use AI chat
- [ ] Go offline, verify calendar still works
- [ ] Close and reopen app
- [ ] Check IndexedDB persists

---

## Next Phase

Proceed to **Phase 9: Testing & Optimization**
