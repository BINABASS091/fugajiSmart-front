# Database Relationships Documentation

This document outlines all the database table relationships in the FugajiPro Poultry Management System, connecting the farmer section to the admin section.

## Entity Relationship Overview

### Core User & Profile
```
User (AUTH)
  ↓ OneToOne
FarmerProfile (FARMER)
```

### Farm & Batch Hierarchy
```
FarmerProfile
  ↓ ForeignKey (One-to-Many)
Farm
  ↓ ForeignKey (One-to-Many)
Batch
  ↓ ForeignKey (Many-to-One, Optional)
BreedConfiguration (ADMIN)
```

### Device Management
```
Farm
  ↓ ForeignKey (One-to-Many)
Device
  ↑ ForeignKey (Many-to-One, Optional)
Batch
```

### Activities & Monitoring
```
FarmerProfile ────┐
  ↓              │
Farm            │ ForeignKey
  ↓              │
Batch (Optional) ↓
  ↓              │
Activity ←───────┘
```

### Alerts System
```
FarmerProfile ────┐
  ↓              │
Farm            │
  ↓              │ ForeignKey
Batch (Optional) │ (All Optional)
  ↓              │
Device (Optional)│
  ↓              │
Alert ←──────────┘
```

### Recommendations
```
User (ADMIN) ─────┐ created_by
                  ↓
FarmerProfile ────┐
  ↓              │
Batch (Optional) │ ForeignKey
  ↓              │
Recommendation ←─┘
```

### Subscription & Payment
```
FarmerProfile
  ↓ ForeignKey (One-to-Many)
Subscription
  ↓ ForeignKey (Many-to-One)
SubscriptionPlan (ADMIN)
  
Subscription
  ↓ ForeignKey (One-to-Many)
Payment
```

### User Feature Access
```
User
  ↓ OneToOne
UserFeatureAccess
  ↑ updates_from
Subscription
```

### Inventory Management
```
FarmerProfile ────┐
  ↓              │
Farm (Optional)  │ ForeignKey
  ↓              │
InventoryItem ←──┘
  ↓ ForeignKey (One-to-Many)
InventoryTransaction
```

### Breed Configuration (Admin)
```
BreedConfiguration (ADMIN)
  ├─ ForeignKey (One-to-Many) → BreedStage
  ├─ ForeignKey (One-to-Many) → BreedMilestone
  └─ ForeignKey (One-to-Many) → Batch (Optional)

BreedStage
  ↓ ForeignKey (One-to-Many, Optional)
BreedMilestone
```

---

## Detailed Model Relationships

### 1. User Model
**Type:** Core Authentication Model (extends AbstractUser)

**Relationships:**
- `OneToOne` → FarmerProfile (related_name: 'farmer_profile')
- `OneToOne` → UserFeatureAccess (related_name: 'feature_access')
- `ForeignKey` ← Recommendation (created_by, optional)

**Fields:**
- id (UUID, Primary Key)
- email (Unique)
- role (FARMER/ADMIN/STAFF/VIEWER)
- phone
- timestamps

---

### 2. FarmerProfile Model
**Type:** Farmer Section Core

**Relationships:**
- `OneToOne` → User (Primary Key)
- `ForeignKey` ← Farm (One-to-Many)
- `ForeignKey` ← Activity (One-to-Many)
- `ForeignKey` ← Alert (One-to-Many, optional)
- `ForeignKey` ← Subscription (One-to-Many)
- `ForeignKey` ← InventoryItem (One-to-Many)
- `ForeignKey` ← Recommendation (One-to-Many, optional)

**Fields:**
- business_name
- location
- experience_years
- verification_status
- avatar (ImageField)
- timestamps

---

### 3. Farm Model
**Type:** Farmer Section

**Relationships:**
- `ForeignKey` → FarmerProfile (related_name: 'farms')
- `ForeignKey` ← Batch (One-to-Many)
- `ForeignKey` ← Device (One-to-Many)
- `ForeignKey` ← Activity (One-to-Many, optional)
- `ForeignKey` ← Alert (One-to-Many, optional)
- `ForeignKey` ← InventoryItem (One-to-Many, optional)

**Fields:**
- id (UUID)
- name
- location
- size_hectares
- latitude, longitude
- status
- timestamps

---

### 4. Batch Model
**Type:** Farmer Section

**Relationships:**
- `ForeignKey` → Farm (related_name: 'batches')
- `ForeignKey` → BreedConfiguration (optional, related_name: 'batches')
- `ForeignKey` ← Device (One-to-Many, optional)
- `ForeignKey` ← Activity (One-to-Many, optional)
- `ForeignKey` ← Alert (One-to-Many, optional)
- `ForeignKey` ← Recommendation (One-to-Many, optional)

**Fields:**
- id (UUID)
- batch_number
- breed (CharField)
- breed_config (ForeignKey to BreedConfiguration)
- quantity
- start_date, expected_end_date
- status
- mortality_count
- current_age_days
- timestamps

---

### 5. BreedConfiguration Model
**Type:** Admin Section

**Relationships:**
- `ForeignKey` ← BreedStage (One-to-Many)
- `ForeignKey` ← BreedMilestone (One-to-Many)
- `ForeignKey` ← Batch (One-to-Many, optional)

**Fields:**
- id (UUID)
- breed_name (unique)
- breed_type
- description
- average_maturity_days
- production_lifespan_days
- average_weight_kg
- eggs_per_year
- feed_consumption_daily_grams
- space_requirement_sqm
- temperature_min/max_celsius
- humidity_min/max_percent
- is_active
- timestamps

---

### 6. BreedStage Model
**Type:** Admin Section

**Relationships:**
- `ForeignKey` → BreedConfiguration (related_name: 'stages')
- `ForeignKey` ← BreedMilestone (One-to-Many, optional)

**Fields:**
- id (UUID)
- stage_name
- start_day, end_day
- description
- feeding_guide
- health_tips
- housing_requirements
- expected_weight_kg
- mortality_threshold_percent
- feed_type
- vaccination_schedule
- common_diseases
- management_practices
- order_index
- timestamps

---

### 7. BreedMilestone Model
**Type:** Admin Section

**Relationships:**
- `ForeignKey` → BreedConfiguration (related_name: 'milestones')
- `ForeignKey` → BreedStage (optional, related_name: 'milestones')

**Fields:**
- id (UUID)
- milestone_day
- milestone_title
- milestone_description
- action_required
- is_critical
- timestamps

---

### 8. Device Model
**Type:** Farmer/Admin Section

**Relationships:**
- `ForeignKey` → Farm (related_name: 'devices')
- `ForeignKey` → Batch (optional, related_name: 'devices')
- `ForeignKey` ← Alert (One-to-Many, optional)

**Fields:**
- id (UUID)
- device_name
- serial_number (unique)
- device_type (TEMPERATURE_SENSOR, HUMIDITY_SENSOR, etc.)
- status (ACTIVE, INACTIVE, MAINTENANCE, etc.)
- firmware_version
- installation_date
- last_online
- notes
- timestamps

---

### 9. Activity Model
**Type:** Farmer Section

**Relationships:**
- `ForeignKey` → Farm (optional, related_name: 'activities')
- `ForeignKey` → Batch (optional, related_name: 'activities')
- `ForeignKey` → FarmerProfile (related_name: 'activities')

**Fields:**
- id (UUID)
- activity_type (FEEDING, VACCINATION, CLEANING, etc.)
- description
- status (PENDING, COMPLETED, CANCELLED)
- scheduled_date
- completed_at
- created_at

---

### 10. Alert Model
**Type:** Farmer/Admin Section

**Relationships:**
- `ForeignKey` → FarmerProfile (optional, related_name: 'alerts')
- `ForeignKey` → Farm (optional, related_name: 'alerts')
- `ForeignKey` → Batch (optional, related_name: 'alerts')
- `ForeignKey` → Device (optional, related_name: 'alerts')

**Fields:**
- id (UUID)
- alert_type (HEALTH, ENVIRONMENT, DEVICE, SYSTEM)
- severity (LOW, MEDIUM, HIGH, CRITICAL)
- message
- is_read
- created_at

**Usage:**
- Alerts can be linked to specific farm, batch, or device
- Device alerts automatically reference the triggering device
- Health alerts reference the affected batch
- Environment alerts reference the farm or batch

---

### 11. Recommendation Model
**Type:** Admin → Farmer

**Relationships:**
- `ForeignKey` → FarmerProfile (optional, related_name: 'recommendations')
- `ForeignKey` → Batch (optional, related_name: 'recommendations')
- `ForeignKey` → User (created_by, optional, related_name: 'recommendations')

**Fields:**
- id (UUID)
- title
- category (FEEDING, HEALTH, ENVIRONMENT, BIOSECURITY)
- content
- breed
- age_range_days
- created_at

**Usage:**
- Admin/System creates recommendations
- Can be targeted to specific farmer
- Can be specific to a batch
- General recommendations have null farmer/batch

---

### 12. SubscriptionPlan Model
**Type:** Admin Section

**Relationships:**
- `ForeignKey` ← Subscription (One-to-Many)

**Fields:**
- id (UUID)
- name
- description
- price
- duration_days
- max_farms
- max_devices
- features (JSONField)
- is_active
- timestamps

---

### 13. Subscription Model
**Type:** Farmer Section

**Relationships:**
- `ForeignKey` → FarmerProfile (related_name: 'subscriptions')
- `ForeignKey` → SubscriptionPlan (related_name: 'subscriptions')
- `ForeignKey` ← Payment (One-to-Many)

**Fields:**
- id (UUID)
- status (TRIAL, ACTIVE, CANCELLED, EXPIRED, PAYMENT_PENDING)
- start_date, end_date
- amount
- is_active
- auto_renew
- trial_ends_at
- cancelled_at
- cancellation_reason
- notes
- timestamps

---

### 14. Payment Model
**Type:** Farmer Section

**Relationships:**
- `ForeignKey` → Subscription (related_name: 'payments')

**Fields:**
- id (UUID)
- amount
- payment_method (MPESA, CARD, BANK, OTHER)
- transaction_id (unique)
- status (PENDING, COMPLETED, FAILED, REFUNDED)
- receipt_number
- payment_date
- completed_at
- notes
- timestamps

---

### 15. UserFeatureAccess Model
**Type:** Farmer Section

**Relationships:**
- `OneToOne` → User (related_name: 'feature_access')
- Updates from → Subscription (not direct FK)

**Fields:**
- can_add_farm
- can_add_batch
- can_add_inventory
- can_view_analytics
- can_export_data
- can_use_api
- max_farms
- max_batches_per_farm
- max_devices
- timestamps

---

### 16. InventoryItem Model
**Type:** Farmer Section

**Relationships:**
- `ForeignKey` → FarmerProfile (related_name: 'inventory_items')
- `ForeignKey` → Farm (optional, related_name: 'inventory_items')
- `ForeignKey` ← InventoryTransaction (One-to-Many)

**Fields:**
- id (UUID)
- name
- category (FEED, MEDICINE, EQUIPMENT, OTHER)
- quantity
- unit
- cost_per_unit
- reorder_level
- supplier
- expiry_date
- timestamps

---

### 17. InventoryTransaction Model
**Type:** Farmer Section

**Relationships:**
- `ForeignKey` → InventoryItem (related_name: 'transactions')

**Fields:**
- id (UUID)
- transaction_type (PURCHASE, USAGE, ADJUSTMENT, RETURN)
- quantity_change
- unit_cost
- total_cost
- notes
- transaction_date
- created_at

---

## Relationship Summary by Section

### Farmer Section Models:
1. **FarmerProfile** - Central farmer entity
2. **Farm** - Farmer's physical locations
3. **Batch** - Poultry batches at farms
4. **Activity** - Farm/batch activities
5. **Alert** - System alerts
6. **Subscription** - Farmer subscriptions
7. **Payment** - Payment records
8. **UserFeatureAccess** - Feature permissions
9. **InventoryItem** - Inventory management
10. **InventoryTransaction** - Stock movements

### Admin Section Models:
1. **User** (Admin role) - System administrators
2. **BreedConfiguration** - Breed definitions
3. **BreedStage** - Growth stages per breed
4. **BreedMilestone** - Key milestones
5. **SubscriptionPlan** - Pricing plans
6. **Recommendation** - Admin recommendations
7. **Device** - IoT device management

### Shared/Bridge Models:
1. **Alert** - Connects devices, batches, farms to farmers
2. **Recommendation** - Admin-created, farmer-targeted
3. **Device** - Admin-managed, farmer-used
4. **Activity** - Farm operations tracking

---

## Key Integration Points

### 1. Farmer to Admin Flow:
```
Farmer → Subscription → SubscriptionPlan (Admin)
Farmer → Batch → BreedConfiguration (Admin)
Farmer → Alert ← Device (Admin-managed)
```

### 2. Admin to Farmer Flow:
```
Admin → Recommendation → Farmer/Batch
Admin → BreedConfiguration → Batch → Farmer
Admin → Device → Farm → Farmer
```

### 3. Data Hierarchy:
```
User/FarmerProfile (Root)
  → Farm (Location)
    → Batch (Production Unit)
      → Activity (Operations)
      → Alert (Monitoring)
      → Device (Hardware)
    → InventoryItem (Resources)
      → Transaction (Stock Movement)
  → Subscription (Business)
    → Payment (Financial)
```

---

## Migration Applied

**Migration:** `0004_add_model_relationships.py`

**Changes:**
1. ✅ Added `farm` field to Activity (nullable)
2. ✅ Added `batch`, `device`, `farm` fields to Alert (all optional)
3. ✅ Added `breed_config` field to Batch (optional)
4. ✅ Added `farm` field to InventoryItem (optional)
5. ✅ Added `batch`, `farmer` fields to Recommendation (optional)

**Database Status:** All relationships successfully applied

---

## Best Practices for Using Relationships

1. **Creating a Batch:**
   - Link to Farm (required)
   - Link to BreedConfiguration (optional but recommended)
   - System can auto-populate breed guidance

2. **Creating an Alert:**
   - Link to Farmer (required)
   - Link to Farm, Batch, or Device based on alert type
   - Device alerts should reference the device
   - Health alerts should reference batch

3. **Creating Activities:**
   - Link to Farmer (required)
   - Link to Farm (recommended)
   - Link to Batch if activity is batch-specific

4. **Creating Recommendations:**
   - Admin creates recommendation
   - Can target specific farmer or batch
   - Can be general (null farmer/batch) for all farmers

5. **Managing Inventory:**
   - Link to Farmer (required)
   - Link to Farm (recommended for multi-farm farmers)
   - Track transactions per item

---

## Query Examples

### Get all batches for a farmer with breed config:
```python
farmer = FarmerProfile.objects.get(user__email="farmer@example.com")
batches = Batch.objects.filter(
    farm__farmer=farmer
).select_related('breed_config', 'farm')
```

### Get all alerts for a specific batch:
```python
batch = Batch.objects.get(id=batch_id)
alerts = Alert.objects.filter(batch=batch).order_by('-created_at')
```

### Get all devices for a farm with their batches:
```python
farm = Farm.objects.get(id=farm_id)
devices = Device.objects.filter(farm=farm).select_related('batch')
```

### Get recommendations for a farmer:
```python
farmer = FarmerProfile.objects.get(user__email="farmer@example.com")
recommendations = Recommendation.objects.filter(
    models.Q(farmer=farmer) | models.Q(farmer__isnull=True)
).order_by('-created_at')
```

### Get inventory for a specific farm:
```python
farm = Farm.objects.get(id=farm_id)
inventory = InventoryItem.objects.filter(farm=farm).prefetch_related('transactions')
```

---

## Conclusion

All tables now have proper relationships connecting the farmer section to the admin section:

✅ **Farmer Section** → Core operational models (Farm, Batch, Activity, Inventory)
✅ **Admin Section** → Configuration and management models (BreedConfig, SubscriptionPlan)
✅ **Bridge Models** → Connect farmer and admin (Alert, Recommendation, Device)
✅ **Data Flow** → Bidirectional between farmer and admin sections
✅ **Referential Integrity** → All foreign keys properly defined with CASCADE/SET_NULL
✅ **Optional Links** → Flexibility for partial data while maintaining relationships

The database structure now supports:
- Multi-farm management per farmer
- Batch-specific breed configurations
- Context-aware alerts (farm/batch/device)
- Targeted recommendations
- Farm-specific inventory tracking
- Comprehensive activity logging
