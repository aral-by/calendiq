import { db } from '@/db';
import type { ChatMessage } from '@/types/chat';
import type { IChatRepository } from './IChatRepository';

/**
 * IndexedDB implementation of Chat Repository
 */
export class IndexedDBChatRepository implements IChatRepository {
  async create(message: Omit<ChatMessage, 'id'>): Promise<ChatMessage> {
    const newMessage: ChatMessage = {
      ...message,
      id: crypto.randomUUID(),
    };
    await db.chat_messages.add(newMessage);
    return newMessage;
  }

  async getAll(): Promise<ChatMessage[]> {
    return await db.chat_messages.orderBy('timestamp').toArray();
  }

  async getRecent(limit: number): Promise<ChatMessage[]> {
    return await db.chat_messages
      .orderBy('timestamp')
      .reverse()
      .limit(limit)
      .toArray();
  }

  async clear(): Promise<void> {
    await db.chat_messages.clear();
  }
}
