import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { Mail, FileText, ListChecks, Search, MessagesSquare, ArrowRight, Sparkles } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/_app/")({
  head: () => ({
    meta: [
      { title: "Dashboard — AI Workplace Productivity Assistant" },
      { name: "description", content: "Your AI-powered workplace productivity command center." },
    ],
  }),
  component: Dashboard,
});

const features = [
  { to: "/email" as const, icon: Mail, title: "Email", desc: "Draft polished emails tuned to tone and audience." },
  { to: "/notes" as const, icon: FileText, title: "Meetings", desc: "Turn raw notes into summaries, actions and deadlines." },
  { to: "/tasks" as const, icon: ListChecks, title: "Tasks", desc: "Prioritize and schedule your workload with AI." },
  { to: "/research" as const, icon: Search, title: "Research", desc: "Get structured insights and summaries on any topic." },
  { to: "/chat" as const, icon: MessagesSquare, title: "Chat", desc: "Have a working conversation with your assistant." },
];

function Dashboard() {
  const [welcomeOpen, setWelcomeOpen] = useState(false);
  useEffect(() => {
    if (typeof window === "undefined") return;
    if (!localStorage.getItem("welcome_seen_v1")) {
      setWelcomeOpen(true);
    }
  }, []);
  const dismissWelcome = () => {
    if (typeof window !== "undefined") localStorage.setItem("welcome_seen_v1", "1");
    setWelcomeOpen(false);
  };

  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-10 text-center">
        <div className="inline-flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Your AI workspace
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Get more done, with AI on your side.
        </h1>
        <p className="mx-auto mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Pick a tool below to get started.
        </p>
      </div>

      <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="group">
            <div className="glass relative flex h-56 flex-col justify-between rounded-2xl p-6 transition-all duration-300 hover:-translate-y-1 hover:neon-glow">
              <div className="flex h-14 w-14 items-center justify-center rounded-xl bg-primary/15 text-primary ring-1 ring-primary/30">
                <f.icon className="h-7 w-7" />
              </div>
              <div>
                <h2 className="text-xl font-semibold tracking-tight">{f.title}</h2>
                <p className="mt-1 text-sm text-muted-foreground">{f.desc}</p>
                <span className="mt-3 inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </div>
            </div>
          </Link>
        ))}
      </div>

      <p className="mt-10 text-center text-xs text-muted-foreground">
        AI-generated content may require human review.
      </p>

      <Dialog open={welcomeOpen} onOpenChange={(o) => (!o ? dismissWelcome() : setWelcomeOpen(o))}>
        <DialogContent className="glass border-white/10 sm:max-w-md">
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2">
              <Sparkles className="h-4 w-4 text-primary" /> Welcome
            </DialogTitle>
            <DialogDescription className="pt-2 text-base">
              Click any tile to get started.
            </DialogDescription>
          </DialogHeader>
          <DialogFooter>
            <Button onClick={dismissWelcome}>Got it</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}