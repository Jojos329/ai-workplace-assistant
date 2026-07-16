import { createFileRoute } from "@tanstack/react-router";

type Msg = { role: "system" | "user" | "assistant"; content: string };

const SYSTEM = `You are the AI Workplace Productivity Assistant. Follow these rules STRICTLY on every reply:

1. When the user asks a question, respond with exactly 3 numbered options or angles they can pick from (format: "1. ...", "2. ...", "3. ..."). Keep each option to one short sentence.
2. If the user's message clearly picks one of the previous options (e.g. "option 2", "the second one", or restates it), skip the options and instead ask ONE focused follow-up question to go deeper.
3. Keep every reply UNDER 150 words. Split into small paragraphs (1-2 sentences each). Use markdown.
4. End EVERY reply with a single line in this exact format, and nothing after it:
FOLLOWUPS: ["short question 1", "short question 2", "short question 3"]

Be professional, concise, and useful. Remind users that AI-generated content may require human review only when giving high-stakes advice.`;

export const Route = createFileRoute("/api/chat")({
  server: {
    handlers: {
      POST: async ({ request }) => {
        const key = process.env.LOVABLE_API_KEY;
        if (!key) return new Response("Missing LOVABLE_API_KEY", { status: 500 });

        let body: { messages?: Msg[] };
        try {
          body = (await request.json()) as { messages?: Msg[] };
        } catch {
          return new Response("Invalid JSON", { status: 400 });
        }
        const messages = body.messages ?? [];

        const upstream = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Lovable-API-Key": key,
          },
          body: JSON.stringify({
            model: "google/gemini-3-flash-preview",
            messages: [{ role: "system", content: SYSTEM }, ...messages],
            max_tokens: 200,
            temperature: 0.6,
            stream: true,
          }),
          signal: request.signal,
        });

        if (!upstream.ok || !upstream.body) {
          const text = await upstream.text().catch(() => "");
          const msg =
            upstream.status === 429
              ? "Rate limit exceeded. Please try again in a moment."
              : upstream.status === 402
                ? "AI credits exhausted. Please add credits to your workspace."
                : `AI request failed (${upstream.status}): ${text.slice(0, 200)}`;
          return new Response(msg, { status: upstream.status || 500 });
        }

        const encoder = new TextEncoder();
        const decoder = new TextDecoder();
        const reader = upstream.body.getReader();

        const stream = new ReadableStream<Uint8Array>({
          async start(controller) {
            let buffer = "";
            try {
              while (true) {
                const { done, value } = await reader.read();
                if (done) break;
                buffer += decoder.decode(value, { stream: true });
                let idx: number;
                while ((idx = buffer.indexOf("\n")) !== -1) {
                  const line = buffer.slice(0, idx).trim();
                  buffer = buffer.slice(idx + 1);
                  if (!line.startsWith("data:")) continue;
                  const payload = line.slice(5).trim();
                  if (payload === "[DONE]") {
                    controller.close();
                    return;
                  }
                  try {
                    const j = JSON.parse(payload) as {
                      choices?: Array<{ delta?: { content?: string } }>;
                    };
                    const delta = j.choices?.[0]?.delta?.content;
                    if (delta) controller.enqueue(encoder.encode(delta));
                  } catch {
                    /* ignore */
                  }
                }
              }
              controller.close();
            } catch (err) {
              controller.error(err);
            }
          },
          cancel() {
            reader.cancel().catch(() => {});
          },
        });

        return new Response(stream, {
          headers: {
            "Content-Type": "text/plain; charset=utf-8",
            "Cache-Control": "no-cache, no-transform",
          },
        });
      },
    },
  },
});