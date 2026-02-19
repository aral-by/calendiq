import { useEffect, useState } from 'react';
import { db } from './db';

function App() {
  const [dbStatus, setDbStatus] = useState<'checking' | 'ready' | 'error'>('checking');

  useEffect(() => {
    async function initializeDB() {
      try {
        // Test database connection
        await db.open();
        console.log('[DB] Dexie database initialized successfully');
        console.log('[DB] Stores:', Object.keys(db._dbSchema));
        
        setDbStatus('ready');
      } catch (error) {
        console.error('[DB] Database initialization failed:', error);
        setDbStatus('error');
      }
    }

    initializeDB();
  }, []);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-50 to-purple-50 flex items-center justify-center p-4">
      <div className="text-center">
        <h1 className="text-6xl font-bold text-indigo-600 mb-4">
          Calendiq
        </h1>
        <p className="text-xl text-gray-600 mb-8">
          Your AI-Powered Calendar Assistant
        </p>
        
        <div className="bg-white rounded-lg shadow-lg p-6 max-w-md">
          <h2 className="text-2xl font-semibold mb-4">Phase 2: Database Layer</h2>
          
          <div className="space-y-3 text-left">
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">Type Definitions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">Dexie Database Instance</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">Repository Pattern</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">✅</span>
              <span className="text-gray-700">Utility Functions</span>
            </div>
            <div className="flex items-center gap-2">
              <span className="text-2xl">
                {dbStatus === 'checking' && '⏳'}
                {dbStatus === 'ready' && '✅'}
                {dbStatus === 'error' && '❌'}
              </span>
              <span className="text-gray-700">
                Database Status: <strong>{dbStatus}</strong>
              </span>
            </div>
          </div>

          {dbStatus === 'ready' && (
            <div className="mt-6 p-4 bg-green-50 border border-green-200 rounded-lg">
              <p className="text-green-800 font-medium">
                🎉 Phase 2 Complete!
              </p>
              <p className="text-sm text-green-600 mt-1">
                IndexedDB ready · Repository pattern implemented
              </p>
            </div>
          )}
        </div>

        <div className="mt-8 flex gap-3 justify-center animate-pulse">
          <div className="w-3 h-3 bg-indigo-500 rounded-full"></div>
          <div className="w-3 h-3 bg-purple-500 rounded-full"></div>
          <div className="w-3 h-3 bg-pink-500 rounded-full"></div>
        </div>
      </div>
    </div>
  );
}

export default App;
