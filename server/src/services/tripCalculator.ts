import type { TripCalculationInput, TripCalculationResult } from '../types.js';
import { getVehicleById } from '../database.js';
import { fetchFuelPrices } from './fuelPrices.js';

export async function calculateTrip(
  input: TripCalculationInput,
  country: string,
  apiKey?: string
): Promise<TripCalculationResult | null> {
  const vehicle = getVehicleById(input.vehicleId);
  if (!vehicle) return null;

  const prices = await fetchFuelPrices(country, apiKey);
  const fuelNeededLiters = (input.distanceKm / 100) * vehicle.consumptionPer100km;
  const fuelPricePerLiter =
    vehicle.fuelType === 'diesel' ? prices.diesel : prices.gasoline;
  const estimatedCost = fuelNeededLiters * fuelPricePerLiter;

  return {
    vehicle,
    distanceKm: input.distanceKm,
    fuelNeededLiters: Math.round(fuelNeededLiters * 100) / 100,
    fuelPricePerLiter,
    estimatedCost: Math.round(estimatedCost * 100) / 100,
    currency: prices.currency,
  };
}
