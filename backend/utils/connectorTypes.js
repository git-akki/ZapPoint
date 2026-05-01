// Canonical EV connector types. Single source of truth shared across the
// Station and EmergencyService models so filter dropdowns and validators
// agree. Previously each model embedded a 14-entry enum with case + space
// variants of the same connector — both noisy and useless for filtering.
export const CONNECTOR_TYPES = ['Type1', 'Type2', 'CCS', 'CHAdeMO', 'Tesla']

// Map any legacy / loose input to one of the canonical values.
// We normalize at write time (mongoose `set:` hook on the schema field)
// so DB rows converge on canonical values without a separate migration.
export function normalizeConnectorType(input) {
  if (input == null) return input
  const raw = String(input).trim().toLowerCase().replace(/\s+/g, '')
  // Map every legacy variant to its canonical value.
  const map = {
    'type1': 'Type1',
    'type2': 'Type2',
    // 'Type 3' / 'Type c' / bare 'Type' were data-entry typos in the original
    // schema. Folding them into Type2 (most common in India) keeps existing
    // rows queryable instead of dropping them on the floor.
    'type3': 'Type2',
    'typec': 'Type2',
    'type': 'Type2',
    'ccs': 'CCS',
    'chademo': 'CHAdeMO',
    'tesla': 'Tesla',
  }
  return map[raw] || input // fall through to mongoose's enum check on miss
}
