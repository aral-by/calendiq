import { NoteColor } from '@/types/note';
import { cn } from '@/lib/utils';

interface ColorPickerProps {
  selectedColor: NoteColor;
  onColorChange: (color: NoteColor) => void;
}

const colors: { value: NoteColor; label: string; class: string }[] = [
  { value: 'yellow', label: 'Yellow', class: 'bg-yellow-300 hover:bg-yellow-400 border-yellow-400' },
  { value: 'pink', label: 'Pink', class: 'bg-pink-300 hover:bg-pink-400 border-pink-400' },
  { value: 'blue', label: 'Blue', class: 'bg-blue-300 hover:bg-blue-400 border-blue-400' },
  { value: 'green', label: 'Green', class: 'bg-green-300 hover:bg-green-400 border-green-400' },
  { value: 'purple', label: 'Purple', class: 'bg-purple-300 hover:bg-purple-400 border-purple-400' },
  { value: 'orange', label: 'Orange', class: 'bg-orange-300 hover:bg-orange-400 border-orange-400' },
];

export function ColorPicker({ selectedColor, onColorChange }: ColorPickerProps) {
  return (
    <div className="flex gap-1">
      {colors.map((color) => (
        <button
          key={color.value}
          type="button"
          className={cn(
            'w-5 h-5 rounded-full border transition-all hover:scale-110',
            color.class,
            selectedColor === color.value && 'ring-1 ring-offset-1 ring-foreground scale-105'
          )}
          onClick={() => onColorChange(color.value)}
          title={color.label}
        />
      ))}
    </div>
  );
}
