// Data service wrapper - provides a consistent API for all data operations
// This version connects to the real Django REST Framework API

import {
  Farm, Batch, Device, Alert, Activity, InventoryItem, Subscription
} from '../types';
import {
  farmsApi,
  batchesApi,
  devicesApi,
  inventoryApi,
  subscriptionsApi,
  authApi,
  inventoryAlertsApi
} from '../lib/api';

export const dataService = {
  // Farms
  getFarms: async (farmerId?: string): Promise<Farm[]> => {
    const params = farmerId ? { farmer: farmerId } : {};
    const res = await farmsApi.getAll(params);
    return res.data || [];
  },

  getFarmById: async (id: string): Promise<Farm | null> => {
    const res = await farmsApi.getById(id);
    return res.data;
  },

  createFarm: async (farm: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Promise<Farm> => {
    const res = await farmsApi.create(farm);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  updateFarm: async (id: string, updates: Partial<Farm>): Promise<Farm | null> => {
    const res = await farmsApi.update(id, updates);
    return res.data;
  },

  deleteFarm: async (id: string): Promise<boolean> => {
    const res = await farmsApi.delete(id);
    return !res.error;
  },

  // Batches
  getBatches: async (farmId?: string, _farmerId?: string): Promise<Batch[]> => {
    const res = await batchesApi.getAll();
    let data = res.data || [];
    if (farmId) data = data.filter((b: any) => b.farm === farmId);
    return data;
  },

  getBatchById: async (id: string): Promise<Batch | null> => {
    const res = await batchesApi.getById(id);
    return res.data;
  },

  createBatch: async (batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>): Promise<Batch> => {
    const res = await batchesApi.create(batch);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  updateBatch: async (id: string, updates: Partial<Batch>): Promise<Batch | null> => {
    const res = await batchesApi.update(id, updates);
    return res.data;
  },

  // Devices
  getDevices: async (farmId?: string): Promise<Device[]> => {
    const res = await devicesApi.getAll();
    let data = res.data || [];
    if (farmId) data = data.filter((d: any) => d.farm === farmId);
    return data;
  },

  createDevice: async (device: Omit<Device, 'id' | 'created_at' | 'updated_at'>): Promise<Device> => {
    const res = await devicesApi.create(device);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  // Alerts
  getAlerts: async (_farmerId?: string): Promise<Alert[]> => {
    const res = await inventoryAlertsApi.getAll();
    return res.data || [];
  },

  createAlert: async (alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> => {
    const res = await inventoryAlertsApi.create(alert as any);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  updateAlert: async (id: string, updates: Partial<Alert>): Promise<Alert | null> => {
    const res = await inventoryAlertsApi.update(id, updates);
    return res.data;
  },

  // Activities
  getActivities: async (_farmerId?: string, _batchId?: string): Promise<Activity[]> => {
    // Placeholder as activitiesApi is not in lib/api.ts
    return [];
  },

  createActivity: async (_activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> => {
    throw new Error('Activity creation not implemented in real API yet');
  },

  updateActivity: async (_id: string, _updates: Partial<Activity>): Promise<Activity | null> => {
    throw new Error('Activity update not implemented in real API yet');
  },

  // Subscriptions
  getSubscriptions: async (_farmerId?: string): Promise<Subscription[]> => {
    const res = await subscriptionsApi.getAll();
    return res.data || [];
  },

  createSubscription: async (subscription: Omit<Subscription, 'id' | 'created_at'>): Promise<Subscription> => {
    const res = await subscriptionsApi.create(subscription);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  updateSubscription: async (id: string, updates: Partial<Subscription>): Promise<Subscription | null> => {
    const res = await subscriptionsApi.update(id, updates);
    return res.data;
  },

  // Inventory
  getInventory: async (_farmerId?: string): Promise<InventoryItem[]> => {
    const res = await inventoryApi.getItems();
    return res.data || [];
  },

  createInventoryItem: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> => {
    const res = await inventoryApi.createItem(item as any);
    if (res.error) throw new Error(res.error);
    return res.data!;
  },

  updateInventoryItem: async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    const res = await inventoryApi.updateItem(id, updates as any);
    return res.data;
  },

  deleteInventoryItem: async (id: string): Promise<boolean> => {
    const res = await inventoryApi.deleteItem(id);
    return !res.error;
  },

  // Users (for admin)
  getUsers: async (): Promise<any[]> => {
    const res = await authApi.getCurrentUser();
    return res.data ? [res.data] : [];
  },

  getUserById: async (_id: string): Promise<any | null> => {
    return null;
  },
};

// Export types for convenience
export type { Farm, Batch, Device, Alert, Activity, InventoryItem, Subscription };
