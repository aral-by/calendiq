// User Profile Interface
export interface UserProfile {
  id: 1; // Always 1 (single user application)
  firstName: string;
  lastName: string;
  birthDate: string; // ISO 8601 date: "YYYY-MM-DD"
  pinHash: string;   // SHA-256 hashed PIN
  createdAt: string; // ISO 8601 timestamp
}
