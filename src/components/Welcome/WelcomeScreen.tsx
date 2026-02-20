import { useUser } from '@/context/UserContext';
import { Calendar } from 'lucide-react';
import { useEffect, useState } from 'react';

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
    <div className="min-h-screen flex flex-col bg-white">
      {/* Logo Header */}
      <div className="p-6 border-b border-gray-100">
        <div className="flex items-center gap-2">
          <Calendar className="w-6 h-6 text-gray-900" strokeWidth={1.5} />
          <h1 className="text-xl font-normal text-gray-900 tracking-tight">
            Calendiq
          </h1>
        </div>
      </div>

      {/* Welcome Content */}
      <div className="flex-1 flex items-center justify-center p-6">
        <div className="text-center space-y-6 animate-in fade-in zoom-in duration-700">
          <Calendar className="w-20 h-20 text-gray-900 mx-auto" strokeWidth={1} />
          <div className="space-y-2">
            <h2 className="text-4xl md:text-5xl font-normal text-gray-900">
              Welcome to Calendiq
            </h2>
            <p className="text-2xl text-gray-500">
              {user?.firstName}
            </p>
          </div>
          <p className="text-sm text-gray-400 uppercase tracking-wider">
            Setting up your workspace...
          </p>
        </div>
      </div>
    </div>
  );
}
