const getApiBaseUrl = () => {
  const envUrl = import.meta.env.VITE_API_BASE_URL;
  if (envUrl && envUrl.trim().length > 0) {
    return envUrl.trim().replace(/\/+$/, '');
  }
  return 'http://127.0.0.1:8000/api/v1'; // prefer local over remote for dev
};

const API_BASE_URL = getApiBaseUrl();

function getCsrfToken() {
  if (typeof document === 'undefined') return null;
  const m = document.cookie.match(/(?:^|;\s*)csrftoken=([^;]+)/);
  return m ? decodeURIComponent(m[1]) : null;
}

// Centralized fetch with CSRF for unsafe methods
async function fetchApi<T = any>(path: string, options: RequestInit = {}): Promise<{ data: T | null; error: string | null }> {
  const normalizedPath = path.startsWith('/') ? path.replace(/^\/+/, '') : path;
  const url = `${API_BASE_URL}/${normalizedPath}`;
  const method = (options.method || 'GET').toUpperCase();
  const needsCsrf = ['POST', 'PUT', 'PATCH', 'DELETE'].includes(method);
  const csrf = needsCsrf ? getCsrfToken() : null;

  try {
    const res = await fetch(url, {
      credentials: 'include',
      headers: {
        // Only set JSON content-type if body is not FormData
        ...(options.body instanceof FormData ? {} : { 'Content-Type': 'application/json' }),
        ...(needsCsrf && csrf ? { 'X-CSRFToken': csrf } : {}),
        ...(options.headers || {}),
      },
      ...options,
    });
    if (res.status === 401) return { data: null, error: 'UNAUTHORIZED' };
    if (res.status === 403) {
      const text = await res.text();
      return { data: null, error: text || 'FORBIDDEN' };
    }
    if (!res.ok) {
      const text = await res.text();
      throw new Error(text || `Request failed (${res.status})`);
    }
    const text = await res.text();
    const data: T | null = text ? (JSON.parse(text) as T) : null;
    return { data, error: null };
  } catch (err: any) {
    console.error('Network error:', err);
    return { data: null, error: err.message || 'Network error' };
  }
}

// Auth endpoints
export const authApi = {
  async getCurrentUser() {
    return fetchApi('auth/profile/');
  },
  async csrf() {
    return fetchApi('auth/csrf/');
  },
  async register(payload: { email: string; password: string; password2: string; role?: 'ADMIN' | 'FARMER'; phone?: string; name?: string }) {
    return fetchApi('auth/register/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async login(payload: { email: string; password: string }) {
    return fetchApi('auth/login/', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
  },
  async refresh() {
    return fetchApi('auth/refresh/', { method: 'POST' });
  },
  async logout() {
    return fetchApi('auth/logout/', { method: 'POST' });
  },
  async googleLogin(token: string) {
    return fetchApi('auth/google/', {
      method: 'POST',
      body: JSON.stringify({ token }),
    });
  },
  async uploadAvatar(file: File) {
    const form = new FormData();
    form.append('avatar', file);
    return fetchApi<{ avatar_url: string }>('auth/profile/avatar/', {
      method: 'POST',
      body: form,
    });
  },
  async updateCurrency(currency: string) {
    return fetchApi('auth/currency/', {
      method: 'PATCH',
      body: JSON.stringify({ preferred_currency: currency }),
    });
  },
};

// Batches API
export const batchesApi = {
  async getAll() {
    return fetchApi<any[]>('batches/');
  },
  async getById(id: string) {
    return fetchApi<any>(`batches/${id}/`);
  },
  async create(data: any) {
    return fetchApi<any>('batches/', { method: 'POST', body: JSON.stringify(data) });
  },
  async update(id: string, data: any) {
    return fetchApi<any>(`batches/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    return fetchApi<void>(`batches/${id}/`, { method: 'DELETE' });
  },
};

// Inventory API
export const inventoryApi = {
  // Get all inventory items with optional filters
  getItems: async (params?: {
    category?: string;
    subcategory?: string;
    farm?: string;
    search?: string;
    is_iot_device?: boolean;
    is_emergency_stock?: boolean;
    ordering?: string;
  }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    return fetchApi(`/inventory/${queryString}`);
  },

  // Get single inventory item by ID
  getItem: async (id: string) => {
    return fetchApi(`/inventory/${id}/`);
  },

  // Create new inventory item
  createItem: async (data: {
    name: string;
    category: string;
    subcategory?: string | null;
    quantity: number;
    unit: string;
    cost_per_unit: number;
    reorder_level?: number;
    supplier?: string | null;
    expiry_date?: string | null;
    purchase_date?: string | null;
    feed_type?: string | null;
    consumption_rate_per_day?: number | null;
    course_days?: number | null;
    barcode?: string | null;
    batch_number?: string | null;
    location?: string | null;
    requires_refrigeration?: boolean;
    is_iot_device?: boolean;
    is_emergency_stock?: boolean;
    farm?: string | null;
    batch?: string | null;
    age_days?: number | null;
    average_weight?: number | null;
    notes?: string | null;
  }) => {
    return fetchApi('/inventory/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update inventory item
  updateItem: async (id: string, data: Partial<{
    name: string;
    category: string;
    subcategory?: string | null;
    quantity: number;
    unit: string;
    cost_per_unit: number;
    reorder_level?: number;
    supplier?: string | null;
    expiry_date?: string | null;
    purchase_date?: string | null;
    feed_type?: string | null;
    consumption_rate_per_day?: number | null;
    course_days?: number | null;
    barcode?: string | null;
    batch_number?: string | null;
    location?: string | null;
    requires_refrigeration?: boolean;
    is_iot_device?: boolean;
    is_emergency_stock?: boolean;
    farm?: string | null;
    batch?: string | null;
    age_days?: number | null;
    average_weight?: number | null;
    notes?: string | null;
  }>) => {
    return fetchApi(`/inventory/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete inventory item
  deleteItem: async (id: string) => {
    return fetchApi(`/inventory/${id}/`, {
      method: 'DELETE',
    });
  },

  // Get transactions with optional filters
  getTransactions: async (params?: {
    item?: string;
    transaction_type?: string;
    ordering?: string;
  }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    return fetchApi(`/inventory-transactions/${queryString}`);
  },

  // Create transaction (add stock/use stock)
  createTransaction: async (data: {
    item: string;
    transaction_type: 'PURCHASE' | 'USAGE' | 'ADJUSTMENT' | 'RETURN' | 'WASTE';
    quantity_change: number;
    unit_cost?: number | null;
    notes?: string | null;
    batch?: string | null;
  }) => {
    return fetchApi('/inventory-transactions/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Get transaction by ID
  getTransaction: async (id: string) => {
    return fetchApi(`/inventory-transactions/${id}/`);
  },
};

// Feed Consumption API
export const feedConsumptionApi = {
  // Get all feed consumption records
  getAll: async (params?: {
    batch?: string;
    inventory_item?: string;
    date?: string;
    ordering?: string;
  }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    return fetchApi(`/feed-consumption/${queryString}`);
  },

  // Get single feed consumption record
  getById: async (id: string) => {
    return fetchApi(`/feed-consumption/${id}/`);
  },

  // Create feed consumption record
  create: async (data: {
    batch: string;
    inventory_item: string;
    quantity_used: number;
    unit_cost?: number | null;
    date?: string;
    notes?: string | null;
    transaction?: string | null;
  }) => {
    return fetchApi('/feed-consumption/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update feed consumption record
  update: async (id: string, data: Partial<{
    batch: string;
    inventory_item: string;
    quantity_used: number;
    unit_cost?: number | null;
    date?: string;
    notes?: string | null;
  }>) => {
    return fetchApi(`/feed-consumption/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Delete feed consumption record
  delete: async (id: string) => {
    return fetchApi(`/feed-consumption/${id}/`, {
      method: 'DELETE',
    });
  },
};

// Inventory Alerts API
export const inventoryAlertsApi = {
  // Get all inventory alerts
  getAll: async (params?: {
    item?: string;
    alert_type?: string;
    severity?: string;
    is_resolved?: boolean;
    ordering?: string;
  }) => {
    const queryString = params ? '?' + new URLSearchParams(
      Object.entries(params).reduce((acc, [key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          acc[key] = String(value);
        }
        return acc;
      }, {} as Record<string, string>)
    ).toString() : '';
    return fetchApi(`/inventory-alerts/${queryString}`);
  },

  // Get single alert
  getById: async (id: string) => {
    return fetchApi(`/inventory-alerts/${id}/`);
  },

  // Resolve an alert
  resolve: async (id: string) => {
    return fetchApi(`/inventory-alerts/${id}/resolve/`, {
      method: 'POST',
    });
  },

  // Create alert (usually done by system, but can be manual)
  create: async (data: {
    item: string;
    alert_type: 'LOW_STOCK' | 'EXPIRY_WARNING' | 'EXPIRED' | 'OUT_OF_STOCK' | 'HIGH_CONSUMPTION';
    message: string;
    severity?: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
  }) => {
    return fetchApi('/inventory-alerts/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update alert
  update: async (id: string, data: Partial<{
    message: string;
    severity: 'LOW' | 'MEDIUM' | 'HIGH' | 'CRITICAL';
    is_resolved: boolean;
  }>) => {
    return fetchApi(`/inventory-alerts/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },
};

// Farms API
export const farmsApi = {
  async getAll(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any[]>(`farms/${queryString}`);
  },
  async getById(id: string) {
    return fetchApi<any>(`farms/${id}/`);
  },
  async create(data: any) {
    return fetchApi<any>('farms/', { method: 'POST', body: JSON.stringify(data) });
  },
  async update(id: string, data: any) {
    return fetchApi<any>(`farms/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    return fetchApi<void>(`farms/${id}/`, { method: 'DELETE' });
  },
};

// Devices API
export const devicesApi = {
  async getAll() {
    return fetchApi<any[]>('devices/');
  },
  async getById(id: string) {
    return fetchApi<any>(`devices/${id}/`);
  },
  async create(data: any) {
    return fetchApi<any>('devices/', { method: 'POST', body: JSON.stringify(data) });
  },
  async update(id: string, data: any) {
    return fetchApi<any>(`devices/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    return fetchApi<void>(`devices/${id}/`, { method: 'DELETE' });
  },
};

// Farmers API (admin-focused)
export const farmersApi = {
  async getAll() {
    const res = await fetchApi<any>('farmers/');
    const list = Array.isArray(res.data) ? res.data : Array.isArray((res.data as any)?.results) ? (res.data as any).results : [];
    return { data: list, error: res.error };
  },
  async getById(id: string) {
    return fetchApi<any>(`farmers/${id}/`);
  },
};

// Subscriptions API
export const subscriptionsApi = {
  async getAll() {
    return fetchApi<any[]>('subscriptions/');
  },
  async getById(id: string) {
    return fetchApi<any>(`subscriptions/${id}/`);
  },
  async create(data: any) {
    return fetchApi<any>('subscriptions/', { method: 'POST', body: JSON.stringify(data) });
  },
  async update(id: string, data: any) {
    return fetchApi<any>(`subscriptions/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async cancel(id: string) {
    return fetchApi<any>(`subscriptions/${id}/cancel/`, { method: 'POST' });
  },
  async reactivate(id: string) {
    return fetchApi<any>(`subscriptions/${id}/reactivate/`, { method: 'POST' });
  },
};

// Breed APIs
export const breedConfigurationsApi = {
  async getAll() {
    const res = await fetchApi<any>('breedconfigurations/');
    const list = Array.isArray(res.data) ? res.data : Array.isArray((res.data as any)?.results) ? (res.data as any).results : [];
    return { data: list, error: res.error };
  },
  async create(data: any) {
    return fetchApi<any>('breedconfigurations/', { method: 'POST', body: JSON.stringify(data) });
  },
  async update(id: string, data: any) {
    return fetchApi<any>(`breedconfigurations/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    return fetchApi<void>(`breedconfigurations/${id}/`, { method: 'DELETE' });
  },
};

export const breedStagesApi = {
  async listByBreed(breedId: string) {
    const res = await fetchApi<any>(`breedstages/?breed=${breedId}`);
    const list = Array.isArray(res.data) ? res.data : Array.isArray((res.data as any)?.results) ? (res.data as any).results : [];
    return { data: list, error: res.error };
  },
  async getByBreed(breedId: string) {
    return this.listByBreed(breedId);
  },
  async create(data: any) {
    return fetchApi<any>('breedstages/', { method: 'POST', body: JSON.stringify(data) });
  },
  async update(id: string, data: any) {
    return fetchApi<any>(`breedstages/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    return fetchApi<void>(`breedstages/${id}/`, { method: 'DELETE' });
  },
};

export const breedMilestonesApi = {
  async listByBreed(breedId: string) {
    const res = await fetchApi<any>(`breedmilestones/?breed=${breedId}`);
    const list = Array.isArray(res.data) ? res.data : Array.isArray((res.data as any)?.results) ? (res.data as any).results : [];
    return { data: list, error: res.error };
  },
  async getByBreed(breedId: string) {
    return this.listByBreed(breedId);
  },
  async create(data: any) {
    return fetchApi<any>('breedmilestones/', { method: 'POST', body: JSON.stringify(data) });
  },
  async update(id: string, data: any) {
    return fetchApi<any>(`breedmilestones/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    return fetchApi<void>(`breedmilestones/${id}/`, { method: 'DELETE' });
  },
};

export const recommendationsApi = {
  async getAll() {
    const res = await fetchApi<any>('recommendations/');
    const list = Array.isArray(res.data) ? res.data : Array.isArray((res.data as any)?.results) ? (res.data as any).results : [];
    return { data: list, error: res.error };
  },
  async getById(id: string) {
    return fetchApi<any>(`recommendations/${id}/`);
  },
};


export const medicineApi = {
  getInventory: async (params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/medicine-inventory/${query}`);
  },
  createItem: async (data: any) => fetchApi('/medicine-inventory/', { method: 'POST', body: JSON.stringify(data) }),
  updateItem: async (id: string, data: any) => fetchApi(`/medicine-inventory/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteItem: async (id: string) => fetchApi(`/medicine-inventory/${id}/`, { method: 'DELETE' }),
  getAdministrations: async (params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/medicine-administration/${query}`);
  },
  createAdministration: async (data: any) => fetchApi('/medicine-administration/', { method: 'POST', body: JSON.stringify(data) }),
};

export const equipmentApi = {
  getAll: async (params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/equipment-inventory/${query}`);
  },
  create: async (data: any) => fetchApi('/equipment-inventory/', { method: 'POST', body: JSON.stringify(data) }),
  update: async (id: string, data: any) => fetchApi(`/equipment-inventory/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  delete: async (id: string) => fetchApi(`/equipment-inventory/${id}/`, { method: 'DELETE' }),
};

export const laborApi = {
  getRecords: async (params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/labor-records/${query}`);
  },
  createRecord: async (data: any) => fetchApi('/labor-records/', { method: 'POST', body: JSON.stringify(data) }),
  updateRecord: async (id: string, data: any) => fetchApi(`/labor-records/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  deleteRecord: async (id: string) => fetchApi(`/labor-records/${id}/`, { method: 'DELETE' }),
  getExpenses: async (params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/service-expenses/${query}`);
  },
  createExpense: async (data: any) => fetchApi('/service-expenses/', { method: 'POST', body: JSON.stringify(data) }),
};

export const healthAlertsApi = {
  getAll: async (params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/health-alerts/${query}`);
  },
  resolve: async (id: string, notes?: string) => fetchApi(`/health-alerts/${id}/resolve/`, {
    method: 'POST',
    body: JSON.stringify({ resolution_notes: notes })
  }),
};

export const eggsApi = {
  getInventory: async (params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/egg-inventory/${query}`);
  },
  createInventory: async (data: any) => fetchApi('/egg-inventory/', { method: 'POST', body: JSON.stringify(data) }),
  updateInventory: async (id: string, data: any) => fetchApi(`/egg-inventory/${id}/`, { method: 'PATCH', body: JSON.stringify(data) }),
  getSales: async (params?: any) => {
    const query = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/egg-sales/${query}`);
  },
  createSale: async (data: any) => fetchApi('/egg-sales/', { method: 'POST', body: JSON.stringify(data) }),
};

export { API_BASE_URL, fetchApi };