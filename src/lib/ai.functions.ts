import { createServerFn } from "@tanstack/react-start";
import { z } from "zod";
import { callGateway, type ChatMsg } from "./ai-gateway.server";

/* ---------------- Email Generator ---------------- */

const EmailInput = z.object({
  purpose: z.string().min(1),
  audience: z.string().min(1),
  tone: z.string().min(1),
  keyPoints: z.string().optional().default(""),
});

export const generateEmail = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => EmailInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are an executive communications assistant. Write professional emails.

Return ONLY the email in this exact format:
Subject: <concise subject line>

<email body with greeting, 2-4 short paragraphs, and a sign-off>

Guidelines:
- Match the specified tone precisely.
- Tailor language to the specified audience.
- Be clear, actionable, and free of filler.
- Do not include any commentary outside the email.`;

    const user = `Purpose: ${data.purpose}
Audience: ${data.audience}
Tone: ${data.tone}
Key points to include: ${data.keyPoints || "(none specified)"}`;

    const text = await callGateway(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.7 },
    );
    return { email: text.trim() };
  });

/* ---------------- Meeting Notes Summarizer ---------------- */

const NotesInput = z.object({ notes: z.string().min(10) });

export const summarizeNotes = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => NotesInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a professional meeting summarizer. Analyze the meeting notes provided and return a well-structured markdown summary with these sections:

## Summary
A 2-3 sentence overview.

## Key Points
- Bullet points of the most important discussion items.

## Action Items
- [ ] Task — Owner (if mentioned) — Deadline (if mentioned)

## Decisions Made
- Bullet points of decisions.

## Deadlines
- Item — Date

Be concise, factual, and professional. Do not invent information not present in the notes.`;

    const text = await callGateway(
      [
        { role: "system", content: system },
        { role: "user", content: data.notes },
      ],
      { temperature: 0.3 },
    );
    return { summary: text.trim() };
  });

/* ---------------- AI Task Planner ---------------- */

const TasksInput = z.object({
  tasks: z.string().min(3),
  timeframe: z.string().optional().default("this week"),
});

export const planTasks = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => TasksInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are an expert productivity coach. Given a list of tasks, prioritize and schedule them.

Return a markdown plan with:

## Prioritized Tasks
A numbered list. For each task include:
**1. Task name** — Priority: High | Medium | Low
- Rationale: one short sentence.
- Suggested schedule: day/time slot within the given timeframe.
- Estimated effort: e.g. 30 min, 2h.

## Focus Recommendations
2-3 bullets on how to sequence the day/week for maximum output.

Use the Eisenhower matrix reasoning implicitly (urgent/important). Be practical and specific.`;

    const user = `Timeframe: ${data.timeframe}
Tasks:
${data.tasks}`;

    const text = await callGateway(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.4 },
    );
    return { plan: text.trim() };
  });

/* ---------------- Research Assistant ---------------- */

const ResearchInput = z.object({
  topic: z.string().min(2),
  depth: z.enum(["overview", "deep-dive"]).default("overview"),
});

export const research = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ResearchInput.parse(d))
  .handler(async ({ data }) => {
    const system = `You are a senior research analyst. Produce a clear, well-structured research briefing on the requested topic.

Return markdown with:

## Executive Summary
3-4 sentences.

## Key Insights
- 5-7 sharp bullet points with concrete details.

## Trends & Context
2-3 paragraphs of context.

## Considerations & Risks
- Bullets on caveats, risks, or open questions.

## Suggested Next Steps
- Actionable follow-ups.

Be factual and balanced. Where information is uncertain, say so. Do not fabricate statistics or citations.`;

    const user = `Topic: ${data.topic}
Depth: ${data.depth}`;

    const text = await callGateway(
      [
        { role: "system", content: system },
        { role: "user", content: user },
      ],
      { temperature: 0.5 },
    );
    return { report: text.trim() };
  });

/* ---------------- Chatbot ---------------- */

const ChatInput = z.object({
  messages: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});

export const chatCompletion = createServerFn({ method: "POST" })
  .inputValidator((d: unknown) => ChatInput.parse(d))
  .handler(async ({ data }) => {
    const system: ChatMsg = {
      role: "system",
      content: `You are the AI Workplace Productivity Assistant — a professional, concise assistant that helps knowledge workers with emails, meetings, planning, research, and general work questions. Format responses in clean markdown. Ask a clarifying question only when essential. Remind users that AI-generated content may require human review when giving advice with real-world consequences.`,
    };
    const text = await callGateway([system, ...data.messages], { temperature: 0.6 });
    return { reply: text.trim() };
  });