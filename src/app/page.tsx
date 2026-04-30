import { redirect } from "next/navigation";
import { getSession } from "@/lib/auth";
import { Button } from "@/components/ui/button";
import Link from "next/link";

export default async function Home() {
  const session = await getSession();
  if (session) redirect("/dashboard");

  return (
    <div className="relative flex min-h-screen items-center justify-center overflow-hidden bg-background px-4">
      {/* Warm ambient glow */}
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0"
        style={{
          background:
            "radial-gradient(ellipse 70% 50% at 50% 60%, oklch(0.95 0.035 80 / 0.55), transparent)",
        }}
      />

      <div className="relative z-10 text-center space-y-6 max-w-lg">
        <p className="text-xs font-medium uppercase tracking-widest text-muted-foreground">
          Your personal task companion
        </p>
        <h1 className="font-display text-5xl font-semibold leading-tight tracking-tight text-foreground sm:text-6xl">
          Taskwise
        </h1>
        <p className="text-muted-foreground text-lg leading-relaxed">
          A warm, focused space to capture what matters and get things done.
        </p>
        <div className="flex flex-col gap-3 sm:flex-row sm:justify-center pt-2">
          <Button asChild size="lg" className="font-medium">
            <Link href="/login">Sign in</Link>
          </Button>
          <Button asChild variant="outline" size="lg" className="font-medium">
            <Link href="/register">Create account</Link>
          </Button>
        </div>
      </div>
    </div>
  );
}
