import { strict as assert } from "node:assert";
import { overlaps, buildOverlapQuery } from "./timeOverlap";

/**
 * Self-test function for time overlap utilities.
 * Run with: node --loader ts-node/esm src/server/utils/timeOverlap.spec.ts
 * Or compile and run: npx tsx src/server/utils/timeOverlap.spec.ts
 */
export function runSelfTest(): void {
  // eslint-disable-next-line no-console
  console.log("Running timeOverlap self-tests...");

  // Test 1: Overlapping ranges
  const start1 = new Date("2024-01-01T10:00:00Z");
  const end1 = new Date("2024-01-01T12:00:00Z");
  const start2 = new Date("2024-01-01T11:00:00Z");
  const end2 = new Date("2024-01-01T13:00:00Z");
  assert.strictEqual(overlaps(start1, end1, start2, end2), true, "Ranges should overlap");

  // Test 2: Non-overlapping ranges (A before B)
  const start3 = new Date("2024-01-01T10:00:00Z");
  const end3 = new Date("2024-01-01T11:00:00Z");
  const start4 = new Date("2024-01-01T12:00:00Z");
  const end4 = new Date("2024-01-01T13:00:00Z");
  assert.strictEqual(overlaps(start3, end3, start4, end4), false, "Ranges should not overlap (A before B)");

  // Test 3: Non-overlapping ranges (A after B)
  assert.strictEqual(overlaps(start4, end4, start3, end3), false, "Ranges should not overlap (A after B)");

  // Test 4: Adjacent ranges (touching but not overlapping)
  const start5 = new Date("2024-01-01T10:00:00Z");
  const end5 = new Date("2024-01-01T11:00:00Z");
  const start6 = new Date("2024-01-01T11:00:00Z");
  const end6 = new Date("2024-01-01T12:00:00Z");
  assert.strictEqual(overlaps(start5, end5, start6, end6), false, "Adjacent ranges should not overlap");

  // Test 5: One range completely contains the other
  const start7 = new Date("2024-01-01T10:00:00Z");
  const end7 = new Date("2024-01-01T14:00:00Z");
  const start8 = new Date("2024-01-01T11:00:00Z");
  const end8 = new Date("2024-01-01T13:00:00Z");
  assert.strictEqual(overlaps(start7, end7, start8, end8), true, "Containing range should overlap");
  assert.strictEqual(overlaps(start8, end8, start7, end7), true, "Contained range should overlap");

  // Test 6: Identical ranges
  assert.strictEqual(overlaps(start1, end1, start1, end1), true, "Identical ranges should overlap");

  // Test 7: buildOverlapQuery structure
  const query = buildOverlapQuery(start1, end1);
  assert.ok(query.startAt, "Query should have startAt field");
  assert.ok(query.endAt, "Query should have endAt field");
  assert.ok(query.startAt.$lt, "Query should have startAt.$lt");
  assert.ok(query.endAt.$gt, "Query should have endAt.$gt");
  assert.strictEqual(query.startAt.$lt.getTime(), end1.getTime(), "startAt.$lt should equal end");
  assert.strictEqual(query.endAt.$gt.getTime(), start1.getTime(), "endAt.$gt should equal start");

  // Test 8: buildOverlapQuery with different times
  const start9 = new Date("2024-01-01T09:00:00Z");
  const end9 = new Date("2024-01-01T15:00:00Z");
  const query2 = buildOverlapQuery(start9, end9);
  assert.strictEqual(query2.startAt.$lt.getTime(), end9.getTime(), "Query should use correct end time");
  assert.strictEqual(query2.endAt.$gt.getTime(), start9.getTime(), "Query should use correct start time");

  // eslint-disable-next-line no-console
  console.log("✅ All timeOverlap tests passed!");
}

// Run tests if this file is executed directly
if (typeof require !== "undefined" && require.main === module) {
  try {
    runSelfTest();
  } catch (error) {
    console.error("❌ Test failed:", error);
    process.exit(1);
  }
}
