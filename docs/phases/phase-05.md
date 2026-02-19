# Phase 5: Chat Interface & AI Integration

**Status:** Not Started  
**Estimated Time:** 5-6 hours  
**Dependencies:** Phase 4

---

## Objectives

- Build chat UI component
- Create OpenAI proxy API endpoint
- Implement AI action parsing and validation
- Connect chat to event operations
- Save chat history to IndexedDB

---

## Tasks

### 5.1 Install Dependencies

```bash
npm install zod
```

---

### 5.2 Create AI Action Types and Validation

**src/types/ai.ts:**
```typescript
import { z } from 'zod';

export const AIActionSchema = z.discriminatedUnion('type', [
  z.object({
    type: z.literal('CREATE_EVENT'),
    payload: z.object({
      title: z.string(),
      start: z.string(),
      end: z.string(),
      description: z.string().optional(),
      location: z.string().optional(),
      allDay: z.boolean().optional(),
    }),
  }),
  z.object({
    type: z.literal('UPDATE_EVENT'),
    id: z.string(),
    payload: z.record(z.any()),
  }),
  z.object({
    type: z.literal('DELETE_EVENT'),
    id: z.string(),
  }),
  z.object({
    type: z.literal('QUERY_EVENTS'),
    filter: z.record(z.any()).optional(),
  }),
  z.object({
    type: z.literal('NO_ACTION'),
    message: z.string(),
  }),
]);

export type AIAction = z.infer<typeof AIActionSchema>;
```

---

### 5.3 Create OpenAI Proxy Endpoint

**api/ai.ts:**
```typescript
import type { VercelRequest, VercelResponse } from '@vercel/node';

export default async function handler(req: VercelRequest, res: VercelResponse) {
  if (req.method !== 'POST') {
    return res.status(405).json({ error: 'Method not allowed' });
  }

  const { message } = req.body;

  if (!message) {
    return res.status(400).json({ error: 'Message is required' });
  }

  const OPENAI_API_KEY = process.env.OPENAI_API_KEY;

  if (!OPENAI_API_KEY) {
    return res.status(500).json({ error: 'OpenAI API key not configured' });
  }

  try {
    const response = await fetch('https://api.openai.com/v1/chat/completions', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${OPENAI_API_KEY}`,
      },
      body: JSON.stringify({
        model: 'gpt-4o',
        messages: [
          {
            role: 'system',
            content: `You are a calendar assistant. Parse user requests and return JSON actions.
            
Available actions:
- CREATE_EVENT: { type: 'CREATE_EVENT', payload: { title, start, end, description?, location?, allDay? } }
- UPDATE_EVENT: { type: 'UPDATE_EVENT', id, payload: { ...updates } }
- DELETE_EVENT: { type: 'DELETE_EVENT', id }
- QUERY_EVENTS: { type: 'QUERY_EVENTS', filter?: {...} }
- NO_ACTION: { type: 'NO_ACTION', message: 'your response' }

Always return valid JSON. Dates in ISO 8601 format.`,
          },
          {
            role: 'user',
            content: message,
          },
        ],
        response_format: { type: 'json_object' },
      }),
    });

    const data = await response.json();
    const aiResponse = data.choices[0].message.content;
    const action = JSON.parse(aiResponse);

    return res.status(200).json({ action, message: aiResponse });
  } catch (error) {
    console.error('OpenAI API error:', error);
    return res.status(500).json({ error: 'Failed to process AI request' });
  }
}
```

---

### 5.4 Create Chat Context

**src/context/ChatContext.tsx:**
```typescript
import { createContext, useContext, useState, ReactNode } from 'react';
import type { ChatMessage } from '@/types/chat';
import type { AIAction } from '@/types/ai';
import { IndexedDBChatRepository } from '@/db/repositories';
import { AIActionSchema } from '@/types/ai';

interface ChatContextValue {
  messages: ChatMessage[];
  loading: boolean;
  sendMessage: (message: string) => Promise<AIAction | null>;
  loadHistory: () => Promise<void>;
}

const ChatContext = createContext<ChatContextValue | undefined>(undefined);

export function ChatProvider({ children }: { children: ReactNode }) {
  const [messages, setMessages] = useState<ChatMessage[]>([]);
  const [loading, setLoading] = useState(false);
  
  const chatRepo = new IndexedDBChatRepository();

  async function loadHistory() {
    const history = await chatRepo.getAll();
    setMessages(history);
  }

  async function sendMessage(message: string): Promise<AIAction | null> {
    setLoading(true);
    
    try {
      const response = await fetch('/api/ai', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ message }),
      });

      if (!response.ok) throw new Error('API request failed');

      const { action } = await response.json();
      
      // Validate with Zod
      const validatedAction = AIActionSchema.parse(action);

      // Save to chat history
      await chatRepo.create({
        userMessage: message,
        aiResponse: JSON.stringify(validatedAction),
        timestamp: new Date().toISOString(),
        actionType: validatedAction.type,
        actionPayload: 'payload' in validatedAction ? validatedAction.payload : null,
      });

      await loadHistory();
      
      return validatedAction;
    } catch (error) {
      console.error('Chat error:', error);
      return null;
    } finally {
      setLoading(false);
    }
  }

  return (
    <ChatContext.Provider value={{ messages, loading, sendMessage, loadHistory }}>
      {children}
    </ChatContext.Provider>
  );
}

export function useChat() {
  const context = useContext(ChatContext);
  if (!context) throw new Error('useChat must be used within ChatProvider');
  return context;
}
```

---

### 5.5 Create Chat Panel Component

**src/components/Chat/ChatPanel.tsx:**
```typescript
import { useEffect, useRef } from 'react';
import { useChat } from '@/context/ChatContext';
import { useEvents } from '@/context/EventContext';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';

export function ChatPanel() {
  const { messages, sendMessage, loadHistory } = useChat();
  const { createEvent, updateEvent, deleteEvent } = useEvents();

  useEffect(() => {
    loadHistory();
  }, []);

  async function handleSendMessage(message: string) {
    const action = await sendMessage(message);
    
    if (!action) return;

    // Execute action
    switch (action.type) {
      case 'CREATE_EVENT':
        await createEvent(action.payload);
        break;
      case 'UPDATE_EVENT':
        await updateEvent(action.id, action.payload);
        break;
      case 'DELETE_EVENT':
        await deleteEvent(action.id);
        break;
      // QUERY_EVENTS and NO_ACTION handled in UI
    }
  }

  return (
    <div className="h-full flex flex-col">
      <div className="flex-1 overflow-y-auto">
        <ChatHistory messages={messages} />
      </div>
      <div className="border-t pt-4">
        <ChatInput onSend={handleSendMessage} />
      </div>
    </div>
  );
}
```

---

### 5.6 Create Chat History Component

**src/components/Chat/ChatHistory.tsx:**
```typescript
import type { ChatMessage } from '@/types/chat';

interface ChatHistoryProps {
  messages: ChatMessage[];
}

export function ChatHistory({ messages }: ChatHistoryProps) {
  return (
    <div className="space-y-4 p-4">
      {messages.map(msg => (
        <div key={msg.id} className="space-y-2">
          <div className="bg-blue-100 p-3 rounded-lg">
            <p className="text-sm">{msg.userMessage}</p>
          </div>
          {msg.aiResponse && (
            <div className="bg-gray-100 p-3 rounded-lg">
              <p className="text-sm">{msg.aiResponse}</p>
            </div>
          )}
        </div>
      ))}
    </div>
  );
}
```

---

### 5.7 Create Chat Input Component

**src/components/Chat/ChatInput.tsx:**
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';

interface ChatInputProps {
  onSend: (message: string) => Promise<void>;
}

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('');
  const [sending, setSending] = useState(false);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!message.trim() || sending) return;

    setSending(true);
    await onSend(message);
    setMessage('');
    setSending(false);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Ask AI to manage your calendar..."
        disabled={sending}
      />
      <Button type="submit" disabled={sending}>
        {sending ? 'Sending...' : 'Send'}
      </Button>
    </form>
  );
}
```

---

### 5.8 Update App.tsx

Add ChatProvider and integrate ChatPanel with CalendarView in MainLayout.

---

### 5.9 Add AI Auto-Categorization

Enhance AI prompt to automatically assign categories to events.

**Update api/ai.ts system prompt:**
```typescript
const systemPrompt = `You are a calendar assistant. Parse user requests and return JSON actions.

Available actions:
- CREATE_EVENT: { type: 'CREATE_EVENT', payload: { title, start, end, description?, location?, allDay?, category?, categoryColor? } }
- UPDATE_EVENT: { type: 'UPDATE_EVENT', id, payload: { ...updates } }
- DELETE_EVENT: { type: 'DELETE_EVENT', id }
- QUERY_EVENTS: { type: 'QUERY_EVENTS', filter?: {...} }
- NO_ACTION: { type: 'NO_ACTION', message: 'your response' }

Always return valid JSON. Dates in ISO 8601 format.

EVENT CATEGORIES:
Assign appropriate category when creating events:
- "work": meetings, presentations, deadlines, projects (color: #3b82f6)
- "personal": home tasks, personal appointments, errands (color: #10b981)
- "health": doctor visits, gym, exercise, wellness (color: #ef4444)
- "social": dinners, parties, meetups with friends (color: #f97316)
- "finance": bill payments, bank appointments, taxes (color: #8b5cf6)
- "education": classes, courses, training, learning (color: #06b6d4)

Examples:
User: "Yarın saat 15'te doktor randevum var"
Response: {
  "type": "CREATE_EVENT",
  "payload": {
    "title": "Doktor Randevusu",
    "start": "2026-02-24T15:00:00Z",
    "end": "2026-02-24T16:00:00Z",
    "category": "health",
    "categoryColor": "#ef4444"
  }
}

User: "Pazartesi saat 10'da toplantı ekle"
Response: {
  "type": "CREATE_EVENT",
  "payload": {
    "title": "Toplantı",
    "start": "2026-02-24T10:00:00Z",
    "end": "2026-02-24T11:00:00Z",
    "category": "work",
    "categoryColor": "#3b82f6"
  }
}
`;
```

**Update src/types/ai.ts to include category:**
```typescript
z.object({
  type: z.literal('CREATE_EVENT'),
  payload: z.object({
    title: z.string(),
    start: z.string(),
    end: z.string(),
    description: z.string().optional(),
    location: z.string().optional(),
    allDay: z.boolean().optional(),
    category: z.enum(['work', 'personal', 'health', 'social', 'finance', 'education']).optional(),
    categoryColor: z.string().optional(),
  }),
}),
```

**Update ChatPanel to include category in event creation:**
```typescript
async function handleSendMessage(message: string) {
  const action = await sendMessage(message);
  
  if (!action) return;

  switch (action.type) {
    case 'CREATE_EVENT':
      await createEvent({
        ...action.payload,
        autoCategorizationConfidence: 0.85, // AI categorization confidence
      });
      break;
    // ... other cases
  }
}
```

---

## Acceptance Criteria

- [ ] Chat panel displays in right column
- [ ] User can type and send messages
- [ ] Messages sent to /api/ai endpoint
- [ ] OpenAI returns JSON actions
- [ ] Actions validated with Zod
- [ ] CREATE_EVENT creates calendar event
- [ ] Chat history saved to IndexedDB
- [ ] Chat history displays on reload
- [ ] Error handling for offline/failed requests
- [ ] **AI assigns categories** to created events
- [ ] **Category colors** applied automatically
- [ ] **AI categorization confidence** stored (for Phase 13 UI)

---

## Future Enhancement: Batch Actions (Post-MVP)

**Current MVP:** AI returns single action per command.

**Future Goal:** Support complex commands that require multiple actions:
- "Haftasonudaki planlarımı iptal et" → Multiple DELETE actions
- "Yarınki toplantıları 1 saat ertele" → Multiple UPDATE actions
- "Haftasonu planlarımı iptal ve yerine doldur" → Multiple DELETE + CREATE actions

**Implementation Strategy:**
1. Update AIActionSchema to support batch:
   ```typescript
   z.object({
     type: z.literal('BATCH'),
     actions: z.array(AIActionSchema),
   })
   ```

2. Update system prompt to return action arrays for complex commands

3. Update action executor to loop through batch actions sequentially

4. Enhanced conflict detection for batch operations

**Note:** This is NOT required for MVP. Single-action commands are sufficient for core functionality.

---

## Next Phase

Proceed to **Phase 6: Speech-to-Text Integration (Deepgram)**
