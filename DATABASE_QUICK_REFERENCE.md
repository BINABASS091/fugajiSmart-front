# Database Relationships Quick Reference

## 🔗 Complete Relationship Map

### User & Profile
```
User ─(1:1)→ FarmerProfile
User ─(1:1)→ UserFeatureAccess
```

### Farm Hierarchy
```
FarmerProfile ─(1:N)→ Farm ─(1:N)→ Batch
```

### Batch Connections
```
Batch ─(N:1)→ BreedConfiguration [optional]
Batch ─(1:N)→ Device [optional]
Batch ─(1:N)→ Activity [optional]
Batch ─(1:N)→ Alert [optional]
Batch ─(1:N)→ Recommendation [optional]
```

### Farm Connections
```
Farm ─(1:N)→ Device
Farm ─(1:N)→ Activity [optional]
Farm ─(1:N)→ Alert [optional]
Farm ─(1:N)→ InventoryItem [optional]
```

### Admin → Farmer
```
BreedConfiguration ─(1:N)→ BreedStage ─(1:N)→ BreedMilestone
BreedConfiguration ─(1:N)→ Batch [optional]
SubscriptionPlan ─(1:N)→ Subscription ─(1:N)→ Payment
User(admin) ─(1:N)→ Recommendation ─(N:1)→ FarmerProfile [optional]
                                    └─(N:1)→ Batch [optional]
```

### Alerts
```
Alert ─(N:1)→ FarmerProfile [optional]
Alert ─(N:1)→ Farm [optional]
Alert ─(N:1)→ Batch [optional]
Alert ─(N:1)→ Device [optional]
```

### Inventory
```
FarmerProfile ─(1:N)→ InventoryItem ─(N:1)→ Farm [optional]
InventoryItem ─(1:N)→ InventoryTransaction
```

---

## 📋 Model Cheat Sheet

| Model | Key Relationships | Section |
|-------|------------------|---------|
| **User** | → FarmerProfile, UserFeatureAccess | Auth |
| **FarmerProfile** | → Farm, Activity, Alert, Subscription, InventoryItem, Recommendation | Farmer |
| **Farm** | FarmerProfile →, → Batch, Device, Activity, Alert, InventoryItem | Farmer |
| **Batch** | Farm →, → BreedConfiguration, Device, Activity, Alert, Recommendation | Farmer |
| **BreedConfiguration** | → BreedStage, BreedMilestone, Batch | Admin |
| **BreedStage** | BreedConfiguration →, → BreedMilestone | Admin |
| **BreedMilestone** | BreedConfiguration →, BreedStage → | Admin |
| **Device** | Farm →, Batch →, → Alert | Both |
| **Activity** | FarmerProfile →, Farm →, Batch → | Farmer |
| **Alert** | FarmerProfile →, Farm →, Batch →, Device → | Both |
| **Recommendation** | User →, FarmerProfile →, Batch → | Both |
| **SubscriptionPlan** | → Subscription | Admin |
| **Subscription** | FarmerProfile →, SubscriptionPlan →, → Payment | Farmer |
| **Payment** | Subscription → | Farmer |
| **UserFeatureAccess** | User → | Farmer |
| **InventoryItem** | FarmerProfile →, Farm →, → InventoryTransaction | Farmer |
| **InventoryTransaction** | InventoryItem → | Farmer |

---

## 🔍 Common Queries

### Get all data for a farmer
```python
farmer = FarmerProfile.objects.get(user__email="farmer@example.com")
farms = farmer.farms.all()
activities = farmer.activities.all()
alerts = farmer.alerts.all()
subscriptions = farmer.subscriptions.all()
inventory = farmer.inventory_items.all()
recommendations = farmer.recommendations.all()
```

### Get farm with all related data
```python
farm = Farm.objects.select_related('farmer').prefetch_related(
    'batches',
    'devices',
    'activities',
    'alerts',
    'inventory_items'
).get(id=farm_id)
```

### Get batch with breed configuration
```python
batch = Batch.objects.select_related(
    'farm__farmer',
    'breed_config'
).prefetch_related(
    'devices',
    'activities',
    'alerts',
    'recommendations'
).get(id=batch_id)
```

### Get alerts by context
```python
# All device alerts
device_alerts = Alert.objects.filter(
    device__isnull=False
).select_related('device', 'farm')

# Batch health alerts
health_alerts = Alert.objects.filter(
    alert_type='HEALTH',
    batch__isnull=False
).select_related('batch', 'farm')

# Farm environment alerts
env_alerts = Alert.objects.filter(
    alert_type='ENVIRONMENT',
    farm__isnull=False
).select_related('farm')
```

### Get recommendations
```python
# For specific farmer
farmer_recs = Recommendation.objects.filter(
    Q(farmer=farmer) | Q(farmer__isnull=True)
).order_by('-created_at')

# For specific batch
batch_recs = Recommendation.objects.filter(
    Q(batch=batch) | Q(batch__isnull=True, farmer=batch.farm.farmer)
).order_by('-created_at')

# General recommendations
general_recs = Recommendation.objects.filter(
    farmer__isnull=True,
    batch__isnull=True
)
```

### Get breed data for batch
```python
batch = Batch.objects.select_related('breed_config').get(id=batch_id)
if batch.breed_config:
    stages = batch.breed_config.stages.order_by('start_day')
    milestones = batch.breed_config.milestones.order_by('milestone_day')
    
    # Current stage based on batch age
    current_stage = stages.filter(
        start_day__lte=batch.current_age_days,
        end_day__gte=batch.current_age_days
    ).first()
```

### Get farm inventory
```python
farm = Farm.objects.get(id=farm_id)
inventory = InventoryItem.objects.filter(
    Q(farm=farm) | Q(farmer=farm.farmer, farm__isnull=True)
).prefetch_related('transactions')
```

---

## ⚡ Performance Tips

### Use select_related for ForeignKey
```python
# Good - Single query
batches = Batch.objects.select_related(
    'farm',
    'breed_config'
).all()

# Bad - N+1 queries
batches = Batch.objects.all()
for batch in batches:
    print(batch.farm.name)  # Extra query each time
```

### Use prefetch_related for reverse FK / M2M
```python
# Good - 2 queries total
farms = Farm.objects.prefetch_related('batches', 'devices').all()

# Bad - N+1 queries
farms = Farm.objects.all()
for farm in farms:
    print(farm.batches.all())  # Extra query each time
```

### Combine both for nested data
```python
# Optimal - Minimal queries
batches = Batch.objects.select_related(
    'farm__farmer__user',
    'breed_config'
).prefetch_related(
    'devices',
    'activities',
    'alerts'
)
```

---

## 🛡️ Cascade Behaviors

### CASCADE (Deletes children)
- User → FarmerProfile
- FarmerProfile → Farm, Activity, Alert, Subscription, InventoryItem, Recommendation
- Farm → Batch, Device, Activity, Alert, InventoryItem
- Batch → Device, Activity, Alert, Recommendation
- BreedConfiguration → BreedStage, BreedMilestone
- SubscriptionPlan → Subscription (PROTECT - must delete subs first)
- Subscription → Payment

### SET_NULL (Preserves children)
- BreedConfiguration → Batch (batch.breed_config = NULL)
- Device → Batch (device.batch = NULL)
- User → Recommendation (recommendation.created_by = NULL)
- BreedStage → BreedMilestone (milestone.stage = NULL)

---

## 📊 Relationship Counts

| Model | Has Relationships | Referenced By | Total |
|-------|------------------|---------------|-------|
| User | 2 | 1 | 3 |
| FarmerProfile | 0 | 6 | 6 |
| Farm | 1 | 6 | 7 |
| Batch | 2 | 5 | 7 |
| BreedConfiguration | 0 | 3 | 3 |
| Device | 2 | 1 | 3 |
| Alert | 4 | 0 | 4 |
| Activity | 3 | 0 | 3 |
| Recommendation | 3 | 0 | 3 |
| Subscription | 2 | 1 | 3 |
| InventoryItem | 2 | 1 | 3 |

**Total Relationships: 31**

---

## 🔧 Migration Status

```
✅ 0001_initial
✅ 0002_inventoryitem_inventorytransaction
✅ 0003_farmerprofile_avatar
✅ 0004_add_model_relationships ← Current
```

---

## 📝 Field Names Reference

### Foreign Key Field Names
- `user` - Links to User model
- `farmer` / `farmer_profile` - Links to FarmerProfile
- `farm` - Links to Farm
- `batch` - Links to Batch
- `breed` / `breed_config` - Links to BreedConfiguration
- `stage` - Links to BreedStage
- `device` - Links to Device
- `plan` - Links to SubscriptionPlan
- `subscription` - Links to Subscription
- `item` - Links to InventoryItem
- `created_by` - Links to User (creator)

### Reverse Relationship Names
- `farmer_profile` - User → FarmerProfile
- `feature_access` - User → UserFeatureAccess
- `farms` - FarmerProfile → Farm
- `batches` - Farm → Batch / BreedConfiguration → Batch
- `devices` - Farm → Device / Batch → Device
- `activities` - Farm → Activity / Batch → Activity / FarmerProfile → Activity
- `alerts` - Farm → Alert / Batch → Alert / Device → Alert / FarmerProfile → Alert
- `stages` - BreedConfiguration → BreedStage
- `milestones` - BreedConfiguration → BreedMilestone / BreedStage → BreedMilestone
- `recommendations` - FarmerProfile → Recommendation / Batch → Recommendation / User → Recommendation
- `subscriptions` - FarmerProfile → Subscription / SubscriptionPlan → Subscription
- `payments` - Subscription → Payment
- `inventory_items` - FarmerProfile → InventoryItem / Farm → InventoryItem
- `transactions` - InventoryItem → InventoryTransaction

---

## 🎯 Usage Patterns

### Creating Related Objects
```python
# Chain creation
farmer = FarmerProfile.objects.create(user=user, ...)
farm = Farm.objects.create(farmer=farmer, ...)
batch = Batch.objects.create(farm=farm, breed_config=breed_config, ...)

# With context
Alert.objects.create(
    farmer=farmer,
    farm=farm,
    batch=batch,
    device=device,
    alert_type='DEVICE',
    severity='HIGH',
    message='Sensor offline'
)
```

### Querying Related Objects
```python
# Forward relationships (use field name)
batch.farm
batch.breed_config
alert.device

# Reverse relationships (use related_name)
farm.batches.all()
device.alerts.all()
batch.recommendations.all()
```

### Filtering by Related Fields
```python
# Double underscore notation
Batch.objects.filter(farm__farmer__user__email="farmer@example.com")
Alert.objects.filter(batch__farm__name="Farm 1")
Device.objects.filter(farm__farmer__business_name="ABC Poultry")
```

---

This quick reference provides all essential information for working with the enhanced database relationships in the FugajiPro system.
