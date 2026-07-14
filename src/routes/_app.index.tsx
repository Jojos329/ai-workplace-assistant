import { createFileRoute, Link } from "@tanstack/react-router";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Mail, FileText, ListChecks, Search, MessagesSquare, ArrowRight, Sparkles } from "lucide-react";

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
  { to: "/email" as const, icon: Mail, title: "Smart Email Generator", desc: "Draft polished emails tuned to tone and audience." },
  { to: "/notes" as const, icon: FileText, title: "Meeting Notes Summarizer", desc: "Turn raw notes into summaries, actions and deadlines." },
  { to: "/tasks" as const, icon: ListChecks, title: "AI Task Planner", desc: "Prioritize and schedule your workload with AI." },
  { to: "/research" as const, icon: Search, title: "Research Assistant", desc: "Get structured insights and summaries on any topic." },
  { to: "/chat" as const, icon: MessagesSquare, title: "AI Chat", desc: "Have a working conversation with your assistant." },
];

function Dashboard() {
  return (
    <div className="mx-auto max-w-6xl">
      <div className="mb-8 rounded-2xl border bg-gradient-to-br from-primary/10 via-accent/40 to-background p-8">
        <div className="flex items-center gap-2 text-xs font-medium uppercase tracking-wider text-primary">
          <Sparkles className="h-3.5 w-3.5" /> Your AI workspace
        </div>
        <h1 className="mt-3 text-3xl font-semibold tracking-tight sm:text-4xl">
          Get more done, with AI on your side.
        </h1>
        <p className="mt-2 max-w-2xl text-sm text-muted-foreground sm:text-base">
          Draft emails, summarize meetings, plan your week, and research any topic — all from a single professional workspace.
        </p>
      </div>

      <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
        {features.map((f) => (
          <Link key={f.to} to={f.to} className="group">
            <Card className="h-full transition hover:border-primary/40 hover:shadow-md">
              <CardHeader>
                <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10 text-primary">
                  <f.icon className="h-5 w-5" />
                </div>
                <CardTitle className="mt-3 text-base">{f.title}</CardTitle>
                <CardDescription>{f.desc}</CardDescription>
              </CardHeader>
              <CardContent>
                <span className="inline-flex items-center gap-1 text-sm font-medium text-primary">
                  Open <ArrowRight className="h-3.5 w-3.5 transition group-hover:translate-x-0.5" />
                </span>
              </CardContent>
            </Card>
          </Link>
        ))}
      </div>

      <p className="mt-8 text-xs text-muted-foreground">
        AI-generated content may require human review.
      </p>
    </div>
  );
}