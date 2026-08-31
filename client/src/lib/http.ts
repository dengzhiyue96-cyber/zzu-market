/// <reference types="vite/client" />
import axios from 'axios';
import type { AxiosRequestConfig } from 'axios';

const http = axios.create({
  baseURL: (import.meta as any).env?.VITE_API_BASE || '/',
  timeout: 15000,
});

http.interceptors.request.use((config) => {
  const token = localStorage.getItem('zzu_token');
  if (token) config.headers.Authorization = `Bearer ${token}`;
  return config;
});

http.interceptors.response.use(
  (res) => res.data,
  (err) => {
    const data = err?.response?.data;
    if (err?.response?.status === 401) {
      localStorage.removeItem('zzu_token');
      localStorage.removeItem('zzu_user');
      if (!location.pathname.startsWith('/login')) location.href = `/login?from=${encodeURIComponent(location.pathname + location.search)}`;
    }
    return Promise.reject(data || { code: 1, msg: err.message || '网络异常' });
  }
);

export async function api<T = any>(url: string, config: AxiosRequestConfig = {}): Promise<{ code: 0 | 1; msg: string; data: T }> {
  return http.request({ url, ...config }) as any;
}

export default http;
