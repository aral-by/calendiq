# Phase 13: Categories & Event Organization

**Status:** Not Started  
**Estimated Time:** 4-5 hours  
**Dependencies:** Phase 5 (AI Integration), Phase 12 (Recurring Events)

---

## Objectives

- Implement 6 predefined event categories with color coding
- Build category assignment UI
- AI-powered auto-categorization with confidence scores
- Category filtering and legend
- Visual organization with color-coded events
- User override capability

---

## Tasks

### 13.1 Review Type Definitions

Already defined in `src/types/event.ts`:

```typescript
export type EventCategory = 'work' | 'personal' | 'health' | 'social' | 'finance' | 'education' | 'custom';

export interface CategoryDefinition {
  id: EventCategory;
  name: string;
  color: string;
  icon?: string;
  isSystem: boolean;
}

export const DEFAULT_CATEGORIES: CategoryDefinition[] = [
  { id: 'work', name: 'Work', color: '#3b82f6', icon: 'Briefcase', isSystem: true },
  { id: 'personal', name: 'Personal', color: '#10b981', icon: 'User', isSystem: true },
  { id: 'health', name: 'Health', color: '#ef4444', icon: 'Heart', isSystem: true },
  { id: 'social', name: 'Social', color: '#f97316', icon: 'Users', isSystem: true },
  { id: 'finance', name: 'Finance', color: '#8b5cf6', icon: 'DollarSign', isSystem: true },
  { id: 'education', name: 'Education', color: '#06b6d4', icon: 'BookOpen', isSystem: true },
];
```

---

### 13.2 Create Category Service

**src/services/categoryService.ts:**

```typescript
import { EventCategory, CategoryDefinition, DEFAULT_CATEGORIES } from '@/types/event';

export class CategoryService {
  private categories: CategoryDefinition[] = [...DEFAULT_CATEGORIES];

  getAllCategories(): CategoryDefinition[] {
    return this.categories;
  }

  getCategoryById(id: EventCategory): CategoryDefinition | undefined {
    return this.categories.find((c) => c.id === id);
  }

  getCategoryColor(id: EventCategory): string {
    return this.getCategoryById(id)?.color || '#6b7280'; // gray-500 fallback
  }

  getCategoryName(id: EventCategory): string {
    return this.getCategoryById(id)?.name || 'Uncategorized';
  }

  // AI-powered categorization
  async categorizEvent(title: string, description?: string): Promise<{
    category: EventCategory;
    confidence: number;
  }> {
    const keywords = this.extractKeywords(title, description);

    // Simple keyword matching with confidence scores
    const scores: Partial<Record<EventCategory, number>> = {
      work: this.scoreCategory(keywords, ['toplantı', 'meeting', 'presentation', 'proje', 'project', 'work', 'iş', 'report']),
      personal: this.scoreCategory(keywords, ['kişisel', 'personal', 'ev', 'home', 'organize', 'düzenle']),
      health: this.scoreCategory(keywords, ['doktor', 'doctor', 'sağlık', 'health', 'gym', 'spor', 'exercise', 'egzersiz']),
      social: this.scoreCategory(keywords, ['akşam yemeği', 'dinner', 'kahve', 'coffee', 'party', 'parti', 'buluşma', 'meet', 'arkadaş', 'friend']),
      finance: this.scoreCategory(keywords, ['fatura', 'bill', 'ödeme', 'payment', 'banka', 'bank', 'vergi', 'tax', 'invoice']),
      education: this.scoreCategory(keywords, ['ders', 'class', 'okul', 'school', 'öğren', 'learn', 'course', 'kurs', 'eğitim', 'training']),
    };

    // Find highest scoring category
    const entries = Object.entries(scores) as [EventCategory, number][];
    const best = entries.reduce((max, curr) =>
      curr[1] > max[1] ? curr : max
    );

    return {
      category: best[0],
      confidence: Math.min(best[1], 0.95), // Cap at 95%
    };
  }

  private extractKeywords(title: string, description?: string): string[] {
    const text = `${title} ${description || ''}`.toLowerCase();
    return text.split(/\s+/);
  }

  private scoreCategory(keywords: string[], categoryKeywords: string[]): number {
    let score = 0;
    for (const keyword of keywords) {
      for (const catKeyword of categoryKeywords) {
        if (keyword.includes(catKeyword) || catKeyword.includes(keyword)) {
          score += 0.2;
        }
      }
    }
    return Math.min(score, 1.0);
  }
}

export const categoryService = new CategoryService();
```

---

### 13.3 Create Category Selector Component

**src/components/Calendar/CategorySelector.tsx:**

```typescript
import { Badge } from '@/components/ui/badge';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import { EventCategory, DEFAULT_CATEGORIES } from '@/types/event';
import * as Icons from 'lucide-react';

interface CategorySelectorProps {
  value?: EventCategory;
  onChange: (category: EventCategory) => void;
  showConfidence?: number;
}

export function CategorySelector({ value, onChange, showConfidence }: CategorySelectorProps) {
  const selectedCategory = DEFAULT_CATEGORIES.find((c) => c.id === value);

  return (
    <div className="space-y-2">
      <Select value={value} onValueChange={onChange}>
        <SelectTrigger>
          <SelectValue placeholder="Select category">
            {selectedCategory && (
              <div className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded-full"
                  style={{ backgroundColor: selectedCategory.color }}
                />
                <span>{selectedCategory.name}</span>
              </div>
            )}
          </SelectValue>
        </SelectTrigger>
        <SelectContent>
          {DEFAULT_CATEGORIES.map((category) => {
            const Icon = category.icon
              ? Icons[category.icon as keyof typeof Icons]
              : null;

            return (
              <SelectItem key={category.id} value={category.id}>
                <div className="flex items-center gap-2">
                  <div
                    className="w-3 h-3 rounded-full"
                    style={{ backgroundColor: category.color }}
                  />
                  {Icon && <Icon className="w-4 h-4" />}
                  <span>{category.name}</span>
                </div>
              </SelectItem>
            );
          })}
        </SelectContent>
      </Select>

      {showConfidence !== undefined && showConfidence > 0 && (
        <Badge variant="secondary" className="text-xs">
          AI Confidence: {Math.round(showConfidence * 100)}%
        </Badge>
      )}
    </div>
  );
}
```

---

### 13.4 Create Category Legend Component

**src/components/Calendar/CategoryLegend.tsx:**

```typescript
import { DEFAULT_CATEGORIES } from '@/types/event';

interface CategoryLegendProps {
  onCategoryClick?: (categoryId: string) => void;
  activCategories?: Set<string>;
}

export function CategoryLegend({ onCategoryClick, activeCategories }: CategoryLegendProps) {
  return (
    <div className="flex flex-wrap gap-2 p-4 bg-muted/50 rounded-lg">
      <span className="text-sm font-medium mr-2">Categories:</span>
      {DEFAULT_CATEGORIES.map((category) => {
        const isActive = !activeCategories || activeCategories.has(category.id);
        
        return (
          <button
            key={category.id}
            onClick={() => onCategoryClick?.(category.id)}
            className={`flex items-center gap-2 px-3 py-1 rounded-full border transition-opacity ${
              isActive ? 'opacity-100' : 'opacity-40'
            }`}
            style={{
              borderColor: category.color,
              backgroundColor: isActive ? `${category.color}20` : 'transparent',
            }}
          >
            <div
              className="w-3 h-3 rounded-full"
              style={{ backgroundColor: category.color }}
            />
            <span className="text-sm">{category.name}</span>
          </button>
        );
      })}
    </div>
  );
}
```

---

### 13.5 Update EventModal with Auto-Categorization

**src/components/Calendar/EventModal.tsx:**

```typescript
import { CategorySelector } from './CategorySelector';
import { categoryService } from '@/services/categoryService';
import { useEffect, useState } from 'react';

// Inside component
const [category, setCategory] = useState<EventCategory | undefined>(event?.category);
const [categoryConfidence, setCategoryConfidence] = useState(event?.autoCategorizationConfidence || 0);

// Auto-categorize on title/description change
useEffect(() => {
  if (!title) return;

  const timer = setTimeout(async () => {
    const result = await categoryService.categorizEvent(title, description);
    setCategory(result.category);
    setCategoryConfidence(result.confidence);
  }, 500); // Debounce

  return () => clearTimeout(timer);
}, [title, description]);

// In JSX
<div>
  <Label>Category</Label>
  <CategorySelector
    value={category}
    onChange={setCategory}
    showConfidence={categoryConfidence}
  />
</div>

// Include in save payload
const eventData = {
  ...otherFields,
  category,
  categoryColor: categoryService.getCategoryColor(category!),
  autoCategorizationConfidence: categoryConfidence,
};
```

---

### 13.6 Update CalendarView with Color Coding

**src/components/Calendar/CalendarView.tsx:**

```typescript
import { CategoryLegend } from './CategoryLegend';
import { categoryService } from '@/services/categoryService';

// State for category filter
const [activeCategories, setActiveCategories] = useState<Set<string>>(
  new Set(DEFAULT_CATEGORIES.map((c) => c.id))
);

function toggleCategory(categoryId: string) {
  setActiveCategories((prev) => {
    const next = new Set(prev);
    if (next.has(categoryId)) {
      next.delete(categoryId);
    } else {
      next.add(categoryId);
    }
    return next;
  });
}

// Filter events by category
const filteredEvents = events.filter((event) =>
  event.category ? activeCategories.has(event.category) : true
);

// Add background color to events
events={filteredEvents.map((event) => ({
  id: event.id,
  title: event.title,
  start: event.start,
  end: event.end,
  backgroundColor: event.categoryColor || '#6b7280',
  borderColor: event.categoryColor || '#6b7280',
  // ... other fields
}))}

// In JSX (above calendar)
<CategoryLegend
  onCategoryClick={toggleCategory}
  activeCategories={activeCategories}
/>
```

---

### 13.7 Update AI System Prompt for Categories

**api/ai.ts:**

```typescript
const systemPrompt = `
When creating events, assign appropriate category:
- Work: meetings, presentations, deadlines, projects
- Personal: home tasks, personal appointments, errands
- Health: doctor visits, gym, exercise, wellness
- Social: dinners, parties, meetups with friends
- Finance: bill payments, bank appointments, taxes
- Education: classes, courses, training, learning

Examples:
User: "Yarın saat 15'te doktor randevum var"
Response: {
  type: "CREATE_EVENT",
  payload: {
    title: "Doktor Randevusu",
    category: "health",
    start: "2026-02-24T15:00:00Z",
    end: "2026-02-24T16:00:00Z"
  }
}

User: "Pazartesi toplantı ekle"
Response: {
  type: "CREATE_EVENT",
  payload: {
    title: "Toplantı",
    category: "work",
    start: "2026-02-24T10:00:00Z",
    end: "2026-02-24T11:00:00Z"
  }
}
`;
```

---

### 13.8 Update Dexie Schema (if needed)

**src/db/dexie.ts:**

No schema changes needed - category fields already in CalendarEvent interface.

---

## Testing Checklist

- [ ] Create event manually with category selection
- [ ] Auto-categorization suggests correct category based on title
- [ ] Categories show correct colors in calendar
- [ ] Category legend displays all 6 categories
- [ ] Click category in legend to filter events
- [ ] Multiple categories can be filtered simultaneously
- [ ] Uncategorized events show gray color
- [ ] AI assigns categories correctly for Turkish prompts
- [ ] Category confidence badge shows percentage
- [ ] User can override AI-suggested category

---

## Acceptance Criteria

- [ ] 6 predefined categories available (Work, Personal, Health, Social, Finance, Education)
- [ ] Each category has distinct color and icon
- [ ] Auto-categorization works with >70% accuracy
- [ ] Category selector in event modal
- [ ] Category legend with filter functionality
- [ ] Color-coded events in calendar view
- [ ] AI assigns categories automatically
- [ ] User can override AI suggestions
- [ ] Categories saved to IndexedDB
- [ ] No performance issues with category filtering

---

## Known Limitations

- **Custom categories:** Not supported in MVP (only 6 predefined)
- **Multi-category events:** Not supported (events can only have 1 category)
- **AI accuracy:** Simple keyword matching (~70-80% accuracy), not ML-based
- **Localization:** Keywords hardcoded for Turkish and English only

---

## Next Phase

Return to **Phase 9: PWA & Offline Support** to complete remaining features.
