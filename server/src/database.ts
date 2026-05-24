import initSqlJs, { Database as SqlJsDatabase } from 'sql.js';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import type { CreateVehicleInput, FuelType, Vehicle } from './types.js';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const DB_PATH = path.join(__dirname, '..', 'data', 'tripcalculator.db');

let db: SqlJsDatabase | null = null;

function rowToVehicle(row: Record<string, unknown>): Vehicle {
  return {
    id: row.id as number,
    name: row.name as string,
    make: row.make as string,
    model: row.model as string,
    year: row.year as number,
    fuelType: row.fuel_type as FuelType,
    consumptionPer100km: row.consumption_per_100km as number,
    createdAt: row.created_at as string,
    updatedAt: row.updated_at as string,
  };
}

function persistDb(): void {
  if (!db) return;
  const dir = path.dirname(DB_PATH);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  const data = db.export();
  fs.writeFileSync(DB_PATH, Buffer.from(data));
}

export async function initDatabase(): Promise<void> {
  const SQL = await initSqlJs();
  const dir = path.dirname(DB_PATH);

  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }

  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
  } else {
    db = new SQL.Database();
  }

  db.run(`
    CREATE TABLE IF NOT EXISTS vehicles (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      make TEXT NOT NULL,
      model TEXT NOT NULL,
      year INTEGER NOT NULL,
      fuel_type TEXT NOT NULL CHECK (fuel_type IN ('gasoline', 'diesel')),
      consumption_per_100km REAL NOT NULL CHECK (consumption_per_100km > 0),
      created_at TEXT NOT NULL DEFAULT (datetime('now')),
      updated_at TEXT NOT NULL DEFAULT (datetime('now'))
    )
  `);

  const count = db.exec('SELECT COUNT(*) as count FROM vehicles');
  const vehicleCount = count[0]?.values[0]?.[0] as number;

  if (vehicleCount === 0) {
    seedDefaultVehicles();
  }

  persistDb();
}

function seedDefaultVehicles(): void {
  const defaults: CreateVehicleInput[] = [
    {
      name: 'Daily Commuter',
      make: 'Toyota',
      model: 'Corolla',
      year: 2022,
      fuelType: 'gasoline',
      consumptionPer100km: 6.5,
    },
    {
      name: 'Family SUV',
      make: 'Volkswagen',
      model: 'Tiguan',
      year: 2021,
      fuelType: 'diesel',
      consumptionPer100km: 7.2,
    },
  ];

  for (const vehicle of defaults) {
    createVehicle(vehicle);
  }
}

export function getAllVehicles(): Vehicle[] {
  if (!db) throw new Error('Database not initialized');

  const result = db.exec('SELECT * FROM vehicles ORDER BY name ASC');
  if (!result.length) return [];

  const columns = result[0].columns;
  return result[0].values.map((row: import('sql.js').SqlValue[]) => {
    const record: Record<string, unknown> = {};
    columns.forEach((col: string, i: number) => {
      record[col] = row[i];
    });
    return rowToVehicle(record);
  });
}

export function getVehicleById(id: number): Vehicle | null {
  if (!db) throw new Error('Database not initialized');

  const stmt = db.prepare('SELECT * FROM vehicles WHERE id = ?');
  stmt.bind([id]);

  if (!stmt.step()) {
    stmt.free();
    return null;
  }

  const row = stmt.getAsObject();
  stmt.free();
  return rowToVehicle(row);
}

export function createVehicle(input: CreateVehicleInput): Vehicle {
  if (!db) throw new Error('Database not initialized');

  db.run(
    `INSERT INTO vehicles (name, make, model, year, fuel_type, consumption_per_100km)
     VALUES (?, ?, ?, ?, ?, ?)`,
    [input.name, input.make, input.model, input.year, input.fuelType, input.consumptionPer100km]
  );

  const result = db.exec('SELECT last_insert_rowid() as id');
  const id = result[0].values[0][0] as number;
  persistDb();

  const vehicle = getVehicleById(id);
  if (!vehicle) throw new Error('Failed to create vehicle');
  return vehicle;
}

export function updateVehicle(id: number, input: Partial<CreateVehicleInput>): Vehicle | null {
  if (!db) throw new Error('Database not initialized');

  const existing = getVehicleById(id);
  if (!existing) return null;

  const updated = {
    name: input.name ?? existing.name,
    make: input.make ?? existing.make,
    model: input.model ?? existing.model,
    year: input.year ?? existing.year,
    fuelType: input.fuelType ?? existing.fuelType,
    consumptionPer100km: input.consumptionPer100km ?? existing.consumptionPer100km,
  };

  db.run(
    `UPDATE vehicles SET name = ?, make = ?, model = ?, year = ?, fuel_type = ?,
     consumption_per_100km = ?, updated_at = datetime('now') WHERE id = ?`,
  [
      updated.name,
      updated.make,
      updated.model,
      updated.year,
      updated.fuelType,
      updated.consumptionPer100km,
      id,
    ]
  );

  persistDb();
  return getVehicleById(id);
}

export function deleteVehicle(id: number): boolean {
  if (!db) throw new Error('Database not initialized');

  const existing = getVehicleById(id);
  if (!existing) return false;

  db.run('DELETE FROM vehicles WHERE id = ?', [id]);
  persistDb();
  return true;
}
