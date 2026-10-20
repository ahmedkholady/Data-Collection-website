import 'dotenv/config';
import { z } from 'zod';

const envSchema = z.object({
  PORT: z.coerce.number().int().positive().default(5000),
  NODE_ENV: z.enum(['development', 'production', 'test']).default('development'),
  JSON_LIMIT: z.string().default('10mb'),

  // Database Connection URL
  DATABASE_URL: z.string().min(1).optional(),

  // Standard PG Connection Parameters
  PGHOST: z.string().min(1).optional(),
  PGPORT: z.coerce.number().int().positive().optional(),
  PGDATABASE: z.string().min(1).optional(),
  PGUSER: z.string().min(1).optional(),
  PGPASSWORD: z.string().optional(),

  // Pool Configuration
  PGMAX_CLIENTS: z.coerce.number().int().positive().default(10),
  PGIDLE_TIMEOUT_MS: z.coerce.number().int().positive().default(30000),
  PGCONNECTION_TIMEOUT_MS: z.coerce.number().int().positive().default(5000),
});

/**
 * Validates process.env without exposing sensitive credentials in error logs.
 */
function validateEnv(rawEnv = process.env) {
  const result = envSchema.safeParse(rawEnv);

  if (!result.success) {
    const errorDetails = result.error.issues
      .map((issue) => `${issue.path.join('.')}: ${issue.message}`)
      .join('; ');
    throw new Error(`Environment validation failed: ${errorDetails}`);
  }

  return result.data;
}

export const env = validateEnv();

/**
 * Checks if database credentials or connection string are supplied.
 */
export function isDatabaseConfigured() {
  return Boolean(env.DATABASE_URL || env.PGDATABASE || env.PGHOST);
}

/**
 * Builds pg.Pool configuration object without exposing secrets.
 * Throws a descriptive error if database configuration is missing.
 */
export function getDbPoolConfig() {
  if (!isDatabaseConfigured()) {
    throw new Error(
      'Database is not configured. Please define DATABASE_URL or standard PG* environment variables (PGHOST, PGDATABASE, PGUSER, PGPASSWORD).'
    );
  }

  const poolOptions = {
    max: env.PGMAX_CLIENTS,
    idleTimeoutMillis: env.PGIDLE_TIMEOUT_MS,
    connectionTimeoutMillis: env.PGCONNECTION_TIMEOUT_MS,
  };

  if (env.DATABASE_URL) {
    return {
      connectionString: env.DATABASE_URL,
      ...poolOptions,
    };
  }

  return {
    host: env.PGHOST || 'localhost',
    port: env.PGPORT || 5432,
    database: env.PGDATABASE,
    user: env.PGUSER,
    password: env.PGPASSWORD,
    ...poolOptions,
  };
}

export { validateEnv };
