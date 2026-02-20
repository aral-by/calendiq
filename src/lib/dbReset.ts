import { db } from '@/db';

/**
 * Reset all application data
 * This will delete the entire IndexedDB database
 */
export async function resetAppData(): Promise<void> {
  try {
    // Close database connection
    db.close();
    
    // Delete the database
    await db.delete();
    
    console.log('[DB Reset] Application data cleared');
    
    // Reload the page to reinitialize
    window.location.reload();
  } catch (error) {
    console.error('[DB Reset] Failed to reset data:', error);
    throw error;
  }
}

/**
 * Clear user profile only (keeps events and chat history)
 */
export async function clearUserProfile(): Promise<void> {
  try {
    await db.user_profile.clear();
    console.log('[DB Reset] User profile cleared');
    window.location.reload();
  } catch (error) {
    console.error('[DB Reset] Failed to clear user profile:', error);
    throw error;
  }
}

/**
 * Make reset function available in browser console
 */
if (typeof window !== 'undefined') {
  (window as any).resetCalendiq = resetAppData;
  (window as any).clearUserProfile = clearUserProfile;
  console.log('[Debug] Use window.resetCalendiq() to reset app or window.clearUserProfile() to clear user only');
}
