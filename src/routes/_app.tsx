import { createFileRoute, Outlet } from "@tanstack/react-router";
import { Link, useRouterState } from "@tanstack/react-router";
import { Settings, Sparkles, LayoutDashboard, Mail, FileText, ListChecks, Search, MessagesSquare } from "lucide-react";
import { Sheet, SheetContent, SheetHeader, SheetTitle, SheetTrigger, SheetDescription } from "@/components/ui/sheet";
import { Button } from "@/components/ui/button";
import { Toaster } from "@/components/ui/sonner";

export const Route = createFileRoute("/_app")({
  component: AppLayout,
});

const navItems = [
  { title: "Dashboard", url: "/", icon: LayoutDashboard },
  { title: "Email Generator", url: "/email", icon: Mail },
  { title: "Meeting Notes", url: "/notes", icon: FileText },
  { title: "Task Planner", url: "/tasks", icon: ListChecks },
  { title: "Research", url: "/research", icon: Search },
  { title: "AI Chat", url: "/chat", icon: MessagesSquare },
] as const;

function AppLayout() {
  const pathname = useRouterState({ select: (s) => s.location.pathname });
  return (
    <div className="flex min-h-screen w-full flex-col">
      <header className="sticky top-0 z-10 flex h-14 items-center justify-between border-b border-white/10 bg-background/40 px-4 backdrop-blur-xl">
        <Link to="/" className="flex items-center gap-2">
          <div className="flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground">
            <Sparkles className="h-4 w-4" />
          </div>
          <span className="text-sm font-semibold tracking-tight">Workplace AI</span>
        </Link>
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" aria-label="Settings">
              <Settings className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="glass border-white/10">
            <SheetHeader>
              <SheetTitle>Settings & Navigation</SheetTitle>
              <SheetDescription>Jump to any tool or manage preferences.</SheetDescription>
            </SheetHeader>
            <nav className="mt-6 flex flex-col gap-1">
              {navItems.map((item) => {
                const active = item.url === "/" ? pathname === "/" : pathname.startsWith(item.url);
                return (
                  <Link
                    key={item.url}
                    to={item.url}
                    className={`flex items-center gap-3 rounded-md px-3 py-2 text-sm transition-colors ${
                      active ? "bg-primary/15 text-primary" : "hover:bg-white/5"
                    }`}
                  >
                    <item.icon className="h-4 w-4" />
                    {item.title}
                  </Link>
                );
              })}
            </nav>
            <p className="mt-8 text-[10px] leading-snug text-muted-foreground">
              AI-generated content may require human review.
            </p>
          </SheetContent>
        </Sheet>
      </header>
      <main className="flex-1 p-6 lg:p-8">
        <Outlet />
      </main>
      <Toaster richColors position="top-right" />
    </div>
  );
}