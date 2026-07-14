import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { MessagesSquare, Plus, Trash2, Send, User, Bot } from "lucide-react";
import { toast } from "sonner";
import { chatCompletion } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";

type Msg = { role: "user" | "assistant"; content: string };
type Thread = { id: string; title: string; updatedAt: number; messages: Msg[] };

const KEY = "wpai:chat:threads";

function loadThreads(): Thread[] {
  if (typeof window === "undefined") return [];
  try {
    return JSON.parse(window.localStorage.getItem(KEY) ?? "[]") as Thread[];
  } catch {
    return [];
  }
}
function saveThreads(t: Thread[]) {
  if (typeof window !== "undefined") window.localStorage.setItem(KEY, JSON.stringify(t));
}

export const Route = createFileRoute("/_app/chat")({
  head: () => ({ meta: [{ title: "AI Chat — Workplace AI" }] }),
  component: ChatPage,
});

function ChatPage() {
  const [threads, setThreads] = useState<Thread[]>([]);
  const [activeId, setActiveId] = useState<string | null>(null);
  const [ready, setReady] = useState(false);

  useEffect(() => {
    const existing = loadThreads();
    if (existing.length === 0) {
      const first: Thread = { id: crypto.randomUUID(), title: "New chat", updatedAt: Date.now(), messages: [] };
      saveThreads([first]);
      setThreads([first]);
      setActiveId(first.id);
    } else {
      setThreads(existing);
      setActiveId(existing[0].id);
    }
    setReady(true);
  }, []);

  const active = threads.find((t) => t.id === activeId) ?? null;

  function updateActive(updater: (t: Thread) => Thread) {
    setThreads((prev) => {
      const next = prev.map((t) => (t.id === activeId ? updater(t) : t));
      saveThreads(next);
      return next;
    });
  }

  function newThread() {
    const t: Thread = { id: crypto.randomUUID(), title: "New chat", updatedAt: Date.now(), messages: [] };
    const next = [t, ...threads];
    setThreads(next);
    saveThreads(next);
    setActiveId(t.id);
  }

  function deleteThread(id: string) {
    const next = threads.filter((t) => t.id !== id);
    if (next.length === 0) {
      const fresh: Thread = { id: crypto.randomUUID(), title: "New chat", updatedAt: Date.now(), messages: [] };
      saveThreads([fresh]);
      setThreads([fresh]);
      setActiveId(fresh.id);
      return;
    }
    saveThreads(next);
    setThreads(next);
    if (activeId === id) setActiveId(next[0].id);
  }

  if (!ready) return null;

  return (
    <div className="mx-auto flex h-[calc(100vh-8rem)] max-w-6xl gap-4">
      <aside className="hidden w-64 shrink-0 flex-col rounded-xl border bg-card md:flex">
        <div className="border-b p-3">
          <Button onClick={newThread} className="w-full" size="sm">
            <Plus className="mr-1 h-4 w-4" /> New chat
          </Button>
        </div>
        <div className="flex-1 overflow-y-auto p-2">
          {threads.map((t) => (
            <div
              key={t.id}
              className={cn(
                "group mb-1 flex items-center gap-2 rounded-md px-2 py-2 text-sm",
                t.id === activeId ? "bg-accent text-accent-foreground" : "hover:bg-muted",
              )}
            >
              <button onClick={() => setActiveId(t.id)} className="flex-1 truncate text-left" type="button">
                {t.title || "Untitled"}
              </button>
              <button onClick={() => deleteThread(t.id)} className="opacity-0 transition group-hover:opacity-100" aria-label="Delete thread" type="button">
                <Trash2 className="h-3.5 w-3.5 text-muted-foreground hover:text-destructive" />
              </button>
            </div>
          ))}
        </div>
      </aside>

      {active && <ChatWindow key={active.id} thread={active} onUpdate={updateActive} />}
    </div>
  );
}

function ChatWindow({ thread, onUpdate }: { thread: Thread; onUpdate: (u: (t: Thread) => Thread) => void }) {
  const call = useServerFn(chatCompletion);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const inputRef = useRef<HTMLTextAreaElement>(null);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, [thread.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [thread.messages, loading]);

  async function send() {
    const text = input.trim();
    if (!text || loading) return;
    const userMsg: Msg = { role: "user", content: text };
    const nextMsgs = [...thread.messages, userMsg];
    onUpdate((t) => ({
      ...t,
      messages: nextMsgs,
      title: t.messages.length === 0 ? text.slice(0, 40) : t.title,
      updatedAt: Date.now(),
    }));
    setInput("");
    setLoading(true);
    try {
      const res = await call({ data: { messages: nextMsgs } });
      const assistant: Msg = { role: "assistant", content: res.reply };
      onUpdate((t) => ({ ...t, messages: [...t.messages, assistant], updatedAt: Date.now() }));
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Chat failed.");
    } finally {
      setLoading(false);
      setTimeout(() => inputRef.current?.focus(), 0);
    }
  }

  function onKey(e: React.KeyboardEvent<HTMLTextAreaElement>) {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      send();
    }
  }

  return (
    <div className="flex flex-1 flex-col rounded-xl border bg-card">
      <div className="flex items-center gap-2 border-b px-4 py-3">
        <MessagesSquare className="h-4 w-4 text-primary" />
        <div className="text-sm font-medium">{thread.title}</div>
      </div>

      <div className="flex-1 overflow-y-auto p-4">
        {thread.messages.length === 0 && !loading && (
          <div className="flex h-full flex-col items-center justify-center text-center">
            <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-primary/10 text-primary">
              <Bot className="h-6 w-6" />
            </div>
            <h3 className="text-lg font-semibold">How can I help you work today?</h3>
            <p className="mt-1 max-w-sm text-sm text-muted-foreground">
              Ask about emails, meetings, planning, or anything work-related.
            </p>
          </div>
        )}

        <div className="space-y-5">
          {thread.messages.map((m, i) => (
            <MessageBubble key={i} msg={m} />
          ))}
          {loading && (
            <div className="flex items-start gap-3">
              <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-primary">
                <Bot className="h-4 w-4" />
              </div>
              <div className="flex items-center gap-1.5 pt-2">
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.3s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground [animation-delay:-0.15s]" />
                <span className="h-1.5 w-1.5 animate-bounce rounded-full bg-muted-foreground" />
              </div>
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="border-t p-3">
        <div className="flex items-end gap-2 rounded-lg border bg-background p-2 focus-within:ring-2 focus-within:ring-ring">
          <Textarea
            ref={inputRef}
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={onKey}
            rows={1}
            placeholder="Message your assistant..."
            className="min-h-[36px] resize-none border-0 bg-transparent p-1 shadow-none focus-visible:ring-0"
          />
          <Button size="icon" onClick={send} disabled={loading || !input.trim()} aria-label="Send">
            <Send className="h-4 w-4" />
          </Button>
        </div>
        <p className="mt-2 text-center text-[11px] text-muted-foreground">
          AI-generated content may require human review.
        </p>
      </div>
    </div>
  );
}

function MessageBubble({ msg }: { msg: Msg }) {
  const isUser = msg.role === "user";
  return (
    <div className={cn("flex items-start gap-3", isUser && "flex-row-reverse")}>
      <div className={cn("flex h-8 w-8 shrink-0 items-center justify-center rounded-full", isUser ? "bg-primary text-primary-foreground" : "bg-primary/10 text-primary")}>
        {isUser ? <User className="h-4 w-4" /> : <Bot className="h-4 w-4" />}
      </div>
      <div className={cn("max-w-[80%] rounded-lg px-4 py-2.5 text-sm", isUser ? "bg-primary text-primary-foreground" : "bg-muted text-foreground")}>
        {isUser ? (
          <p className="whitespace-pre-wrap">{msg.content}</p>
        ) : (
          <article className="prose prose-sm max-w-none prose-p:my-2 prose-headings:mt-3 prose-headings:mb-1.5 prose-li:my-0.5">
            <ReactMarkdown>{msg.content}</ReactMarkdown>
          </article>
        )}
      </div>
    </div>
  );
}