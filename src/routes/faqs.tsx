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
} from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faqs")({
  head: () => ({
    meta: [
      { title: "FAQ Categories" },
      { name: "description", content: "Organize and manage FAQ categories." },
    ],
  }),
  component: FaqCategoriesPage,
});

const ICONS = [
  { key: "graduation", Icon: GraduationCap },
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

type Category = {
  slug: string;
  title: string;
  count: number;
  iconKey: string;
  color: string;
};

const INITIAL: Category[] = [
  { slug: "admissions", title: "Admissions", count: 24, iconKey: "graduation", color: "#3B82F6" },
  { slug: "academics", title: "Academics", count: 32, iconKey: "book", color: "#8B5CF6" },
  { slug: "financial-aid", title: "Financial Aid", count: 18, iconKey: "landmark", color: "#10B981" },
  { slug: "campus-life", title: "Campus Life", count: 15, iconKey: "building", color: "#EF4444" },
  { slug: "technical-support", title: "Technical Support", count: 21, iconKey: "headphones", color: "#F59E0B" },
  { slug: "career-services", title: "Career Services", count: 12, iconKey: "briefcase", color: "#6366F1" },
  { slug: "research-labs", title: "Research & Labs", count: 9, iconKey: "flask", color: "#14B8A6" },
  { slug: "international-students", title: "International Students", count: 14, iconKey: "globe", color: "#EC4899" },
  { slug: "health-wellness", title: "Health & Wellness", count: 11, iconKey: "heart", color: "#06B6D4" },
  { slug: "facilities", title: "Facilities", count: 8, iconKey: "hotel", color: "#F97316" },
  { slug: "sports-activities", title: "Sports & Activities", count: 7, iconKey: "trophy", color: "#A855F7" },
  { slug: "security-safety", title: "Security & Safety", count: 6, iconKey: "shield", color: "#22C55E" },
];

function getIcon(key: string) {
  return ICONS.find((i) => i.key === key)?.Icon ?? HelpCircle;
}

function FaqCategoriesPage() {
  const [categories, setCategories] = useState<Category[]>(INITIAL);
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [iconKey, setIconKey] = useState<string>("graduation");

  const handleCreate = () => {
    if (!title.trim()) return;
    const slug = title.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
    setCategories([
      ...categories,
      { slug, title: title.trim(), count: 0, iconKey, color: "#6366F1" },
    ]);
    setTitle("");
    setIconKey("graduation");
    setOpen(false);
  };

  return (
    <AdminLayout>
      <div className="space-y-6">
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

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {categories.map((cat) => {
            const Icon = getIcon(cat.iconKey);
            return (
              <Link
                key={cat.slug}
                to="/faqs/$category"
                params={{ category: cat.slug }}
                className="group relative overflow-hidden rounded-xl border bg-card p-5 shadow-sm transition-all hover:shadow-md"
              >
                <div
                  className="absolute left-0 right-0 top-0 h-1"
                  style={{ backgroundColor: cat.color }}
                />
                <div className="flex items-start justify-between">
                  <div
                    className="flex h-12 w-12 items-center justify-center rounded-lg"
                    style={{ backgroundColor: `${cat.color}20`, color: cat.color }}
                  >
                    <Icon className="h-6 w-6" />
                  </div>
                  <div className="flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <span
                      role="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-accent cursor-pointer"
                    >
                      <Pencil className="h-4 w-4" />
                    </span>
                    <span
                      role="button"
                      onClick={(e) => {
                        e.preventDefault();
                        e.stopPropagation();
                      }}
                      className="rounded p-1 text-muted-foreground hover:bg-accent hover:text-destructive cursor-pointer"
                    >
                      <Trash2 className="h-4 w-4" />
                    </span>
                  </div>
                </div>
                <h3 className="mt-4 text-lg font-semibold text-foreground">{cat.title}</h3>
                <p className="mt-1 flex items-center gap-1 text-sm text-muted-foreground">
                  <HelpCircle className="h-3.5 w-3.5" /> {cat.count} FAQs
                </p>
              </Link>
            );
          })}
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
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
              />
            </div>
          </div>
          <DialogFooter className="gap-2 sm:gap-0">
            <DialogClose asChild>
              <Button variant="ghost">Cancel</Button>
            </DialogClose>
            <Button onClick={handleCreate} className="gap-2">
              <Check className="h-4 w-4" /> Create Category
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}