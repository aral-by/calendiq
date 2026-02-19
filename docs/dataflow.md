# Calendiq Data Flow

This document describes all major data flows in the Calendiq application.

---

## 1. Application Initialization Flow

### First Launch (New User)

```
App Start
    │
    ├─► Check IndexedDB for user_profile
    │       │
    │       └─► user_profile NOT found
    │               │
    │               ▼
    │       Show Setup Screen
    │               │
    │       ┌───────┴───────────────────────────┐
    │       │  User Input:                      │
    │       │  - First Name                     │
    │       │  - Last Name                      │
    │       │  - Birth Date                     │
    │       │  - PIN (4 digits)                 │
    │       │  - PIN Confirmation               │
    │       └───────┬───────────────────────────┘
    │               │
    │               ├─► Validate: PIN match?
    │               │       ├─ No → Show error, retry
    │               │       └─ Yes ↓
    │               │
    │               ├─► Hash PIN (SHA-256)
    │               │
    │               ├─► Create UserProfile object
    │               │
    │               ├─► Save to IndexedDB (user_profile)
    │               │
    │               └─► Navigate to Main Screen
    │
    └─► Initialize Dexie instance
            │
            └─► Ready
```

### Subsequent Launches (Returning User)

```
App Start
    │
    ├─► Check IndexedDB for user_profile
    │       │
    │       └─► user_profile FOUND
    │               │
    │               ▼
    │       Show PIN Entry Screen
    │               │
    │       ┌───────┴───────────────────────────┐
    │       │  User enters 4-digit PIN          │
    │       └───────┬───────────────────────────┘
    │               │
    │               ├─► Hash entered PIN
    │               │
    │               ├─► Compare with stored pinHash
    │               │       ├─ No match → Show error
    │               │       └─ Match ↓
    │               │
    │               └─► Navigate to Main Screen
    │
    └─► Load events from events store
            │
            └─► Load chat_messages from store
                    │
                    └─► Render Calendar + Chat
```

---

## 2. Manual Event Creation Flow

```
User clicks "+" button
    │
    ▼
Open Event Modal (empty form)
    │
    ├─► User fills form:
    │   ├─ Title (required)
    │   ├─ Description
    │   ├─ Start date/time (required)
    │   ├─ End date/time (required)
    │   ├─ All day toggle
    │   ├─ Location
    │   ├─ Color
    │   ├─ Priority
    │   ├─ Status
    │   └─ Tags
    │
    ├─► User clicks "Save"
    │
    ├─► Validate form
    │   ├─ Missing required fields? → Show error
    │   ├─ End before start? → Show error
    │   └─ Valid ↓
    │
    ├─► Run Conflict Detection
    │   ├─ Query events in time range
    │   ├─ Check for overlaps
    │   └─ Overlap found?
    │       ├─ Yes → Show warning modal
    │       │        ├─ "Continue anyway" → Proceed
    │       │        └─ "Cancel" → Return to form
    │       └─ No → Proceed
    │
    ├─► Generate UUID for event
    │
    ├─► Create CalendarEvent object
    │   ├─ Set createdAt (ISO 8601)
    │   └─ Set updatedAt (ISO 8601)
    │
    ├─► Save to IndexedDB (events store)
    │
    ├─► Update FullCalendar UI
    │
    └─► Close modal
```

---

## 3. Manual Event Update Flow

```
User clicks on existing event
    │
    ▼
Open Event Modal (pre-filled)
    │
    ├─► Load event data from IndexedDB
    │
    ├─► Populate form fields
    │
    ├─► User modifies fields
    │
    ├─► User clicks "Save"
    │
    ├─► Validate form (same as creation)
    │
    ├─► Run Conflict Detection
    │   └─ Exclude current event from check
    │
    ├─► Update CalendarEvent object
    │   └─ Set updatedAt (new timestamp)
    │
    ├─► Update in IndexedDB
    │
    ├─► Refresh FullCalendar UI
    │
    └─► Close modal
```

---

## 4. Manual Event Deletion Flow

```
User clicks on event
    │
    ▼
Open Event Modal
    │
    ├─► User clicks "Delete" button
    │
    ├─► Show confirmation dialog
    │   ├─ Cancel → Stay in modal
    │   └─ Confirm ↓
    │
    ├─► Delete from IndexedDB (events store)
    │
    ├─► Remove from FullCalendar UI
    │
    └─► Close modal
```

---

## 5. AI Chat Flow (Text Input)

```
User types message in chat input
    │
    ├─► User presses Enter or Send button
    │
    ├─► Check navigator.onLine
    │   ├─ Offline → Show "You're offline" message
    │   │            Suggest manual event creation
    │   └─ Online ↓
    │
    ├─► Display user message in chat UI
    │
    ├─► Show loading indicator
    │
    ├─► Send POST to /api/ai
    │   │
    │   └─► Vercel Function receives request
    │           │
    │           ├─► Extract message from body
    │           │
    │           ├─► Prepare OpenAI API request
    │           │   ├─ System prompt (calendar context)
    │           │   ├─ User message
    │           │   └─ Request structured JSON response
    │           │
    │           ├─► Call OpenAI API (GPT-4o)
    │           │
    │           ├─► Receive JSON action response
    │           │
    │           └─► Return to frontend
    │
    ├─► Receive AI response
    │
    ├─► Validate with Zod schema
    │   ├─ Invalid → Show error, log, stop
    │   └─ Valid ↓
    │
    ├─► Parse action type
    │
    ├─► Execute action:
    │   │
    │   ├─ CREATE_EVENT
    │   │   ├─ Run conflict detection
    │   │   ├─ Generate UUID
    │   │   ├─ Save to events store
    │   │   └─ Update calendar UI
    │   │
    │   ├─ UPDATE_EVENT
    │   │   ├─ Find event by ID
    │   │   ├─ Run conflict detection
    │   │   ├─ Update in events store
    │   │   └─ Refresh calendar UI
    │   │
    │   ├─ DELETE_EVENT
    │   │   ├─ Find event by ID
    │   │   ├─ Delete from events store
    │   │   └─ Remove from calendar UI
    │   │
    │   ├─ QUERY_EVENTS
    │   │   ├─ Query events store with filter
    │   │   ├─ Format results
    │   │   └─ Display in chat as response
    │   │
    │   └─ NO_ACTION
    │       └─ Display AI message only
    │
    ├─► Create ChatMessage object
    │   ├─ userMessage
    │   ├─ aiResponse
    │   ├─ timestamp
    │   ├─ actionType
    │   └─ actionPayload
    │
    ├─► Save to chat_messages store
    │
    ├─► Display AI response in chat UI
    │
    └─► Hide loading indicator
```

---

## 6. Voice Input Flow (Deepgram)

```
User clicks microphone button
    │
    ├─► Check navigator.onLine
    │   ├─ Offline → Show error
    │   └─ Online ↓
    │
    ├─► Request microphone permission
    │   ├─ Denied → Show error
    │   └─ Granted ↓
    │
    ├─► Start audio recording (MediaRecorder API)
    │
    ├─► Show recording indicator
    │
    ├─► User speaks
    │
    ├─► User clicks stop button (or auto-stop)
    │
    ├─► Stop recording
    │
    ├─► Get audio blob
    │
    ├─► Show processing indicator
    │
    ├─► Send audio to /api/ai (with special flag)
    │   │   OR /api/stt (if separate endpoint)
    │   │
    │   └─► Vercel Function receives audio
    │           │
    │           ├─► Forward to Deepgram API
    │           │
    │           ├─► Receive transcript
    │           │
    │           └─► Return transcript to frontend
    │
    ├─► Receive transcript text
    │
    ├─► Populate chat input field with text
    │
    ├─► User reviews/edits text (optional)
    │
    ├─► User clicks Send
    │
    └─► Continue to AI Chat Flow (Text Input)
```

---

## 7. Conflict Detection Flow

```
Event about to be created/updated
    │
    ├─► Extract start and end times
    │
    ├─► Query all events from events store
    │
    ├─► Filter events in same time range
    │   └─ If update: exclude current event ID
    │
    ├─► For each potentially conflicting event:
    │   │
    │   ├─► Check overlap logic:
    │   │   │
    │   │   ├─ new_start < existing_end AND
    │   │   │  new_end > existing_start
    │   │   │
    │   │   └─► Overlap detected?
    │   │       ├─ Yes → Add to conflicts array
    │   │       └─ No → Continue
    │   │
    │   └─► Return conflicts array
    │
    ├─► Conflicts found?
    │   │
    │   ├─ Yes → Show warning modal
    │   │        ├─ Display conflicting event details
    │   │        ├─ "Continue anyway" button
    │   │        └─ "Cancel" button
    │   │
    │   └─ No → Proceed with save
    │
    └─► End
```

---

## 8. PIN Validation Flow

```
User enters PIN (on app launch)
    │
    ├─► Collect 4 digits
    │
    ├─► Hash entered PIN with SHA-256
    │
    ├─► Load user_profile from IndexedDB
    │
    ├─► Compare hashed PIN with stored pinHash
    │   │
    │   ├─ Match → Grant access
    │   │          Navigate to Main Screen
    │   │
    │   └─ No match → Show error message
    │                 "Incorrect PIN"
    │                 Clear input
    │                 Allow retry
    │
    └─► End
```

---

## 9. Offline Detection Flow

```
User attempts AI action
    │
    ├─► Check navigator.onLine
    │   │
    │   ├─ false → Show notification:
    │   │          "You're offline. Use manual event creation."
    │   │          ├─ Show "+" button highlight
    │   │          └─ Disable chat input
    │   │
    │   └─ true → Proceed with API call
    │
    └─► Listen for offline/online events
        │
        ├─ Goes offline → Disable AI features
        │                 Show banner notification
        │
        └─ Comes online → Enable AI features
                          Hide banner
```

---

## 10. Data Persistence Flow

### IndexedDB Stores

```
Dexie Instance
    │
    ├─► user_profile (single record)
    │   ├─ Primary Key: id (always 1)
    │   └─ Fields: firstName, lastName, birthDate, pinHash, createdAt
    │
    ├─► events (multiple records)
    │   ├─ Primary Key: id (UUID)
    │   ├─ Indexes: start, end
    │   └─ Fields: title, description, location, start, end, allDay,
    │              color, tags, priority, status, createdAt, updatedAt
    │
    └─► chat_messages (multiple records, unlimited)
        ├─ Primary Key: id (UUID)
        ├─ Index: timestamp
        └─ Fields: userMessage, aiResponse, timestamp,
                   actionType, actionPayload
```

### Auto-sync Strategy
- **All writes are immediate** (no batching in MVP)
- **No conflicts** (single device, single user)
- **No versioning** (simple overwrite on update)

---

## 11. PWA Installation Flow

```
User visits app in browser
    │
    ├─► Service Worker registered
    │
    ├─► Browser shows "Add to Home Screen" prompt
    │   (or user opens browser menu)
    │
    ├─► User selects "Add to Home Screen"
    │
    ├─► Icon added to tablet home screen
    │
    ├─► User taps icon
    │
    ├─► App launches in standalone mode
    │   ├─ No browser chrome
    │   ├─ Landscape orientation locked
    │   └─ Fullscreen experience
    │
    └─► App loads from cache (if offline)
        or fetches latest (if online)
```

---

## 12. Error Recovery Flows

### API Call Failure
```
API request fails (timeout, 500, etc.)
    │
    ├─► Retry logic (up to 3 attempts)
    │   ├─ Exponential backoff
    │   └─ Still failing? ↓
    │
    ├─► Show user-friendly error
    │   "AI is temporarily unavailable.
    │    Please try again or use manual entry."
    │
    ├─► Log error to console
    │
    └─► Enable "Try Again" button
```

### Invalid AI Response
```
Receive malformed JSON from AI
    │
    ├─► Zod validation fails
    │
    ├─► Log error with response details
    │
    ├─► Show error to user
    │   "AI gave an unexpected response.
    │    Please rephrase or use manual entry."
    │
    └─► Do NOT modify IndexedDB
```

### IndexedDB Write Failure
```
Dexie.put() or .add() fails
    │
    ├─► Catch exception
    │
    ├─► Check error type:
    │   ├─ QuotaExceededError → "Storage full"
    │   ├─ ConstraintError → "Duplicate ID"
    │   └─ Other → Generic error
    │
    ├─► Show error toast/modal
    │
    └─► Do NOT update UI (keep consistent state)
```

---

## 13. Reminder Notification Flow

### Setting a Reminder (Manual or AI)

```
User creates/edits event
    │
    ├─► Manual Form:
    │   └─► Select reminder option (dropdown)
    │       ├─ 0 minutes (at event time)
    │       ├─ 5, 10, 15, 30, 60 minutes before
    │       └─ 1440 minutes (1 day) before
    │
    └─► AI Command:
        └─► Parse: "10 dakika önce hatırlat"
            └─► Extract reminder: 10 (minutes)
    
    ▼
Save event with reminder field
    │
    └─► IndexedDB (events) with reminder value
```

### Notification Permission Request

```
App Initialization OR First Event with Reminder
    │
    ├─► Check Notification.permission
    │       ├─ "granted" → Skip
    │       ├─ "denied" → Show warning (can't send notifications)
    │       └─ "default" → Request permission
    │                   │
    │                   ├─► User grants → Continue
    │                   └─► User denies → Disable notifications
    │
    └─► Store permission state in memory
```

### Background Reminder Check

```
Service Worker (every 1 minute timer)
    │
    ├─► Current time = Now
    │
    ├─► Query IndexedDB (events):
    │   └─► WHERE reminder IS NOT NULL
    │       AND start - reminder <= Now
    │       AND start > Now (event hasn't started yet)
    │       AND notificationSent != true
    │
    ├─► For each matching event:
    │   │
    │   ├─► Calculate reminder time
    │   │   └─► reminderTime = event.start - event.reminder minutes
    │   │
    │   ├─► If reminderTime <= Now:
    │   │   │
    │   │   ├─► Create notification payload:
    │   │   │   {
    │   │   │     title: event.title,
    │   │   │     body: `Starts at ${formatTime(event.start)}`,
    │   │   │     icon: '/icon-192.png',
    │   │   │     tag: event.id,
    │   │   │     data: { eventId: event.id, action: 'open-event' }
    │   │   │   }
    │   │   │
    │   │   ├─► Send notification via Service Worker
    │   │   │   └─► self.registration.showNotification(...)
    │   │   │
    │   │   └─► Mark event as notified:
    │   │       └─► Update event.notificationSent = true
    │   │           (or store in separate reminders_sent array)
    │   │
    │   └─► Continue to next event
    │
    └─► Wait 1 minute → Repeat
```

### Notification Click Handling

```
User clicks notification
    │
    ├─► Service Worker receives 'notificationclick' event
    │
    ├─► Extract eventId from notification.data
    │
    ├─► Close notification
    │
    ├─► Open PWA window (or focus existing)
    │   └─► clients.openWindow('/') or clients.matchAll()
    │
    └─► Navigate to event:
        ├─► Option 1: URL with eventId query param
        │   └─► '/?eventId=abc123'
        │
        └─► Option 2: PostMessage to client
            └─► client.postMessage({ action: 'open-event', eventId })
    
    ▼
Main App receives message
    │
    ├─► Find event by ID
    │
    ├─► Open Event Detail Modal
    │
    └─► Highlight event in FullCalendar
```

### Edge Cases

```
PWA is closed:
    └─► Service Worker still runs (background)
        └─► Notification sent ✅
        └─► Click opens PWA ✅

Browser is closed completely:
    └─► Service Worker may not run (browser dependent)
        └─► Notification may not be sent ⚠️
        └─► Limitation: Not a native app

Notification permission denied:
    └─► Skip notification sending
        └─► Log warning to console
        └─► Event still has reminder field (for future permission grant)

Multiple reminders for same event:
    └─► MVP: Single reminder per event
        └─► Future: Array of reminders
```

---

## Data Flow Diagrams Summary

```
┌──────────────┐
│    User      │
└──────┬───────┘
       │
       ├────► PIN Entry → IndexedDB (user_profile)
       │                     │
       │                     └──► Authenticated
       │
       ├────► Manual CRUD → Event Form → Validation
       │                                      │
       │                              Conflict Detection
       │                                      │
       │                              IndexedDB (events)
       │                                      │
       │                                FullCalendar UI
       │
       └────► AI Chat → Voice (Deepgram) → Transcript
                │                              │
                └──────────────────► Text Input
                                         │
                                   /api/ai (Vercel)
                                         │
                                   OpenAI GPT-4o
                                         │
                                    JSON Action
                                         │
                                   Zod Validation
                                         │
                                   Action Executor
                                         │
                            ┌────────────┴────────────┐
                            │                         │
                      IndexedDB (events)     IndexedDB (chat_messages)
                            │                         │
                      FullCalendar UI            Chat History UI
```

---

## 14. Recurring Event Creation Flow

```
User creates event with recurrence
    │
    ├─► Manual Form:
    │   └─► Enable "Repeat event" toggle
    │       └─► Recurrence Editor opens
    │           ├─ Select frequency (daily/weekly/monthly/yearly)
    │           ├─ Set interval (every N days/weeks/etc.)
    │           ├─ [Weekly only] Select weekdays
    │           └─ Click "Update Recurrence"
    │                   │
    │                   └─► Generate RRULE string
    │                       (e.g., "FREQ=WEEKLY;BYDAY=MO,WE,FR")
    │
    └─► AI Command:
        └─► Parse natural language
            ├─ "her pazartesi" → "FREQ=WEEKLY;BYDAY=MO"
            ├─ "her gün" → "FREQ=DAILY"
            └─ "her 2 haftada bir" → "FREQ=WEEKLY;INTERVAL=2"
    
    ▼
Validate and Save Event
    │
    ├─► Create CalendarEvent object:
    │   ├─ rrule: "FREQ=WEEKLY;BYDAY=MO"
    │   ├─ isRecurring: true
    │   ├─ recurringEventId: null (this IS the parent)
    │   └─ exceptionDates: []
    │
    ├─► Save to IndexedDB (events)
    │
    └─► FullCalendar expands RRULE:
        └─► Renders multiple event instances
            (computed on-the-fly, not stored)
```

---

## 15. Recurring Event Edit Flow

### Edit Single Instance

```
User clicks on recurring event instance
    │
    ├─► Open Event Modal
    │   └─► Show "This is a recurring event" notice
    │
    ├─► User makes changes (e.g., change time)
    │
    ├─► User clicks "Save"
    │
    ├─► Show dialog: "Edit this event" or "Edit all events in series"
    │
    ├─► User selects "Edit this event"
    │
    ├─► Find parent event (via recurringEventId or this IS parent)
    │
    ├─► Add instance date to parent's exceptionDates array:
    │   └─► exceptionDates: [...existing, "2026-02-24T10:00:00Z"]
    │
    ├─► Update parent event in IndexedDB
    │
    ├─► Create NEW non-recurring event:
    │   ├─ id: new UUID
    │   ├─ rrule: undefined
    │   ├─ isRecurring: false
    │   ├─ recurringEventId: parent.id
    │   └─ ... modified fields (new time, etc.)
    │
    ├─► Save new event to IndexedDB
    │
    └─► Refresh FullCalendar:
        ├─ Parent event instances skip exception date
        └─ New event renders at modified time
```

### Edit Series

```
User clicks on recurring event instance
    │
    ├─► Show dialog: "Edit this event" or "Edit all events in series"
    │
    ├─► User selects "Edit all events in series"
    │
    ├─► Find parent event
    │
    ├─► User makes changes:
    │   ├─ Update RRULE (e.g., change weekdays)
    │   └─ Or update title, description, etc.
    │
    ├─► Update parent event in IndexedDB:
    │   └─► All future instances reflect changes
    │
    └─► Refresh FullCalendar
```

### Delete Single Instance

```
User deletes recurring event instance
    │
    ├─► Show dialog: "Delete this event" or "Delete all events in series"
    │
    ├─► User selects "Delete this event"
    │
    ├─► Add instance date to parent's exceptionDates:
    │   └─► exceptionDates: [...existing, "2026-02-24T10:00:00Z"]
    │
    ├─► Update parent event in IndexedDB
    │
    └─► Refresh FullCalendar:
        └─ Instance no longer renders
```

### Delete Series

```
User deletes recurring event instance
    │
    ├─► User selects "Delete all events in series"
    │
    ├─► Delete parent event from IndexedDB
    │
    ├─► Delete all child events (instances with recurringEventId)
    │
    └─► Refresh FullCalendar:
        └─ All instances removed
```

---

## 16. Category Auto-Assignment Flow

### Manual Event Creation

```
User creates event manually
    │
    ├─► User types event title/description
    │
    ├─► Auto-categorization triggered (debounced 500ms)
    │   │
    │   └─► CategoryService.categorizeEvent(title, description)
    │       │
    │       ├─► Extract keywords from text
    │       │
    │       ├─► Score against 6 categories:
    │       │   ├─ Work: "toplantı", "meeting", "presentation", "proje"
    │       │   ├─ Personal: "kişisel", "ev", "home"
    │       │   ├─ Health: "doktor", "gym", "sağlık", "spor"
    │       │   ├─ Social: "akşam yemeği", "kahve", "party"
    │       │   ├─ Finance: "fatura", "bill", "banka", "ödeme"
    │       │   └─ Education: "ders", "class", "okul", "kurs"
    │       │
    │       ├─► Return highest scoring category + confidence:
    │       │   └─► { category: 'work', confidence: 0.85 }
    │       │
    │       └─► Update form state:
    │           ├─ Set category dropdown to 'work'
    │           ├─ Set categoryColor to '#3b82f6'
    │           └─ Show confidence badge: "AI Confidence: 85%"
    │
    ├─► User can override category (dropdown change)
    │
    └─► User saves event:
        └─► Store with:
            ├─ category: 'work'
            ├─ categoryColor: '#3b82f6'
            └─ autoCategorizationConfidence: 0.85
```

### AI Event Creation

```
User sends AI command: "Yarın saat 15'te doktor randevum var"
    │
    ├─► /api/ai receives message
    │
    ├─► GPT-4o analyzes event type
    │
    ├─► AI assigns category in JSON response:
    │   {
    │     "type": "CREATE_EVENT",
    │     "payload": {
    │       "title": "Doktor Randevusu",
    │       "start": "2026-02-24T15:00:00Z",
    │       "end": "2026-02-24T16:00:00Z",
    │       "category": "health",
    │       "categoryColor": "#ef4444"
    │     }
    │   }
    │
    ├─► Action executor creates event with category
    │
    └─► Event renders in calendar with red color (health)
```

### Category Filtering

```
User views calendar
    │
    ├─► Category Legend displays at top:
    │   ├─ [🔵 Work] [🟢 Personal] [🔴 Health]
    │   ├─ [🟠 Social] [🟣 Finance] [🔵 Education]
    │   └─ All categories active by default
    │
    ├─► User clicks category badge (e.g., "Work")
    │   │
    │   ├─► Toggle category in activeCategories Set
    │   │   └─► If active: remove from Set
    │   │       If inactive: add to Set
    │   │
    │   └─► Filter events:
    │       └─► Only show events where category IN activeCategories
    │
    └─► FullCalendar re-renders with filtered events
```

---

## 17. Daily Summary Notification Flow

### Scheduler Initialization

```
App Start
    │
    ├─► Start Reminder Scheduler (Phase 7)
    │
    └─► Start Daily Summary Scheduler:
        │
        ├─► Set interval: every 60 minutes
        │
        └─► Run immediately on start (then hourly)
```

### Daily Check Logic

```
Every 60 minutes:
    │
    ├─► Get current time
    │
    ├─► Check if current hour == 8 (08:00)
    │   ├─ No → Skip this cycle
    │   └─ Yes ↓
    │
    ├─► Check localStorage: lastDailySummaryDate
    │   ├─ Today's date already sent? → Skip
    │   └─ New day ↓
    │
    ├─► Check user preference: dailySummaryEnabled
    │   ├─ false → Skip
    │   └─ true ↓
    │
    ├─► Query IndexedDB:
    │   └─► events WHERE start >= startOfDay(today)
    │                 AND start <= endOfDay(today)
    │
    ├─► No events today?
    │   └─► Skip (no notification)
    │
    ├─► Sort events by start time
    │
    ├─► Format event list:
    │   └─► For each event:
    │       └─► "09:00 [work] Team Meeting"
    │           "13:00 [health] Gym Session"
    │           "18:00 [social] Dinner with friends"
    │
    ├─► Create notification:
    │   {
    │     title: "Good morning! You have 3 events today",
    │     body: eventList (joined by \n),
    │     tag: "daily-summary",
    │     data: { eventId: 'daily-summary', action: 'open-calendar' }
    │   }
    │
    ├─► Send notification via Service Worker
    │
    ├─► Save to localStorage:
    │   └─► lastDailySummaryDate = today.toDateString()
    │
    └─► Log: "Daily summary sent"
```

### User Settings

```
User opens Settings panel
    │
    ├─► Toggle: "Daily Morning Summary (08:00)"
    │   └─► Default: Checked (enabled)
    │
    ├─► User unchecks toggle
    │
    ├─► Save to localStorage:
    │   └─► dailySummaryEnabled = 'false'
    │
    └─► Daily summary scheduler respects setting:
        └─► Will not send notifications until re-enabled
```

---

*This data flow document maps all user interactions and system processes in Calendiq.*
