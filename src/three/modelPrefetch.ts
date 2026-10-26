type Connection = { saveData?: boolean; effectiveType?: string };

export function canPrefetchModels(connection?: Connection): boolean {
  return connection?.effectiveType === '4g' && !connection.saveData;
}
