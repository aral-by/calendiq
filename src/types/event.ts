// CalendarEvent Interface
export interface CalendarEvent {
  // Core fields
  id: string;          // UUID
  title: string;
  description?: string;
  location?: string;
  start: string;       // ISO 8601
  end: string;         // ISO 8601
  allDay: boolean;
  
  // Visual & Organization
  color?: string;
  tags?: string[];
  priority?: 'low' | 'medium' | 'high';
  status?: EventStatus;
  
  // Recurring Events (Phase 12)
  rrule?: string;              // RRULE string (RFC 5545 format)
  recurringEventId?: string;   // Links recurring instances to parent
  exceptionDates?: string[];   // ISO dates to skip (exceptions)
  isRecurring?: boolean;       // Quick check flag
  
  // Categories & Color Coding (Phase 13)
  category?: EventCategory;           // Predefined or custom category
  categoryColor?: string;             // Override category default color
  autoCategorizationConfidence?: number; // AI confidence (0-1)
  
  // Reminders & Notifications
  reminder?: number;           // Minutes before event (0, 5, 10, 15, 30, 60, 1440)
  notificationSent?: boolean;  // Track if reminder was sent
  
  // Timestamps
  createdAt: string;
  updatedAt: string;
}

// Event Status
export type EventStatus = 'confirmed' | 'tentative' | 'cancelled';

// Event Categories
export type EventCategory = 
  | 'work' 
  | 'personal' 
  | 'health' 
  | 'social' 
  | 'finance'
  | 'education'
  | 'custom';

// Category Definition
export interface CategoryDefinition {
  id: string;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean; // true for predefined, false for custom
}

// Predefined Categories
export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { id: 'work', name: 'Work', color: '#3b82f6', icon: 'Briefcase', isSystem: true },
  { id: 'personal', name: 'Personal', color: '#10b981', icon: 'User', isSystem: true },
  { id: 'health', name: 'Health', color: '#ef4444', icon: 'Heart', isSystem: true },
  { id: 'social', name: 'Social', color: '#f59e0b', icon: 'Users', isSystem: true },
  { id: 'finance', name: 'Finance', color: '#8b5cf6', icon: 'DollarSign', isSystem: true },
  { id: 'education', name: 'Education', color: '#06b6d4', icon: 'BookOpen', isSystem: true },
];

// Reminder Options
export const REMINDER_OPTIONS = [
  { label: 'No reminder', value: 0 },
  { label: 'At time of event', value: 0 },
  { label: '5 minutes before', value: 5 },
  { label: '10 minutes before', value: 10 },
  { label: '15 minutes before', value: 15 },
  { label: '30 minutes before', value: 30 },
  { label: '1 hour before', value: 60 },
  { label: '1 day before', value: 1440 },
] as const;

// Event Filter
export interface EventFilter {
  category?: EventCategory;
  priority?: 'low' | 'medium' | 'high';
  status?: EventStatus;
  dateRange?: {
    start: string;
    end: string;
  };
  tags?: string[];
  isRecurring?: boolean;
}
