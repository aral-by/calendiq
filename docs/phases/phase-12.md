# Phase 12: Recurring Events & RRULE Integration

**Status:** Not Started  
**Estimated Time:** 5-6 hours  
**Dependencies:** Phase 4, Phase 5

---

## Objectives

- Implement RRULE (RFC 5545) format support for recurring events
- Integrate FullCalendar's recurring event plugin
- Build recurrence editor UI component
- Handle recurring event exceptions (skip specific dates)
- AI natural language parsing for recurrence patterns
- Edit single instance vs. entire series logic

---

## Tasks

### 12.1 Install Dependencies

```bash
npm install rrule
npm install @fullcalendar/rrule
```

---

### 12.2 Update Event Interface

Already updated in `src/types/event.ts`:
```typescript
interface CalendarEvent {
  // ... existing fields
  rrule?: string;              // RRULE string
  recurringEventId?: string;   // Parent event ID
  exceptionDates?: string[];   // Skipped dates
  isRecurring?: boolean;       // Quick check
}
```

---

### 12.3 Create RRULE Utility Service

**src/services/rruleService.ts:**
```typescript
import { RRule, Frequency } from 'rrule';

export interface RecurrencePattern {
  frequency: 'daily' | 'weekly' | 'monthly' | 'yearly';
  interval?: number;
  byWeekday?: number[]; // 0=MO, 1=TU, etc.
  byMonthDay?: number;
  count?: number;
  until?: Date;
}

export function createRRuleString(pattern: RecurrencePattern): string {
  const options: Partial<RRule> = {
    freq: getFrequency(pattern.frequency),
    interval: pattern.interval || 1,
  };

  if (pattern.byWeekday) {
    options.byweekday = pattern.byWeekday;
  }

  if (pattern.byMonthDay) {
    options.bymonthday = pattern.byMonthDay;
  }

  if (pattern.count) {
    options.count = pattern.count;
  }

  if (pattern.until) {
    options.until = pattern.until;
  }

  const rule = new RRule(options);
  return rule.toString().replace('RRULE:', '');
}

export function parseRRuleString(rruleStr: string): RecurrencePattern {
  const rule = RRule.fromString('RRULE:' + rruleStr);
  const options = rule.origOptions;

  return {
    frequency: getFrequencyName(options.freq),
    interval: options.interval,
    byWeekday: options.byweekday as number[],
    byMonthDay: options.bymonthday,
    count: options.count,
    until: options.until,
  };
}

export function getRecurringDates(
  rrule: string,
  start: Date,
  end: Date
): Date[] {
  const rule = RRule.fromString('RRULE:' + rrule, {
    dtstart: start,
  });

  return rule.between(start, end, true);
}

function getFrequency(freq: string): Frequency {
  const map: Record<string, Frequency> = {
    daily: RRule.DAILY,
    weekly: RRule.WEEKLY,
    monthly: RRule.MONTHLY,
    yearly: RRule.YEARLY,
  };
  return map[freq];
}

function getFrequencyName(freq: Frequency): string {
  const map: Record<number, string> = {
    [RRule.DAILY]: 'daily',
    [RRule.WEEKLY]: 'weekly',
    [RRule.MONTHLY]: 'monthly',
    [RRule.YEARLY]: 'yearly',
  };
  return map[freq];
}
```

---

### 12.4 Create Recurrence Editor Component

**src/components/Calendar/RecurrenceEditor.tsx:**
```typescript
import { useState } from 'react';
import { Label } from '@/components/ui/label';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { createRRuleString, type RecurrencePattern } from '@/services/rruleService';

interface RecurrenceEditorProps {
  initialPattern?: RecurrencePattern;
  onChange: (rrule: string | undefined) => void;
}

export function RecurrenceEditor({ initialPattern, onChange }: RecurrenceEditorProps) {
  const [enabled, setEnabled] = useState(!!initialPattern);
  const [frequency, setFrequency] = useState<string>(
    initialPattern?.frequency || 'daily'
  );
  const [interval, setInterval] = useState(initialPattern?.interval || 1);
  const [weekdays, setWeekdays] = useState<number[]>(
    initialPattern?.byWeekday || []
  );

  function handleUpdate() {
    if (!enabled) {
      onChange(undefined);
      return;
    }

    const pattern: RecurrencePattern = {
      frequency: frequency as any,
      interval,
      byWeekday: frequency === 'weekly' ? weekdays : undefined,
    };

    const rrule = createRRuleString(pattern);
    onChange(rrule);
  }

  return (
    <div className="space-y-4">
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          checked={enabled}
          onChange={(e) => {
            setEnabled(e.target.checked);
            if (!e.target.checked) onChange(undefined);
          }}
        />
        <Label>Repeat event</Label>
      </div>

      {enabled && (
        <>
          <div className="grid grid-cols-2 gap-4">
            <div>
              <Label>Frequency</Label>
              <Select value={frequency} onValueChange={setFrequency}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="daily">Daily</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                  <SelectItem value="yearly">Yearly</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Every</Label>
              <Input
                type="number"
                min={1}
                value={interval}
                onChange={(e) => setInterval(parseInt(e.target.value))}
              />
            </div>
          </div>

          {frequency === 'weekly' && (
            <div>
              <Label>Repeat on</Label>
              <div className="flex gap-2">
                {['M', 'T', 'W', 'T', 'F', 'S', 'S'].map((day, i) => (
                  <button
                    key={i}
                    className={`w-10 h-10 rounded-full ${
                      weekdays.includes(i)
                        ? 'bg-primary text-primary-foreground'
                        : 'bg-muted'
                    }`}
                    onClick={() => {
                      setWeekdays((prev) =>
                        prev.includes(i)
                          ? prev.filter((d) => d !== i)
                          : [...prev, i]
                      );
                    }}
                  >
                    {day}
                  </button>
                ))}
              </div>
            </div>
          )}

          <Button onClick={handleUpdate}>Update Recurrence</Button>
        </>
      )}
    </div>
  );
}
```

---

### 12.5 Update EventModal to Include Recurrence Editor

**src/components/Calendar/EventModal.tsx:**

Add RecurrenceEditor component after basic fields:

```typescript
import { RecurrenceEditor } from './RecurrenceEditor';

// In state
const [rrule, setRrule] = useState<string | undefined>(event?.rrule);

// In JSX (after reminder field)
<RecurrenceEditor initialPattern={rrule} onChange={setRrule} />

// Include in save payload
const eventData = {
  ...otherFields,
  rrule,
  isRecurring: !!rrule,
};
```

---

### 12.6 Integrate FullCalendar RRULE Plugin

**src/components/Calendar/CalendarView.tsx:**

```typescript
import rrulePlugin from '@fullcalendar/rrule';

// In FullCalendar plugins
plugins={[
  dayGridPlugin,
  timeGridPlugin,
  interactionPlugin,
  rrulePlugin, // Add this
]}

// Events with rrule
events={events.map(event => ({
  id: event.id,
  title: event.title,
  start: event.start,
  end: event.end,
  rrule: event.rrule, // FullCalendar will auto-expand
  exdate: event.exceptionDates, // Exceptions
  // ... other fields
}))}
```

---

### 12.7 Handle Recurring Event Editing

**src/hooks/useEvents.ts:**

```typescript
export function useEvents() {
  async function updateRecurringEvent(
    eventId: string,
    updates: Partial<CalendarEvent>,
    updateType: 'single' | 'series'
  ) {
    const event = await db.events.get(eventId);
    
    if (!event) return;

    if (updateType === 'series') {
      // Update parent event
      await db.events.update(event.recurringEventId || eventId, updates);
    } else {
      // Create exception for single instance
      const parentId = event.recurringEventId || eventId;
      const parent = await db.events.get(parentId);
      
      if (parent) {
        // Add to exception dates
        const exceptionDates = [...(parent.exceptionDates || []), event.start];
        await db.events.update(parentId, { exceptionDates });
      }

      // Create new non-recurring event for this instance
      const newEvent = {
        ...event,
        ...updates,
        id: crypto.randomUUID(),
        rrule: undefined,
        isRecurring: false,
      };
      await db.events.add(newEvent);
    }
  }

  return { updateRecurringEvent };
}
```

---

### 12.8 Update AI Action Schema for Recurrence

**src/types/ai.ts:**

```typescript
z.object({
  type: z.literal('CREATE_EVENT'),
  payload: z.object({
    title: z.string(),
    start: z.string(),
    end: z.string(),
    rrule: z.string().optional(), // AI-generated RRULE
    // ... other fields
  }),
}),
```

**api/ai.ts (system prompt update):**

```typescript
const systemPrompt = `
When user mentions recurring events, generate RRULE string:
- "every Monday" → "FREQ=WEEKLY;BYDAY=MO"
- "every day" → "FREQ=DAILY"
- "every 2 weeks" → "FREQ=WEEKLY;INTERVAL=2"
- "every Monday and Friday" → "FREQ=WEEKLY;BYDAY=MO,FR"

Examples:
User: "Her pazartesi saat 10'da toplantı ekle"
Response: {
  type: "CREATE_EVENT",
  payload: {
    title: "Toplantı",
    start: "2026-02-24T10:00:00Z",
    end: "2026-02-24T11:00:00Z",
    rrule: "FREQ=WEEKLY;BYDAY=MO"
  }
}
`;
```

---

## Testing Checklist

- [ ] Create daily recurring event manually
- [ ] Create weekly recurring event (specific days)
- [ ] Create monthly recurring event
- [ ] AI parses "every Monday" correctly
- [ ] Edit single instance creates exception
- [ ] Edit series updates all future instances
- [ ] Delete single instance adds to exceptionDates
- [ ] Delete series removes parent event
- [ ] FullCalendar displays recurring instances correctly
- [ ] Recurring events show in List View
- [ ] Recurring events trigger reminders correctly

---

## Acceptance Criteria

- [ ] Users can create recurring events with RRULE editor
- [ ] Daily, weekly, monthly, yearly frequencies supported
- [ ] Weekday selection works for weekly events
- [ ] AI correctly parses natural language recurrence patterns
- [ ] Edit single vs. edit series modal appears
- [ ] Exceptions handled correctly (exceptionDates)
- [ ] FullCalendar plugin renders recurring events
- [ ] Recurring events saved to IndexedDB
- [ ] No performance issues with 100+ recurring instances

---

## Known Limitations

- **Complex patterns:** "Last Friday of every month" not supported in MVP
- **End conditions:** Only supports indefinite or count-based (no until date in UI)
- **Timezone handling:** Assumes local timezone for all recurring events

---

## Next Phase

Proceed to **Phase 13: Categories & Event Organization**
