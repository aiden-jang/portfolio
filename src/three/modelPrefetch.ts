type Connection = { saveData?: boolean; effectiveType?: string };

export function canPrefetchModels(connection?: Connection): boolean {
  if (connection?.saveData) return false;
  return !['slow-2g', '2g', '3g'].includes(connection?.effectiveType ?? '');
}
