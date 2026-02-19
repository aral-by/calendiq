# Phase 9: Testing & Optimization

**Status:** Not Started  
**Estimated Time:** 3-4 hours  
**Dependencies:** Phase 8

---

## Objectives

- Comprehensive end-to-end testing
- Performance optimization
- UI/UX refinements
- Bug fixes and error handling
- Accessibility improvements

---

## Tasks

### 9.1 Manual Testing Scenarios

**Setup & Authentication:**
- [ ] First-time setup completes successfully
- [ ] PIN validation works correctly
- [ ] Wrong PIN shows error
- [ ] Setup data persists after reload

**Manual Event CRUD:**
- [ ] Create event via form
- [ ] Edit existing event
- [ ] Delete event with confirmation
- [ ] All event fields save correctly
- [ ] Conflict detection triggers
- [ ] Conflict warning allows save anyway

**AI Chat:**
- [ ] Send text message to AI
- [ ] AI creates event correctly
- [ ] AI updates event
- [ ] AI deletes event
- [ ] Chat history persists
- [ ] Error handling for API failures

**Voice Input:**
- [ ] Mic permission requested
- [ ] Recording starts/stops correctly
- [ ] Transcript populates input
- [ ] User can edit transcript
- [ ] Error handling for mic denied

**Offline Mode:**
- [ ] App loads offline
- [ ] Manual CRUD works offline
- [ ] AI chat disabled offline
- [ ] Offline banner displays
- [ ] Online/offline transitions smooth

**PWA:**
- [ ] Install to home screen works
- [ ] App launches fullscreen
- [ ] Landscape orientation locked
- [ ] Icons display correctly

---

### 9.2 Performance Optimizations

**Code Splitting:**
```typescript
// Lazy load heavy components
const CalendarView = lazy(() => import('@/components/Calendar/CalendarView'));
const ChatPanel = lazy(() => import('@/components/Chat/ChatPanel'));
```

**Memoization:**
```typescript
// In CalendarView
const eventItems = useMemo(() => 
  events.map(e => ({
    id: e.id,
    title: e.title,
    start: e.start,
    end: e.end,
  })),
  [events]
);
```

**IndexedDB Indexes:**
```typescript
// Ensure proper indexing in db/index.ts
this.version(1).stores({
  events: 'id, start, end, status, [start+end]', // Compound index
});
```

**Debounce Conflict Detection:**
```typescript
import { debounce } from 'lodash-es';

const debouncedConflictCheck = debounce((start, end) => {
  const conflicts = detectConflicts(events, start, end);
  setConflicts(conflicts);
}, 300);
```

---

### 9.3 UI/UX Refinements

**Loading States:**
- Add skeleton loaders for calendar
- Show spinner during AI processing
- Display progress indicator for voice recording

**Empty States:**
```typescript
// In CalendarView
{events.length === 0 && (
  <div className="text-center p-8 text-muted-foreground">
    <p>No events yet. Click a date to create one!</p>
  </div>
)}
```

**Toast Notifications:**
```typescript
import { useToast } from '@/components/ui/use-toast';

const { toast } = useToast();

toast({
  title: "Event created",
  description: "Your event has been added to the calendar.",
});
```

**Touch Targets:**
- Ensure all buttons are min 44x44px
- Increase tap areas for calendar events
- Add visual feedback on tap

---

### 9.4 Accessibility Improvements

**ARIA Labels:**
```typescript
<button
  aria-label="Record voice message"
  onClick={startRecording}
>
  <Mic />
</button>
```

**Keyboard Navigation:**
- Tab through form fields
- Enter to submit forms
- Escape to close modals

**Focus Management:**
```typescript
// Auto-focus PIN input
<Input
  ref={inputRef}
  autoFocus
  type="password"
/>
```

**Color Contrast:**
- Ensure text meets WCAG AA standards
- Test with Chrome DevTools accessibility audit

---

### 9.5 Error Handling

**Global Error Boundary:**
```typescript
class ErrorBoundary extends React.Component {
  componentDidCatch(error, errorInfo) {
    console.error('App error:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return <div>Something went wrong. Please refresh.</div>;
    }
    return this.props.children;
  }
}
```

**API Error Handling:**
```typescript
async function sendMessage(message: string) {
  try {
    const response = await fetch('/api/ai', { ... });
    
    if (!response.ok) {
      throw new Error(`API error: ${response.status}`);
    }
    
    return await response.json();
  } catch (error) {
    toast({
      title: "Connection error",
      description: "Unable to reach AI. Check your connection.",
      variant: "destructive",
    });
    return null;
  }
}
```

---

### 9.6 Bundle Size Optimization

**Analyze Bundle:**
```bash
npm run build
npx vite-bundle-visualizer
```

**Tree Shaking:**
- Import only needed lodash functions
- Use specific imports from icon libraries

**Production Build:**
```bash
npm run build
# Check dist/ size
du -sh dist/
```

---

### 9.7 Browser Console Cleanup

- Remove all `console.log()` from production code
- Keep only `console.error()` for critical errors
- Add production environment check:

```typescript
if (import.meta.env.DEV) {
  console.log('Debug info');
}
```

---

### 9.8 Security Audit

- [ ] API keys not in bundle
- [ ] No sensitive data in localStorage
- [ ] CSP headers configured
- [ ] HTTPS enforced
- [ ] PIN hashed, never plain text

---

### 9.9 Documentation Updates

- [ ] Update README with setup instructions
- [ ] Document environment variables
- [ ] Add screenshots
- [ ] List known limitations
- [ ] Credit open-source dependencies

---

## Acceptance Criteria

- [ ] All manual test scenarios pass
- [ ] No console errors in production
- [ ] Bundle size < 500KB (gzipped)
- [ ] Lighthouse PWA score > 90
- [ ] Lighthouse Performance score > 80
- [ ] All ARIA labels in place
- [ ] Touch targets properly sized
- [ ] Error states handled gracefully
- [ ] Loading states smooth

---

## Performance Targets

| Metric | Target |
|--------|--------|
| First Contentful Paint | < 1.5s |
| Largest Contentful Paint | < 2.5s |
| Time to Interactive | < 3.5s |
| Bundle Size (gzipped) | < 500KB |
| IndexedDB Query Time | < 50ms |

---

## Next Phase

Proceed to **Phase 10: Documentation & Release**
