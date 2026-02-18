# Calendiq Directory Structure

This document describes the complete folder and file organization for the Calendiq project.

---

## Root Structure

```
calendiq-base/
├── public/                    # Static assets
├── src/                       # Source code
├── api/                       # Vercel serverless functions
├── docs/                      # Documentation
├── .env                       # Environment variables (gitignored)
├── .env.example               # Example environment file
├── .gitignore                 # Git ignore rules
├── package.json               # Dependencies
├── tsconfig.json              # TypeScript configuration
├── vite.config.ts             # Vite build configuration
├── tailwind.config.js         # TailwindCSS configuration
├── postcss.config.js          # PostCSS configuration
├── index.html                 # Entry HTML
├── vercel.json                # Vercel deployment config
├── README.md                  # Main documentation
└── mvp.md                     # Product requirements
```

---

## `/public` - Static Assets

```
public/
├── manifest.json              # PWA manifest
├── sw.js                      # Service worker (optional manual)
├── robots.txt                 # SEO robots file
├── icons/
│   ├── icon-192.png           # PWA icon (192x192)
│   ├── icon-512.png           # PWA icon (512x512)
│   ├── favicon.ico            # Browser favicon
│   └── apple-touch-icon.png   # iOS icon
└── fonts/                     # Custom fonts (if any)
```

**Purpose:**
- Contains all static files served as-is
- PWA icons and manifest
- Assets accessible at root URL

---

## `/src` - Application Source Code

```
src/
├── main.tsx                   # Application entry point
├── App.tsx                    # Root component
├── vite-env.d.ts              # Vite type definitions
│
├── components/                # React components
│   ├── Setup/
│   │   ├── SetupWizard.tsx        # First-time setup flow
│   │   ├── SetupForm.tsx          # Setup form fields
│   │   └── index.ts               # Barrel export
│   │
│   ├── PIN/
│   │   ├── PINScreen.tsx          # PIN entry screen
│   │   ├── PINInput.tsx           # 4-digit PIN input
│   │   ├── PINPad.tsx             # On-screen number pad (optional)
│   │   └── index.ts
│   │
│   ├── Calendar/
│   │   ├── CalendarView.tsx       # FullCalendar wrapper
│   │   ├── EventModal.tsx         # Create/Edit event modal
│   │   ├── EventForm.tsx          # Event form fields
│   │   ├── ConflictWarning.tsx    # Overlap warning modal
│   │   ├── EventDetails.tsx       # Read-only event view
│   │   └── index.ts
│   │
│   ├── Chat/
│   │   ├── ChatPanel.tsx          # Main chat container
│   │   ├── ChatHistory.tsx        # Scrollable message list
│   │   ├── ChatMessage.tsx        # Single message bubble
│   │   ├── ChatInput.tsx          # Text input + send button
│   │   ├── VoiceRecorder.tsx      # Voice recording component
│   │   ├── TypingIndicator.tsx    # AI typing animation
│   │   └── index.ts
│   │
│   ├── Layout/
│   │   ├── MainLayout.tsx         # Two-column tablet layout
│   │   ├── Header.tsx             # App header (optional)
│   │   └── index.ts
│   │
│   └── ui/                        # shadcn/ui components
│       ├── button.tsx
│       ├── dialog.tsx
│       ├── input.tsx
│       ├── label.tsx
│       ├── select.tsx
│       ├── toast.tsx
│       ├── calendar.tsx           # Date picker
│       ├── popover.tsx
│       ├── badge.tsx
│       └── ... (other shadcn components)
│
├── db/                        # Database layer
│   ├── index.ts                   # Dexie instance + schema
│   ├── migrations.ts              # IndexedDB migrations (if any)
│   │
│   ├── repositories/              # Repository pattern
│   │   ├── IEventRepository.ts        # Event repository interface
│   │   ├── IndexedDBEventRepository.ts # IndexedDB implementation
│   │   ├── IUserRepository.ts         # User repository interface
│   │   ├── IndexedDBUserRepository.ts # IndexedDB implementation
│   │   ├── IChatRepository.ts         # Chat repository interface
│   │   ├── IndexedDBChatRepository.ts # IndexedDB implementation
│   │   └── index.ts                   # Barrel export
│   │
│   └── utils/
│       ├── queryHelpers.ts        # Query utility functions
│       └── dateHelpers.ts         # Date range queries
│
├── hooks/                     # Custom React hooks
│   ├── useUser.ts                 # User profile & auth
│   ├── useEvents.ts               # Event CRUD operations
│   ├── useChat.ts                 # Chat & AI interaction
│   ├── useConflictDetection.ts    # Event overlap checking
│   ├── useOnlineStatus.ts         # Online/offline detection
│   ├── useVoiceRecorder.ts        # Voice recording logic
│   └── index.ts
│
├── context/                   # React Context providers
│   ├── UserContext.tsx            # User state & authentication
│   ├── EventContext.tsx           # Event state & operations
│   ├── ChatContext.tsx            # Chat state & AI calls
│   └── index.ts
│
├── services/                  # API and external services
│   ├── ai.ts                      # OpenAI API calls
│   ├── stt.ts                     # Deepgram API calls
│   ├── conflictDetector.ts        # Conflict detection logic
│   └── pinHasher.ts               # PIN hashing utilities
│
├── types/                     # TypeScript types
│   ├── event.ts                   # CalendarEvent interface
│   ├── user.ts                    # UserProfile interface
│   ├── chat.ts                    # ChatMessage interface
│   ├── ai.ts                      # AIAction types
│   └── index.ts
│
├── lib/                       # Utility libraries
│   ├── utils.ts                   # General utilities (cn, etc.)
│   ├── validators.ts              # Zod schemas
│   ├── constants.ts               # App constants
│   └── dateUtils.ts               # Date formatting
│
├── styles/                    # Global styles
│   ├── globals.css                # TailwindCSS imports + custom
│   └── fullcalendar-override.css  # FullCalendar customizations
│
└── assets/                    # Images, icons (if not in public)
    └── logo.svg
```

---

## `/api` - Vercel Serverless Functions

```
api/
├── ai.ts                      # OpenAI proxy endpoint
│   └─► POST /api/ai
│       ├─ Input: { message: string, audio?: blob }
│       ├─ Calls: OpenAI API (GPT-4o)
│       ├─ Calls: Deepgram API (if audio present)
│       └─ Output: { action: AIAction, message: string }
│
└── [stt.ts]                   # Optional separate Deepgram endpoint
    └─► POST /api/stt
        ├─ Input: { audio: blob }
        ├─ Calls: Deepgram API
        └─ Output: { transcript: string }
```

**Note:** Serverless functions run in Node.js environment (Vercel runtime).

---

## `/docs` - Documentation

```
docs/
├── architecture.md            # System architecture
├── dataflow.md                # Data flow diagrams
├── directory-structure.md     # This file
│
├── phases/                    # Development phases
│   ├── phase-01.md            # Phase 1: Setup
│   ├── phase-02.md            # Phase 2: Database
│   ├── phase-03.md            # Phase 3: Auth
│   ├── phase-04.md            # Phase 4: Calendar
│   ├── phase-05.md            # Phase 5: Chat
│   ├── phase-06.md            # Phase 6: Voice
│   ├── phase-07.md            # Phase 7: Conflict
│   ├── phase-08.md            # Phase 8: PWA
│   ├── phase-09.md            # Phase 9: Testing
│   └── phase-10.md            # Phase 10: Deployment
│
└── copilot-notes/             # Session notes (optional)
    └── session1.md
```

---

## Configuration Files

### `.env` (Not committed)
```
OPENAI_API_KEY=sk-proj-...
DEEPGRAM_API_KEY=...
```

### `.env.example` (Committed)
```
OPENAI_API_KEY=
DEEPGRAM_API_KEY=
```

### `.gitignore`
```
# Dependencies
node_modules/

# Build output
dist/
.vercel/

# Environment
.env
.env.local

# IDE
.vscode/
.idea/

# OS
.DS_Store
Thumbs.db

# Logs
*.log
```

### `package.json`
```json
{
  "name": "calendiq",
  "version": "1.0.0",
  "type": "module",
  "scripts": {
    "dev": "vite",
    "build": "tsc && vite build",
    "preview": "vite preview",
    "lint": "eslint . --ext ts,tsx"
  },
  "dependencies": {
    "react": "^18.2.0",
    "react-dom": "^18.2.0",
    "@fullcalendar/react": "^6.1.0",
    "@fullcalendar/daygrid": "^6.1.0",
    "@fullcalendar/timegrid": "^6.1.0",
    "dexie": "^3.2.0",
    "dexie-react-hooks": "^1.1.0",
    "zod": "^3.22.0",
    "@radix-ui/react-*": "latest",
    "class-variance-authority": "^0.7.0",
    "clsx": "^2.0.0",
    "tailwind-merge": "^2.0.0",
    "uuid": "^9.0.0"
  },
  "devDependencies": {
    "@types/react": "^18.2.0",
    "@types/react-dom": "^18.2.0",
    "@types/node": "^20.0.0",
    "@types/uuid": "^9.0.0",
    "@vitejs/plugin-react": "^4.2.0",
    "typescript": "^5.3.0",
    "vite": "^5.0.0",
    "vite-plugin-pwa": "^0.17.0",
    "tailwindcss": "^3.4.0",
    "postcss": "^8.4.0",
    "autoprefixer": "^10.4.0",
    "eslint": "^8.55.0"
  }
}
```

### `tsconfig.json`
```json
{
  "compilerOptions": {
    "target": "ES2020",
    "useDefineForClassFields": true,
    "lib": ["ES2020", "DOM", "DOM.Iterable"],
    "module": "ESNext",
    "skipLibCheck": true,
    "moduleResolution": "bundler",
    "allowImportingTsExtensions": true,
    "resolveJsonModule": true,
    "isolatedModules": true,
    "noEmit": true,
    "jsx": "react-jsx",
    "strict": true,
    "noUnusedLocals": true,
    "noUnusedParameters": true,
    "noFallthroughCasesInSwitch": true,
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  },
  "include": ["src"],
  "references": [{ "path": "./tsconfig.node.json" }]
}
```

### `vite.config.ts`
```typescript
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'
import path from 'path'

export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      manifest: {
        name: 'Calendiq',
        short_name: 'Calendiq',
        theme_color: '#4f46e5',
        icons: [ /* ... */ ]
      }
    })
  ],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

### `vercel.json`
```json
{
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  },
  "rewrites": [
    {
      "source": "/(.*)",
      "destination": "/index.html"
    }
  ]
}
```

---

## Import Path Conventions

### Absolute Imports (using `@/`)
```typescript
// Components
import { CalendarView } from '@/components/Calendar'
import { ChatPanel } from '@/components/Chat'

// Hooks
import { useEvents } from '@/hooks/useEvents'

// Types
import type { CalendarEvent } from '@/types/event'

// Services
import { detectConflicts } from '@/services/conflictDetector'

// Utils
import { cn } from '@/lib/utils'
```

### Relative Imports (within same module)
```typescript
// Inside components/Calendar/EventModal.tsx
import { EventForm } from './EventForm'
import { ConflictWarning } from './ConflictWarning'
```

---

## File Naming Conventions

| Type | Convention | Example |
|------|-----------|---------|
| Components | PascalCase | `CalendarView.tsx` |
| Hooks | camelCase with `use` prefix | `useEvents.ts` |
| Types | camelCase | `event.ts`, `user.ts` |
| Services | camelCase | `conflictDetector.ts` |
| Utils | camelCase | `dateUtils.ts` |
| Constants | UPPER_SNAKE_CASE in file | `constants.ts` |
| Context | PascalCase with `Context` | `UserContext.tsx` |
| API routes | camelCase | `ai.ts`, `stt.ts` |

---

## Component Organization Pattern

Each component folder follows this pattern:

```
ComponentGroup/
├── MainComponent.tsx      # Main exported component
├── SubComponent.tsx       # Sub-components (not exported)
├── types.ts               # Local types (if any)
├── styles.module.css      # Component-specific styles (optional)
└── index.ts               # Barrel export
```

**Example:**
```typescript
// components/Calendar/index.ts
export { CalendarView } from './CalendarView'
export { EventModal } from './EventModal'
// Don't export EventForm (internal use only)
```

---

## Build Output

```
dist/                          # Production build (gitignored)
├── index.html                 # Entry HTML
├── assets/
│   ├── index-[hash].js        # Bundled JS
│   ├── index-[hash].css       # Bundled CSS
│   └── [asset]-[hash].ext     # Other assets
├── manifest.json
└── sw.js                      # Service worker
```

---

## Development vs Production Paths

### Development (Vite Dev Server)
```
http://localhost:5173/
├── /                          # App root
├── /api/ai                    # Proxied via Vercel CLI
└── /api/stt                   # Proxied via Vercel CLI
```

### Production (Vercel)
```
https://calendiq.vercel.app/
├── /                          # App root (from dist/)
├── /api/ai                    # Serverless function
└── /api/stt                   # Serverless function
```

---

## Architecture Alignment

This directory structure follows the principles outlined in `architecture.md`:

- **UI Layer** → `/src/components`
- **Business Logic** → `/src/services`, `/src/hooks`
- **Repository Pattern** → `/src/db/repositories`
- **Data Layer** → `/src/db`
- **API Proxy** → `/api`

---

*This directory structure is designed for scalability, maintainability, and clear separation of concerns.*
