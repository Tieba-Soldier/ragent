import assert from "node:assert/strict";
import { test } from "node:test";

import { createAgentStreamResponse } from "./useAgentStream.ts";
import { createStreamResponse } from "./useStreamResponse.ts";

function mockStream(...chunks) {
  const originalFetch = globalThis.fetch;
  globalThis.fetch = async () => {
    const body = new ReadableStream({
      start(controller) {
        for (const chunk of chunks) controller.enqueue(new TextEncoder().encode(chunk));
        controller.close();
      }
    });
    return new Response(body, { headers: { "content-type": "text/event-stream" } });
  };
  return () => {
    globalThis.fetch = originalFetch;
  };
}

test("chat stream dispatches the final SSE line without a trailing newline", async () => {
  const restore = mockStream("event: done\ndata: {}\n\nevent: do", "ne\ndata: {}");
  let done = 0;
  try {
    await createStreamResponse({ url: "/stream", retryCount: 0 }, { onDone: () => done++ }).start();
    assert.equal(done, 2);
  } finally {
    restore();
  }
});

test("agent stream dispatches the final SSE line without a trailing newline", async () => {
  const restore = mockStream("event: done\ndata: {}\n\nevent: do", "ne\ndata: {}");
  let done = 0;
  try {
    await createAgentStreamResponse(
      { url: "/stream", retryCount: 0 },
      { onDone: () => done++ }
    ).start();
    assert.equal(done, 2);
  } finally {
    restore();
  }
});
