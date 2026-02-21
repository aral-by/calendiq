import { useState, useEffect } from 'react';
import { UserProvider, useUser } from '@/context/UserContext';
import { EventProvider } from '@/context/EventContext';
import { ChatHistoryProvider } from '@/context/ChatHistoryContext';
import { SetupWizard } from '@/components/Setup/SetupWizard';
import { WelcomeScreen } from '@/components/Welcome/WelcomeScreen';
import { PINScreen } from '@/components/PIN/PINScreen';
import { MainLayout } from '@/components/Layout/MainLayout';
import { Dashboard } from '@/components/Dashboard/Dashboard';
import { AssistantChat } from '@/components/Chat/AssistantChat';
import { CursorProvider, Cursor } from '@/components/animate-ui/components/animate/cursor';

function AppContent() {
  const { isSetupComplete, isAuthenticated, loading, showWelcome } = useUser();
  const [currentPage, setCurrentPage] = useState<'dashboard' | 'search' | 'calendar' | 'ai-chat' | 'statistics'>('dashboard');

  // Request notification permission on first load
  useEffect(() => {
    if (isSetupComplete && isAuthenticated && !showWelcome) {
      const requestNotificationPermission = async () => {
        if ('Notification' in window && 'serviceWorker' in navigator) {
          const permission = Notification.permission;
          
          if (permission === 'default') {
            setTimeout(async () => {
              try {
                const result = await Notification.requestPermission();
                if (result === 'granted') {
                  navigator.serviceWorker.register('/sw.js').catch((error) => {
                    console.error('Service Worker registration failed:', error);
                  });
                }
              } catch (error) {
                console.error('Error requesting notification permission:', error);
              }
            }, 2000);
          } else if (permission === 'granted') {
            navigator.serviceWorker.register('/sw.js').catch((error) => {
              console.error('Service Worker registration failed:', error);
            });
          }
        }
      };

      requestNotificationPermission();
    }
  }, [isSetupComplete, isAuthenticated, showWelcome]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-white">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-gray-900 mx-auto mb-4"></div>
          <p className="text-gray-600">Loading...</p>
        </div>
      </div>
    );
  }

  if (!isSetupComplete) {
    return <SetupWizard />;
  }

  if (!isAuthenticated) {
    return <PINScreen />;
  }

  if (showWelcome) {
    return <WelcomeScreen />;
  }

  const handleNavigate = (page: 'dashboard' | 'search' | 'calendar' | 'ai-chat' | 'statistics') => {
    setCurrentPage(page);
  };

  const handleDashboardCardClick = (action: 'calendar' | 'ai-chat' | 'today' | 'quick-add') => {
    if (action === 'calendar') {
      setCurrentPage('calendar');
    } else if (action === 'ai-chat') {
      setCurrentPage('ai-chat');
    } else if (action === 'today') {
      // TODO: Implement today's schedule view
      console.log('Today view not implemented yet');
    } else if (action === 'quick-add') {
      // TODO: Implement quick add modal
      console.log('Quick add not implemented yet');
    }
  };

  return (
    <EventProvider>
      <ChatHistoryProvider>
        <MainLayout currentPage={currentPage} onNavigate={handleNavigate}>
          {currentPage === 'dashboard' && <Dashboard onNavigate={handleDashboardCardClick} />}
          {currentPage === 'search' && <div className="flex items-center justify-center h-full"><h1 className="text-2xl font-bold">Search Page</h1></div>}
          {currentPage === 'calendar' && <div className="flex items-center justify-center h-full"><h1 className="text-2xl font-bold">Calendar Page</h1></div>}
          {currentPage === 'ai-chat' && <AssistantChat />}
          {currentPage === 'statistics' && <div className="flex items-center justify-center h-full"><h1 className="text-2xl font-bold">Statistics Page</h1></div>}
        </MainLayout>
      </ChatHistoryProvider>
    </EventProvider>
  );
}

function App() {
  return (
    <CursorProvider>
      <Cursor />
      <UserProvider>
        <AppContent />
      </UserProvider>
    </CursorProvider>
  );
}

export default App;

