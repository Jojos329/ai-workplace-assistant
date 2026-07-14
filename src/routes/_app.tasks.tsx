import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { ListChecks } from "lucide-react";
import { toast } from "sonner";
import { planTasks } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiOutput, LoadingPulse, PageHeader } from "@/components/ai-output";
import { appendHistory } from "@/lib/history";

export const Route = createFileRoute("/_app/tasks")({
  head: () => ({ meta: [{ title: "Task Planner — Workplace AI" }] }),
  component: TasksPage,
});

function TasksPage() {
  const call = useServerFn(planTasks);
  const [tasks, setTasks] = useState("");
  const [timeframe, setTimeframe] = useState("this week");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (tasks.trim().length < 5) {
      toast.error("Add a few tasks to plan.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const res = await call({ data: { tasks, timeframe } });
      setOutput(res.plan);
      appendHistory("tasks", { title: `Plan for ${timeframe}`, content: res.plan });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to plan tasks.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader icon={ListChecks} title="AI Task Planner" description="Prioritize your tasks and get a suggested schedule." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Your tasks</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="timeframe">Timeframe</Label>
                <Input id="timeframe" value={timeframe} onChange={(e) => setTimeframe(e.target.value)} placeholder="e.g. this week, next 3 days" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="tasks">Tasks (one per line)</Label>
                <Textarea id="tasks" rows={12} placeholder={"Prep board deck\nReview candidate feedback\nUpdate roadmap doc\n..."} value={tasks} onChange={(e) => setTasks(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Planning..." : "Plan my tasks"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div>
          {loading ? <LoadingPulse label="Prioritizing your workload..." /> : <AiOutput content={output} empty="Your prioritized plan will appear here." />}
        </div>
      </div>
    </div>
  );
}