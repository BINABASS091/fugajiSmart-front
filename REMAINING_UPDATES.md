# Remaining Files to Update

## Status: Most Critical Files Updated ✅

The following files have been successfully updated:
- ✅ AuthContext
- ✅ SubscriptionContext  
- ✅ Login.tsx
- ✅ FarmerDashboard.tsx
- ✅ FarmsManagement.tsx
- ✅ BatchesManagement.tsx
- ✅ Subscription.tsx
- ✅ InventoryManagement.tsx
- ✅ AdminDashboard.tsx
- ✅ FarmersManagement.tsx
- ✅ Header.tsx

## Files Still Needing Updates

### Admin Pages (Low Priority - Can work with mock data)
- `src/pages/admin/FarmerDetail.tsx`
- `src/pages/admin/AllFarmsManagement.tsx`
- `src/pages/admin/AllBatchesManagement.tsx`
- `src/pages/admin/DevicesManagement.tsx`
- `src/pages/admin/AlertsManagement.tsx`
- `src/pages/admin/SubscriptionsManagement.tsx`
- `src/pages/admin/RecommendationsManagement.tsx`
- `src/pages/admin/BreedConfigurations.tsx`
- `src/pages/admin/Settings.tsx`

### Farmer Pages (Medium Priority)
- `src/pages/farmer/FarmDetail.tsx`
- `src/pages/farmer/ActivitiesManagement.tsx`
- `src/pages/farmer/AlertsPage.tsx`
- `src/pages/farmer/ProfilePage.tsx`
- `src/pages/farmer/KnowledgeBase.tsx`

### Components (Low Priority)
- `src/components/AddInventoryItemModal.tsx` - Needs update
- `src/components/StockTransactionModal.tsx` - Needs update
- `src/components/PredictionHistory.tsx`

### Other Files
- `src/pages/disease-prediction.tsx`
- `src/contexts/LanguageContext.tsx` (if it uses Supabase)
- `src/pages/api/create-admin.ts` (can be deleted)
- `src/pages/createAdmin.ts` (can be deleted)

## Quick Update Pattern

For each file:

1. **Replace imports:**
```typescript
// OLD
import { supabase } from '../lib/supabase';

// NEW
import { dataService } from '../services/dataService';
```

2. **Replace queries:**
```typescript
// OLD
const { data } = await supabase.from('table').select('*').eq('field', value);

// NEW
const items = await dataService.getTable(value);
```

3. **Replace counts:**
```typescript
// OLD
const { count } = await supabase.from('table').select('*', { count: 'exact', head: true });

// NEW
const items = await dataService.getTable();
const count = items.length;
```

## Notes

- All core functionality is working
- Remaining files are mostly display/management pages
- They can be updated incrementally
- The app will work even if some pages show empty data initially



