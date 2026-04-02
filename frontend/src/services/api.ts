import axios from 'axios';
import { useAuthStore } from '../stores/authStore';

const API_URL = import.meta.env.VITE_API_URL;

function authHeaders() {
  const token = useAuthStore.getState().accessToken;
  return token ? { Authorization: `Bearer ${token}` } : {};
}

export const authApi = {
  register: async (data: { email: string; password: string; name: string; phone?: string; role?: string }) => {
    const res = await axios.post(`${API_URL}/api/auth/register`, data);
    return res.data as any;
  },
  login: async (data: { email: string; password: string }) => {
    const res = await axios.post(`${API_URL}/api/auth/login`, data);
    return res.data as any;
  }
};

export const alertsApi = {
  getActive: async () => {
    const res = await axios.get(`${API_URL}/api/alerts/active`, { headers: authHeaders() });
    return res.data;
  }
};

export const scenarioApi = {
  simulate: async (data: any) => {
    const res = await axios.post(`${API_URL}/api/scenarios/simulate`, data, { headers: authHeaders() });
    return res.data;
  }
};
