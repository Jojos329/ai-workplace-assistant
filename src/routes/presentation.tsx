import { createFileRoute, useSearch, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef, useCallback, type ReactNode } from "react";
import {
  Mail,
  FileText,
  ListChecks,
  Search,
  MessagesSquare,
  ArrowRight,
  ArrowLeft,
  Maximize,
  Minimize,
  Sparkles,
  Zap,
  Clock,
  AlertTriangle,
  LayoutDashboard,
  CheckCircle2,
  Cpu,
  Layers,
  MessageSquare,
  Globe,
  ChevronRight,
  MousePointer,
  User,
  Cable,
} from "lucide-react";
import { z } from "zod";

export const Route = createFileRoute("/presentation")({
  validateSearch: z.object({
    slide: z.number().min(0).optional().catch(0),
  }),
  head: () => ({
    meta: [
      { title: "AI Workplace Productivity Assistant — Presentation" },
      { name: "description", content: "A full-screen presentation of the AI Workplace Productivity Assistant." },
    ],
  }),
  component: PresentationPage,
});

const TOTAL_SLIDES = 7;

function PresentationPage() {
  const { slide } = useSearch({ from: "/presentation" });
  const navigate = useNavigate({ from: "/presentation" });
  const [currentSlide, setCurrentSlide] = useState(Math.min(slide ?? 0, TOTAL_SLIDES - 1));
  const [scale, setScale] = useState(1);
  const [isFullscreen, setIsFullscreen] = useState(false);
  const [cursorVisible, setCursorVisible] = useState(true);
  const cursorTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  const goToSlide = useCallback((index: number) => {
    setCurrentSlide(Math.max(0, Math.min(index, TOTAL_SLIDES - 1)));
  }, []);

  const nextSlide = useCallback(() => goToSlide(currentSlide + 1), [currentSlide, goToSlide]);
  const prevSlide = useCallback(() => goToSlide(currentSlide - 1), [currentSlide, goToSlide]);

  useEffect(() => {
    navigate({ search: { slide: currentSlide }, replace: true });
    document.title = `${currentSlide + 1}/${TOTAL_SLIDES} — AI Workplace Productivity Assistant`;
  }, [currentSlide, navigate]);

  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "ArrowRight" || e.key === "ArrowDown" || e.key === " " || e.key === "PageDown") {
        e.preventDefault();
        nextSlide();
      } else if (e.key === "ArrowLeft" || e.key === "ArrowUp" || e.key === "PageUp") {
        e.preventDefault();
        prevSlide();
      } else if (e.key === "Home") {
        e.preventDefault();
        goToSlide(0);
      } else if (e.key === "End") {
        e.preventDefault();
        goToSlide(TOTAL_SLIDES - 1);
      } else if (e.key === "f" || e.key === "F5") {
        if (e.key === "F5") e.preventDefault();
        toggleFullscreen();
      } else if (e.key === "Escape") {
        if (document.fullscreenElement) document.exitFullscreen();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [nextSlide, prevSlide, goToSlide]);

  useEffect(() => {
    const handleResize = () => {
      if (!containerRef.current) return;
      const rect = containerRef.current.getBoundingClientRect();
      const scaleX = rect.width / 1920;
      const scaleY = rect.height / 1080;
      setScale(Math.min(scaleX, scaleY));
    };

    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  useEffect(() => {
    const handleFullscreenChange = () => {
      setIsFullscreen(!!document.fullscreenElement);
    };
    document.addEventListener("fullscreenchange", handleFullscreenChange);
    return () => document.removeEventListener("fullscreenchange", handleFullscreenChange);
  }, []);

  const resetCursorTimer = useCallback(() => {
    setCursorVisible(true);
    if (cursorTimer.current) clearTimeout(cursorTimer.current);
    cursorTimer.current = setTimeout(() => {
      if (isFullscreen) setCursorVisible(false);
    }, 2000);
  }, [isFullscreen]);

  useEffect(() => {
    window.addEventListener("mousemove", resetCursorTimer);
    return () => window.removeEventListener("mousemove", resetCursorTimer);
  }, [resetCursorTimer]);

  const toggleFullscreen = async () => {
    try {
      if (!document.fullscreenElement) {
        await document.documentElement.requestFullscreen();
      } else {
        await document.exitFullscreen();
      }
    } catch {
      // Fullscreen may be blocked in some contexts; ignore.
    }
  };

  const slideComponents = [
    <TitleSlide key="title" />,
    <ProblemSlide key="problem" />,
    <SolutionSlide key="solution" />,
    <FeaturesSlide key="features" />,
    <TechSlide key="tech" />,
    <FlowSlide key="flow" />,
    <EndingSlide key="ending" />,
  ];

  return (
    <div
      ref={containerRef}
      className="fixed inset-0 overflow-hidden bg-[#0a0a0f]"
      style={{ cursor: cursorVisible ? "auto" : "none" }}
    >
      <div className="absolute inset-0 slide-grid-bg opacity-40" />
      <div
        className="absolute inset-0 opacity-60"
        style={{
          background: "radial-gradient(ellipse at top, #1a1a2e 0%, #0a0a0f 60%)",
        }}
      />

      <div className="slide-wrapper" style={{ ["--scale" as string]: scale }}>
        <div className="slide-content flex flex-col bg-[#0a0a0f]/80 text-foreground">
          {slideComponents[currentSlide]}

          <div className="absolute bottom-0 left-0 right-0 flex h-20 items-center justify-between px-16">
            <div className="slide-chrome flex items-center gap-3 text-muted-foreground">
              <Sparkles className="h-5 w-5 text-primary" />
              <span>AI Workplace Productivity Assistant</span>
            </div>
            <div className="slide-chrome text-muted-foreground">
              {currentSlide + 1} / {TOTAL_SLIDES}
            </div>
          </div>

          <div className="absolute bottom-0 left-0 h-1 bg-primary/20" style={{ width: `${((currentSlide + 1) / TOTAL_SLIDES) * 100}%` }} />
        </div>
      </div>

      <div className="absolute bottom-6 right-6 flex items-center gap-2 opacity-0 transition-opacity duration-300 hover:opacity-100 focus-within:opacity-100">
        <button
          onClick={prevSlide}
          disabled={currentSlide === 0}
          className="rounded-lg bg-white/5 p-2 text-foreground backdrop-blur-sm transition hover:bg-white/10 disabled:opacity-30"
          aria-label="Previous slide"
        >
          <ArrowLeft className="h-5 w-5" />
        </button>
        <button
          onClick={nextSlide}
          disabled={currentSlide === TOTAL_SLIDES - 1}
          className="rounded-lg bg-white/5 p-2 text-foreground backdrop-blur-sm transition hover:bg-white/10 disabled:opacity-30"
          aria-label="Next slide"
        >
          <ArrowRight className="h-5 w-5" />
        </button>
        <button
          onClick={toggleFullscreen}
          className="rounded-lg bg-white/5 p-2 text-foreground backdrop-blur-sm transition hover:bg-white/10"
          aria-label="Toggle fullscreen"
        >
          {isFullscreen ? <Minimize className="h-5 w-5" /> : <Maximize className="h-5 w-5" />}
        </button>
      </div>
    </div>
  );
}

function SlideContainer({ children, className = "" }: { children: ReactNode; className?: string }) {
  return <div className={`h-full w-full p-20 pt-24 ${className}`}>{children}</div>;
}

function TitleSlide() {
  return (
    <SlideContainer className="flex flex-col items-center justify-center text-center">
      <div className="relative">
        <div className="absolute -inset-32 rounded-full bg-primary/10 blur-3xl" />
        <div className="slide-kicker mb-8 inline-flex items-center gap-3 rounded-full border border-primary/30 bg-primary/10 px-6 py-3 text-primary">
          <Sparkles className="h-5 w-5" /> Introducing the future of work
        </div>
      </div>
      <h1 className="slide-title-lg mt-4 max-w-[1400px] font-bold tracking-tight text-foreground">
        AI Workplace Productivity Assistant
      </h1>
      <p className="slide-subtitle mt-10 max-w-[1000px] text-muted-foreground">
        One intelligent workspace. Five AI tools. Zero busywork.
      </p>
      <div className="mt-16 flex items-center gap-4">
        <span className="slide-badge rounded-full border border-primary/40 bg-primary/10 px-6 py-3 text-primary">
          Press → to begin
        </span>
      </div>
    </SlideContainer>
  );
}

function ProblemSlide() {
  const problems = [
    { icon: LayoutDashboard, title: "Scattered tools", desc: "Email, notes, tasks, and research live in separate apps." },
    { icon: Clock, title: "Manual busywork", desc: "Hours lost drafting, summarizing, and prioritizing by hand." },
    { icon: AlertTriangle, title: "Context switching", desc: "Jumping between tabs kills focus and slows momentum." },
  ];

  return (
    <SlideContainer className="flex flex-col justify-center">
      <div className="slide-kicker mb-6 text-primary">The problem</div>
      <h2 className="slide-title max-w-[1100px] font-bold text-foreground">
        Scattered tools and manual busywork slow teams down.
      </h2>
      <p className="slide-body mt-8 max-w-[950px] text-muted-foreground">
        Professionals waste hours every day switching between apps, drafting routine messages, and trying to keep up with meeting notes and deadlines.
      </p>

      <div className="mt-20 grid grid-cols-3 gap-10">
        {problems.map((p) => (
          <div
            key={p.title}
            className="glass flex flex-col rounded-3xl p-10 transition-transform duration-300 hover:-translate-y-2 hover:neon-glow"
          >
            <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <p.icon className="h-10 w-10" />
            </div>
            <h3 className="slide-subtitle mt-10 font-semibold text-foreground">{p.title}</h3>
            <p className="slide-body mt-4 text-muted-foreground">{p.desc}</p>
          </div>
        ))}
      </div>
    </SlideContainer>
  );
}

function SolutionSlide() {
  const tools = [
    { icon: Mail, label: "Email" },
    { icon: FileText, label: "Meetings" },
    { icon: ListChecks, label: "Tasks" },
    { icon: Search, label: "Research" },
    { icon: MessagesSquare, label: "Chat" },
  ];

  return (
    <SlideContainer className="flex flex-col justify-center">
      <div className="slide-kicker mb-6 text-primary">The solution</div>
      <h2 className="slide-title max-w-[1100px] font-bold text-foreground">
        One central dashboard with every AI tool you need.
      </h2>
      <p className="slide-body mt-8 max-w-[950px] text-muted-foreground">
        A single, unified workspace where professionals can draft emails, summarize meetings, plan tasks, research topics, and chat with AI — all in one place.
      </p>

      <div className="mt-20 flex items-center justify-center gap-8">
        {tools.map((t) => (
          <div
            key={t.label}
            className="glass flex h-72 w-64 flex-col items-center justify-center gap-6 rounded-3xl transition-transform duration-300 hover:-translate-y-3 hover:neon-glow"
          >
            <div className="flex h-24 w-24 items-center justify-center rounded-3xl bg-primary/15 text-primary ring-1 ring-primary/30">
              <t.icon className="h-12 w-12" />
            </div>
            <span className="slide-subtitle font-semibold text-foreground">{t.label}</span>
          </div>
        ))}
      </div>
    </SlideContainer>
  );
}

function FeaturesSlide() {
  const features = [
    { icon: Mail, title: "Smart Email Generator", desc: "Choose tone and audience. Get a polished draft instantly." },
    { icon: FileText, title: "Meeting Summarizer", desc: "Turn raw notes into key points, actions, and deadlines." },
    { icon: ListChecks, title: "AI Task Planner", desc: "Prioritize and schedule your workload with intelligent suggestions." },
    { icon: Search, title: "Research Assistant", desc: "Generate structured insights and summaries on any topic." },
    { icon: MessagesSquare, title: "AI Chat", desc: "Have a working conversation with your assistant, saved by thread." },
  ];

  return (
    <SlideContainer className="flex flex-col justify-center">
      <div className="slide-kicker mb-6 text-primary">Features</div>
      <h2 className="slide-title max-w-[1100px] font-bold text-foreground">Five AI-powered tools for daily work.</h2>

      <div className="mt-16 grid grid-cols-3 gap-8">
        {features.slice(0, 3).map((f) => (
          <div
            key={f.title}
            className="glass flex flex-col rounded-3xl p-10 transition-transform duration-300 hover:-translate-y-2 hover:neon-glow"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <f.icon className="h-8 w-8" />
            </div>
            <h3 className="slide-subtitle mt-8 font-semibold text-foreground">{f.title}</h3>
            <p className="slide-body mt-4 text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid grid-cols-2 gap-8 px-48">
        {features.slice(3).map((f) => (
          <div
            key={f.title}
            className="glass flex flex-col rounded-3xl p-10 transition-transform duration-300 hover:-translate-y-2 hover:neon-glow"
          >
            <div className="flex h-16 w-16 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <f.icon className="h-8 w-8" />
            </div>
            <h3 className="slide-subtitle mt-8 font-semibold text-foreground">{f.title}</h3>
            <p className="slide-body mt-4 text-muted-foreground">{f.desc}</p>
          </div>
        ))}
      </div>
    </SlideContainer>
  );
}

function TechSlide() {
  const tech = [
    { icon: Zap, title: "Lovable", desc: "Rapidly built and deployed with AI-assisted development." },
    { icon: Layers, title: "shadcn/ui", desc: "Accessible, composable UI components with a clean design system." },
    { icon: Cpu, title: "TanStack Start", desc: "Modern full-stack React framework for speed and type safety." },
    { icon: MessageSquare, title: "Deep-conversation AI", desc: "Structured prompts tuned for professional, reliable output." },
  ];

  return (
    <SlideContainer className="flex flex-col justify-center">
      <div className="slide-kicker mb-6 text-primary">Tech highlights</div>
      <h2 className="slide-title max-w-[1100px] font-bold text-foreground">Built with modern, professional tooling.</h2>

      <div className="mt-20 grid grid-cols-2 gap-10">
        {tech.map((t) => (
          <div
            key={t.title}
            className="glass flex items-start gap-8 rounded-3xl p-10 transition-transform duration-300 hover:-translate-y-2 hover:neon-glow"
          >
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-2xl bg-primary/15 text-primary">
              <t.icon className="h-10 w-10" />
            </div>
            <div>
              <h3 className="slide-subtitle font-semibold text-foreground">{t.title}</h3>
              <p className="slide-body mt-3 text-muted-foreground">{t.desc}</p>
            </div>
          </div>
        ))}
      </div>
    </SlideContainer>
  );
}

function FlowSlide() {
  const steps = [
    { icon: LayoutDashboard, title: "Open the app", desc: "Land on a clean dashboard with all five tools." },
        { icon: MousePointer, title: "Pick a tool", desc: "Choose Email, Meetings, Tasks, Research, or Chat." },
    { icon: MessageSquare, title: "Ask the AI", desc: "Describe what you need in plain language." },
    { icon: CheckCircle2, title: "Get options", desc: "Review, edit, and use the AI-generated output." },
  ];

  return (
    <SlideContainer className="flex flex-col justify-center">
      <div className="slide-kicker mb-6 text-primary">User flow</div>
      <h2 className="slide-title max-w-[1100px] font-bold text-foreground">From idea to output in four simple steps.</h2>

      <div className="mt-24 flex items-center justify-between gap-6">
        {steps.map((s, i) => (
          <div key={s.title} className="flex flex-1 items-center">
            <div className="glass flex flex-1 flex-col items-center rounded-3xl p-8 text-center transition-transform duration-300 hover:-translate-y-2 hover:neon-glow">
              <div className="flex h-20 w-20 items-center justify-center rounded-2xl bg-primary/15 text-primary">
                <s.icon className="h-10 w-10" />
              </div>
              <div className="slide-body-lg mt-8 font-semibold text-foreground">{s.title}</div>
              <p className="slide-body mt-4 text-muted-foreground">{s.desc}</p>
            </div>
            {i < steps.length - 1 && (
              <ChevronRight className="mx-4 h-12 w-12 shrink-0 text-primary/40" />
            )}
          </div>
        ))}
      </div>
    </SlideContainer>
  );
}

function EndingSlide() {
  return (
    <SlideContainer className="flex flex-col items-center justify-center text-center">
      <div className="relative">
        <div className="absolute -inset-40 rounded-full bg-primary/10 blur-3xl" />
        <h2 className="slide-title-lg relative font-bold text-foreground">Thank you.</h2>
      </div>
      <p className="slide-subtitle mt-10 max-w-[900px] text-muted-foreground">
        The AI Workplace Productivity Assistant turns scattered work into one seamless, intelligent experience.
      </p>

      <div className="mt-20 grid grid-cols-3 gap-10">
        <div className="glass rounded-3xl p-10 transition-transform duration-300 hover:-translate-y-2 hover:neon-glow">
          <Globe className="mx-auto h-12 w-12 text-primary" />
          <h3 className="slide-subtitle mt-6 font-semibold text-foreground">Mobile app</h3>
          <p className="slide-body mt-3 text-muted-foreground">Take the assistant anywhere.</p>
        </div>
        <div className="glass rounded-3xl p-10 transition-transform duration-300 hover:-translate-y-2 hover:neon-glow">
          <User className="mx-auto h-12 w-12 text-primary" />
          <h3 className="slide-subtitle mt-6 font-semibold text-foreground">Team workspaces</h3>
          <p className="slide-body mt-3 text-muted-foreground">Collaborate with shared AI output.</p>
        </div>
        <div className="glass rounded-3xl p-10 transition-transform duration-300 hover:-translate-y-2 hover:neon-glow">
          <Plug className="mx-auto h-12 w-12 text-primary" />
          <h3 className="slide-subtitle mt-6 font-semibold text-foreground">Integrations</h3>
          <p className="slide-body mt-3 text-muted-foreground">Connect calendars, email, and docs.</p>
        </div>
      </div>

      <div className="mt-20">
        <span className="slide-badge rounded-full border border-primary/40 bg-primary/10 px-8 py-4 text-primary">
          Questions & Answers
        </span>
      </div>
    </SlideContainer>
  );
}
