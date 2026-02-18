# Calendiq Architecture

## Overview

Calendiq is a **local-first**, **frontend-heavy** calendar application designed for 10.5" tablets. The architecture prioritizes data locality, offline functionality, and minimal backend dependencies.

---

## Architecture Principles

### 1. Local-First
- **Primary data storage:** IndexedDB (via Dexie.js)
- **No cloud dependencies** for calendar data
- Full offline functionality for core features
- Internet required only for AI features (OpenAI, Deepgram)

### 2. Frontend-Heavy
- React + TypeScript
- All business logic in frontend
- Repository pattern for data abstraction
- No persistent backend server

### 3. Minimal Backend
- Vercel Serverless Functions as API proxies only
- `/api/ai` - OpenAI proxy
- `/api/stt` - Deepgram proxy (if separate endpoint needed)
- API keys secured via Vercel environment variables

---

## System Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                     Calendiq PWA (Frontend)                 │
│  ┌────────────────────────────────────────────────────────┐ │
│  │  UI Layer (React + shadcn/ui)                          │ │
│  │  ├─ Setup Screen                                       │ │
│  │  ├─ PIN Screen                                         │ │
│  │  ├─ Calendar View (FullCalendar)                       │ │
│  │  ├─ Chat Panel                                         │ │
│  │  └─ Manual Event CRUD Modal                            │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                 │
│  ┌────────────────────────┴──────────────────────────────┐ │
│  │  Business Logic Layer                                 │ │
│  │  ├─ Event Manager (CRUD operations)                   │ │
│  │  ├─ Conflict Detector                                 │ │
│  │  ├─ AI Action Executor                                │ │
│  │  └─ PIN Validator                                     │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                 │
│  ┌────────────────────────┴──────────────────────────────┐ │
│  │  Repository Layer (IEventRepository)                  │ │
│  │  └─ IndexedDBEventRepository                          │ │
│  └────────────────────────────────────────────────────────┘ │
│                           │                                 │
│  ┌────────────────────────┴──────────────────────────────┐ │
│  │  Data Layer (Dexie.js)                                │ │
│  │  ├─ user_profile store                                │ │
│  │  ├─ events store                                      │ │
│  │  └─ chat_messages store                               │ │
│  └────────────────────────────────────────────────────────┘ │
│                                                             │
│                      IndexedDB (Browser)                    │
└─────────────────────────────────────────────────────────────┘
                           │
                           │ (API calls only)
                           ▼
┌─────────────────────────────────────────────────────────────┐
│              Vercel Serverless Functions                    │
│  ┌──────────────────┐         ┌──────────────────┐          │
│  │  /api/ai         │         │  /api/stt (opt)  │          │
│  │  (OpenAI Proxy)  │         │  (Deepgram)      │          │
│  └──────────────────┘         └──────────────────┘          │
└─────────────────────────────────────────────────────────────┘
           │                              │
           │                              │
           ▼                              ▼
   ┌──────────────┐              ┌──────────────┐
   │  OpenAI API  │              │ Deepgram API │
   │  (GPT-4o)    │              │  (STT)       │
   └──────────────┘              └──────────────┘
```

---

## Data Flow Layers

### 1. UI Layer
**Technology:** React, TypeScript, TailwindCSS, shadcn/ui, FullCalendar

**Responsibilities:**
- Render calendar view
- Display chat interface
- Handle user input (text, voice, touch)
- Show conflict warnings
- Manage PIN authentication
- Display setup wizard

### 2. Business Logic Layer
**Responsibilities:**
- Validate user input
- Execute AI actions
- Detect event conflicts (local)
- Manage event CRUD operations
- Hash and verify PIN
- Orchestrate data flow

### 3. Repository Layer
**Pattern:** Repository Pattern with interface abstraction

**Interface:**
```typescript
interface IEventRepository {
  create(event: Partial<CalendarEvent>): Promise<CalendarEvent>;
  update(id: string, updates: Partial<CalendarEvent>): Promise<CalendarEvent>;
  delete(id: string): Promise<void>;
  getById(id: string): Promise<CalendarEvent | undefined>;
  getAll(): Promise<CalendarEvent[]>;
  query(filter: EventFilter): Promise<CalendarEvent[]>;
}
```

**Implementation:**
- `IndexedDBEventRepository` (current MVP)
- `OscarAPIEventRepository` (future integration)

**Benefits:**
- Easy swapping of data sources
- Testability
- Future Oscar integration without refactoring

### 4. Data Layer
**Technology:** Dexie.js wrapper around IndexedDB

**Stores:**
- `user_profile` - Single user profile + PIN hash
- `events` - All calendar events
- `chat_messages` - Unlimited chat history

---

## Security Architecture

### PIN Security
- PIN is **never stored in plain text**
- SHA-256 hashing before storage
- Validation happens client-side (local-first principle)
- No PIN recovery in MVP (future enhancement)

### API Key Security
- OpenAI and Deepgram API keys stored in **Vercel Environment Variables**
- Keys **never** appear in source code or bundle
- Proxy functions act as secure middleware
- `.env` files in `.gitignore`

### Data Security
- All calendar data stays on device
- No cloud sync in MVP
- No external data transmission except AI requests
- IndexedDB isolated per origin/domain

---

## Offline Strategy

### Offline Capabilities
✅ View calendar  
✅ Create/edit/delete events manually  
✅ Browse chat history  
✅ PIN authentication  
✅ Conflict detection  

### Online Requirements
❌ AI chat functionality  
❌ Voice-to-text (Deepgram)  
❌ Initial setup (optional, for timestamp accuracy)  

### Service Worker Strategy
- Cache static assets (HTML, CSS, JS, icons)
- Cache FullCalendar assets
- Network-first for API calls
- Fallback to cached app shell when offline

---

## Component Architecture

### Core Components

```
src/
├── components/
│   ├── Setup/
│   │   └── SetupWizard.tsx          # First-time user setup
│   ├── PIN/
│   │   ├── PINScreen.tsx            # PIN entry screen
│   │   └── PINInput.tsx             # 4-digit PIN input component
│   ├── Calendar/
│   │   ├── CalendarView.tsx         # FullCalendar wrapper
│   │   ├── EventModal.tsx           # Create/Edit event modal
│   │   └── ConflictWarning.tsx      # Conflict notification
│   ├── Chat/
│   │   ├── ChatPanel.tsx            # Chat container
│   │   ├── ChatHistory.tsx          # Scrollable message list
│   │   ├── ChatInput.tsx            # Text input + voice button
│   │   └── VoiceRecorder.tsx        # Deepgram voice recording
│   └── Layout/
│       └── MainLayout.tsx           # Two-column tablet layout
```

---

## State Management

### Approach
**Local state + Context API** (no Redux for MVP simplicity)

### Context Providers
```typescript
<UserProvider>        // User profile, PIN status
  <EventProvider>     // All events, CRUD operations
    <ChatProvider>    // Chat messages, AI interaction
      <App />
    </ChatProvider>
  </EventProvider>
</UserProvider>
```

### Custom Hooks
- `useUser()` - User profile and authentication
- `useEvents()` - Event CRUD and queries
- `useChat()` - Chat history and AI interaction
- `useConflictDetection()` - Event overlap checking

---

## AI Integration Architecture

### OpenAI Flow
```
User Input → ChatInput.tsx
    ↓
/api/ai (Vercel Function)
    ↓
OpenAI API (GPT-4o)
    ↓
JSON Action Response
    ↓
Zod Schema Validation
    ↓
Action Executor
    ↓
IndexedDB Update
    ↓
Calendar UI Refresh
```

### Deepgram Flow (Voice)
```
User clicks mic → VoiceRecorder.tsx
    ↓
Audio Recording (Browser MediaRecorder)
    ↓
/api/ai (or /api/stt) with audio blob
    ↓
Deepgram API (STT)
    ↓
Transcript text
    ↓
Populate ChatInput
    ↓
User confirms → Continue to OpenAI flow
```

### Action Schema
```typescript
type AIAction =
  | { type: 'CREATE_EVENT'; payload: Partial<CalendarEvent> }
  | { type: 'UPDATE_EVENT'; id: string; payload: Partial<CalendarEvent> }
  | { type: 'DELETE_EVENT'; id: string }
  | { type: 'QUERY_EVENTS'; filter: EventFilter }
  | { type: 'NO_ACTION'; message: string };
```

---

## PWA Architecture

### Manifest
- Standalone display mode
- Landscape orientation lock
- 192x192 and 512x512 icons
- Theme color: indigo (#4f46e5)

### Service Worker
- Workbox or manual implementation
- Cache static assets
- Runtime caching for FullCalendar CDN assets
- Offline fallback page

### Installation
- User adds to home screen on tablet
- Launches in fullscreen mode
- Native app experience

---

## Future Architecture (Oscar Integration)

### Current: Standalone
```
Calendiq → IndexedDBEventRepository → IndexedDB
```

### Future: Oscar Backend
```
Calendiq → OscarAPIEventRepository → Oscar REST API → PostgreSQL
```

### Migration Strategy
1. **No change** to UI or business logic
2. **Only change:** Swap `IndexedDBEventRepository` with `OscarAPIEventRepository`
3. **Repository interface remains identical**
4. Optional: Sync layer for offline-first + cloud backup

---

## Technology Stack Summary

| Layer | Technology |
|-------|-----------|
| **Frontend Framework** | React 18 + TypeScript |
| **UI Library** | shadcn/ui (Radix + TailwindCSS) |
| **Calendar** | FullCalendar (MIT edition) |
| **Database** | IndexedDB (Dexie.js) |
| **Validation** | Zod |
| **API Proxy** | Vercel Serverless Functions |
| **AI** | OpenAI GPT-4o |
| **Speech-to-Text** | Deepgram API |
| **PWA** | Vite PWA Plugin |
| **Build Tool** | Vite |
| **Package Manager** | npm/pnpm |

---

## Performance Considerations

### Local-First Benefits
- Instant UI updates (no network latency)
- No server bottlenecks
- Scales to one device perfectly

### Optimization Strategies
- Lazy load FullCalendar views
- Virtualize chat history (react-window)
- Debounce conflict detection
- IndexedDB indexes on `start` and `end` for queries
- Memoize expensive computations (useMemo)

---

## Error Handling Architecture

### Offline Error Handling
- Check `navigator.onLine` before AI requests
- Show user-friendly "You're offline" message
- Gracefully fallback to manual event entry

### API Error Handling
- Retry logic for transient failures (3 attempts)
- User notification for persistent errors
- Log errors to browser console (no external logging in MVP)

### Data Validation Errors
- Zod schema validation for all AI responses
- Reject invalid actions with error message
- Allow user to retry or switch to manual mode

---

*This architecture document serves as the technical blueprint for Calendiq MVP development.*
