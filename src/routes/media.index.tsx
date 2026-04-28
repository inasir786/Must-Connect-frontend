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
import { useState, useEffect } from "react";
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
  Loader2,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMediaCategories,
  createMediaCategory,
  updateMediaCategory,
  deleteMediaCategory,
  type MediaCategory,
} from "@/api/media";

export const Route = createFileRoute("/media/")({
  head: () => ({
    meta: [
      { title: "Media Categories — MUST Connect" },
      { name: "description", content: "Browse media by university category." },
    ],
  }),
  component: MediaPage,
});

// ─── Icon registry ─────────────────────────────────────────────────────────────
// Keys must match the `icon` strings the API returns / accepts

const ICON_OPTIONS = [
  { key: "flask",       Icon: FlaskConical,  color: "text-chart-1" },
  { key: "building2",   Icon: Building2,     color: "text-chart-2" },
  { key: "graduation",  Icon: GraduationCap, color: "text-chart-3" },
  { key: "user",        Icon: UserRound,     color: "text-chart-4" },
  { key: "calendar",    Icon: CalendarDays,  color: "text-destructive" },
  { key: "building",    Icon: Building,      color: "text-chart-2" },
  { key: "coffee",      Icon: Coffee,        color: "text-chart-4" },
  { key: "car",         Icon: Car,           color: "text-chart-1" },
  { key: "book",        Icon: BookOpen,      color: "text-chart-2" },
  { key: "trophy",      Icon: Trophy,        color: "text-chart-3" },
  { key: "home",        Icon: Home,          color: "text-chart-5" },
  { key: "trees",       Icon: Trees,         color: "text-chart-3" },
  { key: "soup",        Icon: Soup,          color: "text-chart-4" },
  { key: "users",       Icon: Users,         color: "text-chart-3" },
  { key: "award",       Icon: Award,         color: "text-chart-3" },
  { key: "school",      Icon: GraduationCap, color: "text-chart-5" },
  { key: "mappin",      Icon: MapPin,        color: "text-destructive" },
] as const;

const BORDER_COLORS = [
  "border-t-blue-500",
  "border-t-purple-500",
  "border-t-emerald-500",
  "border-t-rose-500",
  "border-t-amber-500",
  "border-t-cyan-500",
  "border-t-indigo-500",
  "border-t-pink-500",
  "border-t-teal-500",
  "border-t-orange-500",
  "border-t-violet-500",
  "border-t-green-500",
];

const TEXT_COLORS = [
  "text-blue-600",
  "text-purple-600",
  "text-emerald-600",
  "text-rose-600",
  "text-amber-600",
  "text-cyan-600",
  "text-indigo-600",
  "text-pink-600",
  "text-teal-600",
  "text-orange-600",
  "text-violet-600",
  "text-green-600",
];

function getIconEntry(key: string) {
  return ICON_OPTIONS.find((i) => i.key === key) ?? ICON_OPTIONS[0];
}

function getBorderColor(index: number) {
  return BORDER_COLORS[index % BORDER_COLORS.length];
}

function getTextColor(index: number) {
  return TEXT_COLORS[index % TEXT_COLORS.length];
}

// ─── Icon Picker ──────────────────────────────────────────────────────────────

function IconPicker({
  value,
  onChange,
}: {
  value: string;
  onChange: (key: string) => void;
}) {
  return (
    <div className="grid grid-cols-6 gap-2">
      {ICON_OPTIONS.map(({ key, Icon, color }) => (
        <button
          key={key}
          type="button"
          onClick={() => onChange(key)}
          className={cn(
            "flex h-10 w-full items-center justify-center rounded-md border transition-colors",
            value === key
              ? "border-accent bg-accent/10"
              : "border-border bg-muted hover:bg-muted/70",
          )}
          aria-label={key}
        >
          <Icon className={cn("h-5 w-5", color)} />
        </button>
      ))}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

function MediaPage() {
  const [categories, setCategories] = useState<MediaCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create dialog
  const [createOpen, setCreateOpen] = useState(false);
  const [newTitle, setNewTitle] = useState("");
  const [newIcon, setNewIcon] = useState("building");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit dialog
  const [editTarget, setEditTarget] = useState<MediaCategory | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editIcon, setEditIcon] = useState("building");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getMediaCategories();
        if (!cancelled) setCategories(data);
      } catch {
        if (!cancelled) setError("Failed to load categories. Please try again.");
      } finally {
        if (!cancelled) setLoading(false);
      }
    };
    load();
    return () => { cancelled = true; };
  }, []);

  // ── Create ─────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!newTitle.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createMediaCategory({
        title: newTitle.trim(),
        icon: newIcon,
      });
      setCategories((prev) => [...prev, created]);
      setNewTitle("");
      setNewIcon("building");
      setCreateOpen(false);
    } catch {
      setCreateError("Failed to create category. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // ── Edit helpers ────────────────────────────────────────────────────────
  const openEdit = (e: React.MouseEvent, cat: MediaCategory) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTarget(cat);
    setEditTitle(cat.title);
    setEditIcon(cat.icon);
    setEditError(null);
  };

  const handleUpdate = async () => {
    if (!editTarget || !editTitle.trim()) return;
    setUpdating(true);
    setEditError(null);

    // Optimistic update
    const optimistic: MediaCategory = {
      ...editTarget,
      title: editTitle.trim(),
      icon: editIcon,
    };
    setCategories((prev) =>
      prev.map((c) => (c.id === editTarget.id ? optimistic : c))
    );
    setEditTarget(null);

    try {
      const updated = await updateMediaCategory(editTarget.id, {
        title: editTitle.trim(),
        icon: editIcon,
      });
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch {
      // Rollback
      setCategories((prev) =>
        prev.map((c) => (c.id === editTarget.id ? editTarget : c))
      );
      setEditTarget(editTarget);
      setEditError("Failed to update category. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // ── Delete ──────────────────────────────────────────────────────────────
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this category?")) return;
    try {
      await deleteMediaCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete category. Please try again.");
    }
  };

  // ── Render ──────────────────────────────────────────────────────────────
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
            onClick={() => setCreateOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Plus className="h-4 w-4" />
            Add Category
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Loading */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading categories…
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Grid */}
        {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            {categories.map((cat, index) => {
              const { Icon, color } = getIconEntry(cat.icon);
              const borderColor = getBorderColor(index);
              const textColor = getTextColor(index);

              return (
                <div
                  key={cat.id}
                  className={cn(
                    "group relative rounded-xl border border-t-4 border-border bg-card p-4 shadow-sm transition-shadow hover:shadow-md",
                    borderColor,
                  )}
                >
                  <Link
                    to="/media/$category"
                    params={{ category: String(cat.id) }}
                    search={{ name: cat.title }}
                    className="absolute inset-0 z-0 rounded-xl"
                    aria-label={`Open ${cat.title}`}
                  />
                  <div className="relative z-10 flex items-start justify-between pointer-events-none">
                    <div className={cn("flex h-10 w-10 items-center justify-center rounded-lg bg-muted", color)}>
                      <Icon className="h-5 w-5" />
                    </div>
                    <div className="flex items-center gap-1 opacity-60 transition-opacity group-hover:opacity-100 pointer-events-auto">
                      <button
                        type="button"
                        onClick={(e) => openEdit(e, cat)}
                        className="rounded p-1.5 hover:bg-muted"
                        aria-label="Edit"
                      >
                        <Pencil className="h-4 w-4 text-muted-foreground" />
                      </button>
                      <button
                        type="button"
                        onClick={(e) => handleDelete(e, cat.id)}
                        className="rounded p-1.5 hover:bg-muted"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-4 w-4 text-muted-foreground" />
                      </button>
                    </div>
                  </div>
                  <div className="relative z-10 mt-3 pointer-events-none">
                    <p className={cn("text-base font-semibold", textColor)}>{cat.title}</p>
                    <div className="mt-1 flex items-center gap-1.5 text-xs text-muted-foreground">
                      <ImageIcon className="h-3.5 w-3.5" />
                      <span>{cat.asset_count} items</span>
                    </div>
                  </div>
                </div>
              );
            })}

            {categories.length === 0 && (
              <p className="col-span-full text-sm text-muted-foreground">
                No categories yet. Click "Add Category" to create one.
              </p>
            )}
          </div>
        )}
      </div>

      {/* ── Create Dialog ── */}
      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); setCreateError(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-primary">Select Icon</Label>
              <IconPicker value={newIcon} onChange={setNewIcon} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="create-title" className="text-sm font-semibold">
                Category Title
              </Label>
              <Input
                id="create-title"
                placeholder="Enter category name"
                value={newTitle}
                onChange={(e) => setNewTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>
            {createError && (
              <p className="text-xs font-medium text-destructive">{createError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={creating}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleCreate}
              disabled={creating || !newTitle.trim()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            >
              {creating
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Check className="h-4 w-4" />}
              {creating ? "Creating…" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* ── Edit Dialog ── */}
      <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label className="text-sm font-semibold text-primary">Select Icon</Label>
              <IconPicker value={editIcon} onChange={setEditIcon} />
            </div>
            <div className="space-y-2">
              <Label htmlFor="edit-title" className="text-sm font-semibold">
                Category Title
              </Label>
              <Input
                id="edit-title"
                placeholder="Enter category name"
                value={editTitle}
                onChange={(e) => setEditTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleUpdate()}
              />
            </div>
            {editError && (
              <p className="text-xs font-medium text-destructive">{editError}</p>
            )}
          </div>
          <DialogFooter>
            <DialogClose asChild>
              <Button variant="ghost" disabled={updating}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleUpdate}
              disabled={updating || !editTitle.trim()}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            >
              {updating
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Check className="h-4 w-4" />}
              {updating ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}