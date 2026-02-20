// User Profile Interface
export interface UserProfile {
  id: 1; // Always 1 (single user application)
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601 date: "YYYY-MM-DD"
  pinHash: string;   // SHA-256 hashed PIN
  preferredLanguage?: string; // User's preferred language (e.g., 'en', 'tr')
  preferredTheme?: 'light' | 'dark' | 'system'; // User's preferred theme
  createdAt: string; // ISO 8601 timestamp
}
