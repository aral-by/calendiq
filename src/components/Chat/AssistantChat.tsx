import { useState, useMemo, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, ArrowUp } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useChatHistory } from '@/context/ChatHistoryContext';

function getTimeBasedGreeting(userName?: string): { title: string; subtitle: string } {
  const hour = new Date().getHours();
  
  // Casual greetings (not time-specific) - expanded variety with better name integration
  const casualGreetings = [
    { title: "What's cooking", subtitle: 'Ready to organize your day?', withName: true },
    { title: 'Hey there', subtitle: 'How can I assist you today?', withName: true },
    { title: 'Welcome back', subtitle: "Let's get things done", withName: true },
    { title: 'Look who it is', subtitle: 'Ready to get productive?', withName: false },
    { title: 'Ready to roll', subtitle: 'Ready to schedule something?', withName: true },
    { title: 'Howdy partner', subtitle: "Let's make magic happen", withName: false },
    { title: "What's the plan", subtitle: 'Time to plan something awesome', withName: true },
    { title: 'Well well well', subtitle: "What's on your agenda today?", withName: false },
    { title: 'Back for more', subtitle: 'Ready to tackle your schedule?', withName: true },
    { title: 'Good to see you', subtitle: "Let's organize your world", withName: true },
    { title: 'There you are', subtitle: 'Nice to see you here', withName: true },
    { title: 'Welcome', subtitle: "Let's plan something great", withName: true },
    { title: 'Hey friend', subtitle: 'Your calendar awaits', withName: false },
    { title: "What's happening", subtitle: 'How can I help you today?', withName: true },
    { title: 'Ahoy', subtitle: 'Time to organize things?', withName: true },
    { title: 'Cheers', subtitle: 'Ready to navigate your schedule?', withName: true },
    { title: "What's new", subtitle: "What's the plan today?", withName: true },
    { title: 'Long time no see', subtitle: "Let's get productive", withName: true },
    { title: 'Nice to see you', subtitle: 'Ready for action?', withName: true },
    { title: "How's it going", subtitle: 'Time to organize?', withName: true },
  ];
  
  const timeBasedGreetings = {
    earlyMorning: [
      { title: 'Hello Early Bird', subtitle: 'The world is yours to conquer' },
      { title: 'Rise and Shine', subtitle: 'A new day awaits you' },
      { title: 'Morning Warrior', subtitle: 'Ready to seize the day?' },
      { title: 'Bright and Early', subtitle: 'Love the enthusiasm!' },
      { title: 'Wakey Wakey', subtitle: "Let's make today amazing" },
      { title: 'Up with the Sun', subtitle: 'Your dedication is inspiring' },
      { title: 'Early Riser', subtitle: 'The best hours are ahead' },
    ],
    morning: [
      { title: 'Good Morning', subtitle: "Let's make today productive" },
      { title: 'Morning Sunshine', subtitle: 'How can I brighten your day?' },
      { title: 'Fresh Start', subtitle: 'What shall we accomplish today?' },
      { title: 'Top of the Morning', subtitle: 'Ready to own the day?' },
      { title: 'Morning Glory', subtitle: 'Your day awaits' },
      { title: 'Beautiful Morning', subtitle: "Let's make it count" },
      { title: 'Morning Champion', subtitle: 'Ready for greatness?' },
      { title: 'Rise Up', subtitle: "Time to shine" },
    ],
    afternoon: [
      { title: 'Good Afternoon', subtitle: "How's your day going?" },
      { title: 'Midday Maestro', subtitle: 'Keep up the great momentum' },
      { title: 'Afternoon Achiever', subtitle: 'Ready to tackle more tasks?' },
      { title: 'Afternoon Delight', subtitle: "Let's boost that productivity" },
      { title: 'Halfway There', subtitle: 'Keep the energy flowing' },
      { title: 'Afternoon Star', subtitle: 'Shining bright today?' },
      { title: 'Pleasant Afternoon', subtitle: "What's next on your list?" },
      { title: 'Midday Break', subtitle: 'Time to plan ahead?' },
    ],
    evening: [
      { title: 'Good Evening', subtitle: 'Winding down or gearing up?' },
      { title: 'Evening Star', subtitle: 'How can I help you tonight?' },
      { title: 'Sunset Scheduler', subtitle: "Let's plan ahead together" },
      { title: 'Evening Planner', subtitle: 'Preparing for tomorrow?' },
      { title: 'Twilight Time', subtitle: "What's on your mind?" },
      { title: 'Golden Hour', subtitle: 'Perfect time to organize' },
      { title: 'Evening Edition', subtitle: 'Ready to wrap things up?' },
      { title: 'After Hours', subtitle: 'Still going strong?' },
    ],
    night: [
      { title: 'Hello Night Owl', subtitle: 'Burning the midnight oil?' },
      { title: 'Late Night Planner', subtitle: 'What brings you here at this hour?' },
      { title: 'Midnight Maestro', subtitle: "Night time, bright ideas" },
      { title: 'Burning the Midnight Oil', subtitle: 'Dedication at its finest' },
      { title: 'Night Shift', subtitle: 'When do you sleep?' },
      { title: 'Moonlight Scheduler', subtitle: 'Planning under the stars?' },
      { title: 'Insomniac Achiever', subtitle: "Can't stop, won't stop" },
      { title: 'After Midnight', subtitle: 'Your dedication is admirable' },
      { title: 'Night Mode Activated', subtitle: 'Best ideas come at night?' },
      { title: 'Nocturnal Navigator', subtitle: 'The night is young' },
    ],
  };

  // 50% chance for time-based, 50% chance for casual
  const useCasual = Math.random() > 0.5;
  
  let greeting;
  if (useCasual) {
    const randomCasual = casualGreetings[Math.floor(Math.random() * casualGreetings.length)];
    greeting = randomCasual;
    
    // Add name if it should be included
    if (userName && randomCasual.withName) {
      greeting = {
        ...randomCasual,
        title: `${randomCasual.title}, ${userName}`,
      };
    }
  } else {
    let timeGreetings;
    if (hour >= 5 && hour < 8) timeGreetings = timeBasedGreetings.earlyMorning;
    else if (hour >= 8 && hour < 12) timeGreetings = timeBasedGreetings.morning;
    else if (hour >= 12 && hour < 17) timeGreetings = timeBasedGreetings.afternoon;
    else if (hour >= 17 && hour < 21) timeGreetings = timeBasedGreetings.evening;
    else timeGreetings = timeBasedGreetings.night;
    
    greeting = timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
    
    if (userName) {
      greeting = {
        ...greeting,
        title: `${greeting.title}, ${userName}`,
      };
    }
  }
  
  return greeting;
}

export function AssistantChat() {
  const [message, setMessage] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const { user } = useUser();
  const { currentSession, currentSessionId, createNewSession, switchSession, addMessage } = useChatHistory();
  
  const userName = user?.firstName;
  const greeting = useMemo(() => getTimeBasedGreeting(userName), [userName]);

  const messages = currentSession?.messages || [];

  const examplePrompts = [
    "Yarın saat 15'te doktor randevum var",
    "Pazartesi 10'da toplantı ekle",
  ];

  const handleSend = async () => {
    if (!message.trim() || isLoading) return;
    
    // Create a new session if none exists
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
      switchSession(sessionId);
    }
    
    const userMessage = message.trim();
    addMessage({ role: 'user', content: userMessage, timestamp: Date.now() });
    setMessage('');
    setIsLoading(true);
    
    // Simulate AI response (TODO: Real API call)
    setTimeout(() => {
      addMessage({ 
        role: 'assistant', 
        content: 'Anladım! Etkinliği takvime ekliyorum.',
        timestamp: Date.now()
      });
      setIsLoading(false);
    }, 2000);
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  const handleVoiceInput = () => {
    // TODO: Implement voice input (Phase 6 - Deepgram integration)
    console.log('Voice input will be implemented in Phase 6');
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-3xl flex flex-col items-center justify-center flex-1">
        {messages.length === 0 ? (
          // Welcome Screen
          <div className="flex-1 flex flex-col items-center justify-center space-y-12 w-full animate-in fade-in duration-500">
            {/* Header */}
            <div className="text-center space-y-3">
              <h1 className="text-3xl font-semibold tracking-tight">{greeting.title}</h1>
              <p className="text-xl text-muted-foreground">{greeting.subtitle}</p>
            </div>

            {/* Example Prompts */}
            <div className="w-full grid grid-cols-2 gap-3">
              {examplePrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => handlePromptClick(prompt)}
                  className="p-4 rounded-2xl border border-border bg-card hover:bg-accent transition-colors text-left"
                >
                  <p className="text-sm text-card-foreground">{prompt}</p>
                </button>
              ))}
            </div>
          </div>
        ) : (
          // Chat Messages
          <div className="flex-1 w-full overflow-y-auto space-y-6 pb-4 animate-in fade-in slide-in-from-bottom-4 duration-500">
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'} animate-in fade-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {msg.role === 'user' ? (
                  // User message - no bubble, just text
                  <p className="text-lg max-w-[80%]">{msg.content}</p>
                ) : (
                  // AI message - with bubble
                  <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-muted">
                    <p className="text-lg text-muted-foreground">{msg.content}</p>
                  </div>
                )}
              </div>
            ))}
            
            {/* Typing Indicator */}
            {isLoading && (
              <div className="flex justify-start animate-in fade-in slide-in-from-bottom-2 duration-300">
                <div className="max-w-[80%] rounded-2xl px-5 py-3 bg-muted">
                  <div className="flex items-center gap-1">
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '0ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '150ms' }}></div>
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/40 animate-bounce" style={{ animationDelay: '300ms' }}></div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}

        {/* Input Area */}
        <div className="w-full pb-4">
          <div className="relative flex items-center gap-3 rounded-3xl border border-border bg-background p-4 shadow-lg">
            <Button
              onClick={handleVoiceInput}
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
              title="Voice input (coming soon)"
            >
              <Mic className="h-5 w-5" />
            </Button>

            <Input
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' && !e.shiftKey) {
                  e.preventDefault();
                  handleSend();
                }
              }}
              placeholder="Send a message..."
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base"
            />

            <Button
              onClick={handleSend}
              disabled={!message.trim() || isLoading}
              size="icon"
              className="shrink-0 rounded-full disabled:opacity-50"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
