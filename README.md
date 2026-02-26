# Calendiq

> A local-first, AI-powered calendar application

Calendiq is a privacy-focused calendar app that runs entirely on your device. Built with React, TypeScript, and IndexedDB, it offers AI-powered event creation through natural language and voice input while keeping all your data local.

**Current Status:** Fully responsive design supporting tablets, desktops, and mobile devices.

## Features

> **Note:** Default language is Turkish (TR). Application is optimized for Turkish users with UTC+3 (Turkey) timezone.

### Core Features

- **Local-First Architecture** - All calendar data stored locally in IndexedDB, no cloud dependency
- **AI-Powered Event Creation** - Create events using natural language via Groq AI
- **Voice Input with Real-Time Visualization** - Speak your events using Groq Whisper API with live audio level indicators and automatic silence detection
- **Multi-Model AI Support** - Choose from multiple AI models including GPT-4, Claude, DeepSeek, and more
- **Manual Event Management** - Full CRUD operations without AI
- **Event Reminders** - Set reminders (5, 10, 15, 30 min, 1 hour, 1 day before) with browser notifications
- **Conflict Detection** - Automatically warns about overlapping events
- **PIN Authentication** - Secure 4-digit PIN with SHA-256 hashing
- **Offline Capable** - Works completely offline for calendar operations
- **PWA Support** - Install as a native app on any device

### Productivity Features

- **Statistics Dashboard** - Comprehensive analytics with charts showing event distribution, time allocation, and productivity metrics
- **Quick Search** - Keyboard shortcut (Cmd+K / Ctrl+K) for instant search across all events with fuzzy matching
- **Sticky Notes** - Quick note-taking feature integrated into the calendar interface
- **Chat History Management** - Session-based conversation tracking with the ability to create, switch, and manage multiple chat sessions
- **Mobile Responsive Design** - Fully optimized UI for mobile phones, tablets, and desktop screens with touch-friendly controls

### User Experience

- **Smart Sidebar** - Collapsible navigation with mobile-optimized close button
- **Markdown Support** - Rich text formatting in AI responses and event descriptions
- **Greeting System** - Personalized time-based and casual greetings
- **Loading States** - Visual feedback for AI processing and voice transcription
- **Error Handling** - User-friendly dialog-based error messages instead of alerts

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **Recharts** for statistics and data visualization
- **Dexie.js** for IndexedDB management
- **Zod** for validation
- **react-markdown** for rich text rendering
- **date-fns** for date manipulation
- **lucide-react** for icons
- **rrule** for recurring events

### Backend
- **Vercel Serverless Functions** for API proxies
- **Groq API** for AI model access (llama-3.3-70b-versatile, gpt-4o, claude-sonnet-4, deepseek-r1, and more)
- **Groq Whisper** (whisper-large-v3-turbo) for speech-to-text with Turkish language support

### Infrastructure
- **Vite** for build tooling
- **Vercel** for deployment
- **PWA** via Vite PWA Plugin
- **Web Audio API** for real-time audio visualization

## Installation

### Prerequisites

- Node.js 18+ and npm/pnpm
- Groq API key (get from https://console.groq.com/keys - free tier available)
- Vercel account (for deployment)

### Local Development

1. **Clone the repository**
   ```bash
   git clone https://github.com/YOUR_USERNAME/calendiq.git
   cd calendiq
   ```

2. **Install dependencies**
   ```bash
   npm install
   ```

3. **Set up environment variables**
   
   Create a `.env` file:
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your Groq API key:
   ```
   # Required for both AI chat and voice input
   VITE_GROQ_API_KEY=your_groq_api_key_here
   GROQ_API_KEY=your_groq_api_key_here
   ```
   
   > **Note:** `VITE_GROQ_API_KEY` is used for development (direct API calls), while `GROQ_API_KEY` is used in production (serverless functions).

4. **Run development server**
   ```bash
   npm run dev
   ```
   
   Open http://localhost:5173

### Deployment to Vercel

1. **Install Vercel CLI**
   ```bash
   npm install -g vercel
   ```

2. **Login to Vercel**
   ```bash
   vercel login
   ```

3. **Deploy**
   ```bash
   vercel
   ```

4. **Configure environment variables on Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `GROQ_API_KEY` (required - get from https://console.groq.com/keys)
   
   > **Note:** Never commit API keys to the repository. Always use environment variables.

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Install as PWA

**On Any Device:**
1. Open deployed URL in your browser (Chrome, Safari, Firefox, Edge)
2. Look for "Install" or "Add to Home Screen" prompt
3. Tap/click Install
4. Launch from home screen or app drawer for fullscreen experience

**Platform-specific:**
- **iPad/iPhone:** Safari → Share → Add to Home Screen
- **Android:** Chrome → Menu → Add to Home Screen
- **Desktop:** Chrome/Edge → Address bar → Install icon

## Usage

### First Time Setup

1. Open the app
2. Enter your first name, last name, and birth date
3. Create a 4-digit PIN (remember it - no recovery in MVP)
4. Start using your calendar

### Creating Events

**Via AI Chat:**
- Type natural language: "Meeting with Sarah tomorrow at 3pm for 1 hour"
- Voice input: Tap microphone icon → speak your request → automatic transcription after 2 seconds of silence
- Real-time visualization: Audio bars respond to your voice level during recording
- Automatic stop: Recording stops automatically after 2 seconds of silence

**Manually:**
- Click any time slot on the calendar
- Fill in event details (title, date, time, location, notes, reminders)
- Save

**Natural Language Examples:**
- "Lunch with John next Monday at noon"
- "Dentist appointment on Friday at 2pm"
- "Team meeting every day at 9am for this week"
- "Cancel all my meetings tomorrow"

### Managing Events

- **View:** All events display on the weekly calendar view
- **Edit:** Click an event → modify details → save
- **Delete:** Click an event → delete button → confirm
- **Conflicts:** System warns if events overlap with existing ones
- **Search:** Press Cmd+K (Mac) or Ctrl+K (Windows/Linux) to open quick search
- **Filter:** Search by title, location, or date

### Statistics Dashboard

Access comprehensive analytics:
- **Overview Cards:** Total events, upcoming events, completed events, today's events, total hours
- **Event Distribution:** Visual breakdown by category and status
- **Time Allocation:** Bar chart showing hours spent per category
- **Weekly Activity:** Line chart tracking event patterns over time

### Chat Features

- **Model Selection:** Choose from multiple AI models (GPT-4, Claude, DeepSeek, etc.)
- **Session Management:** Create new chat sessions, switch between sessions, view history
- **Markdown Support:** AI responses support rich text formatting
- **Voice Input:** Microphone button with real-time audio visualization
- **Auto-suggestions:** Quick action prompts for common tasks

### Sticky Notes

- Quick note-taking feature accessible from sidebar
- Perfect for temporary reminders and quick thoughts
- Integrated with the calendar interface

## Architecture

Calendiq follows a **repository pattern** for future extensibility:

```
UI Layer (React Components)
    ↓
Business Logic (Hooks & Services)
    ↓
Repository Layer (Interfaces)
    ↓
Data Layer (IndexedDB via Dexie)
```

This architecture allows easy migration to a backend service (Oscar integration) in the future by simply swapping the repository implementation.

See [docs/architecture.md](docs/architecture.md) for detailed architecture documentation.

## Project Structure

```
calendiq-base/
├── src/
│   ├── components/      # React components
│   ├── db/              # Dexie instance & repositories
│   ├── hooks/           # Custom React hooks
│   ├── context/         # React Context providers
│   ├── services/        # Business logic
│   ├── types/           # TypeScript interfaces
│   └── lib/             # Utilities
├── api/                 # Vercel serverless functions
├── docs/                # Documentation
│   ├── architecture.md
│   ├── dataflow.md
│   ├── directory-structure.md
│   └── phases/          # Development phases
├── public/              # Static assets
└── mvp.md               # Product requirements
```

See [docs/directory-structure.md](docs/directory-structure.md) for complete structure.

## Development Phases

This project was developed through systematic phases:

1. **Project Setup & Infrastructure**
2. **Database Layer & Repository Pattern**
3. **Authentication & PIN System**
4. **Calendar UI & Manual CRUD**
5. **Chat Interface & AI Integration**
6. **Voice Input Integration (Groq Whisper)**
7. **Reminder & Notification System**
8. **Conflict Detection & Validation**
9. **Statistics Dashboard & Analytics**
10. **Search Functionality & Quick Actions**
11. **Mobile Responsive Design**
12. **PWA Configuration & Deployment**

Each phase built upon the previous, ensuring a solid foundation. See `docs/phases/` for detailed documentation.

## API Keys

### Getting Your Keys

**Groq:**
1. Visit https://console.groq.com/
2. Sign up for a free account (no credit card required)
3. Navigate to API Keys section
4. Create a new API key
5. Copy and save securely

**Free Tier Benefits:**
- 14,400 requests per day
- Access to multiple models including:
  - llama-3.3-70b-versatile (default)
  - gpt-4o
  - claude-sonnet-4
  - deepseek-r1-distill-llama-70b
  - whisper-large-v3-turbo (for voice)

### Security

- API keys are stored in environment variables, never in code
- Production uses serverless proxy functions to protect keys
- Development mode supports direct API calls for faster iteration
- Frontend bundle contains no API keys in production build
- All sensitive operations go through secure serverless endpoints

## Browser Support

- **Recommended:** Chrome, Safari, Edge, Firefox (latest versions)
- **Requirements:** 
  - Modern browser with IndexedDB support
  - Web Audio API support (for voice input)
  - MediaRecorder API support (for voice recording)
- **Tested on:** 
  - Desktop: Chrome, Safari, Edge, Firefox
  - Mobile: Safari (iOS), Chrome (Android)
  - Tablets: iPad, Android tablets

## Known Limitations

This is an MVP with intentional scope limitations:

- **Authentication:** No PIN recovery mechanism
- **Data Management:** No cloud sync or backup
- **User Management:** Single user only
- **Events:** Limited recurring event support
- **Timezone:** Fixed UTC+3 (Turkey timezone)
- **Export/Import:** No calendar file export/import
- **Offline Voice:** Voice transcription requires internet connection (Groq API)

See [docs/known-limitations.md](docs/phases/phase-10.md#known-limitations) for complete list.

## Contributing

Contributions are welcome! This is a hobby project and open to improvements.

### How to Contribute

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Make your changes
4. Test thoroughly
5. Commit (`git commit -m 'Add amazing feature'`)
6. Push (`git push origin feature/amazing-feature`)
7. Open a Pull Request

### Development Guidelines

- Follow existing code patterns
- Add TypeScript types for all props
- Keep components small and focused
- Write meaningful commit messages
- Update documentation if needed

## Future Plans

Priority roadmap for future releases:

### Near-Term Enhancements
- **Calendar Import/Export** - iCal format support for data portability
- **Enhanced Recurring Events** - More complex recurrence patterns
- **PIN Recovery** - Secure PIN reset mechanism via email
- **Multi-timezone Support** - Handle events across different timezones
- **Dark Mode** - System-aware theme toggle
- **Snooze Reminders** - Defer notifications with custom intervals

### Advanced Features
- **Batch Actions** - Complex multi-step operations via AI ("cancel weekend plans and reschedule")
- **Telegram Chatbot Integration** - Manage calendar via Telegram bot with two-way sync
- **Oscar Backend Integration** - Connect to Oscar backend via REST API for cloud sync
- **Multi-user Support** - Shared calendars and collaboration features
- **Event Templates** - Reusable event configurations
- **Attachment Support** - Add files and images to events
- **Advanced Analytics** - Productivity insights and recommendations

### Enterprise Features
- **Team Calendars** - Organization-wide calendar management
- **Access Control** - Role-based permissions
- **Audit Logs** - Track changes and modifications
- **SSO Integration** - Single sign-on support
- **Calendar Sharing** - Public/private calendar links
- **Meeting Rooms** - Resource booking system

See [docs/phases/phase-11.md](docs/phases/phase-11.md#future-enhancements) for detailed future roadmap.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Built with [React](https://react.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Charts by [Recharts](https://recharts.org/)
- AI models by [Groq](https://groq.com/)
- Voice transcription by [Groq Whisper](https://console.groq.com/docs/speech-text)
- Icons by [Lucide](https://lucide.dev/)
- Date handling by [date-fns](https://date-fns.org/)

## Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/calendiq/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/calendiq/discussions)

---

**Made with ❤️ as a hobby project**

*Calendiq is designed for personal use. Always keep backups of important calendar data.*
