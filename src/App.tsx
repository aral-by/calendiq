import { UserProvider, useUser } from '@/context/UserContext';
import { SetupWizard } from '@/components/Setup/SetupWizard';
import { PINScreen } from '@/components/PIN/PINScreen';

function AppContent() {
  const { isSetupComplete, isAuthenticated, loading } = useUser();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-indigo-50 to-blue-50">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto mb-4"></div>
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

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-green-50 to-emerald-50 p-4">
      <div className="text-center">
        <h1 className="text-5xl font-bold text-green-600 mb-4">
          Phase 3 Complete!
        </h1>
        <p className="text-xl text-gray-700 mb-8">
          Authentication system is working
        </p>
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-md">
          <h2 className="text-2xl font-semibold mb-4">What's Next?</h2>
          <p className="text-gray-600">
            Phase 4: Calendar UI & Manual CRUD
          </p>
        </div>
      </div>
    </div>
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
