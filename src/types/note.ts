export type NoteColor = 'yellow' | 'pink' | 'blue' | 'green' | 'purple' | 'orange';

export interface Note {
  id: string;
  content: string;
  color: NoteColor;
  position: {
    x: number;
    y: number;
  };
  createdAt: number;
  updatedAt: number;
}

export type CreateNoteInput = Omit<Note, 'id' | 'createdAt' | 'updatedAt'>;
export type UpdateNoteInput = Partial<Omit<Note, 'id' | 'createdAt' | 'updatedAt'>>;
