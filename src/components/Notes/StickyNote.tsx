import { useState, useRef, useEffect } from 'react';
import { Note, NoteColor } from '@/types/note';
import { Card } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Input } from '@/components/ui/input';
import { Trash2, GripVertical } from 'lucide-react';
import { cn } from '@/lib/utils';
import { ColorPicker } from './ColorPicker';

interface StickyNoteProps {
  note: Note;
  onUpdate: (id: string, updates: { title?: string; content?: string; color?: NoteColor; position?: { x: number; y: number } }) => void;
  onDelete: (id: string) => void;
  scale: number;
}

const colorStyles: Record<NoteColor, string> = {
  yellow: 'bg-yellow-100 dark:bg-yellow-900/30 border-yellow-300 dark:border-yellow-700 shadow-yellow-200/50 dark:shadow-yellow-900/30',
  pink: 'bg-pink-100 dark:bg-pink-900/30 border-pink-300 dark:border-pink-700 shadow-pink-200/50 dark:shadow-pink-900/30',
  blue: 'bg-blue-100 dark:bg-blue-900/30 border-blue-300 dark:border-blue-700 shadow-blue-200/50 dark:shadow-blue-900/30',
  green: 'bg-green-100 dark:bg-green-900/30 border-green-300 dark:border-green-700 shadow-green-200/50 dark:shadow-green-900/30',
  purple: 'bg-purple-100 dark:bg-purple-900/30 border-purple-300 dark:border-purple-700 shadow-purple-200/50 dark:shadow-purple-900/30',
  orange: 'bg-orange-100 dark:bg-orange-900/30 border-orange-300 dark:border-orange-700 shadow-orange-200/50 dark:shadow-orange-900/30',
};

export function StickyNote({ note, onUpdate, onDelete, scale }: StickyNoteProps) {
  const [isDragging, setIsDragging] = useState(false);
  const [isEditing, setIsEditing] = useState(false);
  const [content, setContent] = useState(note.content);
  const [dragStart, setDragStart] = useState({ x: 0, y: 0 });
  const noteRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    if (isEditing && textareaRef.current) {
      textareaRef.current.focus();
      textareaRef.current.setSelectionRange(content.length, content.length);
    }
  }, [isEditing]);

  const handleMouseDown = (e: React.MouseEvent) => {
    if ((e.target as HTMLElement).closest('.drag-handle')) {
      e.preventDefault();
      setIsDragging(true);
      setDragStart({
        x: e.clientX - note.position.x * scale,
        y: e.clientY - note.position.y * scale,
      });
    }
  };

  const handleMouseMove = (e: MouseEvent) => {
    if (isDragging) {
      const newX = (e.clientX - dragStart.x) / scale;
      const newY = (e.clientY - dragStart.y) / scale;
      onUpdate(note.id, { position: { x: newX, y: newY } });
    }
  };

  const handleMouseUp = () => {
    setIsDragging(false);
  };

  useEffect(() => {
    if (isDragging) {
      document.addEventListener('mousemove', handleMouseMove);
      document.addEventListener('mouseup', handleMouseUp);
      return () => {
        document.removeEventListener('mousemove', handleMouseMove);
        document.removeEventListener('mouseup', handleMouseUp);
      };
    }
  }, [isDragging, dragStart, scale]);

  const handleSave = () => {
    if (content.trim() !== note.content) {
      onUpdate(note.id, { content: content.trim() });
    }
    setIsEditing(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Escape') {
      setContent(note.content);
      setIsEditing(false);
    }
  };

  return (
    <div
      ref={noteRef}
      className="absolute pointer-events-auto"
      style={{
        left: `${note.position.x}px`,
        top: `${note.position.y}px`,
        cursor: isDragging ? 'grabbing' : 'default',
      }}
      onMouseDown={handleMouseDown}
    >
      <Card
        className={cn(
          'w-64 min-h-64 p-4 border-2 shadow-lg transition-all duration-200',
          colorStyles[note.color],
          isDragging && 'scale-105 shadow-xl rotate-1',
          'hover:shadow-xl'
        )}
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-3 -mt-1">
          <div className="drag-handle cursor-grab active:cursor-grabbing p-1 -ml-2 hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors">
            <GripVertical className="w-4 h-4 text-muted-foreground" />
          </div>
          <Button
            variant="ghost"
            size="icon"
            className="h-7 w-7 hover:bg-red-500/20 hover:text-red-600 dark:hover:text-red-400 transition-colors"
            onClick={() => onDelete(note.id)}
          >
            <Trash2 className="h-3.5 w-3.5" />
          </Button>
        </div>

        {/* Content */}
        <div className="min-h-[180px]">
          {isEditing ? (
            <Textarea
              ref={textareaRef}
              value={content}
              onChange={(e) => setContent(e.target.value)}
              onBlur={handleSave}
              onKeyDown={handleKeyDown}
              className={cn(
                'min-h-[180px] resize-none border-none p-2 -mx-2 text-sm bg-transparent',
                'focus-visible:ring-0 focus-visible:ring-offset-0'
              )}
              placeholder="Write your note..."
            />
          ) : (
            <div
              className="min-h-[180px] p-2 -mx-2 text-sm whitespace-pre-wrap break-words cursor-text hover:bg-black/5 dark:hover:bg-white/5 rounded transition-colors"
              onClick={() => setIsEditing(true)}
            >
              {note.content || (
                <span className="text-muted-foreground italic">Click to edit...</span>
              )}
            </div>
          )}
        </div>
      </Card>
    </div>
  );
}
