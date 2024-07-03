export function normalizeRecord(
  record: Record<string, number>,
): Record<string, number> {
  const values = Object.values(record);
  const min = Math.min(...values);
  const max = Math.max(...values);

  const normalizedRecord: Record<string, number> = {};
  for (const key in record) {
    // eslint-disable-next-line no-prototype-builtins
    if (record.hasOwnProperty(key)) {
      const value = record[key];
      normalizedRecord[key] = (value - min) / (max - min);
    }
  }

  return normalizedRecord;
}
