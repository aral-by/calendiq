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
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
          <Calendar className="w-24 h-24 text-gray-700 mx-auto" strokeWidth={1} />
          <div className="space-y-4">
            <h1 className="text-5xl md:text-6xl font-light text-gray-800 tracking-tight">
              Welcome
            </h1>
            <p className="text-2xl font-light text-gray-400">
              {user?.firstName}
            </p>
          </div>
          <div className="pt-8">
            <div className="flex items-center justify-center gap-1.5">
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
              <div className="w-1.5 h-1.5 bg-gray-700 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
            </div>
          </div>
        </div>
      </div>
    </CursorProvider>
  );
}
