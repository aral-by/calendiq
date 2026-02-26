import { createContext, useContext, useState, ReactNode, useEffect } from 'react';
import { Note, NoteColor, CreateNoteInput, UpdateNoteInput } from '@/types/note';

interface NoteContextType {
  notes: Note[];
  createNote: (input: CreateNoteInput) => Note;
  updateNote: (id: string, updates: UpdateNoteInput) => void;
  deleteNote: (id: string) => void;
  clearAllNotes: () => void;
}

const NoteContext = createContext<NoteContextType | undefined>(undefined);

export function NoteProvider({ children }: { children: ReactNode }) {
  const [notes, setNotes] = useState<Note[]>(() => {
    const saved = localStorage.getItem('calendiq_notes');
    return saved ? JSON.parse(saved) : [];
  });

  // Save to localStorage whenever notes change
  useEffect(() => {
    localStorage.setItem('calendiq_notes', JSON.stringify(notes));
  }, [notes]);

  const createNote = (input: CreateNoteInput): Note => {
    const newNote: Note = {
      id: `note_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      content: input.content,
      color: input.color,
      position: input.position,
      createdAt: Date.now(),
      updatedAt: Date.now(),
    };

    setNotes(prev => [...prev, newNote]);
    return newNote;
  };

  const updateNote = (id: string, updates: UpdateNoteInput) => {
    setNotes(prev =>
      prev.map(note =>
        note.id === id
          ? { ...note, ...updates, updatedAt: Date.now() }
          : note
      )
    );
  };

  const deleteNote = (id: string) => {
    setNotes(prev => prev.filter(note => note.id !== id));
  };

  const clearAllNotes = () => {
    setNotes([]);
  };

  return (
    <NoteContext.Provider
      value={{
        notes,
        createNote,
        updateNote,
        deleteNote,
        clearAllNotes,
      }}
    >
      {children}
    </NoteContext.Provider>
  );
}

export function useNotes() {
  const context = useContext(NoteContext);
  if (!context) {
    throw new Error('useNotes must be used within a NoteProvider');
  }
  return context;
}
