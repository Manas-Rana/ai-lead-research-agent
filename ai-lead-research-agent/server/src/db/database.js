import fs from "node:fs";
import path from "node:path";
import Database from "better-sqlite3";
import { env } from "../config/env.js";

const dbPath = path.resolve(process.cwd(), env.DATABASE_PATH);
fs.mkdirSync(path.dirname(dbPath), { recursive: true });

export const db = new Database(dbPath);
db.pragma("journal_mode = WAL");

export function initDb() {
  db.exec(`
    CREATE TABLE IF NOT EXISTS research_runs (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      input TEXT NOT NULL,
      normalized_url TEXT NOT NULL,
      company_name TEXT NOT NULL,
      result_json TEXT NOT NULL,
      status TEXT NOT NULL DEFAULT 'pending',
      created_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP,
      updated_at TEXT NOT NULL DEFAULT CURRENT_TIMESTAMP
    );

    CREATE INDEX IF NOT EXISTS idx_research_runs_created_at
      ON research_runs(created_at DESC);
  `);
}

export function createRun({ input, normalizedUrl, companyName, result, status = "review" }) {
  const stmt = db.prepare(`
    INSERT INTO research_runs
      (input, normalized_url, company_name, result_json, status)
    VALUES
      (@input, @normalizedUrl, @companyName, @resultJson, @status)
  `);

  const info = stmt.run({
    input,
    normalizedUrl,
    companyName,
    resultJson: JSON.stringify(result),
    status
  });

  return getRun(info.lastInsertRowid);
}

export function listRuns() {
  return db.prepare(`
    SELECT id, input, normalized_url, company_name, status, created_at, updated_at
    FROM research_runs
    ORDER BY id DESC
    LIMIT 50
  `).all();
}

export function getRun(id) {
  const row = db.prepare(`
    SELECT *
    FROM research_runs
    WHERE id = ?
  `).get(id);

  if (!row) return null;

  return {
    ...row,
    result: JSON.parse(row.result_json)
  };
}

export function updateRun(id, updates) {
  const current = getRun(id);
  if (!current) return null;

  const nextResult = {
    ...current.result,
    outreach: {
      ...current.result.outreach,
      ...(updates.emailBody !== undefined
        ? { emailBody: updates.emailBody }
        : {}),
      ...(updates.linkedinMessage !== undefined
        ? { linkedinMessage: updates.linkedinMessage }
        : {})
    }
  };

  db.prepare(`
    UPDATE research_runs
    SET result_json = ?, status = ?, updated_at = CURRENT_TIMESTAMP
    WHERE id = ?
  `).run(
    JSON.stringify(nextResult),
    updates.status ?? current.status,
    id
  );

  return getRun(id);
}
