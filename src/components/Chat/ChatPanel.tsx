import { useEffect } from 'react';
import { useChat } from '@/context/ChatContext';
import { useEvents } from '@/context/EventContext';
import { ChatHistory } from './ChatHistory';
import { ChatInput } from './ChatInput';
import { isCreateEventAction, isUpdateEventAction, isDeleteEventAction } from '@/types/ai';
import { Sparkles } from 'lucide-react';

export function ChatPanel() {
  const { messages, loading, sendMessage } = useChat();
  const { createEvent, updateEvent, deleteEvent } = useEvents();
  const hasMessages = messages.length > 0;

  useEffect(() => {
    // Don't load history - start fresh each time
  }, []);

  async function handleSendMessage(message: string) {
    const action = await sendMessage(message);
    
    if (!action) {
      console.log('[Chat] No action returned or error occurred');
      return;
    }

    // Execute action based on type
    try {
      if (isCreateEventAction(action)) {
        console.log('[Chat] Creating event:', action.payload.title);
        await createEvent({
          ...action.payload,
          allDay: action.payload.allDay ?? false,
          status: 'confirmed',
        });
      } else if (isUpdateEventAction(action)) {
        console.log('[Chat] Updating event:', action.id);
        await updateEvent(action.id, action.payload);
      } else if (isDeleteEventAction(action)) {
        console.log('[Chat] Deleting event:', action.id);
        await deleteEvent(action.id);
      }
      // QUERY_EVENTS and NO_ACTION don't need execution
    } catch (error) {
      console.error('[Chat] Error executing action:', error);
    }
  }

  return (
    <div className="h-full flex flex-col bg-background relative">
      {/* Centered Welcome State - Only shown when no messages */}
      <div 
        className={`absolute inset-0 flex flex-col items-center justify-center p-8 transition-all duration-700 ${
          hasMessages ? 'opacity-0 pointer-events-none scale-95' : 'opacity-100 scale-100'
        }`}
      >
        <div className="w-full max-w-3xl space-y-12 animate-in fade-in zoom-in duration-700">
          {/* Header */}
          <div className="text-center space-y-6">
            <div className="flex items-center justify-center">
              <div className="p-4 bg-gradient-to-br from-purple-100 to-blue-100 dark:from-purple-950 dark:to-blue-950 rounded-full">
                <Sparkles className="h-10 w-10 text-purple-600 dark:text-purple-400" />
              </div>
            </div>
            <h1 className="text-4xl font-medium tracking-tight">
              Nasıl yardımcı olabilirim?
            </h1>
          </div>

          {/* Main Input */}
          <div className="space-y-4">
            <ChatInput onSend={handleSendMessage} loading={loading} />
          </div>

          {/* Example Prompts */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium text-muted-foreground px-2">Başlangıç önerileri</h3>
            <div className="grid grid-cols-2 gap-3">
              {[
                { icon: '📅', text: 'Yarın saat 15\'te doktor randevum var' },
                { icon: '💼', text: 'Pazartesi 10\'da toplantı ekle' },
                { icon: '📊', text: 'Bu haftaki planlarımı göster' },
                { icon: '🔔', text: 'Gelecek hafta bir hatırlatıcı koy' }
              ].map((prompt, i) => (
                <button
                  key={i}
                  onClick={() => handleSendMessage(prompt.text)}
                  className="group px-4 py-3 bg-muted/40 hover:bg-muted/70 rounded-xl transition-all duration-200 text-left border border-border/50 hover:border-border"
                >
                  <div className="flex items-start gap-3">
                    <span className="text-lg">{prompt.icon}</span>
                    <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors leading-relaxed">
                      {prompt.text}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </div>
      </div>

      {/* Normal Chat Layout - Slides in when messages exist */}
      <div 
        className={`flex flex-col h-full transition-all duration-700 ${
          hasMessages ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-4 pointer-events-none'
        }`}
      >
        {/* Compact Header */}
        <div className="border-b px-6 py-3 bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
          <div className="flex items-center gap-2">
            <Sparkles className="h-5 w-5 text-purple-600 dark:text-purple-400" />
            <h2 className="text-lg font-medium">AI Assistant</h2>
          </div>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <ChatHistory messages={messages} loading={loading} />
        </div>

        {/* Chat Input */}
        <ChatInput onSend={handleSendMessage} loading={loading} />
      </div>
    </div>
  );
}
