/**
 * scripts/migrate.mjs
 * Supabase に直接 PostgreSQL 接続してマイグレーションを適用する
 *
 * 使い方:
 *   DB_PASSWORD=<your-db-password> node scripts/migrate.mjs
 *
 * DB パスワードは Supabase Dashboard > Settings > Database >
 * "Connection string" または "Database password" で確認
 */

import pg from 'pg'
import { readFileSync } from 'fs'
import { fileURLToPath } from 'url'
import { dirname, join } from 'path'

const { Client } = pg

const __dirname = dirname(fileURLToPath(import.meta.url))

const PROJECT_REF = 'fmhjcjjzovwxwzapdaey'
const DB_PASSWORD = process.env.DB_PASSWORD

if (!DB_PASSWORD) {
  console.error('Error: DB_PASSWORD environment variable is required')
  console.error('Usage: DB_PASSWORD=<your-password> node scripts/migrate.mjs')
  console.error('Find your password: Supabase Dashboard > Settings > Database')
  process.exit(1)
}

// Session pooler (port 5432) - IPv4 対応
const client = new Client({
  host: `aws-0-ap-northeast-1.pooler.supabase.com`,
  port: 5432,
  database: 'postgres',
  user: `postgres.${PROJECT_REF}`,
  password: DB_PASSWORD,
  ssl: { rejectUnauthorized: false },
})

const sqlPath = join(__dirname, '../supabase/migrations/001_initial_schema.sql')
const sql = readFileSync(sqlPath, 'utf8')

try {
  await client.connect()
  console.log('Connected to database')

  await client.query(sql)
  console.log('Migration applied: 001_initial_schema.sql')

  const result = await client.query(`
    SELECT table_name FROM information_schema.tables
    WHERE table_schema = 'public'
    AND table_name IN ('tasks', 'documents', 'writing_styles')
    ORDER BY table_name
  `)
  console.log('Tables created:', result.rows.map(r => r.table_name).join(', '))
} catch (err) {
  console.error('Migration failed:', err.message)
  process.exit(1)
} finally {
  await client.end()
}
