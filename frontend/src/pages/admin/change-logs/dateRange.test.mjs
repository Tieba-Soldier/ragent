import assert from "node:assert/strict";
import test from "node:test";

import { getDefaultBizChangeLogDateRange } from "./dateRange.ts";

test("clamps the prior month at a non-leap February boundary", () => {
  assert.deepEqual(getDefaultBizChangeLogDateRange(new Date(2026, 2, 31)), {
    beginTime: "2026-02-28",
    endTime: "2026-03-31"
  });
});

test("keeps leap day when stepping back from March 31", () => {
  assert.deepEqual(getDefaultBizChangeLogDateRange(new Date(2024, 2, 31)), {
    beginTime: "2024-02-29",
    endTime: "2024-03-31"
  });
});

test("steps back across the year boundary", () => {
  assert.deepEqual(getDefaultBizChangeLogDateRange(new Date(2026, 0, 31)), {
    beginTime: "2025-12-31",
    endTime: "2026-01-31"
  });
});
