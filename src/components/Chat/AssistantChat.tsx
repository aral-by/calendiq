import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Plus, ArrowUp } from 'lucide-react';
import { useUser } from '@/context/UserContext';

function getTimeBasedGreeting(userName?: string): { title: string; subtitle: string } {
  const hour = new Date().getHours();
  const greetings = {
    earlyMorning: [
      { title: 'Hello Early Bird', subtitle: 'The world is yours to conquer' },
      { title: 'Rise and Shine', subtitle: 'A new day awaits you' },
      { title: 'Morning Warrior', subtitle: 'Ready to seize the day?' },
    ],
    morning: [
      { title: 'Good Morning', subtitle: "Let's make today productive" },
      { title: 'Morning Sunshine', subtitle: 'How can I brighten your day?' },
      { title: 'Fresh Start', subtitle: 'What shall we accomplish today?' },
    ],
    afternoon: [
      { title: 'Good Afternoon', subtitle: "How's your day going?" },
      { title: 'Midday Maestro', subtitle: 'Keep up the great momentum' },
      { title: 'Afternoon Achiever', subtitle: 'Ready to tackle more tasks?' },
    ],
    evening: [
      { title: 'Good Evening', subtitle: 'Winding down or gearing up?' },
      { title: 'Evening Star', subtitle: 'How can I help you tonight?' },
      { title: 'Sunset Scheduler', subtitle: "Let's plan ahead together" },
    ],
    night: [
      { title: 'Hello Night Owl', subtitle: 'Burning the midnight oil?' },
      { title: 'Late Night Planner', subtitle: 'What brings you here at this hour?' },
      { title: 'Midnight Maestro', subtitle: "Night time, bright ideas" },
    ],
  };

  let timeGreetings;
  if (hour >= 5 && hour < 8) timeGreetings = greetings.earlyMorning;
  else if (hour >= 8 && hour < 12) timeGreetings = greetings.morning;
  else if (hour >= 12 && hour < 17) timeGreetings = greetings.afternoon;
  else if (hour >= 17 && hour < 21) timeGreetings = greetings.evening;
  else timeGreetings = greetings.night;

  const randomGreeting = timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
  
  if (userName) {
    return {
      title: `${randomGreeting.title}, ${userName}`,
      subtitle: randomGreeting.subtitle,
    };
  }
  
  return randomGreeting;
}

export function AssistantChat() {
  const [message, setMessage] = useState('');
  const { profile } = useUser();
  
  const greeting = useMemo(() => getTimeBasedGreeting(profile?.fullName), [profile?.fullName]);

  const examplePrompts = [
    "Yarın saat 15'te doktor randevum var",
    "Pazartesi 10'da toplantı ekle",
  ];

  const handleSend = async () => {
    if (!message.trim()) return;
    
    // TODO: API call
    console.log('Send:', message);
    setMessage('');
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  return (
    <div className="h-full w-full flex flex-col items-center justify-center bg-background p-8">
      <div className="w-full max-w-3xl flex flex-col items-center justify-center flex-1">
        {/* Welcome Screen */}
        <div className="flex-1 flex flex-col items-center justify-center space-y-12 w-full">
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

        {/* Input Area */}
        <div className="w-full pb-4">
          <div className="relative flex items-center gap-3 rounded-3xl border border-border bg-background p-4 shadow-lg">
            <Button
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
            >
              <Plus className="h-5 w-5" />
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
              disabled={!message.trim()}
              size="icon"
              className="shrink-0 rounded-full"
            >
              <ArrowUp className="h-5 w-5" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
