import assert from "node:assert/strict";
import test from "node:test";

import { formatRelativeTime, formatTooltipTime } from "./time.ts";

test("future timestamps use an absolute time in relative labels", () => {
  const future = new Date(2099, 0, 2, 3, 4).toISOString();
  assert.equal(formatRelativeTime(future), "2099年1月2日 03:04");
});

test("future timestamps use an absolute time in tooltips", () => {
  const future = new Date(2099, 0, 2, 3, 4).toISOString();
  assert.equal(formatTooltipTime(future), "2099-01-02 03:04:00 · 2099年1月2日 03:04");
});
