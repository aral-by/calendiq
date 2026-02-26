import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { ZoomIn, ZoomOut, Maximize2, Plus, Trash2 } from 'lucide-react';
import { useNotes } from '@/context/NoteContext';
import { StickyNote } from '@/components/Notes/StickyNote';
import { ColorPicker } from '@/components/Notes/ColorPicker';
import { NoteColor } from '@/types/note';

export function Notes() {
  const { notes, createNote, updateNote, deleteNote, clearAllNotes } = useNotes();
  const [scale, setScale] = useState(1);
  const [position, setPosition] = useState({ x: 0, y: 0 });
  const [isPanning, setIsPanning] = useState(false);
  const [startPan, setStartPan] = useState({ x: 0, y: 0 });
  const [selectedColor, setSelectedColor] = useState<NoteColor>('yellow');

  const handleZoomIn = () => {
    setScale(prev => Math.min(prev + 0.1, 2));
  };

  const handleZoomOut = () => {
    setScale(prev => Math.max(prev - 0.1, 0.5));
  };

  const handleResetZoom = () => {
    setScale(1);
    setPosition({ x: 0, y: 0 });
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    if (e.button === 0) { // Left click
      setIsPanning(true);
      setStartPan({
        x: e.clientX - position.x,
        y: e.clientY - position.y,
      });
    }
  };

  const handleMouseMove = (e: React.MouseEvent) => {
    if (isPanning) {
      setPosition({
        x: e.clientX - startPan.x,
        y: e.clientY - startPan.y,
      });
    }
  };

  const handleMouseUp = () => {
    setIsPanning(false);
  };

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    const delta = e.deltaY > 0 ? -0.05 : 0.05;
    setScale(prev => Math.min(Math.max(prev + delta, 0.5), 2));
  };

  const handleAddNote = () => {
    // Create note in the center of the visible viewport
    const viewportCenterX = (window.innerWidth / 2 - position.x) / scale;
    const viewportCenterY = (window.innerHeight / 2 - position.y) / scale;

    createNote({
      content: '',
      color: selectedColor,
      position: {
        x: viewportCenterX - 128, // Half of note width (256px / 2)
        y: viewportCenterY - 128, // Half of note height
      },
    });
  };

  const handleClearAll = () => {
    if (notes.length > 0 && confirm(`Are you sure you want to delete all ${notes.length} notes?`)) {
      clearAllNotes();
    }
  };

  return (
    <div className="relative h-full w-full overflow-hidden bg-background">
      {/* Top Toolbar */}
      <div className="absolute top-4 left-4 right-4 z-50 flex items-center justify-between gap-4">
        {/* Left Side - Add Note */}
        <div className="flex items-center gap-3 bg-background/95 backdrop-blur-sm rounded-lg p-2 shadow-lg border border-border">
          <ColorPicker selectedColor={selectedColor} onColorChange={setSelectedColor} />
          <div className="w-px h-8 bg-border" />
          <Button
            onClick={handleAddNote}
            size="sm"
            className="gap-2"
          >
            <Plus className="h-4 w-4" />
            Add Note
          </Button>
        </div>

        {/* Right Side - Controls */}
        <div className="flex items-center gap-2">
          {notes.length > 0 && (
            <Button
              variant="outline"
              size="sm"
              onClick={handleClearAll}
              className="bg-background/95 backdrop-blur-sm shadow-lg gap-2"
            >
              <Trash2 className="h-4 w-4" />
              Clear All ({notes.length})
            </Button>
          )}
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomOut}
            className="bg-background/95 backdrop-blur-sm shadow-lg"
          >
            <ZoomOut className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleResetZoom}
            className="bg-background/95 backdrop-blur-sm shadow-lg"
          >
            <Maximize2 className="h-4 w-4" />
          </Button>
          <Button
            variant="outline"
            size="icon"
            onClick={handleZoomIn}
            className="bg-background/95 backdrop-blur-sm shadow-lg"
          >
            <ZoomIn className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Zoom Level Indicator */}
      <div className="absolute bottom-4 right-4 z-50">
        <div className="bg-background/95 backdrop-blur-sm rounded-lg px-3 py-1.5 text-xs font-medium shadow-lg border border-border">
          {Math.round(scale * 100)}%
        </div>
      </div>

      {/* Canvas Area with Dot Grid */}
      <div
        className="h-full w-full cursor-grab active:cursor-grabbing"
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={handleMouseUp}
        onWheel={handleWheel}
        style={{
          backgroundImage: `radial-gradient(circle, hsl(var(--foreground) / 0.15) 1px, transparent 1px)`,
          backgroundSize: `${20 * scale}px ${20 * scale}px`,
          backgroundPosition: `${position.x}px ${position.y}px`,
        }}
      >
        {/* Content Container */}
        <div
          style={{
            transform: `translate(${position.x}px, ${position.y}px) scale(${scale})`,
            transformOrigin: '0 0',
          }}
          className="relative h-full w-full"
        >
          {/* Sticky notes will be added here */}
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 pointer-events-auto">
            <div className="text-center space-y-4">
              <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-primary/60 bg-clip-text text-transparent">
                Notes Canvas
              </h1>
              <p className="text-muted-foreground text-lg">
                Drag to pan • Scroll to zoom
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
