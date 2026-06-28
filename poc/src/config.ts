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
