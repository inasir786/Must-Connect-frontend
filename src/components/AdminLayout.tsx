import { useState, type ReactNode } from "react";
import { Menu, X } from "lucide-react";
import { AdminSidebar } from "./AdminSidebar";

interface AdminLayoutProps {
  children: ReactNode;
  header?: ReactNode;
}

export function AdminLayout({ children, header }: AdminLayoutProps) {
  const [open, setOpen] = useState(false);

  return (
    <div className="flex min-h-screen w-full overflow-x-hidden bg-[oklch(0.97_0.005_265)]">
      {/* Desktop sidebar — fixed */}
      <div className="hidden lg:block lg:w-48 lg:shrink-0">
        <div className="fixed inset-y-0 left-0 z-30 w-48">
          <AdminSidebar />
        </div>
      </div>

      {/* Mobile drawer — only mounted when open so fixed element never bleeds */}
      {open && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div
            className="absolute inset-0 bg-black/50"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-y-0 left-0 w-48">
            <AdminSidebar onNavigate={() => setOpen(false)} />
          </div>
        </div>
      )}

      {/* Main */}
      <div className="flex w-full min-w-0 flex-1 flex-col overflow-hidden">
        {/* Mobile header */}
        <header className="sticky top-0 z-20 flex h-14 items-center gap-3 border-b border-border bg-card px-4 lg:hidden">
          <button
            onClick={() => setOpen((o) => !o)}
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-muted"
            aria-label="Toggle sidebar"
          >
            {open ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
          <span className="font-semibold">MUST Connect</span>
        </header>

        {header && (
          <div className="sticky top-0 z-10 w-full border-b border-border bg-card px-6 py-4">
            {header}
          </div>
        )}
        <main className="flex-1 bg-[oklch(0.97_0.005_265)] p-4 sm:p-6 lg:p-8">
          {children}
        </main>
      </div>
    </div>
  );
}