/**
 * Checks if two time ranges overlap.
 * Two ranges overlap if: aStart < bEnd AND aEnd > bStart
 *
 * @param aStart Start time of range A
 * @param aEnd End time of range A
 * @param bStart Start time of range B
 * @param bEnd End time of range B
 * @returns true if the ranges overlap, false otherwise
 */
export function overlaps(aStart: Date, aEnd: Date, bStart: Date, bEnd: Date): boolean {
  return aStart < bEnd && aEnd > bStart;
}

/**
 * Builds a MongoDB query object to find documents with time ranges that overlap
 * with the given start and end times.
 *
 * The query matches documents where:
 *   existing.startAt < end AND existing.endAt > start
 *
 * @param start Start time of the range to check
 * @param end End time of the range to check
 * @returns MongoDB query object
 */
export function buildOverlapQuery(start: Date, end: Date): {
  startAt: { $lt: Date };
  endAt: { $gt: Date };
} {
  return {
    startAt: { $lt: end },
    endAt: { $gt: start },
  };
}
