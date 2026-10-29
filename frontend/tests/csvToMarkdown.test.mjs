import assert from "node:assert/strict";
import { readFile } from "node:fs/promises";
import test from "node:test";
import ts from "typescript";

const source = await readFile(new URL("../src/lib/csvToMarkdown.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
const { csvToMarkdown } = await import(`data:text/javascript,${encodeURIComponent(compiled)}`);

test("keeps a single quoted empty CSV field", () => {
  assert.equal(csvToMarkdown('""'), "|  |\n| --- |");
});

test("keeps a quoted empty record after a newline", () => {
  assert.equal(csvToMarkdown('name\n""'), "| name |\n| --- |\n|  |");
});

test("still ignores a terminal record separator", () => {
  assert.equal(csvToMarkdown("name\n"), "| name |\n| --- |");
});

test("preserves quoted commas, newlines and escaped quotes", () => {
  assert.equal(
    csvToMarkdown('name,notes\nAlice,"one,two\n""three"""'),
    '| name | notes |\n| --- | --- |\n| Alice | one,two<br>"three" |'
  );
});
