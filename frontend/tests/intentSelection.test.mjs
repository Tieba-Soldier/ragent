import assert from "node:assert/strict";
import test from "node:test";

import { getSelectedVisibleRows } from "../src/pages/admin/intent-tree/selection.ts";

test("batch selection excludes IDs hidden by pagination or filters", () => {
  const currentPage = [{ id: 2 }, { id: 3 }];
  const selectedIds = new Set([1, 2, 4]);

  assert.deepEqual(getSelectedVisibleRows(currentPage, selectedIds), [{ id: 2 }]);
  assert.deepEqual(getSelectedVisibleRows([], selectedIds), []);
});
