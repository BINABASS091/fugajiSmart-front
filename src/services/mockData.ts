// Mock data service for frontend-only application
// This replaces all backend and Supabase dependencies

export type UserRole = 'ADMIN' | 'FARMER';

export interface User {
  id: string;
  email: string;
  full_name: string;
  phone: string | null;
  role: UserRole;
  avatar_url: string | null;
  created_at: string;
  updated_at: string;
}

export interface Farmer {
  id: string;
  user_id: string;
  business_name: string | null;
  location: string | null;
  phone_number: string | null;
  verification_status: 'PENDING' | 'VERIFIED' | 'REJECTED';
  experience_years: number;
  created_at: string;
  updated_at: string;
}

export interface Farm {
  id: string;
  farmer_id: string;  // Changed from 'farmer' to match backend
  name: string;
  location: string;
  size_hectares: number | null;
  latitude: number | null;
  longitude: number | null;
  status: 'ACTIVE' | 'INACTIVE' | 'MAINTENANCE';
  created_at: string;
  updated_at: string;
  
  // For backward compatibility
  farmer?: string;
}

export interface Batch {
  id: string;
  farm_id: string;
  batch_number: string;
  breed: string;
  quantity: number;
  start_date: string;
  expected_end_date: string | null;
  status: 'ACTIVE' | 'COMPLETED' | 'CLOSED';
  mortality_count: number;
  current_age_days: number;
  created_at: string;
  updated_at: string;
}

export interface Device {
  id: string;
  farm_id: string;
  device_code: string;
  device_type: 'SENSOR' | 'FEEDER' | 'WATER' | 'CAMERA';
  status: 'ONLINE' | 'OFFLINE' | 'ERROR';
  last_reading_at: string | null;
  created_at: string;
  updated_at: string;
}

export interface Alert {
  id: string;
  farmer_id: string | null;
  alert_type: 'HEALTH' | 'ENVIRONMENT' | 'DEVICE' | 'SYSTEM';
  severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  message: string;
  is_read: boolean;
  created_at: string;
}

export interface Activity {
  id: string;
  batch_id: string;
  farmer_id: string;
  activity_type: 'FEEDING' | 'VACCINATION' | 'CLEANING' | 'INSPECTION' | 'OTHER';
  description: string | null;
  status: 'PENDING' | 'COMPLETED' | 'CANCELLED';
  scheduled_date: string;
  completed_at: string | null;
  created_at: string;
}

export interface Subscription {
  id: string;
  farmer_id: string;
  plan_type: 'FREE' | 'BASIC' | 'PREMIUM' | 'ENTERPRISE';
  start_date: string;
  end_date: string | null;
  amount: number;
  status: 'active' | 'expired' | 'cancelled';
  created_at: string;
}

export interface InventoryItem {
  id: string;
  farmer_id: string;
  name: string;
  category: string;
  quantity: number;
  unit: string;
  cost_per_unit: number;
  supplier: string | null;
  expiry_date: string | null;
  created_at: string;
  updated_at: string;
}

// Mock data storage keys
const STORAGE_KEYS = {
  USERS: 'mock_users',
  FARMS: 'mock_farms',
  BATCHES: 'mock_batches',
  DEVICES: 'mock_devices',
  ALERTS: 'mock_alerts',
  ACTIVITIES: 'mock_activities',
  SUBSCRIPTIONS: 'mock_subscriptions',
  INVENTORY: 'mock_inventory',
};

// Initialize mock data
const initializeMockData = () => {
  if (!localStorage.getItem(STORAGE_KEYS.USERS)) {
    const defaultUsers: User[] = [
      {
        id: 'admin-1',
        email: 'admin@fugajismart.com',
        full_name: 'Admin User',
        phone: '+255123456789',
        role: 'ADMIN',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
      {
        id: 'farmer-1',
        email: 'farmer@example.com',
        full_name: 'John Farmer',
        phone: '+255987654321',
        role: 'FARMER',
        avatar_url: null,
        created_at: new Date().toISOString(),
        updated_at: new Date().toISOString(),
      },
    ];
    localStorage.setItem(STORAGE_KEYS.USERS, JSON.stringify(defaultUsers));
  }

  if (!localStorage.getItem(STORAGE_KEYS.FARMS)) {
    localStorage.setItem(STORAGE_KEYS.FARMS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.BATCHES)) {
    localStorage.setItem(STORAGE_KEYS.BATCHES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.DEVICES)) {
    localStorage.setItem(STORAGE_KEYS.DEVICES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ALERTS)) {
    localStorage.setItem(STORAGE_KEYS.ALERTS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.ACTIVITIES)) {
    localStorage.setItem(STORAGE_KEYS.ACTIVITIES, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.SUBSCRIPTIONS)) {
    localStorage.setItem(STORAGE_KEYS.SUBSCRIPTIONS, JSON.stringify([]));
  }

  if (!localStorage.getItem(STORAGE_KEYS.INVENTORY)) {
    localStorage.setItem(STORAGE_KEYS.INVENTORY, JSON.stringify([]));
  }
};

// Initialize on import
initializeMockData();

// Generic storage helpers
const getStorage = <T>(key: string): T[] => {
  const data = localStorage.getItem(key);
  return data ? JSON.parse(data) : [];
};

const setStorage = <T>(key: string, data: T[]): void => {
  localStorage.setItem(key, JSON.stringify(data));
};

// Mock API functions
export const mockDataService = {
  // Users
  getUsers: (): User[] => getStorage<User>(STORAGE_KEYS.USERS),
  getUserById: (id: string): User | undefined => {
    return getStorage<User>(STORAGE_KEYS.USERS).find(u => u.id === id);
  },
  getUserByEmail: (email: string): User | undefined => {
    return getStorage<User>(STORAGE_KEYS.USERS).find(u => u.email === email);
  },
  createUser: (user: Omit<User, 'id' | 'created_at' | 'updated_at'>): User => {
    const users = getStorage<User>(STORAGE_KEYS.USERS);
    const newUser: User = {
      ...user,
      id: `user-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    users.push(newUser);
    setStorage(STORAGE_KEYS.USERS, users);
    return newUser;
  },
  updateUser: (id: string, updates: Partial<User>): User | null => {
    const users = getStorage<User>(STORAGE_KEYS.USERS);
    const index = users.findIndex(u => u.id === id);
    if (index === -1) return null;
    users[index] = { ...users[index], ...updates, updated_at: new Date().toISOString() };
    setStorage(STORAGE_KEYS.USERS, users);
    return users[index];
  },

  // Farms
  getFarms: (farmerId?: string): Farm[] => {
    const farms = getStorage<Farm>(STORAGE_KEYS.FARMS);
    return farmerId ? farms.filter(f => f.farmer_id === farmerId) : farms;
  },
  getFarmById: (id: string): Farm | undefined => {
    return getStorage<Farm>(STORAGE_KEYS.FARMS).find(f => f.id === id);
  },
  createFarm: (farm: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Farm => {
    const farms = getStorage<Farm>(STORAGE_KEYS.FARMS);
    const newFarm: Farm = {
      ...farm,
      id: `farm-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    farms.push(newFarm);
    setStorage(STORAGE_KEYS.FARMS, farms);
    return newFarm;
  },
  updateFarm: (id: string, updates: Partial<Farm>): Farm | null => {
    const farms = getStorage<Farm>(STORAGE_KEYS.FARMS);
    const index = farms.findIndex(f => f.id === id);
    if (index === -1) return null;
    farms[index] = { ...farms[index], ...updates, updated_at: new Date().toISOString() };
    setStorage(STORAGE_KEYS.FARMS, farms);
    return farms[index];
  },
  deleteFarm: (id: string): boolean => {
    const farms = getStorage<Farm>(STORAGE_KEYS.FARMS);
    const filtered = farms.filter(f => f.id !== id);
    setStorage(STORAGE_KEYS.FARMS, filtered);
    return filtered.length < farms.length;
  },

  // Batches
  getBatches: (farmId?: string, farmerId?: string): Batch[] => {
    let batches = getStorage<Batch>(STORAGE_KEYS.BATCHES);
    if (farmId) batches = batches.filter(b => b.farm_id === farmId);
    if (farmerId) {
      const farms = mockDataService.getFarms(farmerId);
      const farmIds = farms.map(f => f.id);
      batches = batches.filter(b => farmIds.includes(b.farm_id));
    }
    return batches;
  },
  getBatchById: (id: string): Batch | undefined => {
    return getStorage<Batch>(STORAGE_KEYS.BATCHES).find(b => b.id === id);
  },
  createBatch: (batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>): Batch => {
    const batches = getStorage<Batch>(STORAGE_KEYS.BATCHES);
    const newBatch: Batch = {
      ...batch,
      id: `batch-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    batches.push(newBatch);
    setStorage(STORAGE_KEYS.BATCHES, batches);
    return newBatch;
  },
  updateBatch: (id: string, updates: Partial<Batch>): Batch | null => {
    const batches = getStorage<Batch>(STORAGE_KEYS.BATCHES);
    const index = batches.findIndex(b => b.id === id);
    if (index === -1) return null;
    batches[index] = { ...batches[index], ...updates, updated_at: new Date().toISOString() };
    setStorage(STORAGE_KEYS.BATCHES, batches);
    return batches[index];
  },

  // Devices
  getDevices: (farmId?: string): Device[] => {
    const devices = getStorage<Device>(STORAGE_KEYS.DEVICES);
    return farmId ? devices.filter(d => d.farm_id === farmId) : devices;
  },
  createDevice: (device: Omit<Device, 'id' | 'created_at' | 'updated_at'>): Device => {
    const devices = getStorage<Device>(STORAGE_KEYS.DEVICES);
    const newDevice: Device = {
      ...device,
      id: `device-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    devices.push(newDevice);
    setStorage(STORAGE_KEYS.DEVICES, devices);
    return newDevice;
  },

  // Alerts
  getAlerts: (farmerId?: string): Alert[] => {
    const alerts = getStorage<Alert>(STORAGE_KEYS.ALERTS);
    return farmerId ? alerts.filter(a => a.farmer_id === farmerId) : alerts;
  },
  createAlert: (alert: Omit<Alert, 'id' | 'created_at'>): Alert => {
    const alerts = getStorage<Alert>(STORAGE_KEYS.ALERTS);
    const newAlert: Alert = {
      ...alert,
      id: `alert-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    alerts.push(newAlert);
    setStorage(STORAGE_KEYS.ALERTS, alerts);
    return newAlert;
  },
  updateAlert: (id: string, updates: Partial<Alert>): Alert | null => {
    const alerts = getStorage<Alert>(STORAGE_KEYS.ALERTS);
    const index = alerts.findIndex(a => a.id === id);
    if (index === -1) return null;
    alerts[index] = { ...alerts[index], ...updates };
    setStorage(STORAGE_KEYS.ALERTS, alerts);
    return alerts[index];
  },

  // Activities
  getActivities: (farmerId?: string, batchId?: string): Activity[] => {
    let activities = getStorage<Activity>(STORAGE_KEYS.ACTIVITIES);
    if (farmerId) activities = activities.filter(a => a.farmer_id === farmerId);
    if (batchId) activities = activities.filter(a => a.batch_id === batchId);
    return activities;
  },
  createActivity: (activity: Omit<Activity, 'id' | 'created_at'>): Activity => {
    const activities = getStorage<Activity>(STORAGE_KEYS.ACTIVITIES);
    const newActivity: Activity = {
      ...activity,
      id: `activity-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    activities.push(newActivity);
    setStorage(STORAGE_KEYS.ACTIVITIES, activities);
    return newActivity;
  },
  updateActivity: (id: string, updates: Partial<Activity>): Activity | null => {
    const activities = getStorage<Activity>(STORAGE_KEYS.ACTIVITIES);
    const index = activities.findIndex(a => a.id === id);
    if (index === -1) return null;
    activities[index] = { ...activities[index], ...updates };
    setStorage(STORAGE_KEYS.ACTIVITIES, activities);
    return activities[index];
  },

  // Subscriptions
  getSubscriptions: (farmerId?: string): Subscription[] => {
    const subscriptions = getStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
    return farmerId ? subscriptions.filter(s => s.farmer_id === farmerId) : subscriptions;
  },
  createSubscription: (subscription: Omit<Subscription, 'id' | 'created_at'>): Subscription => {
    const subscriptions = getStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
    const newSubscription: Subscription = {
      ...subscription,
      id: `sub-${Date.now()}`,
      created_at: new Date().toISOString(),
    };
    subscriptions.push(newSubscription);
    setStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
    return newSubscription;
  },
  updateSubscription: (id: string, updates: Partial<Subscription>): Subscription | null => {
    const subscriptions = getStorage<Subscription>(STORAGE_KEYS.SUBSCRIPTIONS);
    const index = subscriptions.findIndex(s => s.id === id);
    if (index === -1) return null;
    subscriptions[index] = { ...subscriptions[index], ...updates };
    setStorage(STORAGE_KEYS.SUBSCRIPTIONS, subscriptions);
    return subscriptions[index];
  },

  // Inventory
  getInventory: (farmerId?: string): InventoryItem[] => {
    const inventory = getStorage<InventoryItem>(STORAGE_KEYS.INVENTORY);
    return farmerId ? inventory.filter(i => i.farmer_id === farmerId) : inventory;
  },
  createInventoryItem: (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): InventoryItem => {
    const inventory = getStorage<InventoryItem>(STORAGE_KEYS.INVENTORY);
    const newItem: InventoryItem = {
      ...item,
      id: `inv-${Date.now()}`,
      created_at: new Date().toISOString(),
      updated_at: new Date().toISOString(),
    };
    inventory.push(newItem);
    setStorage(STORAGE_KEYS.INVENTORY, inventory);
    return newItem;
  },
  updateInventoryItem: (id: string, updates: Partial<InventoryItem>): InventoryItem | null => {
    const inventory = getStorage<InventoryItem>(STORAGE_KEYS.INVENTORY);
    const index = inventory.findIndex(i => i.id === id);
    if (index === -1) return null;
    inventory[index] = { ...inventory[index], ...updates, updated_at: new Date().toISOString() };
    setStorage(STORAGE_KEYS.INVENTORY, inventory);
    return inventory[index];
  },
  deleteInventoryItem: (id: string): boolean => {
    const inventory = getStorage<InventoryItem>(STORAGE_KEYS.INVENTORY);
    const filtered = inventory.filter(i => i.id !== id);
    setStorage(STORAGE_KEYS.INVENTORY, filtered);
    return filtered.length < inventory.length;
  },
};

