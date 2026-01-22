import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { SidebarTrigger } from "@/components/ui/sidebar";

export default function PlansPage() {
  return (
    <div className="min-h-svh">
      <header className="flex flex-wrap items-center gap-4 border-b border-emerald-900/10 bg-white/70 px-6 py-4 backdrop-blur">
        <SidebarTrigger />
        <div>
          <p className="text-sm text-emerald-900/70">Weekly overview</p>
          <h1 className="font-display text-2xl text-emerald-950">Plans</h1>
        </div>
      </header>
      <main className="mx-auto w-full max-w-5xl px-6 py-8">
        <Card className="border-emerald-900/10 bg-white/80">
          <CardHeader>
            <CardTitle className="font-display text-xl text-emerald-950">
              Planner view coming soon
            </CardTitle>
          </CardHeader>
          <CardContent className="text-sm text-emerald-900/70">
            This is where weekly plans and overrides will live.
          </CardContent>
        </Card>
      </main>
    </div>
  );
}
