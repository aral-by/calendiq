import { useState, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Mic, ArrowUp } from 'lucide-react';
import { useUser } from '@/context/UserContext';

function getTimeBasedGreeting(userName?: string): { title: string; subtitle: string } {
  const hour = new Date().getHours();
  
  // Casual greetings (not time-specific) - expanded variety
  const casualGreetings = [
    { title: "What's up", subtitle: 'Ready to organize your day?' },
    { title: 'Hey there', subtitle: 'How can I assist you today?' },
    { title: 'Welcome back', subtitle: "Let's get things done" },
    { title: 'Hello', subtitle: 'What can I help you with?' },
    { title: 'Hi', subtitle: 'Ready to schedule something?' },
    { title: 'Greetings', subtitle: 'Your personal assistant is here' },
    { title: 'Howdy', subtitle: "Let's make magic happen" },
    { title: 'Yo', subtitle: 'Time to plan something awesome' },
    { title: 'Sup', subtitle: "What's on your agenda today?" },
    { title: 'Hey', subtitle: 'Ready to tackle your schedule?' },
    { title: 'Hiya', subtitle: "Let's organize your world" },
    { title: 'Well hello', subtitle: 'Nice to see you here' },
    { title: 'Look who it is', subtitle: 'Ready to get productive?' },
    { title: 'There you are', subtitle: "Let's plan something great" },
    { title: 'Welcome', subtitle: 'Your calendar awaits' },
    { title: 'Hey friend', subtitle: 'How can I help you today?' },
    { title: "What's happening", subtitle: 'Time to organize things?' },
    { title: 'Good to see you', subtitle: "Let's make today count" },
    { title: 'Ahoy', subtitle: 'Ready to navigate your schedule?' },
    { title: 'Cheers', subtitle: "What's the plan today?" },
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
    greeting = casualGreetings[Math.floor(Math.random() * casualGreetings.length)];
  } else {
    let timeGreetings;
    if (hour >= 5 && hour < 8) timeGreetings = timeBasedGreetings.earlyMorning;
    else if (hour >= 8 && hour < 12) timeGreetings = timeBasedGreetings.morning;
    else if (hour >= 12 && hour < 17) timeGreetings = timeBasedGreetings.afternoon;
    else if (hour >= 17 && hour < 21) timeGreetings = timeBasedGreetings.evening;
    else timeGreetings = timeBasedGreetings.night;
    
    greeting = timeGreetings[Math.floor(Math.random() * timeGreetings.length)];
  }
  
  if (userName) {
    return {
      title: `${greeting.title}, ${userName}`,
      subtitle: greeting.subtitle,
    };
  }
  
  return greeting;
}

export function AssistantChat() {
  const [message, setMessage] = useState('');
  const { user } = useUser();
  
  const userName = user?.firstName;
  const greeting = useMemo(() => getTimeBasedGreeting(userName), [userName]);

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

  const handleVoiceInput = () => {
    // TODO: Implement voice input (Phase 6 - Deepgram integration)
    console.log('Voice input will be implemented in Phase 6');
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
onClick={handleVoiceInput}
              variant="ghost"
              size="icon"
              className="shrink-0 rounded-full"
              title="Voice input (coming soon)"
            >
              <Mic
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
