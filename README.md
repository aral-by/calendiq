# Calendiq

> A local-first, AI-powered calendar application

Calendiq is a privacy-focused calendar app that runs entirely on your device. Built with React, TypeScript, and IndexedDB, it offers AI-powered event creation through natural language and voice input while keeping all your data local.

**Current MVP:** Optimized for 10.5" tablets (landscape mode). Mobile phone support planned for future releases.

## Features

- **Local-First Architecture** - All calendar data stored locally in IndexedDB, no cloud dependency
- **AI-Powered Event Creation** - Create events using natural language via OpenAI GPT-4o
- **Voice Input** - Speak your events using Deepgram speech-to-text
- **Manual Event Management** - Full CRUD operations without AI
- **Event Reminders** - Set reminders (5, 10, 15, 30 min, 1 hour, 1 day before) with browser notifications
- **Conflict Detection** - Automatically warns about overlapping events
- **PIN Authentication** - Secure 4-digit PIN with SHA-256 hashing
- **Offline Capable** - Works completely offline for calendar operations
- **PWA Support** - Install as a native app on tablets
- **Tablet-Optimized** - MVP designed for 10.5" landscape tablets (mobile support coming soon)

## Tech Stack

### Frontend
- **React 18** with TypeScript
- **TailwindCSS** for styling
- **shadcn/ui** component library
- **FullCalendar** for calendar views
- **Dexie.js** for IndexedDB management
- **Zod** for validation

### Backend
- **Vercel Serverless Functions** for API proxies
- **OpenAI GPT-4o** for AI event parsing
- **Deepgram** for speech-to-text

### Infrastructure
- **Vite** for build tooling
- **Vercel** for deployment
- **PWA** via Vite PWA Plugin

## Installation

### Prerequisites

- Node.js 18+ and npm/pnpm
- OpenAI API key
- Deepgram API key
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
   ```bash
   cp .env.example .env
   ```
   
   Edit `.env` and add your API keys:
   ```
   OPENAI_API_KEY=sk-proj-...
   DEEPGRAM_API_KEY=...
   ```

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

4. **Add environment variables on Vercel**
   - Go to Vercel Dashboard → Your Project → Settings → Environment Variables
   - Add `OPENAI_API_KEY`
   - Add `DEEPGRAM_API_KEY`

5. **Deploy to production**
   ```bash
   vercel --prod
   ```

### Install as PWA

**On Tablet:**
1. Open deployed URL in Safari (iPad) or Chrome (Android tablet)
2. Tap Share → Add to Home Screen
3. Launch from home screen for fullscreen experience

**On Phone:** Mobile-responsive version coming in future updates

## Usage

### First Time Setup

1. Open the app
2. Enter your first name, last name, and birth date
3. Create a 4-digit PIN (remember it - no recovery in MVP)
4. Start using your calendar

### Creating Events

**Via AI Chat:**
- Type: "Meeting with Sarah tomorrow at 3pm for 1 hour"
- Voice: Tap mic → speak your request → confirm → send

**Manually:**
- Click any time slot on the calendar
- Fill in event details
- Save

**Via Chat:**
Type natural language requests like:
- "Lunch with John next Monday at noon"
- "Dentist appointment on Friday at 2pm"
- "Team meeting every day at 9am for this week"

### Managing Events

- **View:** All events display on the weekly calendar
- **Edit:** Click an event → modify details → save
- **Delete:** Click an event → delete button → confirm
- **Conflicts:** System warns if events overlap

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

This project is organized into 11 phases for systematic development:

1. **Project Setup & Infrastructure**
2. **Database Layer & Repository Pattern**
3. **Authentication & PIN System**
4. **Calendar UI & Manual CRUD**
5. **Chat Interface & AI Integration**
6. **Speech-to-Text Integration (Deepgram)**
7. **Reminder & Notification System**
8. **Conflict Detection & Validation**
9. **PWA Configuration & Deployment**
10. **Testing & Optimization**
11. **Documentation & Release**

Each phase has detailed documentation in `docs/phases/`. Complete phases sequentially for best results.

## API Keys

### Getting Your Keys

**OpenAI:**
1. Go to https://platform.openai.com/api-keys
2. Create a new API key
3. Copy and save securely

**Deepgram:**
1. Go to https://console.deepgram.com/
2. Create an API key
3. Copy and save securely

### Security

- API keys are **never** committed to the repository
- Keys are stored in Vercel environment variables
- Frontend bundle contains **no** API keys
- All API calls go through serverless proxy functions

## Browser Support

- **Recommended:** Safari on iPad, Chrome on Android tablets/phones
- **Requirements:** Modern browser with IndexedDB support
- **MVP Tested on:** iPad (10.5"), Android tablets (10.1")
- **Mobile Support:** Coming soon

## Known Limitations

This is an MVP with intentional scope limitations:

- No recurring events
- No cloud sync
- Single user only
- No PIN recovery
- No timezone management
- Mobile phone UI not yet optimized (tablet-first MVP)
- No calendar import/export

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

Priority roadmap for post-MVP releases:

### Phase X: Batch Actions for Complex AI Commands
- Support multi-step operations ("cancel weekend plans and reschedule")
- AI returns action arrays for complex workflows
- Enhanced natural language understanding

### Phase Y: Telegram Chatbot Integration
- Manage calendar via Telegram bot
- Receive reminders in Telegram
- Two-way sync between PWA and Telegram messages
- Voice and text commands from mobile

### Other Enhancements
- **Mobile Phone Support** - Responsive UI for smartphones
- **Oscar Integration** - Connect to Oscar backend via REST API
- **Recurring Events** - Support for repeating calendar entries
- **PIN Recovery** - Secure PIN reset mechanism
- **Export/Import** - iCal format support
- **Multi-user** - Shared calendars
- **Snooze Reminders** - Defer notifications
- **Dark Mode** - Theme toggle

See [docs/phases/phase-11.md](docs/phases/phase-11.md#future-enhancements) for detailed future roadmap.

## License

MIT License - see [LICENSE](LICENSE) file for details

## Acknowledgments

- Built with [React](https://react.dev/)
- UI components from [shadcn/ui](https://ui.shadcn.com/)
- Calendar by [FullCalendar](https://fullcalendar.io/)
- AI by [OpenAI](https://openai.com/)
- Speech-to-text by [Deepgram](https://deepgram.com/)

## Support

- **Issues:** [GitHub Issues](https://github.com/YOUR_USERNAME/calendiq/issues)
- **Discussions:** [GitHub Discussions](https://github.com/YOUR_USERNAME/calendiq/discussions)

---

**Made with ❤️ as a hobby project**

*Calendiq is designed for personal use. Always keep backups of important calendar data.*
