// /src/lib/db/index.ts
// Database factory: Selects JSON (dev) or MongoDB (production) based on environment configuration

import { DatabaseProvider } from './providers/interface.js';
import { JsonDatabaseProvider } from './providers/json-provider.js';
import { MongoDatabaseProvider } from './providers/mongodb-provider.js';

let dbProvider: DatabaseProvider | null = null;

export function getDatabaseProvider(): DatabaseProvider {
  if (dbProvider) return dbProvider;

  const useMock = process.env.USE_MOCK_DB !== 'false' || !process.env.MONGODB_URI;

  if (useMock) {
    if (process.env.NODE_ENV === 'production') {
      throw new Error(
        '[FATAL CONFIG ERROR] Running with local JSON database is strictly prohibited in production. ' +
        'Set USE_MOCK_DB=false and configure MONGODB_URI in Vercel project environment variables.'
      );
    }
    dbProvider = new JsonDatabaseProvider();
  } else {
    dbProvider = new MongoDatabaseProvider();
  }

  return dbProvider!;
}

export * from './providers/interface.js';
