# Phase 6: Speech-to-Text Integration (Deepgram)

**Status:** Not Started  
**Estimated Time:** 2-3 hours  
**Dependencies:** Phase 5

---

## Objectives

- Integrate Deepgram API for voice input
- Add microphone button to chat input
- Handle audio recording and transcription
- Populate chat input with transcript

---

## Tasks

### 6.1 Update AI Endpoint for Audio

**api/ai.ts (update):**
```typescript
export default async function handler(req: VercelRequest, res: VercelResponse) {
  const { message, audio } = req.body;

  // If audio is present, transcribe first
  if (audio) {
    const DEEPGRAM_API_KEY = process.env.DEEPGRAM_API_KEY;
    
    const transcriptResponse = await fetch(
      'https://api.deepgram.com/v1/listen',
      {
        method: 'POST',
        headers: {
          'Authorization': `Token ${DEEPGRAM_API_KEY}`,
          'Content-Type': 'audio/webm',
        },
        body: Buffer.from(audio, 'base64'),
      }
    );

    const transcriptData = await transcriptResponse.json();
    const transcript = transcriptData.results.channels[0].alternatives[0].transcript;

    // Now use transcript as message
    message = transcript;
  }

  // Continue with OpenAI flow...
}
```

---

### 6.2 Create Voice Recorder Hook

**src/hooks/useVoiceRecorder.ts:**
```typescript
import { useState, useRef } from 'react';

export function useVoiceRecorder() {
  const [isRecording, setIsRecording] = useState(false);
  const [audioBlob, setAudioBlob] = useState<Blob | null>(null);
  const mediaRecorderRef = useRef<MediaRecorder | null>(null);
  const chunksRef = useRef<Blob[]>([]);

  async function startRecording() {
    try {
      const stream = await navigator.mediaDevices.getUserMedia({ audio: true });
      const mediaRecorder = new MediaRecorder(stream);
      
      mediaRecorderRef.current = mediaRecorder;
      chunksRef.current = [];

      mediaRecorder.ondataavailable = (e) => {
        if (e.data.size > 0) {
          chunksRef.current.push(e.data);
        }
      };

      mediaRecorder.onstop = () => {
        const blob = new Blob(chunksRef.current, { type: 'audio/webm' });
        setAudioBlob(blob);
        stream.getTracks().forEach(track => track.stop());
      };

      mediaRecorder.start();
      setIsRecording(true);
    } catch (error) {
      console.error('Error starting recording:', error);
      alert('Microphone access denied');
    }
  }

  function stopRecording() {
    if (mediaRecorderRef.current && isRecording) {
      mediaRecorderRef.current.stop();
      setIsRecording(false);
    }
  }

  return {
    isRecording,
    audioBlob,
    startRecording,
    stopRecording,
  };
}
```

---

### 6.3 Create Voice Recorder Component

**src/components/Chat/VoiceRecorder.tsx:**
```typescript
import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { useVoiceRecorder } from '@/hooks/useVoiceRecorder';
import { Mic, MicOff } from 'lucide-react';

interface VoiceRecorderProps {
  onTranscript: (text: string) => void;
}

export function VoiceRecorder({ onTranscript }: VoiceRecorderProps) {
  const { isRecording, audioBlob, startRecording, stopRecording } = useVoiceRecorder();
  const [processing, setProcessing] = useState(false);

  async function handleRecord() {
    if (isRecording) {
      stopRecording();
    } else {
      startRecording();
    }
  }

  async function processAudio() {
    if (!audioBlob) return;

    setProcessing(true);

    try {
      const reader = new FileReader();
      reader.readAsDataURL(audioBlob);
      
      reader.onloadend = async () => {
        const base64Audio = reader.result?.toString().split(',')[1];

        const response = await fetch('/api/ai', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ audio: base64Audio }),
        });

        const data = await response.json();
        onTranscript(data.transcript || '');
      };
    } catch (error) {
      console.error('Error processing audio:', error);
    } finally {
      setProcessing(false);
    }
  }

  useEffect(() => {
    if (audioBlob && !isRecording) {
      processAudio();
    }
  }, [audioBlob, isRecording]);

  return (
    <Button
      type="button"
      variant="outline"
      size="icon"
      onClick={handleRecord}
      disabled={processing}
    >
      {processing ? (
        <Loader2 className="h-4 w-4 animate-spin" />
      ) : isRecording ? (
        <MicOff className="h-4 w-4 text-red-500" />
      ) : (
        <Mic className="h-4 w-4" />
      )}
    </Button>
  );
}
```

---

### 6.4 Update Chat Input with Voice Button

**src/components/Chat/ChatInput.tsx (update):**
```typescript
import { VoiceRecorder } from './VoiceRecorder';

export function ChatInput({ onSend }: ChatInputProps) {
  const [message, setMessage] = useState('');

  function handleTranscript(text: string) {
    setMessage(text);
  }

  return (
    <form onSubmit={handleSubmit} className="flex gap-2">
      <Input
        value={message}
        onChange={e => setMessage(e.target.value)}
        placeholder="Type or speak..."
      />
      <VoiceRecorder onTranscript={handleTranscript} />
      <Button type="submit">Send</Button>
    </form>
  );
}
```

---

### 6.5 Add Environment Variable

**.env:**
```
DEEPGRAM_API_KEY=your_deepgram_api_key_here
```

**Vercel Dashboard:**
Add `DEEPGRAM_API_KEY` to environment variables.

---

## Acceptance Criteria

- [ ] Microphone button appears in chat input
- [ ] Click mic → starts recording
- [ ] Click again → stops recording
- [ ] Audio sent to Deepgram API
- [ ] Transcript populates chat input
- [ ] User can edit transcript before sending
- [ ] Error handling for mic permissions
- [ ] Loading indicator while processing

---

## Next Phase

Proceed to **Phase 7: Conflict Detection & Validation**
