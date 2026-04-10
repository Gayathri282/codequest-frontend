const { Pool } = require('pg');

/**
 * The DATABSE_URI in .env may contain literal special characters in the password
 * (like %) that aren't percent-encoded, which causes pg's URI parser to fail.
 * We parse it manually: extract user:password from the authority, encode the
 * password with encodeURIComponent, then rebuild the URI.
 */
function buildPool() {
  const raw = process.env.DATABASE_URL || process.env.DATABSE_URI || '';
  if (!raw) {
    console.warn('[DB] No database URI found in environment');
    return new Pool({ ssl: { rejectUnauthorized: false } });
  }

  try {
    // Match postgresql://user:password@host/db?params
    const m = raw.match(/^(postgresql|postgres):\/\/([^:]+):(.+)@(.+)$/);
    if (!m) throw new Error('Could not parse DB URI');

    const [, proto, user, password, rest] = m;
    const encoded = `${proto}://${user}:${encodeURIComponent(password)}@${rest}`;
    console.log('[DB] Using connection string:', encoded.replace(/:([^:@]{4})[^:@]*@/, ':$1****@')); // Hide password
    return new Pool({ connectionString: encoded, ssl: { rejectUnauthorized: false } });
  } catch (e) {
    console.warn('[DB] URI parse warning:', e.message, '— trying raw URI');
    console.log('[DB] Using raw connection string:', raw.replace(/:([^:@]{4})[^:@]*@/, ':$1****@'));
    return new Pool({ connectionString: raw, ssl: { rejectUnauthorized: false } });
  }
}

const pool = buildPool();
pool.on('error', (err) => console.error('[DB] Unexpected error:', err.message));

module.exports = pool;
