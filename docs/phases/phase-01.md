# Phase 1: Project Setup & Infrastructure

**Status:** Finished  
**Estimated Time:** 2-3 hours  
**Dependencies:** None

---

## Objectives

- Initialize project with modern React + TypeScript stack
- Configure build tools (Vite)
- Set up TailwindCSS and shadcn/ui
- Configure Vercel deployment
- Establish project structure

---

## Tasks

### 1.1 Initialize React + Vite Project

```bash
npm create vite@latest calendiq -- --template react-ts
cd calendiq
npm install
```

**Verify:**
- `npm run dev` starts development server
- TypeScript compilation works
- Hot module replacement (HMR) functional

---

### 1.2 Install Core Dependencies

```bash
# UI Framework
npm install tailwindcss postcss autoprefixer
npx tailwindcss init -p

# shadcn/ui setup
npx shadcn-ui@latest init

# Utilities
npm install clsx tailwind-merge class-variance-authority
npm install uuid
npm install -D @types/uuid
```

---

### 1.3 Configure TailwindCSS

**tailwind.config.js:**
```javascript
export default {
  darkMode: ["class"],
  content: [
    "./index.html",
    "./src/**/*.{ts,tsx,js,jsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: "#4f46e5", // Indigo
        }
      }
    },
  },
  plugins: [require("tailwindcss-animate")],
}
```

**src/styles/globals.css:**
```css
@tailwind base;
@tailwind components;
@tailwind utilities;
```

---

### 1.4 Install shadcn/ui Components

```bash
npx shadcn-ui@latest add button
npx shadcn-ui@latest add dialog
npx shadcn-ui@latest add input
npx shadcn-ui@latest add label
npx shadcn-ui@latest add select
npx shadcn-ui@latest add toast
npx shadcn-ui@latest add calendar
npx shadcn-ui@latest add badge
```

---

### 1.5 Create Directory Structure

Create folders as per `directory-structure.md`:

```
src/
├── components/
│   ├── Setup/
│   ├── PIN/
│   ├── Calendar/
│   ├── Chat/
│   ├── Layout/
│   └── ui/ (shadcn)
├── db/
│   └── repositories/
├── hooks/
├── context/
├── services/
├── types/
├── lib/
├── styles/
└── assets/
```

---

### 1.6 Configure Path Aliases

**tsconfig.json:**
```json
{
  "compilerOptions": {
    "baseUrl": ".",
    "paths": {
      "@/*": ["./src/*"]
    }
  }
}
```

**vite.config.ts:**
```typescript
import path from 'path'

export default defineConfig({
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src')
    }
  }
})
```

---

### 1.7 Set Up Vercel Project

```bash
npm install -g vercel
vercel login
vercel
```

**vercel.json:**
```json
{
  "buildCommand": "npm run build",
  "outputDirectory": "dist",
  "devCommand": "npm run dev",
  "installCommand": "npm install",
  "framework": "vite",
  "functions": {
    "api/**/*.ts": {
      "memory": 1024,
      "maxDuration": 10
    }
  }
}
```

---

### 1.8 Create Environment Files

**.env.example:**
```
OPENAI_API_KEY=
DEEPGRAM_API_KEY=
```

**.gitignore:**
```
node_modules/
dist/
.env
.env.local
.vercel/
.DS_Store
```

---

### 1.9 Create Basic App Shell

**src/App.tsx:**
```typescript
function App() {
  return (
    <div className="min-h-screen bg-background">
      <h1 className="text-4xl font-bold text-center p-8">
        Calendiq
      </h1>
      <p className="text-center text-muted-foreground">
        Setup in progress...
      </p>
    </div>
  )
}

export default App
```

---

### 1.10 Initial Git Commit

```bash
git init
git add .
git commit -m "Initial project setup"
git branch -M main
git remote add origin https://github.com/YOUR_USERNAME/calendiq.git
git push -u origin main
```

---

## Acceptance Criteria

- [ ] Project runs locally with `npm run dev`
- [ ] TailwindCSS classes work correctly
- [ ] shadcn/ui components render properly
- [ ] Path aliases (`@/`) resolve correctly
- [ ] Project deploys to Vercel successfully
- [ ] All folders from directory structure created
- [ ] .env.example committed, .env gitignored
- [ ] Initial commit pushed to GitHub

---

## Testing

```bash
# Development server
npm run dev

# Production build
npm run build
npm run preview

# Deploy to Vercel
vercel --prod
```

---

## Next Phase

Proceed to **Phase 2: Database Layer & Repository Pattern**
