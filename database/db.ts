import { Job, JobWithDetails, Note, Photo, Signature } from "@/types/job";
import * as SQLite from "expo-sqlite";

let db: SQLite.SQLiteDatabase | null = null;
let dbReady: Promise<SQLite.SQLiteDatabase> | null = null;

export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  // If a database instance already exists, reuse it
  if (db) {
    return db;
  }

  // If initialization is already in progress, return the existing promise
  if (dbReady) {
    return dbReady;
  }

  dbReady = (async () => {
    const database = await SQLite.openDatabaseAsync("contractorapptest.db");

    await database.execAsync(`
    PRAGMA foreign_keys = ON;

    CREATE TABLE IF NOT EXISTS jobs (
      id TEXT PRIMARY KEY,
      title TEXT NOT NULL,
      clientName TEXT NOT NULL,
      address TEXT NOT NULL,
      description TEXT,
      price REAL,
      status TEXT NOT NULL DEFAULT 'pending',
      synced INTEGER DEFAULT 0,
      vatIncluded INTEGER DEFAULT 0,
      taxRate REAL,
      paid INTEGER DEFAULT 0,
      createdAt TEXT NOT NULL,
      updatedAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS notes (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      text TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS photos (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      uri TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS expenses (
      id TEXT PRIMARY KEY,
      category TEXT,
      amount REAL NOT NULL,
      note TEXT,
      createdAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS tax_payments (
      id TEXT PRIMARY KEY,
      amount REAL NOT NULL,
      note TEXT,
      paidAt TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS signatures (
      id TEXT PRIMARY KEY,
      jobId TEXT NOT NULL,
      uri TEXT NOT NULL,
      createdAt TEXT NOT NULL,
      FOREIGN KEY (jobId) REFERENCES jobs(id) ON DELETE CASCADE
    );

    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    );

    CREATE INDEX IF NOT EXISTS idx_jobs_createdAt ON jobs(createdAt);
  `);

    db = database;
    return database;
  })();

  return dbReady;
}

async function ensureDatabase(): Promise<SQLite.SQLiteDatabase> {
  const database = await initDatabase();
  if (!database) {
    throw new Error("Failed to initialize database");
  }
  return database;
}

export async function getAllJobs(): Promise<Job[]> {
  const database = await ensureDatabase();
  const result = await database.getAllAsync<Job>(
    "SELECT * FROM jobs ORDER BY createdAt DESC",
  );
  return result;
}

export async function getActiveJobs(): Promise<Job[]> {
  const database = await ensureDatabase();
  const result = await database.getAllAsync<Job>(
    "SELECT * FROM jobs WHERE status IN (?, ?) ORDER BY createdAt DESC",
    ["pending", "in_progress"],
  );
  return result;
}

export async function getCompletedJobs(): Promise<Job[]> {
  const database = await ensureDatabase();
  const result = await database.getAllAsync<Job>(
    "SELECT * FROM jobs WHERE status = ? ORDER BY createdAt DESC",
    ["completed"],
  );
  return result;
}

export async function getYearToDateIncome(year: number): Promise<number> {
  const database = await ensureDatabase();
  const from = new Date(year, 0, 1).toISOString();
  const to = new Date(year + 1, 0, 1).toISOString();
  const row = await database.getFirstAsync<{ total: number | null }>(
    "SELECT SUM(price) as total FROM jobs WHERE status = 'completed' AND createdAt >= ? AND createdAt < ?",
    [from, to],
  );
  return row?.total ?? 0;
}

export async function getYearToDateExpenses(year: number): Promise<number> {
  const database = await ensureDatabase();
  const from = new Date(year, 0, 1).toISOString();
  const to = new Date(year + 1, 0, 1).toISOString();
  const row = await database.getFirstAsync<{ total: number | null }>(
    "SELECT SUM(amount) as total FROM expenses WHERE createdAt >= ? AND createdAt < ?",
    [from, to],
  );
  return row?.total ?? 0;
}

export async function getYearToDateTaxPaid(year: number): Promise<number> {
  const database = await ensureDatabase();
  const from = new Date(year, 0, 1).toISOString();
  const to = new Date(year + 1, 0, 1).toISOString();
  const row = await database.getFirstAsync<{ total: number | null }>(
    "SELECT SUM(amount) as total FROM tax_payments WHERE paidAt >= ? AND paidAt < ?",
    [from, to],
  );
  return row?.total ?? 0;
}

export async function getRecentTaxPayments(
  limit: number,
): Promise<
  { id: string; amount: number; note: string | null; paidAt: string }[]
> {
  const database = await ensureDatabase();
  const rows = await database.getAllAsync<{
    id: string;
    amount: number;
    note: string | null;
    paidAt: string;
  }>(
    "SELECT id, amount, note, paidAt FROM tax_payments ORDER BY paidAt DESC LIMIT ?",
    [limit],
  );
  return rows;
}

export async function getJobById(id: string): Promise<JobWithDetails | null> {
  const database = await ensureDatabase();

  const job = await database.getFirstAsync<Job>(
    "SELECT * FROM jobs WHERE id = ?",
    [id],
  );
  if (!job) return null;

  const notes = await database.getAllAsync<Note>(
    "SELECT * FROM notes WHERE jobId = ? ORDER BY createdAt DESC",
    [id],
  );
  const photos = await database.getAllAsync<Photo>(
    "SELECT * FROM photos WHERE jobId = ? ORDER BY createdAt DESC",
    [id],
  );

  return {
    ...job,
    notes,
    photos,
  };
}

export async function createJob(
  job: Omit<Job, "id" | "createdAt" | "updatedAt" | "synced">,
): Promise<Job> {
  const database = await ensureDatabase();

  const id = Math.random().toString(36).substring(7);
  const now = new Date().toISOString();

  await database.runAsync(
    "INSERT INTO jobs (id, title, clientName, address, description, price, status, synced, createdAt, updatedAt) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)",
    [
      id,
      job.title,
      job.clientName,
      job.address,
      job.description,
      job.price || null,
      job.status,
      0,
      now,
      now,
    ],
  );

  return {
    id,
    ...job,
    synced: false,
    createdAt: now,
    updatedAt: now,
  };
}

export async function updateJobStatus(
  id: string,
  status: Job["status"],
): Promise<void> {
  const database = await ensureDatabase();

  const updatedAt = new Date().toISOString();

  await database.runAsync(
    "UPDATE jobs SET status = ?, updatedAt = ?, synced = 0 WHERE id = ?",
    [status, updatedAt, id],
  );
}

export async function updateJob(job: Job): Promise<void> {
  const database = await ensureDatabase();
  const updatedAt = new Date().toISOString();
  await database.runAsync(
    "UPDATE jobs SET title = ?, clientName = ?, address = ?, description = ?, price = ?, status = ?, updatedAt = ?, synced = 0 WHERE id = ?",
    [
      job.title,
      job.clientName,
      job.address,
      job.description,
      job.price ?? null,
      job.status,
      updatedAt,
      job.id,
    ],
  );
}

export async function addNote(jobId: string, text: string): Promise<Note> {
  const database = await ensureDatabase();

  const id = Math.random().toString(36).substring(7);
  const createdAt = new Date().toISOString();

  await database.runAsync(
    "INSERT INTO notes (id, jobId, text, createdAt) VALUES (?, ?, ?, ?)",
    [id, jobId, text, createdAt],
  );

  return { id, jobId, text, createdAt };
}

export async function addPhoto(jobId: string, uri: string): Promise<Photo> {
  const database = await ensureDatabase();

  const id = Math.random().toString(36).substring(7);
  const createdAt = new Date().toISOString();

  await database.runAsync(
    "INSERT INTO photos (id, jobId, uri, createdAt) VALUES (?, ?, ?, ?)",
    [id, jobId, uri, createdAt],
  );

  return { id, jobId, uri, createdAt };
}

export async function addSignature(
  jobId: string,
  uri: string,
): Promise<Signature> {
  const database = await ensureDatabase();

  const id = Math.random().toString(36).substring(7);
  const createdAt = new Date().toISOString();

  await database.runAsync(
    "INSERT INTO signatures (id, jobId, uri, createdAt) VALUES (?, ?, ?, ?)",
    [id, jobId, uri, createdAt],
  );

  return { id, jobId, uri, createdAt };
}

export async function getSignatureByJobId(
  jobId: string,
): Promise<Signature | null> {
  const database = await ensureDatabase();
  const row = await database.getFirstAsync<Signature>(
    "SELECT * FROM signatures WHERE jobId = ? LIMIT 1",
    [jobId],
  );
  return row ?? null;
}

export async function getSetting(key: string): Promise<string | null> {
  const database = await ensureDatabase();
  const row = await database.getFirstAsync<{ value: string | null }>(
    "SELECT value FROM settings WHERE key = ?",
    [key],
  );
  return row?.value ?? null;
}

export async function setSetting(key: string, value: string): Promise<void> {
  const database = await ensureDatabase();
  await database.runAsync(
    "INSERT INTO settings (key, value) VALUES (?, ?) ON CONFLICT(key) DO UPDATE SET value = excluded.value",
    [key, value],
  );
}

export async function getNextInvoiceNumber(): Promise<number> {
  const current = await getSetting("lastInvoiceNumber");
  const next = current ? parseInt(current, 10) + 1 : 1;
  await setSetting("lastInvoiceNumber", String(next));
  return next;
}

export async function updateJobPaidStatus(
  id: string,
  paid: boolean,
): Promise<void> {
  const database = await ensureDatabase();
  const updatedAt = new Date().toISOString();

  await database.runAsync(
    "UPDATE jobs SET paid = ?, updatedAt = ?, synced = 0 WHERE id = ?",
    [paid ? 1 : 0, updatedAt, id],
  );
}

export async function deleteJob(id: string): Promise<void> {
  const database = await ensureDatabase();
  await database.runAsync("DELETE FROM jobs WHERE id = ?", [id]);
}
