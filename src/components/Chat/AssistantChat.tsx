import { AssistantRuntimeProvider } from '@assistant-ui/react';
import { useEdgeRuntime } from '@assistant-ui/react-ai-sdk';
import { Thread } from '@/components/thread';

export function AssistantChat() {
  const runtime = useEdgeRuntime({
    api: '/api/ai',
  });

  return (
    <AssistantRuntimeProvider runtime={runtime}>
      <Thread />
    </AssistantRuntimeProvider>
  );
}
