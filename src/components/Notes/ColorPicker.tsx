import { NoteColor } from '@/types/note';
import { Button } from '@/components/ui/button';
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
    <div className="flex gap-2">
      {colors.map((color) => (
        <Button
          key={color.value}
          variant="outline"
          size="icon"
          className={cn(
            'w-8 h-8 rounded-full border-2 transition-all',
            color.class,
            selectedColor === color.value && 'ring-2 ring-offset-2 ring-primary scale-110'
          )}
          onClick={() => onColorChange(color.value)}
          title={color.label}
        />
      ))}
    </div>
  );
}
