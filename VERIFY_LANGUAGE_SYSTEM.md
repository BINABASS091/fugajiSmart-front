# Language System Verification Guide

## Quick Verification Steps

### 1. Start the Application

```bash
cd frontend
npm run dev
```

### 2. Test Language Switching

1. **Open the app** in browser: `http://localhost:5173`
2. **Navigate to Login page** (or any page)
3. **Click the language switcher** in the header (EN ↔ SW)
4. **Observe:**
   - ✅ All text should change immediately
   - ✅ No page refresh needed
   - ✅ Navigation should still work

### 3. Test Language Persistence

1. **Switch language** to Swahili (SW)
2. **Refresh the page** (F5 or Cmd+R)
3. **Verify:**
   - ✅ Language should still be Swahili
   - ✅ All text should remain in Swahili

### 4. Test Across Pages

Navigate through different pages and verify:
- ✅ Login page - Text changes
- ✅ Dashboard - Text changes
- ✅ Sidebar - Menu items change
- ✅ All pages - Content changes

## Expected Behavior

### When Language Changes:

1. **Immediate Update**: All text changes instantly
2. **No Reload**: Page doesn't refresh
3. **State Preserved**: Form data, navigation state preserved
4. **Persistence**: Language saved to localStorage

### What Should Change:

- ✅ Page titles and headings
- ✅ Button labels
- ✅ Form labels
- ✅ Navigation menu items
- ✅ Error/success messages
- ✅ Placeholder text (if translated)
- ✅ Empty states

## Browser Console Checks

Open browser DevTools (F12) and check:

```javascript
// 1. Check localStorage
localStorage.getItem('preferredLanguage');
// Should return: 'en' or 'sw'

// 2. Check i18next (if available globally)
// Note: i18next might not be exposed globally by default
```

## Common Issues

### Issue: Text Doesn't Change

**Possible Causes:**
1. Component not using `useLanguage()` hook
2. Hardcoded text instead of `t()` function
3. Translation key doesn't exist

**Solution:**
- Check component imports `useLanguage`
- Verify text uses `t('key')` not hardcoded strings
- Add missing translation keys

### Issue: Language Resets

**Possible Causes:**
1. localStorage not working
2. Browser blocking localStorage
3. i18next not initialized

**Solution:**
- Check browser console for errors
- Verify localStorage is enabled
- Check `src/main.tsx` imports i18n config

### Issue: Some Text Changes, Some Doesn't

**Possible Causes:**
1. Mixed usage - some text translated, some hardcoded
2. Missing translation keys

**Solution:**
- Find hardcoded text using grep
- Add missing translation keys
- Update components to use `t()`

## Testing Checklist

For each page, verify:

- [ ] Language switcher visible in header
- [ ] Clicking switcher changes language
- [ ] All visible text changes
- [ ] Navigation still works
- [ ] Forms still work
- [ ] Language persists after refresh
- [ ] No console errors

## Automated Testing (Future)

```typescript
// Example test
describe('Language Switching', () => {
  it('should change all text when language changes', () => {
    const { getByText, getByRole } = render(<App />);
    
    // Initial language (English)
    expect(getByText('Welcome')).toBeInTheDocument();
    
    // Change language
    fireEvent.click(getByRole('button', { name: /sw/i }));
    
    // Verify change
    expect(getByText('Karibu')).toBeInTheDocument();
  });
});
```

---

**Status**: Ready for testing!


