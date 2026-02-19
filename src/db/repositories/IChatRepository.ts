import type { ChatMessage } from '@/types/chat';

/**
 * Chat Repository Interface
 * Manages chat message history storage
 */
export interface IChatRepository {
  /**
   * Create a new chat message
   */
  create(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage>;

  /**
   * Get all chat messages ordered by timestamp
   */
  getAll(): Promise<ChatMessage[]>;

  /**
   * Get recent chat messages (limited)
   */
  getRecent(limit: number): Promise<ChatMessage[]>;

  /**
   * Clear all chat history
   */
  clear(): Promise<void>;
}
