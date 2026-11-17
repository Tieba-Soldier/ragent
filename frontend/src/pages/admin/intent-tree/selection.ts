export const getSelectedVisibleRows = <T extends { id: number }>(
  visibleRows: T[],
  selectedIds: ReadonlySet<number>
): T[] => visibleRows.filter((row) => selectedIds.has(row.id));
