import { createFileRoute } from "@tanstack/react-router";
import { useServerFn } from "@tanstack/react-start";
import { useState } from "react";
import { Mail } from "lucide-react";
import { toast } from "sonner";
import { generateEmail } from "@/lib/ai.functions";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { AiOutput, LoadingPulse, PageHeader } from "@/components/ai-output";
import { appendHistory } from "@/lib/history";

export const Route = createFileRoute("/_app/email")({
  head: () => ({ meta: [{ title: "Email Generator — Workplace AI" }] }),
  component: EmailPage,
});

const TONES = ["Professional", "Friendly", "Assertive", "Persuasive", "Apologetic", "Concise", "Enthusiastic"];

function EmailPage() {
  const call = useServerFn(generateEmail);
  const [purpose, setPurpose] = useState("");
  const [audience, setAudience] = useState("");
  const [tone, setTone] = useState("Professional");
  const [keyPoints, setKeyPoints] = useState("");
  const [output, setOutput] = useState("");
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!purpose.trim() || !audience.trim()) {
      toast.error("Please fill in purpose and audience.");
      return;
    }
    setLoading(true);
    setOutput("");
    try {
      const res = await call({ data: { purpose, audience, tone, keyPoints } });
      setOutput(res.email);
      appendHistory("email", { title: purpose.slice(0, 60), content: res.email });
    } catch (err) {
      toast.error(err instanceof Error ? err.message : "Failed to generate email.");
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-6xl">
      <PageHeader icon={Mail} title="Smart Email Generator" description="Craft professional emails tailored to tone and audience." />
      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader><CardTitle className="text-base">Compose</CardTitle></CardHeader>
          <CardContent>
            <form onSubmit={onSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="purpose">Purpose</Label>
                <Input id="purpose" placeholder="e.g. Follow up on the Q3 proposal" value={purpose} onChange={(e) => setPurpose(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label htmlFor="audience">Audience</Label>
                <Input id="audience" placeholder="e.g. Senior PM at a Fortune 500 client" value={audience} onChange={(e) => setAudience(e.target.value)} />
              </div>
              <div className="space-y-2">
                <Label>Tone</Label>
                <Select value={tone} onValueChange={setTone}>
                  <SelectTrigger><SelectValue /></SelectTrigger>
                  <SelectContent>
                    {TONES.map((t) => (<SelectItem key={t} value={t}>{t}</SelectItem>))}
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="key">Key points (optional)</Label>
                <Textarea id="key" rows={4} placeholder="Bullet the points you want included..." value={keyPoints} onChange={(e) => setKeyPoints(e.target.value)} />
              </div>
              <Button type="submit" disabled={loading} className="w-full">
                {loading ? "Generating..." : "Generate email"}
              </Button>
            </form>
          </CardContent>
        </Card>
        <div>
          {loading ? <LoadingPulse label="Drafting your email..." /> : <AiOutput content={output} empty="Your generated email will appear here." />}
        </div>
      </div>
    </div>
  );
}