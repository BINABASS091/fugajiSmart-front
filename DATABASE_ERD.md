# Database Entity Relationship Diagram (ERD)

## Visual Representation of Database Relationships

```
┌─────────────────────────────────────────────────────────────────────────┐
│                        AUTHENTICATION LAYER                              │
└─────────────────────────────────────────────────────────────────────────┘

                              ┌─────────────┐
                              │    User     │
                              │  (Auth)     │
                              │─────────────│
                              │ id (UUID)   │
                              │ email       │
                              │ role        │
                              │ phone       │
                              └──────┬──────┘
                                     │
                        ┌────────────┴────────────┐
                        │ OneToOne                │ OneToOne
                        ↓                         ↓
              ┌─────────────────┐      ┌──────────────────┐
              │ FarmerProfile   │      │ UserFeatureAccess│
              │─────────────────│      │──────────────────│
              │ business_name   │      │ can_add_farm     │
              │ location        │      │ max_farms        │
              │ avatar          │      │ max_devices      │
              └────────┬────────┘      └──────────────────┘
                       │
                       │ (Root of Farmer Section)
                       │


┌─────────────────────────────────────────────────────────────────────────┐
│                         FARMER SECTION                                   │
└─────────────────────────────────────────────────────────────────────────┘

                  ┌─────────────────┐
                  │ FarmerProfile   │ ◄──────────┐
                  └────────┬────────┘            │
                           │ owns                │
                           │ (ForeignKey)        │
                           ↓                     │
                  ┌─────────────────┐            │
          ┌───────│     Farm        │            │
          │       │─────────────────│            │
          │       │ name            │            │
          │       │ location        │            │
          │       │ size_hectares   │            │
          │       └────────┬────────┘            │
          │                │ contains            │
          │                │ (ForeignKey)        │
          │                ↓                     │
          │       ┌─────────────────┐            │
          │   ┌───│     Batch       │            │
          │   │   │─────────────────│            │ references
          │   │   │ batch_number    │            │ (Optional FK)
          │   │   │ breed           │────────────┤
          │   │   │ quantity        │            │
          │   │   │ status          │            │
          │   │   └────────┬────────┘            │
          │   │            │                     │
          │   │            ↓ (Optional FK)       │
          │   │   ┌─────────────────┐            │
          │   │   │BreedConfiguration            │
          │   │   │ (ADMIN SECTION) │            │
          │   │   │─────────────────│            │
          │   │   │ breed_name      │            │
          │   │   │ avg_maturity    │            │
          │   │   └─────────────────┘            │
          │   │                                  │
          │   ├──────────────────────────────────┤
          │   │    (Related Activities)          │
          │   │                                  │
          │   │   ┌─────────────────┐            │
          │   └──→│    Activity     │◄───────────┤
          │       │─────────────────│            │ belongs_to
          │       │ activity_type   │            │ (ForeignKey)
          │       │ status          │            │
          │       │ scheduled_date  │            │
          │       └─────────────────┘            │
          │                                      │
          │       ┌─────────────────┐            │
          ├──────→│     Device      │◄───────────┤
          │       │─────────────────│            │
          │       │ device_name     │            │
          │       │ serial_number   │            │
          │       │ device_type     │            │
          │       │ status          │            │
          │       └────────┬────────┘            │
          │                │                     │
          │                ↓ (Optional FK)       │
          │                Batch                 │
          │                                      │
          │       ┌─────────────────┐            │
          └──────→│  InventoryItem  │◄───────────┤
                  │─────────────────│            │
                  │ name            │            │
                  │ category        │            │
                  │ quantity        │            │
                  │ farm (Optional) │────────────┘
                  └────────┬────────┘
                           │ has
                           │ (ForeignKey)
                           ↓
                  ┌─────────────────────┐
                  │ InventoryTransaction│
                  │─────────────────────│
                  │ transaction_type    │
                  │ quantity_change     │
                  │ total_cost          │
                  └─────────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                     MONITORING & ALERTS                                  │
└─────────────────────────────────────────────────────────────────────────┘

        FarmerProfile ──┐
        Farm ──────────┼─┐
        Batch ─────────┼─┼─┐
        Device ────────┼─┼─┼─┐ (All Optional ForeignKeys)
                       ↓ ↓ ↓ ↓
                  ┌─────────────────┐
                  │     Alert       │
                  │─────────────────│
                  │ alert_type      │
                  │ severity        │
                  │ message         │
                  │ is_read         │
                  └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                   SUBSCRIPTION & PAYMENT                                 │
└─────────────────────────────────────────────────────────────────────────┘

    FarmerProfile
          │ subscribes_to
          │ (ForeignKey)
          ↓
    ┌─────────────────┐       uses        ┌──────────────────┐
    │  Subscription   │──────────────────→│ SubscriptionPlan │
    │─────────────────│   (ForeignKey)    │──────────────────│
    │ status          │                   │ name             │
    │ start_date      │                   │ price            │
    │ end_date        │                   │ max_farms        │
    │ auto_renew      │  (ADMIN SECTION)  │ max_devices      │
    └────────┬────────┘                   │ features (JSON)  │
             │ has                         └──────────────────┘
             │ (ForeignKey)
             ↓
    ┌─────────────────┐
    │    Payment      │
    │─────────────────│
    │ amount          │
    │ payment_method  │
    │ transaction_id  │
    │ status          │
    └─────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                        ADMIN SECTION                                     │
└─────────────────────────────────────────────────────────────────────────┘

                  ┌──────────────────────┐
                  │  BreedConfiguration  │
                  │──────────────────────│
                  │ breed_name           │
                  │ breed_type           │
                  │ average_maturity_days│
                  │ eggs_per_year        │
                  │ temperature_range    │
                  └──────┬───────────────┘
                         │ has
                         │ (ForeignKey)
                  ┌──────┴──────┐
                  ↓             ↓
         ┌────────────────┐  ┌────────────────┐
         │  BreedStage    │  │ BreedMilestone │
         │────────────────│  │────────────────│
         │ stage_name     │  │ milestone_day  │
         │ start_day      │  │ milestone_title│
         │ end_day        │  │ action_required│
         │ feeding_guide  │  │ is_critical    │
         │ health_tips    │  └────────────────┘
         └────────┬───────┘
                  │ organizes
                  │ (Optional FK)
                  ↓
         ┌────────────────┐
         │ BreedMilestone │ (Can also link here)
         └────────────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│              ADMIN → FARMER RECOMMENDATIONS                              │
└─────────────────────────────────────────────────────────────────────────┘

    User (Admin)
          │ creates
          │ (created_by FK)
          ↓
    ┌──────────────────┐
    │ Recommendation   │◄────┐
    │──────────────────│     │ (Optional FK)
    │ title            │     │
    │ category         │     │
    │ content          │     │
    │ breed            │     │
    └──────────────────┘     │
          │                  │
          └──────┬───────────┤
                 ↓ (Optional FKs)
    ┌─────────────────┐  ┌──────────┐
    │ FarmerProfile   │  │  Batch   │
    │ (target farmer) │  │ (target) │
    └─────────────────┘  └──────────┘


┌─────────────────────────────────────────────────────────────────────────┐
│                      RELATIONSHIP LEGEND                                 │
└─────────────────────────────────────────────────────────────────────────┘

  │  │  ↓  ↑      = Direct relationship line
  ──→            = ForeignKey (Many-to-One)
  ◄──            = Reverse relationship (One-to-Many)
  (Optional FK)  = Nullable ForeignKey
  (ForeignKey)   = Required ForeignKey
  OneToOne       = One-to-One relationship


┌─────────────────────────────────────────────────────────────────────────┐
│                    CASCADE BEHAVIOR SUMMARY                              │
└─────────────────────────────────────────────────────────────────────────┘

CASCADE (Delete parent → Delete child):
  • User → FarmerProfile
  • FarmerProfile → Farm → Batch → Activity
  • FarmerProfile → InventoryItem → InventoryTransaction
  • FarmerProfile → Subscription → Payment
  • BreedConfiguration → BreedStage
  • BreedConfiguration → BreedMilestone
  • Farm → Device
  • Alert → Farm/Batch/Device (all CASCADE)

SET_NULL (Delete parent → Set child.parent = NULL):
  • Batch → BreedConfiguration (batch.breed_config = NULL)
  • Device → Batch (device.batch = NULL)
  • User → Recommendation (recommendation.created_by = NULL)
  • BreedStage → BreedMilestone (milestone.stage = NULL)

PROTECT (Cannot delete parent while children exist):
  • SubscriptionPlan → Subscription (must delete subscriptions first)


┌─────────────────────────────────────────────────────────────────────────┐
│                     DATA FLOW EXAMPLES                                   │
└─────────────────────────────────────────────────────────────────────────┘

1. FARMER ONBOARDING:
   User (signup) → FarmerProfile → Farm → Batch → BreedConfiguration

2. DEVICE ALERT:
   Device (sensor) → Alert → Batch → Farm → FarmerProfile (notify)

3. ACTIVITY LOGGING:
   FarmerProfile → Activity → Farm → Batch (track operations)

4. RECOMMENDATION DELIVERY:
   Admin → Recommendation → FarmerProfile/Batch (targeted advice)

5. SUBSCRIPTION FLOW:
   FarmerProfile → Subscription → SubscriptionPlan
                → Payment → UserFeatureAccess (update limits)

6. INVENTORY MANAGEMENT:
   FarmerProfile → InventoryItem → Farm
                → InventoryTransaction (track stock)


┌─────────────────────────────────────────────────────────────────────────┐
│                     RELATIONSHIP COUNTS                                  │
└─────────────────────────────────────────────────────────────────────────┘

Total Models: 17
Total Relationships: 31

By Type:
  • ForeignKey (Many-to-One): 27
  • OneToOne: 2
  • Indirect/Method-based: 2 (UserFeatureAccess.update_from_subscription)

By Section:
  • Farmer Section: 10 models
  • Admin Section: 5 models
  • Shared/Bridge: 2 models

Nullable Relationships: 13
Required Relationships: 14
```

---

## Key Integration Points

### 1. **Farmer → Admin Integration**
```
Farmer subscribes to Admin-managed SubscriptionPlan
Farmer creates Batches using Admin-defined BreedConfiguration
Farmer receives Admin-created Recommendations
Farmer uses Admin-managed Devices
```

### 2. **Admin → Farmer Integration**
```
Admin creates BreedConfigurations → used by Batches
Admin creates SubscriptionPlans → used by Subscriptions
Admin creates Recommendations → delivered to Farmers
Admin manages Devices → deployed at Farms
```

### 3. **Bidirectional Data Flow**
```
Alert System:
  Device → Alert → FarmerProfile (monitoring)
  Batch → Alert → FarmerProfile (health)
  Farm → Alert → FarmerProfile (environment)

Activity Tracking:
  FarmerProfile → Activity → Farm → Batch (operations)

Recommendations:
  Admin → Recommendation → FarmerProfile/Batch (guidance)
```

---

## Database Integrity Rules

1. **Orphan Prevention:**
   - Deleting a User deletes their FarmerProfile (CASCADE)
   - Deleting a FarmerProfile deletes all Farms (CASCADE)
   - Deleting a Farm deletes all Batches (CASCADE)

2. **Data Preservation:**
   - Deleting a BreedConfiguration keeps Batches (SET_NULL)
   - Deleting a Device keeps Alerts (SET_NULL on device field)
   - Deleting a User (admin) keeps their Recommendations (SET_NULL)

3. **Business Logic Protection:**
   - Cannot delete SubscriptionPlan with active Subscriptions (PROTECT)
   - InventoryTransactions automatically update InventoryItem quantities

4. **Optional Relationships:**
   - Alerts can exist without specific Farm/Batch/Device
   - Recommendations can be general (no specific Farmer/Batch)
   - Activities can be farm-wide (no specific Batch)
   - InventoryItems can be farmer-wide (no specific Farm)

---

This ERD provides a complete visual representation of how all database tables relate to each other, connecting the farmer operational section to the admin management section through various integration points and bridge models.
