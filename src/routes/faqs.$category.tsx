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
import { useState, useEffect, useCallback, useRef } from "react";
import { Plus, Search, Pencil, Trash2, X, Loader2, ChevronLeft, ChevronRight } from "lucide-react";
import {
  getFaqs,
  createFaq,
  updateFaq,
  deleteFaq,
  type FaqItem,
} from "@/api/faqs";

export const Route = createFileRoute("/faqs/$category")({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : "",
  }),
  head: ({ params, search }) => ({
    meta: [
      { title: `FAQs — ${(search as any)?.name || params.category}` },
      { name: "description", content: "Manage FAQs for this category." },
    ],
  }),
  component: FaqCategoryDetail,
});

function FaqCategoryDetail() {
  const { category } = Route.useParams();
  const { name: categoryName } = Route.useSearch();

  const categoryId = Number(category);
  const title = categoryName || `Category ${categoryId}`;

  const [allFaqs, setAllFaqs] = useState<FaqItem[]>([]);
  const [faqs, setFaqs] = useState<FaqItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 10;

  const [searchInput, setSearchInput] = useState("");
  const [sort, setSort] = useState<"newest" | "oldest">("newest");
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const [createOpen, setCreateOpen] = useState(false);
  const [newQuestion, setNewQuestion] = useState("");
  const [newAnswer, setNewAnswer] = useState("");
  const [creating, setCreating] = useState(false);
  const [createError, setCreateError] = useState<string | null>(null);

  const [editTarget, setEditTarget] = useState<FaqItem | null>(null);
  const [editQuestion, setEditQuestion] = useState("");
  const [editAnswer, setEditAnswer] = useState("");
  const [updating, setUpdating] = useState(false);
  const [editError, setEditError] = useState<string | null>(null);

  const fetchFaqs = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getFaqs(categoryId, p, PER_PAGE);
      setAllFaqs(res.items);
      setTotalPages(res.meta.total_pages);
      setTotal(res.meta.total);
    } catch {
      setError("Failed to load FAQs. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => {
    fetchFaqs(page);
  }, [fetchFaqs, page]);

  useEffect(() => {
    let result = [...allFaqs];

    const q = searchInput.trim().toLowerCase();
    if (q) {
      result = result.filter((f) =>
        f.question.toLowerCase().includes(q)
      );
    }

    result.sort((a, b) => {
      const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      return sort === "newest" ? -diff : diff;
    });

    setFaqs(result);
  }, [allFaqs, searchInput, sort]);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearchInput(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setPage(1), 300);
  };

  const handleSearchClear = () => {
    setSearchInput("");
    setPage(1);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
  };

  const handleSortChange = (val: string) => {
    setSort(val as "newest" | "oldest");
    setPage(1);
  };

  const handleCreate = async () => {
    if (!newQuestion.trim() || !newAnswer.trim()) return;
    setCreating(true);
    setCreateError(null);
    try {
      await createFaq({
        category_id: categoryId,
        question: newQuestion.trim(),
        answer: newAnswer.trim(),
      });
      await fetchFaqs(page);
      setNewQuestion("");
      setNewAnswer("");
      setCreateOpen(false);
    } catch {
      setCreateError("Failed to create FAQ. Please try again.");
    } finally {
      setCreating(false);
    }
  };

  const openEdit = (faq: FaqItem) => {
    setEditTarget(faq);
    setEditQuestion(faq.question);
    setEditAnswer(faq.answer);
    setEditError(null);
  };

  const handleUpdate = async () => {
    if (!editTarget || !editQuestion.trim() || !editAnswer.trim()) return;
    setUpdating(true);
    setEditError(null);

    const optimistic: FaqItem = {
      ...editTarget,
      question: editQuestion.trim(),
      answer: editAnswer.trim(),
    };
    setFaqs((prev) => prev.map((f) => (f.id === editTarget.id ? optimistic : f)));
    setEditTarget(null);

    try {
      const updated = await updateFaq(editTarget.id, {
        question: editQuestion.trim(),
        answer: editAnswer.trim(),
      });
      setFaqs((prev) => prev.map((f) => (f.id === updated.id ? updated : f)));
    } catch {
      setFaqs((prev) => prev.map((f) => (f.id === editTarget.id ? editTarget : f)));
      setEditTarget(editTarget);
      setEditError("Failed to update FAQ. Please try again.");
    } finally {
      setUpdating(false);
    }
  };

  const handleDelete = async (id: number) => {
    if (!confirm("Delete this FAQ?")) return;
    try {
      await deleteFaq(id);
      setFaqs((prev) => prev.filter((f) => f.id !== id));
      setTotal((t) => t - 1);
    } catch {
      alert("Failed to delete FAQ. Please try again.");
    }
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const displayTotal = searchInput.trim() ? faqs.length : total;
  const startItem = displayTotal === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endItem = Math.min(page * PER_PAGE, displayTotal);

  return (
    <AdminLayout>
      <div className="space-y-6">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h1 className="text-3xl font-bold text-foreground">FAQs — {title}</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Everything you need to know about {title.toLowerCase()}
            </p>
          </div>
          <Button onClick={() => setCreateOpen(true)} className="gap-2">
            <Plus className="h-4 w-4" /> Add FAQ
          </Button>
        </div>

        <div className="rounded-xl border bg-card p-4 shadow-sm">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
            <div className="relative flex-1 max-w-md">
              <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search FAQs"
                className="pl-9 pr-8"
                value={searchInput}
                onChange={handleSearchChange}
              />
              {searchInput && (
                <button
                  onClick={handleSearchClear}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
            <Select value={sort} onValueChange={handleSortChange}>
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

          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading FAQs…
            </div>
          )}

          {error && !loading && (
            <p className="px-5 py-8 text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && (
            <ul className="divide-y">
              {faqs.map((faq) => (
                <li
                  key={faq.id}
                  className="grid grid-cols-[1fr_auto] items-center gap-4 px-5 py-3.5 hover:bg-accent/40"
                >
                  <span className="text-sm font-medium text-primary">{faq.question}</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() => openEdit(faq)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-accent"
                    >
                      <Pencil className="h-4 w-4" />
                    </button>
                    <button
                      onClick={() => handleDelete(faq.id)}
                      className="rounded p-1.5 text-muted-foreground hover:bg-accent hover:text-destructive"
                    >
                      <Trash2 className="h-4 w-4" />
                    </button>
                  </div>
                </li>
              ))}

              {faqs.length === 0 && (
                <li className="px-5 py-8 text-center text-sm text-muted-foreground">
                  {searchInput.trim()
                    ? `No FAQs found for "${searchInput.trim()}".`
                    : `No FAQs yet. Click "Add FAQ" to create one.`}
                </li>
              )}
            </ul>
          )}

          {!loading && !error && displayTotal > 0 && (
            <div className="flex items-center justify-between border-t px-5 py-3 text-xs text-muted-foreground">
              <span>
                Showing {startItem}–{endItem} of {displayTotal} FAQs
                {searchInput.trim() && (
                  <span className="ml-1 text-muted-foreground/70">(filtered)</span>
                )}
              </span>
              <div className="flex items-center gap-1">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="flex h-7 w-7 items-center justify-center rounded border hover:bg-accent disabled:opacity-40"
                >
                  <ChevronLeft className="h-3.5 w-3.5" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={`h-7 w-7 rounded border text-xs ${
                      p === page
                        ? "bg-primary text-primary-foreground"
                        : "hover:bg-accent"
                    }`}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="flex h-7 w-7 items-center justify-center rounded border hover:bg-accent disabled:opacity-40"
                >
                  <ChevronRight className="h-3.5 w-3.5" />
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <Dialog open={createOpen} onOpenChange={(v) => { setCreateOpen(v); setCreateError(null); }}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 text-white">
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-white">Create New FAQ</DialogTitle>
            </DialogHeader>
            <DialogClose className="text-white/80 hover:text-white">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <Label className="mb-1.5 block text-sm">Category</Label>
              <Input value={title} disabled className="bg-muted" />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Question *</Label>
              <Input
                placeholder="Enter your question here..."
                value={newQuestion}
                onChange={(e) => setNewQuestion(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Answer *</Label>
              <Textarea
                placeholder="Enter the detailed answer here..."
                className="min-h-[100px]"
                value={newAnswer}
                onChange={(e) => setNewAnswer(e.target.value)}
              />
            </div>
            {createError && (
              <p className="text-xs font-medium text-destructive">{createError}</p>
            )}
          </div>
          <DialogFooter className="gap-2 border-t bg-muted/30 px-5 py-3 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={creating}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleCreate}
              disabled={creating || !newQuestion.trim() || !newAnswer.trim()}
              className="gap-2"
            >
              {creating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {creating ? "Saving…" : "Save FAQ"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editTarget} onOpenChange={(v) => { if (!v) setEditTarget(null); }}>
        <DialogContent className="sm:max-w-lg p-0 overflow-hidden">
          <div className="flex items-center justify-between bg-gradient-to-r from-blue-600 to-blue-500 px-5 py-3 text-white">
            <DialogHeader className="space-y-0">
              <DialogTitle className="text-white">Edit FAQ</DialogTitle>
            </DialogHeader>
            <DialogClose className="text-white/80 hover:text-white">
              <X className="h-4 w-4" />
            </DialogClose>
          </div>
          <div className="space-y-4 p-5">
            <div>
              <Label className="mb-1.5 block text-sm">Question *</Label>
              <Input
                placeholder="Enter your question here..."
                value={editQuestion}
                onChange={(e) => setEditQuestion(e.target.value)}
              />
            </div>
            <div>
              <Label className="mb-1.5 block text-sm">Answer *</Label>
              <Textarea
                placeholder="Enter the detailed answer here..."
                className="min-h-[100px]"
                value={editAnswer}
                onChange={(e) => setEditAnswer(e.target.value)}
              />
            </div>
            {editError && (
              <p className="text-xs font-medium text-destructive">{editError}</p>
            )}
          </div>
          <DialogFooter className="gap-2 border-t bg-muted/30 px-5 py-3 sm:gap-2">
            <DialogClose asChild>
              <Button variant="outline" disabled={updating}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleUpdate}
              disabled={updating || !editQuestion.trim() || !editAnswer.trim()}
              className="gap-2"
            >
              {updating ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
              {updating ? "Saving…" : "Save Changes"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}