// Data service wrapper - provides a consistent API for all data operations
// This replaces all Supabase queries with mockDataService calls

import { mockDataService, Farm, Batch, Device, Alert, Activity, InventoryItem, Subscription } from './mockData';
import {
  farmsApi
} from '../lib/api';

export const dataService = {
  // Farms
  getFarms: async (farmerId?: string): Promise<Farm[]> => {
    return Promise.resolve(mockDataService.getFarms(farmerId));
  },

  getFarmById: async (id: string): Promise<Farm | null> => {
    return Promise.resolve(mockDataService.getFarmById(id) || null);
  },

  createFarm: async (farm: Omit<Farm, 'id' | 'created_at' | 'updated_at'>): Promise<Farm> => {
    return Promise.resolve(mockDataService.createFarm(farm));
  },

  updateFarm: async (id: string, updates: Partial<Farm>): Promise<Farm | null> => {
    return Promise.resolve(mockDataService.updateFarm(id, updates));
  },

  deleteFarm: async (id: string): Promise<boolean> => {
    return Promise.resolve(mockDataService.deleteFarm(id));
  },

  // Batches
  getBatches: async (farmId?: string, farmerId?: string): Promise<Batch[]> => {
    return Promise.resolve(mockDataService.getBatches(farmId, farmerId));
  },

  getBatchById: async (id: string): Promise<Batch | null> => {
    return Promise.resolve(mockDataService.getBatchById(id) || null);
  },

  createBatch: async (batch: Omit<Batch, 'id' | 'created_at' | 'updated_at'>): Promise<Batch> => {
    return Promise.resolve(mockDataService.createBatch(batch));
  },

  updateBatch: async (id: string, updates: Partial<Batch>): Promise<Batch | null> => {
    return Promise.resolve(mockDataService.updateBatch(id, updates));
  },

  // Devices
  getDevices: async (farmId?: string): Promise<Device[]> => {
    return Promise.resolve(mockDataService.getDevices(farmId));
  },

  createDevice: async (device: Omit<Device, 'id' | 'created_at' | 'updated_at'>): Promise<Device> => {
    return Promise.resolve(mockDataService.createDevice(device));
  },

  // Alerts
  getAlerts: async (farmerId?: string): Promise<Alert[]> => {
    return Promise.resolve(mockDataService.getAlerts(farmerId));
  },

  createAlert: async (alert: Omit<Alert, 'id' | 'created_at'>): Promise<Alert> => {
    return Promise.resolve(mockDataService.createAlert(alert));
  },

  updateAlert: async (id: string, updates: Partial<Alert>): Promise<Alert | null> => {
    return Promise.resolve(mockDataService.updateAlert(id, updates));
  },

  // Activities
  getActivities: async (farmerId?: string, batchId?: string): Promise<Activity[]> => {
    return Promise.resolve(mockDataService.getActivities(farmerId, batchId));
  },

  createActivity: async (activity: Omit<Activity, 'id' | 'created_at'>): Promise<Activity> => {
    return Promise.resolve(mockDataService.createActivity(activity));
  },

  updateActivity: async (id: string, updates: Partial<Activity>): Promise<Activity | null> => {
    return Promise.resolve(mockDataService.updateActivity(id, updates));
  },

  // Subscriptions
  getSubscriptions: async (farmerId?: string): Promise<Subscription[]> => {
    return Promise.resolve(mockDataService.getSubscriptions(farmerId));
  },

  createSubscription: async (subscription: Omit<Subscription, 'id' | 'created_at'>): Promise<Subscription> => {
    return Promise.resolve(mockDataService.createSubscription(subscription));
  },

  updateSubscription: async (id: string, updates: Partial<Subscription>): Promise<Subscription | null> => {
    return Promise.resolve(mockDataService.updateSubscription(id, updates));
  },

  // Inventory
  getInventory: async (farmerId?: string): Promise<InventoryItem[]> => {
    return Promise.resolve(mockDataService.getInventory(farmerId));
  },

  createInventoryItem: async (item: Omit<InventoryItem, 'id' | 'created_at' | 'updated_at'>): Promise<InventoryItem> => {
    return Promise.resolve(mockDataService.createInventoryItem(item));
  },

  updateInventoryItem: async (id: string, updates: Partial<InventoryItem>): Promise<InventoryItem | null> => {
    return Promise.resolve(mockDataService.updateInventoryItem(id, updates));
  },

  deleteInventoryItem: async (id: string): Promise<boolean> => {
    return Promise.resolve(mockDataService.deleteInventoryItem(id));
  },

  // Users (for admin)
  getUsers: async (): Promise<any[]> => {
    return Promise.resolve(mockDataService.getUsers());
  },

  getUserById: async (id: string): Promise<any | null> => {
    return Promise.resolve(mockDataService.getUserById(id) || null);
  },
};

// Export types for convenience
export type { Farm, Batch, Device, Alert, Activity, InventoryItem, Subscription };

