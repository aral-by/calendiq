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
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-white to-gray-50">
        <div className="text-center space-y-8 animate-in fade-in zoom-in duration-1000">
          <div className="bg-white/80 backdrop-blur-sm p-10 rounded-3xl shadow-lg">
            <Calendar className="w-20 h-20 text-gray-600 mx-auto mb-6" strokeWidth={1.25} />
            <div className="space-y-4">
              <h1 className="text-4xl sm:text-5xl md:text-6xl font-normal text-gray-700 tracking-tight">
                Welcome
              </h1>
              <p className="text-xl sm:text-2xl font-light text-gray-400">
                {user?.firstName}
              </p>
            </div>
            <div className="pt-8">
              <div className="flex items-center justify-center gap-1.5">
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '0ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '150ms' }} />
                <div className="w-1.5 h-1.5 bg-gray-600 rounded-full animate-pulse" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        </div>
      </div>
    </CursorProvider>
  );
}
