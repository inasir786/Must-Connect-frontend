import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useRef } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Search,
  Upload,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  UploadCloud,
  Loader2,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getCampaignMedia,
  uploadCampaignMedia,
  deleteCampaignMedia,
  downloadCampaignMedia,
  type CampaignMediaItem,
  type CampaignMediaFileType,
} from "@/api/campaign-media";

export const Route = createFileRoute("/campaign-media")({
  head: () => ({
    meta: [
      { title: "Campaign Media — MUST Connect" },
      { name: "description", content: "Manage and organize media assets for outreach campaigns." },
    ],
  }),
  component: CampaignMediaPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TINTS = [
  "bg-blue-100", "bg-purple-100", "bg-green-100", "bg-orange-100",
  "bg-pink-100", "bg-indigo-100", "bg-yellow-100", "bg-teal-100",
];

function getTint(index: number) {
  return TINTS[index % TINTS.length];
}

function TypeIcon({ type }: { type: CampaignMediaFileType }) {
  if (type === "image") return <ImageIcon className="h-8 w-8 text-foreground/30" />;
  return <FileText className="h-8 w-8 text-foreground/30" />;
}

function typeBadge(type: CampaignMediaFileType) {
  if (type === "image") return "JPG";
  return "PDF";
}

// ─── Component ────────────────────────────────────────────────────────────────

function CampaignMediaPage() {
  const [items, setItems] = useState<CampaignMediaItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Filters
  const [search, setSearch] = useState("");
  const [filterType, setFilterType] = useState<string>("all");
  const [sortOrder, setSortOrder] = useState<"newest" | "oldest">("newest");
  const [activeFilter, setActiveFilter] = useState<string>("all"); // mirrors filterType for Filter btn
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Download — force blob download, never opens in browser tab ───────────
  const handleDownload = async (title: string, url: string) => {
    try {
      const ext = url.split(".").pop()?.split("?")[0] ?? "file";
      await downloadCampaignMedia(url, `${title}.${ext}`);
    } catch {
      window.open(url, "_blank");
    }
  };

  // Upload dialog
  const [open, setOpen] = useState(false);
  const [mediaType, setMediaType] = useState<CampaignMediaFileType>("pdf");
  const [title, setTitle] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchItems = async (q?: string, ft?: string) => {
    setLoading(true);
    setError(null);
    try {
      const params: Record<string, string> = {};
      if (q?.trim()) params.search = q.trim();
      if (ft && ft !== "all") params.file_type = ft;
      const res = await getCampaignMedia(params as any);
      setItems(res.items);
    } catch {
      setError("Failed to load media. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { fetchItems(); }, []);

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const val = e.target.value;
    setSearch(val);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => fetchItems(val, filterType), 300);
  };

  const handleFilterChange = (val: string) => {
    setFilterType(val);
    fetchItems(search, val);
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this media?")) return;
    try {
      await deleteCampaignMedia(id);
      setItems((prev) => prev.filter((i) => i.id !== id));
    } catch {
      alert("Failed to delete media.");
    }
  };

  // ── Upload ─────────────────────────────────────────────────────────────
  const resetDialog = () => {
    setMediaType("pdf");
    setTitle("");
    setFile(null);
    setUploadError(null);
  };

  const handleUpload = async () => {
    if (!title.trim()) { setUploadError("Title is required."); return; }
    if (!file) { setUploadError("Please select a file."); return; }

    setSaving(true);
    setUploadError(null);
    try {
      const fd = new FormData();
      fd.append("title", title.trim());
      fd.append("file_type", mediaType);
      if (file) fd.append("file", file);
      await uploadCampaignMedia(fd);
      await fetchItems(search, filterType);
      resetDialog();
      setOpen(false);
    } catch {
      setUploadError("Failed to upload. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <AdminLayout
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaign Media</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize media assets for outreach campaigns
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Upload className="h-4 w-4" />
            Upload Media
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Toolbar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  placeholder="Search media by title..."
                  className="pl-9 pr-8"
                  value={search}
                  onChange={handleSearchChange}
                />
                {search && (
                  <button
                    onClick={() => { setSearch(""); fetchItems("", filterType); }}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                  >
                    <X className="h-3.5 w-3.5" />
                  </button>
                )}
              </div>
              <Select value={filterType} onValueChange={handleFilterChange}>
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="image">Image</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              {/* Filter button cycles: all → pdf → image → all */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => {
                  const next = activeFilter === "all" ? "pdf" : activeFilter === "pdf" ? "image" : "all";
                  setActiveFilter(next);
                  setFilterType(next);
                  fetchItems(search, next);
                }}
                className={cn(activeFilter !== "all" && "border-primary text-primary bg-primary/5")}
              >
                <Filter className="h-4 w-4" />
                {activeFilter === "all" ? "Filter" : activeFilter.toUpperCase()}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setSortOrder((s) => s === "newest" ? "oldest" : "newest")}
                className={cn(sortOrder === "oldest" && "border-primary text-primary bg-primary/5")}
              >
                <ArrowUpDown className="h-4 w-4" />
                {sortOrder === "newest" ? "Newest" : "Oldest"}
              </Button>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div>
          <h2 className="mb-4 text-lg font-bold">Media Library</h2>

          {loading && (
            <div className="flex items-center justify-center gap-2 py-12 text-sm text-muted-foreground">
              <Loader2 className="h-4 w-4 animate-spin" /> Loading media…
            </div>
          )}

          {error && !loading && (
            <p className="text-sm text-destructive">{error}</p>
          )}

          {!loading && !error && items.length === 0 && (
            <div className="flex flex-col items-center justify-center gap-2 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
              <UploadCloud className="h-8 w-8 opacity-30" />
              <p className="text-sm font-medium">No media yet. Click "Upload Media" to add one.</p>
            </div>
          )}

          {!loading && !error && items.length > 0 && (
            <div className="grid grid-cols-2 gap-4 lg:grid-cols-4">
              {[...items]
                .sort((a, b) => {
                  const diff = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
                  return sortOrder === "newest" ? -diff : diff;
                })
                .map((it, index) => (
                <div
                  key={it.id}
                  className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
                >
                  <div className={cn("relative flex aspect-[16/9] items-center justify-center", getTint(index))}>
                    <TypeIcon type={it.file_type} />
                    <span className="absolute bottom-2 left-2 rounded bg-white/80 px-1.5 py-0.5 text-[9px] font-bold text-foreground">
                      {typeBadge(it.file_type)}
                    </span>
                    <div className="absolute right-1.5 top-1.5 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      {it.file_url && (
                        <button
                          onClick={() => handleDownload(it.title, it.file_url!)}
                          className="rounded bg-white p-1 shadow-sm hover:bg-muted"
                          aria-label="Download"
                        >
                          <Download className="h-3 w-3 text-foreground" />
                        </button>
                      )}
                      <button
                        onClick={() => handleDelete(it.id)}
                        className="rounded bg-white p-1 shadow-sm hover:bg-destructive/10"
                        aria-label="Delete"
                      >
                        <Trash2 className="h-3 w-3 text-destructive" />
                      </button>
                    </div>
                  </div>
                  <div className="p-2">
                    <p className="truncate text-xs font-semibold">{it.title}</p>
                    {it.file_size && (
                      <p className="text-[10px] text-muted-foreground">{it.file_size}</p>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Upload dialog */}
      <Dialog open={open} onOpenChange={(v) => { if (!v) resetDialog(); setOpen(v); }}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Campaign Media</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add media files for your outreach campaigns
            </p>
          </DialogHeader>

          <div className="space-y-4">
            {/* Type selector */}
            <div className="space-y-2">
              <Label className="text-sm font-semibold">Media Type</Label>
              <div className="grid grid-cols-2 gap-2">
                {(["pdf", "image"] as CampaignMediaFileType[]).map((key) => {
                  const icons = { pdf: FileText, image: ImageIcon };
                  const Icon = icons[key];
                  return (
                    <button
                      key={key}
                      type="button"
                      onClick={() => { setMediaType(key); setFile(null); setUploadError(null); }}
                      className={cn(
                        "flex items-center justify-center gap-1.5 rounded-lg border px-3 py-2 text-xs font-semibold uppercase transition-colors",
                        mediaType === key
                          ? "border-accent bg-accent/10 text-accent"
                          : "border-border bg-muted hover:bg-muted/70",
                      )}
                    >
                      <Icon className="h-3.5 w-3.5" />
                      {key}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* File upload */}
            <div
              onClick={() => fileInputRef.current?.click()}
              className="flex cursor-pointer flex-col items-center justify-center gap-1.5 rounded-lg border-2 border-dashed border-accent/40 bg-accent/5 px-4 py-5 text-center transition-colors hover:bg-accent/10"
            >
              <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10">
                <UploadCloud className="h-4 w-4 text-accent" />
              </div>
              {file ? (
                <div className="flex items-center gap-2 text-xs font-medium text-accent">
                  <span className="max-w-[200px] truncate">{file.name}</span>
                  <button
                    type="button"
                    onClick={(e) => { e.stopPropagation(); setFile(null); }}
                    className="text-muted-foreground hover:text-destructive"
                  >
                    <X className="h-3 w-3" />
                  </button>
                </div>
              ) : (
                <>
                  <p className="text-xs font-medium text-accent">Drop files here or click to browse</p>
                  <p className="text-[10px] text-muted-foreground">
                    {mediaType === "pdf"
                      ? "Supports: PDF, DOCX (Max 50MB)"
                      : "Supports: JPG, PNG, GIF (Max 50MB)"}
                  </p>
                </>
              )}
              <input
                ref={fileInputRef}
                type="file"
                accept={mediaType === "pdf" ? ".pdf,.docx" : "image/*"}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>

            {/* Title */}
            <div className="space-y-1.5">
              <Label className="text-sm font-semibold">
                Media Title <span className="text-destructive">*</span>
              </Label>
              <Input
                placeholder="Enter media title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
              />
            </div>

            {uploadError && (
              <p className="text-xs font-medium text-destructive">{uploadError}</p>
            )}
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline" disabled={saving}>Cancel</Button>
            </DialogClose>
            <Button
              onClick={handleUpload}
              disabled={saving}
              className="bg-accent text-accent-foreground hover:bg-accent/90 gap-2"
            >
              {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
              {saving ? "Uploading…" : "Upload Media"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}