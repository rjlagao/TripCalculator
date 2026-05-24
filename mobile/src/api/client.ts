import Constants from 'expo-constants';
import { Platform } from 'react-native';
import type {
  CreateVehicleInput,
  FuelPrices,
  TripCalculationResult,
  Vehicle,
} from '../types';

const DEFAULT_API_URL = 'http://localhost:3001';
const REQUEST_TIMEOUT_MS = 8000;

function getDevMachineIp(): string | null {
  const host = Constants.expoGoConfig?.debuggerHost ?? Constants.expoConfig?.hostUri;
  if (!host) return null;
  return host.split(':')[0] || null;
}

function getApiBaseUrl(): string {
  const configured = Constants.expoConfig?.extra?.apiUrl as string | undefined;

  if (__DEV__) {
    const devIp = getDevMachineIp();
    if (devIp) {
      return `http://${devIp}:3001`;
    }
    if (Platform.OS === 'android') {
      return 'http://10.0.2.2:3001';
    }
  }

  return configured || DEFAULT_API_URL;
}

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const controller = new AbortController();
  const timeout = setTimeout(() => controller.abort(), REQUEST_TIMEOUT_MS);

  try {
    const response = await fetch(`${getApiBaseUrl()}${path}`, {
      headers: { 'Content-Type': 'application/json', ...options?.headers },
      signal: controller.signal,
      ...options,
    });

    if (!response.ok) {
      const error = await response.json().catch(() => ({ error: response.statusText }));
      throw new Error(error.error || `Request failed: ${response.status}`);
    }

    if (response.status === 204) {
      return undefined as T;
    }

    return response.json();
  } catch (err) {
    if (err instanceof Error && err.name === 'AbortError') {
      throw new Error(
        'Server unreachable. Start the API with server\\dev.cmd and ensure your phone is on the same Wi‑Fi.'
      );
    }
    throw err;
  } finally {
    clearTimeout(timeout);
  }
}

export const api = {
  getVehicles: () => request<Vehicle[]>('/api/vehicles'),

  createVehicle: (data: CreateVehicleInput) =>
    request<Vehicle>('/api/vehicles', { method: 'POST', body: JSON.stringify(data) }),

  updateVehicle: (id: number, data: Partial<CreateVehicleInput>) =>
    request<Vehicle>(`/api/vehicles/${id}`, { method: 'PUT', body: JSON.stringify(data) }),

  deleteVehicle: (id: number) =>
    request<void>(`/api/vehicles/${id}`, { method: 'DELETE' }),

  getFuelPrices: (country = 'US') =>
    request<FuelPrices>(`/api/fuel-prices?country=${country}`),

  calculateTrip: (vehicleId: number, distanceKm: number, country = 'US') =>
    request<TripCalculationResult>(
      `/api/trips/calculate?country=${country}`,
      {
        method: 'POST',
        body: JSON.stringify({ vehicleId, distanceKm }),
      }
    ),
};
