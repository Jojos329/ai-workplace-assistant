import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { FileText } from "lucide-react";
import { toast } from "sonner";
import { summarizeNotes } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { AiOutput, LoadingPulse, PageHeader } from "@/components/ai-output";
import { appendHistory } from "@/lib/history";

export const Route = createFileRoute("/_app/notes")({
  head: () => ({ meta: [{ title: "Meeting Notes — Workplace AI" }] }),
  component: NotesPage,
});

function NotesPage() {
  const call = useServerFn(summarizeNotes);
  const [notes, setNotes] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (notes.trim().length < 20) {
      toast.error("Please paste at least a few sentences of notes.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const res = await call({ data: { notes } });
      setOutput(res.summary);
      appendHistory("notes", { title: notes.slice(0, 60), content: res.summary });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to summarize.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader icon={FileText} title="Meeting Notes Summarizer" description="Extract key points, action items, and deadlines from your notes." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Paste your notes</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="notes">Raw meeting notes or transcript</Label>
                <Textarea id="notes" rows={16} placeholder="Paste transcript, bullet notes, or freeform recap..." value={notes} onChange={(e) => setNotes(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Summarizing..." : "Summarize meeting"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div>
          {loading ? <LoadingPulse label="Extracting key points..." /> : <AiOutput content={output} empty="Your structured summary will appear here." />}
        </div>
      </div>
    </div>
  );
}