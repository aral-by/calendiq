// User Profile Interface
export interface UserProfile {
  id: 1; // Always 1 (single user application)
  firstName: string;
  lastName: string;
  dateOfBirth: string; // ISO 8601 date: "YYYY-MM-DD"
  pinHash: string;   // SHA-256 hashed PIN
  preferredLanguage?: string; // User's preferred language (default: 'tr' - Turkish)
  preferredTheme?: 'light' | 'dark' | 'system'; // User's preferred theme
  timezone?: string; // User's timezone (default: 'Europe/Istanbul' - Turkey UTC+3)
  createdAt: string; // ISO 8601 timestamp
}
