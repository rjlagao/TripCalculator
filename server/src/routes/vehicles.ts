import { Router, type Request, type Response } from 'express';
import {
  createVehicle,
  deleteVehicle,
  getAllVehicles,
  getVehicleById,
  updateVehicle,
} from '../database.js';
import type { CreateVehicleInput, FuelType } from '../types.js';

const router = Router();

function isValidFuelType(value: unknown): value is FuelType {
  return value === 'gasoline' || value === 'diesel';
}

function validateVehicleInput(body: Record<string, unknown>): string | null {
  if (!body.name || typeof body.name !== 'string') return 'name is required';
  if (!body.make || typeof body.make !== 'string') return 'make is required';
  if (!body.model || typeof body.model !== 'string') return 'model is required';
  if (typeof body.year !== 'number' || body.year < 1900) return 'valid year is required';
  if (!isValidFuelType(body.fuelType)) return 'fuelType must be gasoline or diesel';
  if (typeof body.consumptionPer100km !== 'number' || body.consumptionPer100km <= 0) {
    return 'consumptionPer100km must be a positive number';
  }
  return null;
}

router.get('/', (_req: Request, res: Response) => {
  res.json(getAllVehicles());
});

router.get('/:id', (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  const vehicle = getVehicleById(id);

  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }

  res.json(vehicle);
});

router.post('/', (req: Request, res: Response) => {
  const error = validateVehicleInput(req.body);
  if (error) {
    res.status(400).json({ error });
    return;
  }

  const vehicle = createVehicle(req.body as CreateVehicleInput);
  res.status(201).json(vehicle);
});

router.put('/:id', (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  const vehicle = updateVehicle(id, req.body as Partial<CreateVehicleInput>);

  if (!vehicle) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }

  res.json(vehicle);
});

router.delete('/:id', (req: Request, res: Response) => {
  const id = parseInt(String(req.params.id), 10);
  const deleted = deleteVehicle(id);

  if (!deleted) {
    res.status(404).json({ error: 'Vehicle not found' });
    return;
  }

  res.status(204).send();
});

export default router;
