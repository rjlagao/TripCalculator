import { Router, type Request, type Response } from 'express';
import { calculateTrip } from '../services/tripCalculator.js';

const router = Router();

router.post('/calculate', async (req: Request, res: Response) => {
  const { vehicleId, distanceKm } = req.body;

  if (typeof vehicleId !== 'number' || typeof distanceKm !== 'number' || distanceKm <= 0) {
    res.status(400).json({
      error: 'vehicleId (number) and distanceKm (positive number) are required',
    });
    return;
  }

  const country = (req.query.country as string) || process.env.FUEL_PRICE_COUNTRY || 'US';
  const apiKey = process.env.FUEL_PRICE_API_KEY;

  const result = await calculateTrip({ vehicleId, distanceKm }, country, apiKey);

  if (!result) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }

  res.json(result);
});

export default router;
