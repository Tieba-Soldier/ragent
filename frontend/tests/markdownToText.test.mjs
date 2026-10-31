import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";
import ts from "typescript";

const source = readFileSync(new URL("../src/lib/markdownToText.ts", import.meta.url), "utf8");
const compiled = ts.transpileModule(source, {
  compilerOptions: { module: ts.ModuleKind.ESNext, target: ts.ScriptTarget.ES2022 }
}).outputText;
const { markdownToPlainText } = await import(
  `data:text/javascript,${encodeURIComponent(compiled)}`
);

test("copies fenced code literally while removing surrounding Markdown", () => {
  const input = '# Example\n\n```js\nconst value = "*literal*";\n---\n| a | b |\n```\n\n**done**';
  assert.equal(
    markdownToPlainText(input),
    'Example\n\nconst value = "*literal*";\n---\n| a | b |\n\ndone'
  );
});

test("copies inline code literally", () => {
  assert.equal(markdownToPlainText("Use `*literal*` and **bold**"), "Use *literal* and bold");
});

test("still removes formatting outside code", () => {
  assert.equal(
    markdownToPlainText(
      "## Title\n\n| name | value |\n| --- | --- |\n| **A** | [link](https://example.com) |"
    ),
    "Title\n\nname  value\nA  link"
  );
});
