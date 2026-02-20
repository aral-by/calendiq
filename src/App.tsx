import { UserProvider, useUser } from '@/context/UserContext';
import { EventProvider } from '@/context/EventContext';
import { SetupWizard } from '@/components/Setup/SetupWizard';
import { WelcomeScreen } from '@/components/Welcome/WelcomeScreen';
import { PINScreen } from '@/components/PIN/PINScreen';
import { Dashboard } from '@/components/Dashboard/Dashboard';

function AppContent() {
  const { isSetupComplete, isAuthenticated, loading, showWelcome } = useUser();

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

  return (
    <EventProvider>
      <MainLayout
        calendar={<CalendarView />}
        chat={
          <div className="h-full flex items-center justify-center p-8">
            <div className="text-center space-y-4">
              <h2 className="text-2xl font-normal text-gray-900">Chat Interface</h2>
              <p className="text-gray-500">Coming in Phase 5</p>
            </div>
          </div>
        }
      />
    </EventProvider>
  );
}

function App() {
  return (
    <UserProvider>
      <AppContent />
    </UserProvider>
  );
}

export default App;
