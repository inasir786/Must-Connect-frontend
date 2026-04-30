import { Link, useLocation, useNavigate } from "@tanstack/react-router";
import {
  LayoutDashboard,
  Upload,
  Megaphone,
  CalendarCheck,
  Image as ImageIcon,
  HelpCircle,
  MessageSquare,
  Settings,
  GraduationCap,
  LogOut,
  Megaphone as MegaphoneIcon,
} from "lucide-react";
import { cn } from "@/lib/utils";

const navItems = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/batches", label: "Batches", icon: Upload },
  { to: "/campaigns", label: "Campaigns", icon: Megaphone },
  { to: "/visits", label: "Visits", icon: CalendarCheck },
  { to: "/media", label: "Media", icon: ImageIcon },
  { to: "/campaign-media", label: "Campaign Media", icon: MegaphoneIcon },
  { to: "/faqs", label: "FAQs", icon: HelpCircle },
  { to: "/chats", label: "Chats", icon: MessageSquare },
  { to: "/settings", label: "Settings", icon: Settings },
] as const;

interface AdminSidebarProps {
  onNavigate?: () => void;
}

export function AdminSidebar({ onNavigate }: AdminSidebarProps) {
  const location = useLocation();
  const navigate = useNavigate();

  const handleLogout = () => {
    document.cookie = "access_token=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;";
    navigate({ to: "/login" });
  };

  return (
    <aside className="flex h-full w-52 flex-col border-r border-sidebar-border bg-sidebar shadow-sm">
      {/* Logo */}
      <div className="flex items-center gap-2.5 border-b border-sidebar-border px-4 py-3.5">
        <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md bg-primary text-primary-foreground">
          <GraduationCap className="h-4.5 w-4.5" />
        </div>
        <div>
          <p className="text-xs font-bold text-sidebar-foreground">MUST Connect</p>
          <p className="text-[11px] text-muted-foreground">Admin Portal</p>
        </div>
      </div>

      {/* Nav */}
      <nav className="flex-1 space-y-0.5 overflow-y-auto px-2 py-3">
        {navItems.map((item, idx) => {
          const isActive =
            (item.label === "Dashboard" && location.pathname === "/") ||
            (item.label === "Batches" && location.pathname === "/batches") ||
            (item.label === "Campaigns" && location.pathname.startsWith("/campaigns")) ||
            (item.label === "Visits" && location.pathname.startsWith("/visits")) ||
            (item.label === "Media" && location.pathname.startsWith("/media")) ||
            (item.label === "Campaign Media" && location.pathname.startsWith("/campaign-media")) ||
            (item.label === "FAQs" && location.pathname.startsWith("/faqs")) ||
            (item.label === "Chats" && location.pathname.startsWith("/chats")) ||
            (item.label === "Settings" && location.pathname === "/settings");
          const Icon = item.icon;
          return (
            <Link
              key={`${item.label}-${idx}`}
              to={item.to}
              onClick={onNavigate}
              className={cn(
                "flex items-center gap-2.5 rounded-md px-2.5 py-2 text-xs font-medium transition-colors",
                isActive
                  ? "bg-primary text-primary-foreground shadow-sm"
                  : "text-sidebar-foreground hover:bg-sidebar-accent hover:text-sidebar-accent-foreground",
              )}
            >
              <Icon className="h-3.5 w-3.5 shrink-0" />
              <span>{item.label}</span>
            </Link>
          );
        })}
      </nav>

      {/* Footer */}
      <div className="border-t border-sidebar-border p-2">
        <div className="flex items-center gap-2 rounded-md px-2 py-1.5">
          <div className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-primary text-[11px] font-semibold text-primary-foreground">
            AU
          </div>
          <div className="min-w-0 flex-1">
            <p className="truncate text-xs font-medium text-sidebar-foreground">Admin User</p>
            <p className="truncate text-[11px] text-muted-foreground">admin@must.edu</p>
          </div>
          <button
            onClick={handleLogout}
            className="text-muted-foreground hover:text-foreground"
            aria-label="Sign out"
          >
            <LogOut className="h-3.5 w-3.5" />
          </button>
        </div>
      </div>
    </aside>
  );
}