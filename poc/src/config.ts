/**
 * Application configuration — the *only* place that reads `process.env`, so the
 * `realtime/` module stays environment-agnostic (it receives the key as a value,
 * it never reads the environment itself).
 */

const TOKEN_SIGNING_KEY_VAR = 'POC_TOKEN_SIGNING_KEY';

/**
 * Read the test-token signing key from the environment. Fails fast if the variable
 * is absent, empty, or blank (after trimming). The key is never hardcoded.
 */
export function loadTokenSigningKey(env: NodeJS.ProcessEnv = process.env): string {
  const key = env[TOKEN_SIGNING_KEY_VAR]?.trim() ?? '';
  if (key === '') {
    throw new Error(`Missing or empty environment variable: ${TOKEN_SIGNING_KEY_VAR}`);
  }
  return key;
}

const PORT_ENV_VAR = 'POC_PORT';
const DEFAULT_PORT = 8080;

/**
 * Read the server listen port from the environment. Optional: defaults to 8080 when
 * absent or blank; otherwise it must be an integer port in 1..65535, else fail-fast.
 */
export function loadPort(env: NodeJS.ProcessEnv = process.env): number {
  const raw = env[PORT_ENV_VAR]?.trim();
  if (raw === undefined || raw === '') return DEFAULT_PORT;
  const port = Number(raw);
  if (!/^\d+$/.test(raw) || port < 1 || port > 65535) {
    throw new Error(`Invalid ${PORT_ENV_VAR} "${raw}": expected an integer port in 1..65535`);
  }
  return port;
}

const DEMO_SEED_ENV_VAR = 'POC_DEMO_SEED';

/** Whether to run the additive demo seed at startup. Off unless `POC_DEMO_SEED` is `1`/`true`. */
export function loadDemoSeed(env: NodeJS.ProcessEnv = process.env): boolean {
  const raw = env[DEMO_SEED_ENV_VAR]?.trim();
  return raw === '1' || raw === 'true';
}
