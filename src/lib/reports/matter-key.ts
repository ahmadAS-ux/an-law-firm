/**
 * Returns a tagged composite key for distinct matter/case counting.
 * NEVER use raw caseId OR matterId — IDs are CUIDs and could collide in type.
 */
export function matterKey(wl: { caseId: string | null; matterId: string | null }): string | null {
  if (wl.matterId) return `matter:${wl.matterId}`;
  if (wl.caseId) return `case:${wl.caseId}`;
  return null;
}

/** Counts distinct matters across a worklog set using tagged keys. */
export function countDistinctMatters(
  workLogs: Array<{ caseId: string | null; matterId: string | null }>
): number {
  const keys = new Set<string>();
  for (const wl of workLogs) {
    const k = matterKey(wl);
    if (k) keys.add(k);
  }
  return keys.size;
}
