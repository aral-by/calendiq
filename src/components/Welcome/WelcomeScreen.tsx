import { useUser } from '@/context/UserContext';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';

export function WelcomeScreen() {
  const { user } = useUser();
  const [show, setShow] = useState(true);

  useEffect(() => {
    // Auto-hide welcome screen after 3 seconds
    const timer = setTimeout(() => setShow(false), 3000);
    return () => clearTimeout(timer);
  }, []);

  if (!show) return null;

  return (
    <CursorProvider>
      <Cursor />
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center space-y-12 animate-in fade-in zoom-in duration-1000">
          <Calendar className="w-40 h-40 text-gray-900 mx-auto" strokeWidth={0.5} />
          <div className="space-y-6">
            <h1 className="text-8xl font-extralight text-gray-900 tracking-tight">
              Welcome
            </h1>
            <p className="text-4xl font-light text-gray-400">
              {user?.firstName}
            </p>
          </div>
          <div className="pt-12">
            <div className="flex items-center justify-center gap-2">
              <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-2 h-2 bg-gray-900 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </CursorProvider>
  );
}
