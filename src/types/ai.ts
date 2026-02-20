import { z } from 'zod';

// AI Action Schema - Validates actions returned by OpenAI
export const AIActionSchema = z.discriminatedUnion('type', [
  // Create Event Action
  z.object({
    type: z.literal('CREATE_EVENT'),
    payload: z.object({
      title: z.string(),
      start: z.string(), // ISO 8601
      end: z.string(),   // ISO 8601
      description: z.string().optional(),
      location: z.string().optional(),
      allDay: z.boolean().optional(),
      category: z.enum(['work', 'personal', 'health', 'social', 'finance', 'education']).optional(),
      categoryColor: z.string().optional(),
      reminder: z.number().optional(), // Minutes before event
      priority: z.enum(['low', 'medium', 'high']).optional(),
    }),
  }),
  
  // Update Event Action
  z.object({
    type: z.literal('UPDATE_EVENT'),
    id: z.string(),
    payload: z.record(z.any()),
  }),
  
  // Delete Event Action
  z.object({
    type: z.literal('DELETE_EVENT'),
    id: z.string(),
  }),
  
  // Query Events Action
  z.object({
    type: z.literal('QUERY_EVENTS'),
    filter: z.record(z.any()).optional(),
  }),
  
  // No Action (just conversation)
  z.object({
    type: z.literal('NO_ACTION'),
    message: z.string(),
  }),
]);

// Type inference from schema
export type AIAction = z.infer<typeof AIActionSchema>;

// Helper type guards
export function isCreateEventAction(action: AIAction): action is Extract<AIAction, { type: 'CREATE_EVENT' }> {
  return action.type === 'CREATE_EVENT';
}

export function isUpdateEventAction(action: AIAction): action is Extract<AIAction, { type: 'UPDATE_EVENT' }> {
  return action.type === 'UPDATE_EVENT';
}

export function isDeleteEventAction(action: AIAction): action is Extract<AIAction, { type: 'DELETE_EVENT' }> {
  return action.type === 'DELETE_EVENT';
}

export function isQueryEventsAction(action: AIAction): action is Extract<AIAction, { type: 'QUERY_EVENTS' }> {
  return action.type === 'QUERY_EVENTS';
}

export function isNoAction(action: AIAction): action is Extract<AIAction, { type: 'NO_ACTION' }> {
  return action.type === 'NO_ACTION';
}
