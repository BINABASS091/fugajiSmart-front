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
  // Get all inventory items
  getItems: async () => {
    return fetchApi('/inventory/');
  },

  // Create new inventory item
  createItem: async (data: any) => {
    return fetchApi('/inventory/', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // Update inventory item
  updateItem: async (id: string, data: any) => {
    return fetchApi(`/inventory/${id}/`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
  },

  // Get transactions
  getTransactions: async (params?: any) => {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi(`/inventory-transactions/${queryString}`);
  },

  // Create transaction (add stock/use stock)
  createTransaction: async (data: any) => {
    return fetchApi('/inventory-transactions/', {
      method: 'POST',
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


export { API_BASE_URL };