// /src/lib/db/index.ts
// Database factory: Selects JSON (dev) or MongoDB (production) based on environment configuration

import { DatabaseProvider } from './providers/interface';
import { JsonDatabaseProvider } from './providers/json-provider';
import { MongoDatabaseProvider } from './providers/mongodb-provider';

let dbProvider: DatabaseProvider | null = null;

export function getDatabaseProvider(): DatabaseProvider {
  if (dbProvider) return dbProvider;

  const useMock = process.env.USE_MOCK_DB !== 'false' || !process.env.MONGODB_URI;

  if (useMock) {
    if (process.env.NODE_ENV === 'production' && process.env.USE_MOCK_DB === 'true') {
      console.warn('[SECURITY WARNING] Running with temporary JSON database in production. Add MONGODB_URI to connect to MongoDB.');
    }
    dbProvider = new JsonDatabaseProvider();
  } else {
    dbProvider = new MongoDatabaseProvider();
  }

  return dbProvider!;
}

export * from './providers/interface';
