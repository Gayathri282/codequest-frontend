/**
 * Converts a Supabase row (snake_case) to a camelCase object
 * with `_id` aliased from `id` so existing frontend code works unchanged.
 */
function toDoc(row) {
  if (!row) return null;
  if (Array.isArray(row)) return row.map(toDoc);
  const out = {};
  for (const [key, val] of Object.entries(row)) {
    if (key === 'id') {
      out._id = val;
      out.id  = val;
      continue;
    }
    const camel = key.replace(/_([a-z])/g, (_, c) => c.toUpperCase());
    out[camel] = val;
  }
  return out;
}

module.exports = { toDoc };
