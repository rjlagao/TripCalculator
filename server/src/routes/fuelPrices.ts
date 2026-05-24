import { Router, type Request, type Response } from 'express';
import { fetchFuelPrices } from '../services/fuelPrices.js';

const router = Router();

router.get('/', async (req: Request, res: Response) => {
  const country = (req.query.country as string) || process.env.FUEL_PRICE_COUNTRY || 'US';
  const apiKey = process.env.FUEL_PRICE_API_KEY;

  const prices = await fetchFuelPrices(country, apiKey);
  res.json(prices);
});

export default router;
