// Chat Message Interface
export interface ChatMessage {
  id: string;           // UUID
  userMessage: string;  // User's input text
  aiResponse?: string;  // AI's parsed response or message
  timestamp: string;    // ISO 8601 timestamp
  actionType?: string;  // Type of AI action executed (CREATE_EVENT, UPDATE_EVENT, etc.)
  actionPayload?: any;  // Action payload data
}
