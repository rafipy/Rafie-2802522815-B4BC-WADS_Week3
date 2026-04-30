import Link from "next/link";
import { Button } from "@/components/ui/button";

export default function DashboardPage() {
  return (
    <div className="max-w-2xl space-y-8">
      <div>
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground mb-1">
          Dashboard
        </p>
        <h2 className="font-display text-3xl font-semibold tracking-tight">
          Welcome back.
        </h2>
        <p className="mt-2 text-muted-foreground">
          Ready to tackle your tasks for today?
        </p>
      </div>

      <div className="rounded-2xl border border-border bg-card p-6 shadow-sm">
        <h3 className="font-display text-lg font-semibold mb-1">My Tasks</h3>
        <p className="text-sm text-muted-foreground mb-4">
          View, add, and manage your to-do list.
        </p>
        <Button asChild>
          <Link href="/dashboard/todos">Open task list</Link>
        </Button>
      </div>
    </div>
  );
}
