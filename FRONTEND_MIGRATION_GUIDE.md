# Frontend Migration Guide - Removing Supabase

This guide documents the migration from Supabase to a frontend-only solution using localStorage and mock data services.

## Overview

All Supabase dependencies have been removed and replaced with:
- `mockDataService` - Local storage-based data management
- `dataService` - Wrapper API for consistent data access
- Updated `AuthContext` - Local authentication without Supabase
- Updated `SubscriptionContext` - Local subscription management

## Key Changes

### 1. Authentication
- **Before**: Supabase auth with `supabase.auth.signInWithPassword()`
- **After**: Local authentication with `AuthContext.signIn()` using localStorage

### 2. Data Access
- **Before**: Direct Supabase queries like `supabase.from('table').select()`
- **After**: Use `dataService` methods like `dataService.getFarms()`

### 3. Imports
- **Remove**: `import { supabase } from '../lib/supabase'`
- **Add**: `import { dataService } from '../services/dataService'`

## Migration Pattern

### Example: Converting Supabase Query to dataService

**Before:**
```typescript
const { data: farms } = await supabase
  .from('farms')
  .select('*')
  .eq('farmer_id', farmerId);
```

**After:**
```typescript
const farms = await dataService.getFarms(farmerId);
```

### Example: Creating Records

**Before:**
```typescript
const { data, error } = await supabase
  .from('farms')
  .insert([farmData])
  .select()
  .single();
```

**After:**
```typescript
const farm = await dataService.createFarm(farmData);
```

## Files That Need Updates

The following files still need to be updated to remove Supabase dependencies:

### Admin Pages
- [ ] `src/pages/admin/AdminDashboard.tsx`
- [ ] `src/pages/admin/FarmersManagement.tsx`
- [ ] `src/pages/admin/FarmerDetail.tsx`
- [ ] `src/pages/admin/AllFarmsManagement.tsx`
- [ ] `src/pages/admin/AllBatchesManagement.tsx`
- [ ] `src/pages/admin/DevicesManagement.tsx`
- [ ] `src/pages/admin/AlertsManagement.tsx`
- [ ] `src/pages/admin/SubscriptionsManagement.tsx`
- [ ] `src/pages/admin/RecommendationsManagement.tsx`
- [ ] `src/pages/admin/BreedConfigurations.tsx`
- [ ] `src/pages/admin/Settings.tsx`

### Farmer Pages
- [x] `src/pages/farmer/FarmerDashboard.tsx` ✅
- [ ] `src/pages/farmer/FarmsManagement.tsx`
- [ ] `src/pages/farmer/FarmDetail.tsx`
- [ ] `src/pages/farmer/BatchesManagement.tsx`
- [ ] `src/pages/farmer/ActivitiesManagement.tsx`
- [ ] `src/pages/farmer/AlertsPage.tsx`
- [ ] `src/pages/farmer/ProfilePage.tsx`
- [ ] `src/pages/farmer/KnowledgeBase.tsx`
- [ ] `src/pages/farmer/Subscription.tsx`
- [ ] `src/pages/farmer/InventoryManagement.tsx`

### Components
- [x] `src/components/Header.tsx` ✅
- [ ] `src/components/AddInventoryItemModal.tsx`
- [ ] `src/components/StockTransactionModal.tsx`
- [ ] `src/components/PredictionHistory.tsx`

### Other
- [ ] `src/pages/disease-prediction.tsx`
- [ ] `src/contexts/LanguageContext.tsx`
- [ ] `src/pages/api/create-admin.ts` (can be deleted)
- [ ] `src/pages/createAdmin.ts` (can be deleted)

## Common Patterns to Replace

### 1. Supabase Query with Filters
```typescript
// Before
const { data } = await supabase
  .from('table')
  .select('*')
  .eq('field', value)
  .order('created_at', { ascending: false });

// After
const all = await dataService.getTable();
const filtered = all
  .filter(item => item.field === value)
  .sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
```

### 2. Count Queries
```typescript
// Before
const { count } = await supabase
  .from('table')
  .select('*', { count: 'exact', head: true })
  .eq('field', value);

// After
const items = await dataService.getTable();
const count = items.filter(item => item.field === value).length;
```

### 3. Real-time Subscriptions
```typescript
// Before
const subscription = supabase
  .channel('channel')
  .on('postgres_changes', { event: '*', schema: 'public', table: 'table' }, () => {
    fetchData();
  })
  .subscribe();

// After
// Use setInterval or manual refresh
useEffect(() => {
  const interval = setInterval(fetchData, 30000); // Refresh every 30s
  return () => clearInterval(interval);
}, []);
```

## Testing

After migration:
1. Test login/logout functionality
2. Test CRUD operations for each entity
3. Verify data persists in localStorage
4. Check that all routes work correctly
5. Test Admin and Farmer sections separately

## Notes

- All data is stored in localStorage
- Data persists across page refreshes
- No backend connection required
- Perfect for frontend-only demos and prototypes
- Can be easily replaced with real API calls later



