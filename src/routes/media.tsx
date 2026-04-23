import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useState } from "react";
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
  Soup,
  Users,
  Award,
  MapPin,
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
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [selectedIcon, setSelectedIcon] = useState("FlaskConical");

  const iconOptions = [
    { name: "FlaskConical", Icon: FlaskConical, color: "text-chart-1" },
    { name: "Building2", Icon: Building2, color: "text-chart-2" },
    { name: "GraduationCap", Icon: GraduationCap, color: "text-chart-3" },
    { name: "UserRound", Icon: UserRound, color: "text-chart-4" },
    { name: "CalendarDays", Icon: CalendarDays, color: "text-destructive" },
    { name: "Building", Icon: Building, color: "text-chart-2" },
    { name: "Coffee", Icon: Coffee, color: "text-chart-4" },
    { name: "Car", Icon: Car, color: "text-chart-1" },
    { name: "BookOpen", Icon: BookOpen, color: "text-chart-2" },
    { name: "Trophy", Icon: Trophy, color: "text-chart-3" },
    { name: "Home", Icon: Home, color: "text-chart-5" },
    { name: "Trees", Icon: Trees, color: "text-chart-3" },
    { name: "Soup", Icon: Soup, color: "text-chart-4" },
    { name: "Users", Icon: Users, color: "text-chart-3" },
    { name: "Award", Icon: Award, color: "text-chart-3" },
    { name: "MapPin", Icon: MapPin, color: "text-destructive" },
  ];

  return (
    <AdminLayout
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Media Categories</h1>
            <p className="text-sm text-muted-foreground">
              Browse media by <span className="text-primary">university category</span>
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((c) => {
            const Icon = c.icon;
            return (
              <div
                key={c.name}
                className={`group relative rounded-xl border border-t-4 border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md ${c.color}`}
              >
                <Link
                  to="/media/$category"
                  params={{ category: c.name }}
                  className="absolute inset-0 z-0 rounded-xl"
                  aria-label={`Open ${c.name}`}
                />
                <div className="relative z-10 flex items-start justify-between pointer-events-none">
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg bg-muted ${c.color.split(" ")[0]}`}>
                    <Icon className="h-5 w-5" />
                  </div>
                  <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100 pointer-events-auto">
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                      className="rounded p-1.5 hover:bg-muted"
                      aria-label="Edit"
                    >
                      <Pencil className="h-4 w-4 text-muted-foreground" />
                    </button>
                    <button
                      type="button"
                      onClick={(e) => { e.stopPropagation(); e.preventDefault(); }}
                      className="rounded p-1.5 hover:bg-muted"
                      aria-label="Delete"
                    >
                      <Trash2 className="h-4 w-4 text-muted-foreground" />
                    </button>
                  </div>
                </div>
                <div className="relative z-10 mt-3 pointer-events-none">
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

      {/* Add Category dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>

          <div className="space-y-2">
            <Label className="text-sm font-semibold text-primary">Select Icon</Label>
            <div className="grid grid-cols-6 gap-2">
              {iconOptions.map(({ name, Icon, color }) => {
                const active = selectedIcon === name;
                return (
                  <button
                    key={name}
                    type="button"
                    onClick={() => setSelectedIcon(name)}
                    className={`flex h-10 w-full items-center justify-center rounded-md border transition-colors ${
                      active
                        ? "border-accent bg-accent/10"
                        : "border-border bg-muted hover:bg-muted/70"
                    }`}
                    aria-label={name}
                  >
                    <Icon className={`h-5 w-5 ${color}`} />
                  </button>
                );
              })}
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="category-title" className="text-sm font-semibold">
              Category Title
            </Label>
            <Input
              id="category-title"
              placeholder="Enter category name"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
            />
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => setOpen(false)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Plus className="h-4 w-4" />
              Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}
