import { fetchApi } from '../lib/api';

export const activitiesApi = {
  async getAll(params?: Record<string, any>) {
    const queryString = params ? '?' + new URLSearchParams(params).toString() : '';
    return fetchApi<any[]>(`activities/${queryString}`);
  },
  async getById(id: string) {
    return fetchApi<any>(`activities/${id}/`);
  },
  async create(data: any) {
    return fetchApi<any>('activities/', { method: 'POST', body: JSON.stringify(data) });
  },
  async update(id: string, data: any) {
    return fetchApi<any>(`activities/${id}/`, { method: 'PUT', body: JSON.stringify(data) });
  },
  async delete(id: string) {
    return fetchApi<void>(`activities/${id}/`, { method: 'DELETE' });
  },
};
