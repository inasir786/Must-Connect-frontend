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
  HelpCircle,
  GraduationCap,
  BookOpen,
  Landmark,
  Building2,
  Headphones,
  Briefcase,
  FlaskConical,
  Globe,
  HeartPulse,
  Hotel,
  Trophy,
  Shield,
  TrendingUp,
  Lightbulb,
  Flag,
  Star,
  Settings as SettingsIcon,
  Users,
  Check,
  Loader2,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getFaqCategories,
  createFaqCategory,
  updateFaqCategory,
  deleteFaqCategory,
  type FaqCategory,
} from "@/api/faqs";

export const Route = createFileRoute("/faqs/")({
  head: () => ({
    meta: [
      { title: "FAQ Categories" },
      { name: "description", content: "Organize and manage FAQ categories." },
    ],
  }),
  component: FaqCategoriesPage,
});

// ─── Icon registry ─────────────────────────────────────────────────────────────
// Keys must match the `icon` strings returned by the API (e.g. "graduation-cap")

const ICONS = [
  { key: "graduation-cap", Icon: GraduationCap },
  { key: "book", Icon: BookOpen },
  { key: "landmark", Icon: Landmark },
  { key: "building", Icon: Building2 },
  { key: "headphones", Icon: Headphones },
  { key: "briefcase", Icon: Briefcase },
  { key: "flask", Icon: FlaskConical },
  { key: "globe", Icon: Globe },
  { key: "heart", Icon: HeartPulse },
  { key: "hotel", Icon: Hotel },
  { key: "trophy", Icon: Trophy },
  { key: "shield", Icon: Shield },
  { key: "trending", Icon: TrendingUp },
  { key: "bulb", Icon: Lightbulb },
  { key: "flag", Icon: Flag },
  { key: "star", Icon: Star },
  { key: "settings", Icon: SettingsIcon },
  { key: "users", Icon: Users },
] as const;

// Cycle through accent colors for categories that don't have a color field
const ACCENT_COLORS = [
  "#3B82F6", "#8B5CF6", "#10B981", "#EF4444", "#F59E0B",
  "#6366F1", "#14B8A6", "#EC4899", "#06B6D4", "#F97316",
  "#A855F7", "#22C55E",
];

function getIcon(key: string) {
  return ICONS.find((i) => i.key === key)?.Icon ?? HelpCircle;
}

function getColor(index: number) {
  return ACCENT_COLORS[index % ACCENT_COLORS.length];
}

// ─── Component ─────────────────────────────────────────────────────────────────

function FaqCategoriesPage() {
  const [categories, setCategories] = useState<FaqCategory[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Create dialog state
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [iconKey, setIconKey] = useState<string>("graduation-cap");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  // Edit dialog state
  const [editTarget, setEditTarget] = useState<FaqCategory | null>(null);
  const [editTitle, setEditTitle] = useState("");
  const [editIconKey, setEditIconKey] = useState<string>("graduation-cap");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  // ── Fetch on mount ────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    const load = async () => {
      try {
        const data = await getFaqCategories();
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

  // ── Create ────────────────────────────────────────────────────────────────
  const handleCreate = async () => {
    if (!title.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      const created = await createFaqCategory({ title: title.trim(), icon: iconKey });
      setCategories((prev) => [...prev, created]);
      setTitle("");
      setIconKey("graduation-cap");
      setOpen(false);
    } catch {
      setCreateError("Failed to create category. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  // ── Delete ────────────────────────────────────────────────────────────────
  const handleDelete = async (e: React.MouseEvent, id: number) => {
    e.preventDefault();
    e.stopPropagation();
    if (!confirm("Delete this category?")) return;
    try {
      await deleteFaqCategory(id);
      setCategories((prev) => prev.filter((c) => c.id !== id));
    } catch {
      alert("Failed to delete category. Please try again.");
    }
  };

  // ── Edit helpers ──────────────────────────────────────────────────────────
  const openEdit = (e: React.MouseEvent, cat: FaqCategory) => {
    e.preventDefault();
    e.stopPropagation();
    setEditTarget(cat);
    setEditTitle(cat.title);
    setEditIconKey(cat.icon);
    setEditError(null);
  };

  const handleUpdate = async () => {
    if (!editTarget || !editTitle.trim()) return;
    setUpdating(true);
    setEditError(null);

    // Optimistic update — apply locally immediately so UI reflects change
    // even if the API returns a partial or empty body
    const optimistic: FaqCategory = {
      ...editTarget,
      title: editTitle.trim(),
      icon: editIconKey,
    };
    setCategories((prev) =>
      prev.map((c) => (c.id === editTarget.id ? optimistic : c))
    );
    setEditTarget(null);

    try {
      const updated = await updateFaqCategory(editTarget.id, {
        title: editTitle.trim(),
        icon: editIconKey,
      });
      // Reconcile with server response (faq_count etc. may differ)
      setCategories((prev) =>
        prev.map((c) => (c.id === updated.id ? updated : c))
      );
    } catch {
      // Rollback on failure
      setCategories((prev) =>
        prev.map((c) => (c.id === editTarget.id ? editTarget : c))
      );
      setEditTarget(editTarget);
      setEditError("Failed to update category. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">FAQ Categories</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Organize and manage frequently asked question categories
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add Category
          </Button>
        </div>

        {/* States */}
        {loading && (
          <div className="flex items-center gap-2 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading categories…
          </div>
        )}

        {error && !loading && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Grid */}
        {!loading && !error && (
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 xl:grid-cols-4">
            {categories.map((cat, index) => {
              const Icon = getIcon(cat.icon);
              const color = getColor(index);
              return (
                <Link
                  key={cat.id}
                  to="/faqs/$category"
                  params={{ category: String(cat.id) }}
                  search={{ name: cat.title }}
                  className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
                >
                  <div
                    className="absolute left-0 right-0 top-0 h-1"
                    style={{ backgroundColor: color }}
                  />
                  <div className="flex items-start justify-between">
                    <div
                      className="flex h-12 w-12 items-center justify-center rounded-lg"
                      style={{ backgroundColor: `${color}20`, color }}
                    >
                      <Icon className="h-6 w-6" />
                    </div>
                    <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        onClick={(e) => openEdit(e, cat)}
                        className="rounded p-1 text-muted-foreground hover:bg-accent"
                      >
                        <Pencil className="h-4 w-4" />
                      </button>
                      <button
                        onClick={(e) => handleDelete(e, cat.id)}
                        className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive"
                      >
                        <Trash2 className="h-4 w-4" />
                      </button>
                    </div>
                  </div>
                  <h3 className="mt-4 text-lg font-semibold text-foreground">{cat.title}</h3>
                  <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                    <HelpCircle className="h-3.5 w-3.5" /> {cat.faq_count} FAQs
                  </p>
                </Link>
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

      {/* Create Dialog */}
      <Dialog open={open} onOpenChange={(v) => { setOpen(v); setCreateError(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Add New Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">Select Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map(({ key, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setIconKey(key)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                      iconKey === key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="cat-title" className="mb-2 block text-sm font-medium">
                Category Title
              </Label>
              <Input
                id="cat-title"
                placeholder="Enter category name"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleCreate()}
              />
            </div>

            {createError && (
              <p className="text-xs font-medium text-destructive">{createError}</p>
            )}
          </div>

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="ghost" disabled={creating}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreate} disabled={creating || !title.trim()} className="gap-2">
              {creating
                ? <Loader2 className="h-4 w-4 animate-spin" />
                : <Check className="h-4 w-4" />}
              {creating ? "Creating…" : "Create Category"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Edit Dialog */}
      <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Edit Category</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div>
              <Label className="mb-2 block text-sm font-medium">Select Icon</Label>
              <div className="grid grid-cols-6 gap-2">
                {ICONS.map(({ key, Icon }) => (
                  <button
                    key={key}
                    type="button"
                    onClick={() => setEditIconKey(key)}
                    className={cn(
                      "flex h-10 w-10 items-center justify-center rounded-lg border transition-colors",
                      editIconKey === key
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border text-muted-foreground hover:bg-accent",
                    )}
                  >
                    <Icon className="h-5 w-5" />
                  </button>
                ))}
              </div>
            </div>

            <div>
              <Label htmlFor="edit-title" className="mb-2 block text-sm font-medium">
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

          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="ghost" disabled={updating}>Cancel</Button>
            </DialogClose>
            <Button onClick={handleUpdate} disabled={updating || !editTitle.trim()} className="gap-2">
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