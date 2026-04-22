import { createFileRoute } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import {
  Plus,
  Pencil,
  Trash2,
  Image as ImageIcon,
  FlaskConical,
  Building2,
  GraduationCap,
  UserRound,
  CalendarDays,
  Building,
  Coffee,
  Car,
  BookOpen,
  Trophy,
  Home,
  Trees,
} from "lucide-react";

export const Route = createFileRoute("/media")({
  head: () => ({
    meta: [
      { title: "Media Categories — MUST Connect" },
      { name: "description", content: "Browse media by university category." },
    ],
  }),
  component: MediaPage,
});

type Category = {
  name: string;
  items: number;
  icon: typeof FlaskConical;
  color: string; // token-based class for top border + icon
};

const categories: Category[] = [
  { name: "Labs", items: 124, icon: FlaskConical, color: "text-chart-1 border-t-chart-1" },
  { name: "Auditorium", items: 48, icon: Building2, color: "text-chart-2 border-t-chart-2" },
  { name: "Classes", items: 156, icon: GraduationCap, color: "text-chart-3 border-t-chart-3" },
  { name: "Faculty", items: 92, icon: UserRound, color: "text-chart-4 border-t-chart-4" },
  { name: "Events", items: 203, icon: CalendarDays, color: "text-chart-5 border-t-chart-5" },
  { name: "Facility", items: 87, icon: Building, color: "text-chart-2 border-t-chart-2" },
  { name: "Cafe", items: 34, icon: Coffee, color: "text-chart-4 border-t-chart-4" },
  { name: "Parking", items: 21, icon: Car, color: "text-chart-1 border-t-chart-1" },
  { name: "Library", items: 78, icon: BookOpen, color: "text-chart-2 border-t-chart-2" },
  { name: "Sports", items: 54, icon: Trophy, color: "text-chart-3 border-t-chart-3" },
  { name: "Hostel", items: 42, icon: Home, color: "text-chart-5 border-t-chart-5" },
  { name: "Campus", items: 98, icon: Trees, color: "text-chart-3 border-t-chart-3" },
];

function MediaPage() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Media Categories</h1>
            <p className="text-sm text-muted-foreground">
              Browse media by <span className="text-primary">university category</span>
            </p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Plus className="h-4 w-4" />
            Upload Media
          </Button>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.name}
                className={`group rounded-xl border border-t-4 border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${c.color}`}
              >
                <div className="flex items-start justify-between">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${c.color.split(" ")[0]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100">
                    <button className="rounded p-1.5 hover:bg-muted" aria-label="Edit">
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button className="rounded p-1.5 hover:bg-muted" aria-label="Delete">
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="mt-3">
                  <p className={`text-base font-semibold ${c.color.split(" ")[0]}`}>{c.name}</p>
                  <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                    <ImageIcon className="h-3.5 w-3.5" />
                    <span>{c.items} items</span>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </AdminLayout>
  );
}
