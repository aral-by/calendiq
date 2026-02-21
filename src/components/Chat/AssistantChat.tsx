import { useMemo } from 'react';
import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useChatRuntime, AssistantChatTransport } from '@assistant-ui/react-ai-sdk';
import { Thread } from '@/components/thread';

export function AssistantChat() {
  // Create transport once
  const transport = useMemo(
    () =>
      new AssistantChatTransport({
        api: '/api/ai',
      }),
    []
  );

  const runtime = useChatRuntime({ transport });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
