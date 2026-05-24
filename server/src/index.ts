import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import { initDatabase } from './database.js';
import vehiclesRouter from './routes/vehicles.js';
import tripsRouter from './routes/trips.js';
import fuelPricesRouter from './routes/fuelPrices.js';

const app = express();
const PORT = parseInt(process.env.PORT || '3001', 10);

app.use(cors());
app.use(express.json());

app.get('/api/health', (_req, res) => {
  res.json({ status: 'ok', timestamp: new Date().toISOString() });
});

app.use('/api/vehicles', vehiclesRouter);
app.use('/api/trips', tripsRouter);
app.use('/api/fuel-prices', fuelPricesRouter);

async function start() {
  await initDatabase();

  app.listen(PORT, '0.0.0.0', () => {
    console.log(`TripCalculator API running on http://0.0.0.0:${PORT}`);
  });
}

start().catch((err) => {
  console.error('Failed to start server:', err);
  process.exit(1);
});
