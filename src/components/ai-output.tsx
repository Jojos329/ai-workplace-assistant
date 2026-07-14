import ReactMarkdown from "react-markdown";
import { Card } from "@/components/ui/card";

export function AiOutput({ content, empty }: { content: string; empty?: string }) {
  if (!content) {
    return (
      <Card className="flex min-h-[240px] items-center justify-center border-dashed p-6 text-sm text-muted-foreground">
        {empty ?? "AI output will appear here."}
      </Card>
    );
  }
  return (
    <Card className="p-6">
      <article className="prose prose-sm max-w-none prose-headings:mt-4 prose-headings:mb-2 prose-p:my-2 prose-li:my-0.5">
        <ReactMarkdown>{content}</ReactMarkdown>
      </article>
      <p className="mt-4 border-t pt-3 text-xs text-muted-foreground">
        AI-generated content may require human review.
      </p>
    </Card>
  );
}

export function LoadingPulse({ label = "Thinking..." }: { label?: string }) {
  return (
    <Card className="flex min-h-[240px] flex-col items-center justify-center gap-3 border-dashed p-6">
      <div className="flex gap-1.5">
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.3s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary [animation-delay:-0.15s]" />
        <span className="h-2 w-2 animate-bounce rounded-full bg-primary" />
      </div>
      <p className="text-sm text-muted-foreground">{label}</p>
    </Card>
  );
}

export function PageHeader({
  title,
  description,
  icon: Icon,
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
}) {
  return (
    <div className="mb-6 flex items-start gap-3">
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Icon className="h-5 w-5" />
      </div>
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">{title}</h1>
        <p className="text-sm text-muted-foreground">{description}</p>
      </div>
    </div>
  );
}