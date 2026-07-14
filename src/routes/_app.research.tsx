import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Search } from "lucide-react";
import { toast } from "sonner";
import { research } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiOutput, LoadingPulse, PageHeader } from "@/components/ai-output";
import { appendHistory } from "@/lib/history";

export const Route = createFileRoute("/_app/research")({
  head: () => ({ meta: [{ title: "Research — Workplace AI" }] }),
  component: ResearchPage,
});

function ResearchPage() {
  const call = useServerFn(research);
  const [topic, setTopic] = useState("");
  const [depth, setDepth] = useState<"overview" | "deep-dive">("overview");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (topic.trim().length < 2) {
      toast.error("Enter a topic.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const res = await call({ data: { topic, depth } });
      setOutput(res.report);
      appendHistory("research", { title: topic.slice(0, 60), content: res.report });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to research topic.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader icon={Search} title="AI Research Assistant" description="Get structured insights and summaries on any topic." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Topic</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="topic">What should I research?</Label>
                <Input id="topic" value={topic} onChange={(e) => setTopic(e.target.value)} placeholder="e.g. Enterprise adoption of AI agents in 2026" />
              </div>
              <div className="space-y-2">
                <Label>Depth</Label>
                <Select value={depth} onValueChange={(v) => setDepth(v as "overview" | "deep-dive")}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    <SelectItem value="overview">Overview</SelectItem>
                    <SelectItem value="deep-dive">Deep dive</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Researching..." : "Run research"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div>
          {loading ? <LoadingPulse label="Compiling insights..." /> : <AiOutput content={output} empty="Your research briefing will appear here." />}
        </div>
      </div>
    </div>
  );
}