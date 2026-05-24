import type { FuelPrices } from '../types.js';

const DEFAULT_PRICES: Record<string, FuelPrices> = {
  US: {
    gasoline: 3.45,
    diesel: 3.89,
    currency: 'USD',
    country: 'US',
    source: 'default',
    updatedAt: new Date().toISOString(),
  },
  GB: {
    gasoline: 1.45,
    diesel: 1.52,
    currency: 'GBP',
    country: 'GB',
    source: 'default',
    updatedAt: new Date().toISOString(),
  },
  DE: {
    gasoline: 1.72,
    diesel: 1.65,
    currency: 'EUR',
    country: 'DE',
    source: 'default',
    updatedAt: new Date().toISOString(),
  },
};

interface CollectApiFuelPrice {
  gasoline?: string;
  diesel?: string;
  currency?: string;
  country?: string;
}

export async function fetchFuelPrices(
  country: string,
  apiKey?: string
): Promise<FuelPrices> {
  const normalizedCountry = country.toUpperCase();

  if (apiKey) {
    try {
      const response = await fetch(
        `https://api.collectapi.com/gasPrice/fromCountry?country=${normalizedCountry}`,
        {
          headers: {
            authorization: `apikey ${apiKey}`,
            'content-type': 'application/json',
          },
        }
      );

      if (response.ok) {
        const data = (await response.json()) as { result?: CollectApiFuelPrice };
        const result = data.result;

        if (result?.gasoline && result?.diesel) {
          return {
            gasoline: parseFloat(result.gasoline),
            diesel: parseFloat(result.diesel),
            currency: result.currency ?? 'USD',
            country: normalizedCountry,
            source: 'collectapi',
            updatedAt: new Date().toISOString(),
          };
        }
      }
    } catch {
      // Fall through to defaults
    }
  }

  const fallback = DEFAULT_PRICES[normalizedCountry] ?? DEFAULT_PRICES.US;
  return {
    ...fallback,
    country: normalizedCountry,
    updatedAt: new Date().toISOString(),
  };
}
