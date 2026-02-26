import { useState, useMemo, useEffect, useRef } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent } from '@/components/ui/card';
import { AlertDialog, AlertDialogAction, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { Mic, ArrowUp, Calendar, Clock, MapPin } from 'lucide-react';
import { useUser } from '@/context/UserContext';
import { useChatHistory } from '@/context/ChatHistoryContext';
import { useEvents } from '@/context/EventContext';
import { ActionCard } from '@/components/Chat/ActionCard';
import { format } from 'date-fns';
import { tr } from 'date-fns/locale';
import { ModelSelector, AIModel } from '@/components/Chat/ModelSelector';
import { useSidebar } from '@/components/ui/sidebar';
import { CalendarAgent } from '@/lib/agent';
import type { ChatCompletionTool } from 'groq-sdk/resources/chat/completions';
import ReactMarkdown from 'react-markdown';

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
  const [selectedModel, setSelectedModel] = useState<AIModel>(() => {
    // Load from localStorage or default to DeepSeek V3
    const saved = localStorage.getItem('preferredAIModel');
    return (saved as AIModel) || 'openai/gpt-oss-120b';
  });
  
  // Agent state for tracking thinking process
  const [isAgentRunning, setIsAgentRunning] = useState(false);
  const agentRef = useRef<CalendarAgent | null>(null);
  
  // Voice recording state
  const [isRecording, setIsRecording] = useState(false);
  const [audioLevel, setAudioLevel] = useState(0);
  
  // Error dialog state
  const [errorDialog, setErrorDialog] = useState<{ open: boolean; title: string; description: string }>({ 
    open: false, 
    title: '', 
    description: '' 
  });
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const audioContextRef = useRef<AudioContext | null>(null);
  const analyserRef = useRef<AnalyserNode | null>(null);
  const animationFrameRef = useRef<number | null>(null);
  const silenceStartTimeRef = useRef<number | null>(null);
  const streamRef = useRef<MediaStream | null>(null);
  
  const { user } = useUser();
  const { currentSession, currentSessionId, createNewSession, switchSession, addMessage } = useChatHistory();
  const { events, createEvent, updateEvent, deleteEvent } = useEvents();
  const { state: sidebarState } = useSidebar();
  
  const userName = user?.firstName;
  const greeting = useMemo(() => getTimeBasedGreeting(userName), [userName]);
  
  // Save model preference to localStorage
  useEffect(() => {
    localStorage.setItem('preferredAIModel', selectedModel);
  }, [selectedModel]);

  // Initialize CalendarAgent when model changes
  useEffect(() => {
    const apiKey = import.meta.env.VITE_GROQ_API_KEY;
    if (!apiKey) {
      console.error('[AssistantChat] No Groq API key found');
      return;
    }

    // Create new agent instance
    const agent = new CalendarAgent(apiKey, selectedModel, 10);

    // Define calendar tools
    const tools: ChatCompletionTool[] = [
      {
        type: 'function',
        function: {
          name: 'query_events',
          description: 'Search and filter calendar events based on various criteria',
          parameters: {
            type: 'object',
            properties: {
              startDate: { type: 'string', description: 'Filter events starting from this date (ISO 8601)' },
              endDate: { type: 'string', description: 'Filter events ending before this date (ISO 8601)' },
              category: { type: 'string', description: 'Filter by event category' },
              searchTerm: { type: 'string', description: 'Search in title and description' },
            },
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'create_event',
          description: 'Create a new calendar event',
          parameters: {
            type: 'object',
            properties: {
              title: { type: 'string', description: 'Event title' },
              start: { type: 'string', description: 'Start date/time (ISO 8601)' },
              end: { type: 'string', description: 'End date/time (ISO 8601)' },
              allDay: { type: 'boolean', description: 'Whether this is an all-day event' },
              category: { type: 'string', description: 'Event category' },
              description: { type: 'string', description: 'Event description' },
              location: { type: 'string', description: 'Event location' },
              participants: { type: 'array', items: { type: 'string' }, description: 'List of participant emails' },
            },
            required: ['title', 'start', 'end'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'update_event',
          description: 'Update an existing calendar event',
          parameters: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Event ID to update' },
              updates: {
                type: 'object',
                properties: {
                  title: { type: 'string' },
                  start: { type: 'string' },
                  end: { type: 'string' },
                  allDay: { type: 'boolean' },
                  category: { type: 'string' },
                  description: { type: 'string' },
                  location: { type: 'string' },
                  participants: { type: 'array', items: { type: 'string' } },
                },
              },
            },
            required: ['id', 'updates'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'delete_event',
          description: 'Delete a calendar event',
          parameters: {
            type: 'object',
            properties: {
              id: { type: 'string', description: 'Event ID to delete' },
            },
            required: ['id'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'bulk_update_events',
          description: 'Update multiple events at once',
          parameters: {
            type: 'object',
            properties: {
              eventIds: { type: 'array', items: { type: 'string' }, description: 'Array of event IDs' },
              updates: { type: 'object', description: 'Updates to apply to all events' },
            },
            required: ['eventIds', 'updates'],
          },
        },
      },
      {
        type: 'function',
        function: {
          name: 'bulk_delete_events',
          description: 'Delete multiple events at once',
          parameters: {
            type: 'object',
            properties: {
              eventIds: { type: 'array', items: { type: 'string' }, description: 'Array of event IDs to delete' },
            },
            required: ['eventIds'],
          },
        },
      },
    ];

    // Register tools with handlers
    agent.registerTool(tools[0], async (args) => {
      // query_events handler
      let filteredEvents = [...events];
      
      if (args.startDate) {
        const startDate = new Date(args.startDate);
        startDate.setHours(0, 0, 0, 0); // Start of day
        filteredEvents = filteredEvents.filter(e => {
          const eventDate = new Date(e.start);
          eventDate.setHours(0, 0, 0, 0);
          return eventDate >= startDate;
        });
      }
      
      if (args.endDate) {
        const endDate = new Date(args.endDate);
        endDate.setHours(23, 59, 59, 999); // End of day
        filteredEvents = filteredEvents.filter(e => {
          const eventDate = new Date(e.start);
          return eventDate <= endDate;
        });
      }
      
      if (args.category) {
        filteredEvents = filteredEvents.filter(e => e.category === args.category);
      }
      
      if (args.searchTerm) {
        const term = args.searchTerm.toLowerCase();
        filteredEvents = filteredEvents.filter(e => 
          e.title.toLowerCase().includes(term) || 
          e.description?.toLowerCase().includes(term)
        );
      }
      
      return filteredEvents;
    });

    agent.registerTool(tools[1], async (args) => {
      // create_event handler
      const eventData = {
        ...args,
        allDay: args.allDay ?? false,
      };
      const newEvent = await createEvent(eventData);
      return newEvent;
    });

    agent.registerTool(tools[2], async (args) => {
      // update_event handler
      await updateEvent(args.id, args.updates);
      return { success: true, id: args.id, updates: args.updates };
    });

    agent.registerTool(tools[3], async (args) => {
      // delete_event handler
      await deleteEvent(args.id);
      return { success: true, id: args.id };
    });

    agent.registerTool(tools[4], async (args) => {
      // bulk_update_events handler
      for (const eventId of args.eventIds) {
        await updateEvent(eventId, args.updates);
      }
      return { success: true, count: args.eventIds.length };
    });

    agent.registerTool(tools[5], async (args) => {
      // bulk_delete_events handler
      for (const eventId of args.eventIds) {
        await deleteEvent(eventId);
      }
      return { success: true, count: args.eventIds.length };
    });

    // Set callbacks for real-time updates
    agent.setCallbacks(
      () => {
        // Agent step updates (not displayed in UI)
      },
      (finalAnswer) => {
        console.log('[Agent] Complete:', finalAnswer);
      },
      (error) => {
        console.error('[Agent] Error:', error);
      }
    );

    agentRef.current = agent;
  }, [selectedModel, events, createEvent, updateEvent, deleteEvent]);

  const messages = currentSession?.messages || [];

  const examplePrompts = [
  "I have a doctor appointment tomorrow at 3pm",
  "This week looks intense, can you balance it?",
  "Schedule a 2-hour deep work block",
  "Keep my mornings distraction-free",
  "Do I have space for a quick meeting on Thursday?",
  "Show me everything I planned for this week",
];

  const handleSend = async () => {
    if (!message.trim() || isLoading || isAgentRunning) return;
    
    // Create a new session if none exists (first message)
    let sessionId = currentSessionId;
    if (!sessionId) {
      sessionId = createNewSession();
      switchSession(sessionId);
    }
    
    const userMessage = message.trim();
    
    // Add user message to chat
    addMessage({ role: 'user', content: userMessage, timestamp: Date.now() }, sessionId);
    setMessage('');
    setIsLoading(true);
    setIsAgentRunning(true);
    
    try {
      // Check if online
      if (!navigator.onLine) {
        addMessage({ 
          role: 'assistant', 
          content: 'Çevrimdışısın. AI özellikleri için internet bağlantısı gerekiyor. Manuel olarak etkinlik ekleyebilirsin.',
          timestamp: Date.now()
        }, sessionId);
        return;
      }

      // Check if agent is initialized
      if (!agentRef.current) {
        throw new Error('Agent not initialized');
      }

      // Build conversation history for agent
      const conversationHistory = messages.map(msg => ({
        role: msg.role as 'user' | 'assistant',
        content: msg.content,
      }));

      // Run the agent
      const result = await agentRef.current.run(userMessage, conversationHistory);

      // Process agent steps and create action cards for tool calls
      if (result.steps && result.steps.length > 0) {
        for (const step of result.steps) {
          if (step.action) {
            const toolName = step.action.tool;
            const toolArgs = step.action.arguments;
            
            // Create event
            if (toolName === 'create_event' && step.observation) {
              try {
                const createdEvent = typeof step.observation === 'string' 
                  ? JSON.parse(step.observation) 
                  : step.observation;
                
                addMessage({
                  role: 'assistant',
                  content: '',
                  timestamp: Date.now(),
                  action: {
                    type: 'created',
                    event: createdEvent,
                  },
                }, sessionId);
              } catch (e) {
                console.error('Failed to parse created event:', e);
              }
            }
            
            // Update event
            else if (toolName === 'update_event' && step.observation) {
              try {
                const eventId = toolArgs.id;
                const updates = toolArgs.updates;
                const updatedEvent = events.find(e => e.id === eventId);
                
                if (updatedEvent) {
                  addMessage({
                    role: 'assistant',
                    content: '',
                    timestamp: Date.now(),
                    action: {
                      type: 'updated',
                      event: { ...updatedEvent, ...updates },
                    },
                  }, sessionId);
                }
              } catch (e) {
                console.error('Failed to create update card:', e);
              }
            }
            
            // Delete event
            else if (toolName === 'delete_event' && step.observation) {
              try {
                const eventId = toolArgs.id;
                const deletedEvent = events.find(e => e.id === eventId);
                
                if (deletedEvent) {
                  addMessage({
                    role: 'assistant',
                    content: '',
                    timestamp: Date.now(),
                    action: {
                      type: 'deleted',
                      event: deletedEvent,
                    },
                  }, sessionId);
                }
              } catch (e) {
                console.error('Failed to create delete card:', e);
              }
            }
            
            // Bulk update events
            else if (toolName === 'bulk_update_events' && step.observation) {
              try {
                const eventIds = toolArgs.eventIds;
                const updates = toolArgs.updates;
                const affectedEvents = events.filter(e => eventIds.includes(e.id));
                
                addMessage({
                  role: 'assistant',
                  content: '',
                  timestamp: Date.now(),
                  action: {
                    type: 'bulk_updated',
                    events: affectedEvents.map(e => ({ ...e, ...updates })),
                    count: eventIds.length,
                  },
                }, sessionId);
              } catch (e) {
                console.error('Failed to create bulk update card:', e);
              }
            }
            
            // Bulk delete events
            else if (toolName === 'bulk_delete_events' && step.observation) {
              try {
                const eventIds = toolArgs.eventIds;
                const affectedEvents = events.filter(e => eventIds.includes(e.id));
                
                addMessage({
                  role: 'assistant',
                  content: '',
                  timestamp: Date.now(),
                  action: {
                    type: 'bulk_deleted',
                    events: affectedEvents,
                    count: eventIds.length,
                  },
                }, sessionId);
              } catch (e) {
                console.error('Failed to create bulk delete card:', e);
              }
            }
          }
        }
      }

      // Add final answer to chat
      if (result.finalAnswer) {
        addMessage({ 
          role: 'assistant', 
          content: result.finalAnswer,
          timestamp: Date.now(),
        }, sessionId);
      } else if (result.errorMessage) {
        addMessage({ 
          role: 'assistant', 
          content: `⚠️ ${result.errorMessage}`,
          timestamp: Date.now()
        }, sessionId);
      }
      
    } catch (error) {
      console.error('[AssistantChat] Error:', error);
      const errorMessage = error instanceof Error ? error.message : 'Bilinmeyen hata';
      addMessage({ 
        role: 'assistant', 
        content: `⚠️ Hata oluştu: ${errorMessage}\n\nLütfen tekrar dene.`,
        timestamp: Date.now()
      }, sessionId);
    } finally {
      setIsLoading(false);
      setIsAgentRunning(false);
    }
  };

  const handlePromptClick = (prompt: string) => {
    setMessage(prompt);
  };

  const handleVoiceInput = async () => {
    if (isRecording) {
      // Stop recording manually
      if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
        mediaRecorderRef.current.stop();
      }
      if (audioContextRef.current) {
        audioContextRef.current.close();
      }
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (streamRef.current) {
        streamRef.current.getTracks().forEach(track => track.stop());
      }
      setIsRecording(false);
      // Don't reset audioLevel here - let it animate during processing
      return;
    }

    try {
      // Start recording
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      
      // Setup audio context for visualization
      const audioContext = new AudioContext();
      const analyser = audioContext.createAnalyser();
      const microphone = audioContext.createMediaStreamSource(stream);
      microphone.connect(analyser);
      analyser.fftSize = 256;
      
      audioContextRef.current = audioContext;
      analyserRef.current = analyser;
      streamRef.current = stream;
      silenceStartTimeRef.current = null; // Reset silence timer
      
      // Silence detection constants
      const SILENCE_THRESHOLD = 0.02; // Audio level threshold
      const SILENCE_DURATION = 2000; // 2 seconds of silence
      
      // Auto-stop function
      const stopRecording = () => {
        if (mediaRecorderRef.current && mediaRecorderRef.current.state === 'recording') {
          mediaRecorderRef.current.stop();
        }
        if (audioContextRef.current) {
          audioContextRef.current.close();
        }
        if (animationFrameRef.current) {
          cancelAnimationFrame(animationFrameRef.current);
        }
        setIsRecording(false);
      };
      
      // Visualize audio level with silence detection
      const dataArray = new Uint8Array(analyser.frequencyBinCount);
      const updateLevel = () => {
        if (analyserRef.current) {
          analyserRef.current.getByteFrequencyData(dataArray);
          const average = dataArray.reduce((a, b) => a + b) / dataArray.length;
          const normalizedLevel = average / 255; // Normalize to 0-1
          
          setAudioLevel(normalizedLevel);
          
          // Silence detection logic
          if (normalizedLevel > SILENCE_THRESHOLD) {
            // Sound detected - reset silence timer
            silenceStartTimeRef.current = null;
          } else {
            // Silence detected
            if (silenceStartTimeRef.current === null) {
              silenceStartTimeRef.current = Date.now();
            } else {
              const silenceDuration = Date.now() - silenceStartTimeRef.current;
              if (silenceDuration >= SILENCE_DURATION) {
                // Auto-stop after silence duration
                stopRecording();
                return;
              }
            }
          }
          
          animationFrameRef.current = requestAnimationFrame(updateLevel);
        }
      };
      updateLevel();
      
      // Setup MediaRecorder
      const mediaRecorder = new MediaRecorder(stream);
      const audioChunks: Blob[] = [];
      
      mediaRecorder.ondataavailable = (event) => {
        audioChunks.push(event.data);
      };
      
      mediaRecorder.onstop = async () => {
        const audioBlob = new Blob(audioChunks, { type: 'audio/webm' });
        
        // Stop all tracks
        if (streamRef.current) {
          streamRef.current.getTracks().forEach(track => track.stop());
        }
        
        // Send to Groq Whisper API
        try {
          setIsLoading(true);
          
          // In development, call Groq API directly
          // In production, use serverless function
          const isDev = import.meta.env.DEV;
          
          if (isDev) {
            // Direct Groq API call (development)
            const groqApiKey = import.meta.env.VITE_GROQ_API_KEY;
            if (!groqApiKey) {
              throw new Error('VITE_GROQ_API_KEY is not set. Please add it to your .env file.');
            }
            
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            formData.append('model', 'whisper-large-v3-turbo');
            formData.append('language', 'tr');
            formData.append('response_format', 'json');
            
            const response = await fetch('https://api.groq.com/openai/v1/audio/transcriptions', {
              method: 'POST',
              headers: {
                'Authorization': `Bearer ${groqApiKey}`,
              },
              body: formData,
            });
            
            if (!response.ok) {
              const errorText = await response.text();
              console.error('Groq API error:', errorText);
              throw new Error('Transcription failed');
            }
            
            const data = await response.json();
            setMessage(data.text);
          } else {
            // Use serverless function (production)
            const formData = new FormData();
            formData.append('file', audioBlob, 'audio.webm');
            
            const response = await fetch('/api/transcribe', {
              method: 'POST',
              body: formData,
            });
            
            if (!response.ok) {
              throw new Error('Transcription failed');
            }
            
            const data = await response.json();
            setMessage(data.text);
          }
        } catch (error: any) {
          console.error('Transcription error:', error);
          setErrorDialog({
            open: true,
            title: 'Ses Çevirme Hatası',
              description: error.message?.includes('VITE_GROQ_API_KEY') 
              ? 'API anahtarı ayarlanmamış. Lütfen .env dosyasına VITE_GROQ_API_KEY ekleyin.' 
              : 'Ses çevirme başarısız oldu. Lütfen tekrar deneyin.'
          });
        } finally {
          setIsLoading(false);
          setAudioLevel(0); // Reset audio level after processing
        }
      };
      
      mediaRecorderRef.current = mediaRecorder;
      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Microphone access error:', error);
      setErrorDialog({
        open: true,
        title: 'Mikrofon Erişimi Reddedildi',
        description: 'Mikrofon erişimi için tarayıcı izinlerini kontrol edin ve sayfayı yenileyin.'
      });
    }
  };

  return (
    <div className="h-full w-full flex flex-col items-center bg-background overflow-hidden">
      <div 
        className="w-full max-w-2xl flex flex-col flex-1 relative overflow-hidden"
      >
        {messages.length === 0 ? (
          // Welcome Screen
          <div 
            className="flex-1 flex flex-col items-center justify-center space-y-12 w-full pb-32 p-8 animate-in fade-in duration-500"
          >
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
          <div 
            className="flex-1 w-full overflow-y-auto space-y-6 pb-32 p-8 animate-in fade-in slide-in-from-bottom-4 duration-500 scrollbar-hide"
          >
            {messages.map((msg, index) => (
              <div
                key={index}
                className={`flex flex-col ${msg.role === 'user' ? 'items-end' : 'items-start'} gap-3 animate-in fade-in slide-in-from-bottom-2 duration-300`}
                style={{ animationDelay: `${index * 50}ms` }}
              >
                {msg.role === 'user' ? (
                  // User message - no bubble, just text
                  <p className="text-sm max-w-[80%]">{msg.content}</p>
                ) : (
                  // AI message - plain text with optional action card or query results
                  <>
                    {/* Only show text if there's actual content */}
                    {msg.content && msg.content.trim() && (
                      <div className="text-sm text-foreground max-w-[80%] markdown-content">
                        <ReactMarkdown
                          components={{
                            p: ({node, ...props}) => <p className="mb-2" {...props} />,
                            strong: ({node, ...props}) => <strong className="font-semibold" {...props} />,
                            em: ({node, ...props}) => <em className="italic" {...props} />,
                            ul: ({node, ...props}) => <ul className="list-disc pl-4 mb-2" {...props} />,
                            ol: ({node, ...props}) => <ol className="list-decimal pl-4 mb-2" {...props} />,
                            li: ({node, ...props}) => <li className="mb-1" {...props} />,
                          }}
                        >
                          {msg.content}
                        </ReactMarkdown>
                      </div>
                    )}
                    
                    {/* Action Card (for create/update/delete/conflict) */}
                    {msg.action && (
                      <div className="w-full max-w-[80%]">
                        <ActionCard 
                          type={msg.action.type} 
                          event={msg.action.event}
                          events={msg.action.events}
                          count={msg.action.count}
                          conflictingEvents={msg.action.conflictingEvents}
                        />
                      </div>
                    )}
                    
                    {/* Query Results (for query_events) */}
                    {msg.queryResults !== undefined && (
                      <div className="w-full max-w-[80%] space-y-2">
                        {msg.queryResults.length > 0 ? (
                          msg.queryResults.map((event) => (
                            <Card key={event.id} className="border-l-4 border-l-blue-500 hover:shadow-md transition-shadow">
                              <CardContent className="p-3">
                                <div className="space-y-1.5">
                                  <div className="flex items-start justify-between gap-2">
                                    <h4 className="font-semibold text-sm">{event.title}</h4>
                                    {event.category && (
                                      <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary shrink-0">
                                        {event.category}
                                      </span>
                                    )}
                                  </div>
                                  
                                  <div className="flex items-center gap-4 text-xs text-muted-foreground">
                                    <div className="flex items-center gap-1.5">
                                      <Calendar className="w-3 h-3" />
                                      <span>{format(new Date(event.start), 'd MMM', { locale: tr })}</span>
                                    </div>
                                    
                                    <div className="flex items-center gap-1.5">
                                      <Clock className="w-3 h-3" />
                                      <span>
                                        {event.allDay 
                                          ? 'Tüm gün' 
                                          : `${format(new Date(event.start), 'HH:mm')}–${format(new Date(event.end), 'HH:mm')}`
                                        }
                                      </span>
                                    </div>
                                    
                                    {event.location && (
                                      <div className="flex items-center gap-1.5">
                                        <MapPin className="w-3 h-3" />
                                        <span>{event.location}</span>
                                      </div>
                                    )}
                                  </div>
                                  
                                  {event.description && (
                                    <p className="text-xs text-muted-foreground pt-1.5 border-t line-clamp-2">
                                      {event.description}
                                    </p>
                                  )}
                                </div>
                              </CardContent>
                            </Card>
                          ))
                        ) : (
                          <Card className="border-l-4 border-l-gray-300">
                            <CardContent className="p-3">
                              <p className="text-xs text-muted-foreground">Bu kriterlere uygun etkinlik bulunamadı.</p>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    )}
                  </>
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

        {/* Input Area - Fixed at Bottom */}
        <div 
          className="fixed bottom-0 left-0 right-0 flex justify-center p-6 bg-gradient-to-t from-background via-background to-transparent pointer-events-none transition-all duration-300"
          style={{
            paddingLeft: sidebarState === 'expanded' ? 'calc(var(--sidebar-width, 16rem) + 1.5rem)' : '1.5rem'
          }}
        >
          <div className="w-full max-w-2xl pointer-events-auto">
            <div className="relative flex items-center gap-2.5 rounded-2xl border-2 bg-background px-3 py-2.5 shadow-md">
            {/* Model Selector */}
            <ModelSelector 
              selectedModel={selectedModel}
              onModelChange={setSelectedModel}
            />

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
              className="flex-1 border-0 bg-transparent focus-visible:ring-0 focus-visible:ring-offset-0 text-base h-9"
            />

            <Button
              onClick={handleVoiceInput}
              variant="ghost"
              size="icon"
              className={`shrink-0 rounded-full relative ${
                isRecording 
                  ? 'bg-red-500 hover:bg-red-600' 
                  : isLoading && audioLevel > 0 
                    ? 'bg-blue-500' 
                    : ''
              }`}
              title={isRecording ? "Kaydı durdur" : "Sesli giriş"}
              disabled={isLoading && audioLevel === 0}
            >
              {(isRecording || (isLoading && audioLevel > 0)) ? (
                <div className="relative h-5 w-5 flex items-center justify-center gap-0.5">
                  {/* Audio visualization bars */}
                  <div 
                    className="w-0.5 bg-white rounded-full transition-all duration-100 ease-out"
                    style={{ height: `${Math.max(20, Math.min(90, audioLevel * 150 * 0.7))}%` }}
                  />
                  <div 
                    className="w-0.5 bg-white rounded-full transition-all duration-100 ease-out"
                    style={{ height: `${Math.max(30, Math.min(90, audioLevel * 150 * 1.0))}%` }}
                  />
                  <div 
                    className="w-0.5 bg-white rounded-full transition-all duration-100 ease-out"
                    style={{ height: `${Math.max(40, Math.min(90, audioLevel * 150 * 1.3))}%` }}
                  />
                  <div 
                    className="w-0.5 bg-white rounded-full transition-all duration-100 ease-out"
                    style={{ height: `${Math.max(30, Math.min(90, audioLevel * 150 * 0.9))}%` }}
                  />
                  <div 
                    className="w-0.5 bg-white rounded-full transition-all duration-100 ease-out"
                    style={{ height: `${Math.max(20, Math.min(90, audioLevel * 150 * 0.6))}%` }}
                  />
                </div>
              ) : (
                <Mic className="h-5 w-5" />
              )}
            </Button>

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

      {/* Error Dialog */}
      <AlertDialog open={errorDialog.open} onOpenChange={(open) => setErrorDialog({ ...errorDialog, open })}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{errorDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{errorDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogAction onClick={() => setErrorDialog({ ...errorDialog, open: false })}>
              Tamam
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
