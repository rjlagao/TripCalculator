export type FuelType = 'gasoline' | 'diesel';

export interface Vehicle {
  id: number;
  name: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  consumptionPer100km: number;
  createdAt: string;
  updatedAt: string;
}

export interface CreateVehicleInput {
  name: string;
  make: string;
  model: string;
  year: number;
  fuelType: FuelType;
  consumptionPer100km: number;
}

export interface TripCalculationResult {
  vehicle: Vehicle;
  distanceKm: number;
  fuelNeededLiters: number;
  fuelPricePerLiter: number;
  estimatedCost: number;
  currency: string;
}

export interface FuelPrices {
  gasoline: number;
  diesel: number;
  currency: string;
  country: string;
  source: string;
  updatedAt: string;
}
