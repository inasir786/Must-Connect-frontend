import { createFileRoute, Link } from "@tanstack/react-router";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { useState } from "react";
import { Plus, Search, Pencil, Trash2, X } from "lucide-react";
import { cn } from "@/lib/utils";

export const Route = createFileRoute("/faqs/$category")({
  head: ({ params }) => ({
    meta: [
      { title: `FAQs — ${decodeURIComponent(params.category)}` },
      { name: "description", content: "Manage FAQs for this category." },
    ],
  }),
  component: FaqCategoryDetail,
});

const SAMPLE_FAQS = [
  "How do I apply for admission to MUST?",
  "What documents are required for enrollment?",
  "What are the admission eligibility criteria?",
  "When does the admission process start?",
  "How can I check my admission status?",
  "What is the application fee for admission?",
  "Can international students apply for admission?",
  "What programs are available for undergraduate admission?",
  "Is there an entrance test for admission?",
  "How do I submit my admission application online?",
];

function FaqCategoryDetail() {
  const { category } = Route.useParams();
  const title = decodeURIComponent(category)
    .split("-")
    .map((s) => s.charAt(0).toUpperCase() + s.slice(1))
    .join(" ");

  const [open, setOpen] = useState(false);
  const [priority, setPriority] = useState<"low" | "medium" | "high">("medium");

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <nav className="mb-2 flex items-center gap-2 text-xs text-muted-foreground">
              <Link to="/faqs" className="hover:text-foreground">
                FAQs
              </Link>
              <span>›</span>
              <span className="text-foreground">{title}</span>
            </nav>
            <h1 className="text-3xl font-bold text-foreground">FAQs - {title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you need to know about the {title.toLowerCase()} process
            </p>
          </div>
          <Button onClick={() => setOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input placeholder="Search FAQs" className="pl-9" />
            </div>
            <Select defaultValue="newest">
              <SelectTrigger className="w-full sm:w-48">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="newest">Sort by: Newest</SelectItem>
                <SelectItem value="oldest">Sort by: Oldest</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="overflow-hidden rounded-xl border bg-card shadow-sm">
          <div className="grid grid-cols-[1fr_auto] items-center gap-4 border-b px-5 py-3 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
            <span>Question</span>
            <span>Actions</span>
          </div>
          <ul className="divide-y">
            {SAMPLE_FAQS.map((q, i) => (
              <li
                key={i}
                className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 hover:bg-accent/40"
              >
                <span className="text-sm font-medium text-primary">{q}</span>
                <div className="flex items-center gap-1">
                  <button className="rounded p-1.5 text-muted-foreground hover:bg-accent">
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive">
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </li>
            ))}
          </ul>
          <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
            <span>Showing 1 to 10 of 24 FAQs</span>
            <div className="flex gap-1">
              <button className="h-7 w-7 rounded border bg-primary text-primary-foreground">
                1
              </button>
              <button className="h-7 w-7 rounded border hover:bg-accent">2</button>
              <button className="h-7 w-7 rounded border hover:bg-accent">3</button>
            </div>
          </div>
        </div>
      </div>

      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 text-white">
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-white">⊕ Create New FAQ</DialogTitle>
            </DialogHeader>
            <DialogClose className="text-white/80 hover:text-white">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <Label className="mb-1.5 block text-sm">Select Category</Label>
              <Select defaultValue={category}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value={category}>{title}</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Question *</Label>
              <Input placeholder="Enter your question here..." />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Answer *</Label>
              <Textarea
                placeholder="Enter the detailed answer here..."
                className="min-h-[100px]"
              />
              <p className="mt-1 text-xs text-muted-foreground">
                Provide a clear and comprehensive answer to help students.
              </p>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Tags (Optional)</Label>
              <Input placeholder="e.g., undergraduate, deadline, documents" />
              <p className="mt-1 text-xs text-muted-foreground">
                Separate tags with commas for better searchability.
              </p>
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Priority</Label>
              <div className="grid grid-cols-3 gap-2">
                {([
                  { v: "low", label: "Low", color: "bg-green-500" },
                  { v: "medium", label: "Medium", color: "bg-yellow-500" },
                  { v: "high", label: "High", color: "bg-red-500" },
                ] as const).map((p) => (
                  <button
                    key={p.v}
                    type="button"
                    onClick={() => setPriority(p.v)}
                    className={cn(
                      "flex items-center justify-center gap-2 rounded-lg border py-2 text-sm transition-colors",
                      priority === p.v
                        ? "border-primary bg-primary/5"
                        : "border-border hover:bg-accent",
                    )}
                  >
                    <span className={cn("h-2 w-2 rounded-full", p.color)} />
                    {p.label}
                  </button>
                ))}
              </div>
            </div>
          </div>
          <DialogFooter className="gap-2 border-t bg-muted/30 px-5 py-3 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button onClick={() => setOpen(false)}>✓ Save FAQ</Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}