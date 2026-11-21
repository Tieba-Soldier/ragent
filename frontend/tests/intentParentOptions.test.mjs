import assert from "node:assert/strict";
import test from "node:test";

import { collectDescendantIntentCodes } from "../src/pages/admin/intent-tree/parentOptions.ts";

test("collects a node and its descendants for parent choice exclusion", () => {
  const node = {
    id: 1,
    intentCode: "domain",
    name: "Domain",
    level: 0,
    children: [
      {
        id: 2,
        intentCode: "category",
        name: "Category",
        level: 1,
        children: [{ id: 3, intentCode: "topic", name: "Topic", level: 2 }]
      }
    ]
  };

  assert.deepEqual([...collectDescendantIntentCodes(node)], ["domain", "category", "topic"]);
  assert.equal(collectDescendantIntentCodes(node).has("unrelated"), false);
});
