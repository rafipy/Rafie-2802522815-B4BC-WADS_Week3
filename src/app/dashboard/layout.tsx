import { redirect } from "next/navigation";
import Link from "next/link";
import { getSession } from "@/lib/auth";
import LogoutButton from "@/components/logout-button";

export default async function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await getSession();

  if (!session) {
    redirect("/login");
  }

  const displayName = session.name?.trim() || session.email;
  const initial = (session.name?.trim()?.[0] ?? session.email?.[0] ?? "?").toUpperCase();

  return (
    <div className="min-h-screen bg-background">
      <header className="sticky top-0 z-10 border-b border-border/60 bg-card/80 backdrop-blur-md shadow-sm">
        <div className="container mx-auto flex items-center justify-between gap-4 py-3 px-4">
          <nav className="flex items-center gap-6">
            <Link
              href="/dashboard"
              className="font-display text-xl font-semibold text-foreground hover:text-primary transition-colors"
            >
              Taskwise
            </Link>
            <Link
              href="/dashboard/todos"
              className="text-sm font-medium text-muted-foreground hover:text-foreground transition-colors"
            >
              My Tasks
            </Link>
          </nav>
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2">
              {session.image ? (
                <img
                  src={session.image}
                  alt={displayName}
                  className="h-8 w-8 rounded-full object-cover ring-2 ring-border"
                  width={32}
                  height={32}
                />
              ) : (
                <div
                  className="flex h-8 w-8 items-center justify-center rounded-full bg-primary text-xs font-semibold text-primary-foreground ring-2 ring-border"
                  aria-hidden
                >
                  {initial}
                </div>
              )}
              <span className="hidden text-sm text-muted-foreground sm:inline">{displayName}</span>
            </div>
            <LogoutButton />
          </div>
        </div>
      </header>
      <main className="container mx-auto py-8 px-4 sm:py-10">{children}</main>
    </div>
  );
}
