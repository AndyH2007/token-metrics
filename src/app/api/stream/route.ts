// Optional SSE endpoint for "Server freshness"

export const runtime = "nodejs";

export async function GET() {
  const encoder = new TextEncoder();

  const stream = new ReadableStream({
    start(controller) {
      let closed = false;

      const send = (msg: any) => {
        if (closed) return;
        try {
          controller.enqueue(
            encoder.encode(`data: ${JSON.stringify(msg)}\n\n`)
          );
        } catch {
          closed = true;
        }
      };

      // initial event
      send({ type: "hello", at: new Date().toISOString() });

      const interval = setInterval(() => {
        send({ type: "tick", at: new Date().toISOString() });
        if (closed) clearInterval(interval);
      }, 15000);
    },
    cancel() {
      // called when client disconnects
    },
  });

  return new Response(stream, {
    headers: {
      "Content-Type": "text/event-stream",
      "Cache-Control": "no-cache, no-transform",
      Connection: "keep-alive",
    },
  });
}
