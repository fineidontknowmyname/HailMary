#!/usr/bin/env node
import { readdirSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import pg from 'pg';
import dotenv from 'dotenv';

const __dirname = dirname(fileURLToPath(import.meta.url));

const ROOT_ENV = join(__dirname, '..', '.env');
const API_ENV = join(__dirname, '..', 'apps', 'api', '.env');

let source = process.env.DATABASE_URL ? 'shell environment' : null;
if (!source) {
  const root = dotenv.config({ path: ROOT_ENV });
  if (root.parsed?.DATABASE_URL) source = ROOT_ENV;
}
if (!source) {
  const api = dotenv.config({ path: API_ENV });
  if (api.parsed?.DATABASE_URL) source = API_ENV;
}

const MIGRATIONS_DIR = join(__dirname, 'migrations');
const statusOnly = process.argv.includes('--status');

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error(
    'Missing DATABASE_URL. Add it to .env (Supabase -> Project Settings -> Database -> Connection string).'
  );
  process.exit(1);
}

function reportSource() {
  try {
    const u = new URL(connectionString);
    const pw = decodeURIComponent(u.password || '');
    const masked = pw.length <= 2 ? '*'.repeat(pw.length) : `${pw[0]}${'*'.repeat(pw.length - 2)}${pw.at(-1)}`;
    console.log(`DATABASE_URL from: ${source}`);
    console.log(`  host: ${u.hostname}:${u.port || 5432}`);
    console.log(`  user: ${u.username}`);
    console.log(`  db:   ${u.pathname.replace('/', '')}`);
    console.log(`  password: ${masked} (${pw.length} chars)`);
  } catch {
    console.log('DATABASE_URL is not a valid URL — check for unencoded special characters in the password.');
  }
}
reportSource();

const migrationFiles = readdirSync(MIGRATIONS_DIR)
  .filter((f) => f.endsWith('.sql'))
  .sort();

const client = new pg.Client({ connectionString });

async function main() {
  try {
    await client.connect();
  } catch (err) {
    if (err.code === '28P01') {
      console.error(
        '\nAuthentication failed (28P01). The DATABASE_URL host is reachable but the ' +
        'user/password was rejected. Checks:\n' +
        '  - password is the Supabase DATABASE password (Settings -> Database), not the service key\n' +
        '  - special characters in the password are percent-encoded (@ : / # + space ...)\n' +
        '  - if using the pooler host (*.pooler.supabase.com), the user must be "postgres.<project-ref>"\n' +
        '  - the string has no leftover [YOUR-PASSWORD] placeholder'
      );
    }
    throw err;
  }

  await client.query(`
    CREATE TABLE IF NOT EXISTS schema_migrations (
      version     text PRIMARY KEY,
      applied_at  timestamptz NOT NULL DEFAULT now()
    )
  `);

  const { rows } = await client.query('SELECT version FROM schema_migrations');
  const applied = new Set(rows.map((r) => r.version));
  const pending = migrationFiles.filter((f) => !applied.has(f));

  if (statusOnly) {
    console.log('Applied:');
    migrationFiles.filter((f) => applied.has(f)).forEach((f) => console.log(`  ok  ${f}`));
    console.log('Pending:');
    pending.forEach((f) => console.log(`  --  ${f}`));
    if (pending.length === 0) console.log('  (none)');
    return;
  }

  if (pending.length === 0) {
    console.log('No pending migrations.');
    return;
  }

  for (const file of pending) {
    const sql = readFileSync(join(MIGRATIONS_DIR, file), 'utf8');
    process.stdout.write(`Applying ${file} ... `);
    try {
      await client.query('BEGIN');
      await client.query(sql);
      await client.query('INSERT INTO schema_migrations (version) VALUES ($1)', [file]);
      await client.query('COMMIT');
      console.log('ok');
    } catch (err) {
      await client.query('ROLLBACK');
      console.log('FAILED');
      console.error(err.message);
      process.exit(1);
    }
  }

  console.log(`\nApplied ${pending.length} migration(s).`);
}

main()
  .catch((err) => {
    console.error(err);
    process.exit(1);
  })
  .finally(() => client.end());
