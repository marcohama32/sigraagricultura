import { createClient } from '@libsql/client'

const url = import.meta.env.VITE_TURSO_DB_URL as string
const authToken = import.meta.env.VITE_TURSO_DB_TOKEN as string

export const isLocalFallback = !url || url.includes('your-database-name')

if (isLocalFallback) {
  console.warn(
    '[DB] Turso credentials not configured. Using LocalStorage for development.\n' +
    'Update your .env file with VITE_TURSO_DB_URL and VITE_TURSO_DB_TOKEN from https://turso.tech'
  )
}

// Only create the real LibSQL client if we have a remote URL.
// The web version of @libsql/client doesn't support local :memory: or file: URLs.
export const db = isLocalFallback 
  ? null 
  : createClient({
      url,
      authToken,
    })

export async function initDb() {
  if (isLocalFallback || !db) return
  
  await db.execute(`
    CREATE TABLE IF NOT EXISTS policies (
      id                TEXT    PRIMARY KEY,
      tipo              TEXT    NOT NULL,
      titulo            TEXT    NOT NULL,
      descricao         TEXT    DEFAULT '',
      categoria         TEXT    NOT NULL,
      status            TEXT    NOT NULL DEFAULT 'Ativa',
      responsavel       TEXT    DEFAULT '',
      data_inicio       TEXT    DEFAULT '',
      data_fim          TEXT    DEFAULT '',
      metas             TEXT    DEFAULT '',
      documento_url     TEXT    DEFAULT '',
      conteudo_completo TEXT    DEFAULT '',
      ambito            TEXT    DEFAULT 'Nacional',
      provincias        TEXT    DEFAULT '',
      implementacao_pct INTEGER DEFAULT 0,
      estado_monitoria  TEXT    DEFAULT 'Em Curso',
      ultima_revisao    TEXT    DEFAULT '',
      proxima_revisao   TEXT    DEFAULT '',
      parceiros         TEXT    DEFAULT '',
      anexos            TEXT    DEFAULT '',
      created_at        TEXT    NOT NULL
    )
  `)
}
