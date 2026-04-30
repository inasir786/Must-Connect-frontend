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
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Upload,
  Search,
  Image as ImageIcon,
  Video,
  Link2,
  UploadCloud,
  Trash2,
  Loader2,
  ChevronLeft,
  ChevronRight,
  FileImage,
  FileVideo,
  Globe,
  X,
  Copy,
  ExternalLink,
  Check,
} from "lucide-react";
import { cn } from "@/lib/utils";
import {
  getMediaAssets,
  createMediaAsset,
  deleteMediaAsset,
  type MediaAsset,
  type MediaAssetType,
} from "@/api/media";

// ─── Route ────────────────────────────────────────────────────────────────────

export const Route = createFileRoute("/media/$category")({
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : "",
  }),
  head: ({ params }) => ({
    meta: [
      { title: `Media Library — ${params.category}` },
      { name: "description", content: "Manage reusable media assets." },
    ],
  }),
  component: CategoryDetailPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

const TABS: MediaAssetType[] = ["image", "video", "link"];

function tabLabel(t: MediaAssetType) {
  return t === "image" ? "Images" : t === "video" ? "Videos" : "Links";
}

// ─── Asset Card (image / video) ───────────────────────────────────────────────

function AssetCard({
  asset,
  onDelete,
}: {
  asset: MediaAsset;
  onDelete: (id: number) => void;
}) {
  const isVideo = asset.type === "video";

  return (
    <div className="group overflow-hidden rounded-2xl border border-border bg-card shadow-sm transition-all hover:shadow-md">
      {/* Preview — square */}
      <div className="aspect-square bg-muted relative overflow-hidden">
        {asset.file_url ? (
          isVideo ? (
            <video
              src={asset.file_url}
              className="h-full w-full object-cover"
              muted
            />
          ) : (
            <img
              src={asset.file_url}
              alt={asset.title}
              loading="lazy"
              className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
            />
          )
        ) : (
          <div className="flex h-full w-full flex-col items-center justify-center gap-2 text-muted-foreground px-3">
            {isVideo ? (
              <FileVideo className="h-10 w-10 opacity-30" />
            ) : (
              <FileImage className="h-10 w-10 opacity-30" />
            )}
          </div>
        )}

        {/* Hover actions — top right */}
        <div className="absolute right-3 top-3 opacity-0 transition-opacity group-hover:opacity-100">
          <button
            onClick={() => onDelete(asset.id)}
            className="flex h-8 w-8 items-center justify-center rounded-lg bg-white shadow-md text-slate-600 hover:text-destructive transition-colors"
            aria-label="Delete asset"
          >
            <Trash2 className="h-4 w-4" />
          </button>
        </div>
      </div>

      {/* Info */}
      <div className="p-4">
        <h3 className="truncate text-sm font-semibold text-foreground mb-1">{asset.title}</h3>
        <div className="flex items-center justify-between">
          <span className="text-xs text-muted-foreground">{asset.label}</span>
          {asset.file_size && (
            <span className="text-xs text-muted-foreground/70">{asset.file_size}</span>
          )}
        </div>
      </div>
    </div>
  );
}

// ─── File Row (link / pdf) ────────────────────────────────────────────────────

function FileRow({
  asset,
  onDelete,
}: {
  asset: MediaAsset;
  onDelete: (id: number) => void;
}) {
  const [copied, setCopied] = useState(false);

  const handleCopy = async () => {
    if (!asset.file_url) return;
    try {
      await navigator.clipboard.writeText(asset.file_url);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    } catch {
      // fallback for older browsers
      const ta = document.createElement("textarea");
      ta.value = asset.file_url;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand("copy");
      document.body.removeChild(ta);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const handleOpen = () => {
    if (asset.file_url) window.open(asset.file_url, "_blank", "noopener,noreferrer");
  };

  return (
    <div className="group flex items-center gap-4 rounded-xl border border-border bg-card px-5 py-4 shadow-sm transition-all hover:shadow-md hover:border-border/80">
      {/* Icon */}
      <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10 text-primary">
        <Globe className="h-5 w-5" />
      </div>

      {/* Meta */}
      <div className="min-w-0 flex-1">
        <p className="truncate text-sm font-semibold text-foreground">{asset.title}</p>
        <p className="truncate text-xs text-muted-foreground mt-0.5">
          {asset.file_url || "—"}
        </p>
      </div>

      {/* File size */}
      {asset.file_size && (
        <span className="hidden sm:block shrink-0 text-xs text-muted-foreground/70 tabular-nums">
          {asset.file_size}
        </span>
      )}

      {/* Actions */}
      <div className="flex shrink-0 items-center gap-2">
        {/* Copy URL */}
        <button
          onClick={handleCopy}
          title={copied ? "Copied!" : "Copy URL"}
          className={cn(
            "flex h-8 w-8 items-center justify-center rounded-lg border transition-all",
            copied
              ? "border-emerald-400 bg-emerald-50 text-emerald-600"
              : "border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted",
          )}
        >
          {copied ? <Check className="h-3.5 w-3.5" /> : <Copy className="h-3.5 w-3.5" />}
        </button>

        {/* Open in browser */}
        <button
          onClick={handleOpen}
          title="Open in browser"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-foreground hover:bg-muted transition-all"
        >
          <ExternalLink className="h-3.5 w-3.5" />
        </button>

        {/* Delete */}
        <button
          onClick={() => onDelete(asset.id)}
          title="Delete"
          className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-background text-muted-foreground hover:text-destructive hover:border-destructive/40 transition-all opacity-0 group-hover:opacity-100"
        >
          <Trash2 className="h-3.5 w-3.5" />
        </button>
      </div>
    </div>
  );
}

// ─── Upload Dialog ────────────────────────────────────────────────────────────

function UploadDialog({
  open,
  onOpenChange,
  categoryId,
  onCreated,
}: {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  categoryId: number;
  onCreated: (asset: MediaAsset) => void;
}) {
  const [mediaType, setMediaType] = useState<MediaAssetType>("image");
  const [title, setTitle] = useState("");
  const [label, setLabel] = useState("");
  const [description, setDescription] = useState("");
  const [fileUrl, setFileUrl] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setMediaType("image");
    setTitle("");
    setLabel("");
    setDescription("");
    setFileUrl("");
    setFile(null);
    setError(null);
  };

  const handleSubmit = async () => {
    if (!title.trim()) { setError("Title is required."); return; }
    if (mediaType === "link" && !fileUrl.trim()) { setError("URL is required for link type."); return; }
    if (mediaType !== "link" && !file) { setError("Please select a file."); return; }

    setSaving(true);
    setError(null);
    try {
      const fd = new FormData();
      fd.append("category_id", String(categoryId));
      fd.append("type", mediaType);
      fd.append("title", title.trim());
      fd.append("label", label.trim());
      fd.append("description", description.trim());
      if (mediaType === "link") {
        fd.append("file_url", fileUrl.trim());
      } else if (file) {
        fd.append("file", file);
      }

      const created = await createMediaAsset(fd);
      onCreated(created);
      reset();
      onOpenChange(false);
    } catch {
      setError("Failed to upload. Please try again.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-2xl p-0 overflow-hidden">
        {/* Header */}
        <div className="px-6 py-4 border-b border-border">
          <DialogTitle className="text-xl font-bold">Upload Media</DialogTitle>
          <p className="text-sm text-muted-foreground mt-0.5">
            Add images, videos, or links to your media library
          </p>
        </div>

        <div className="px-6 py-4 space-y-4 max-h-[60vh] overflow-y-auto">
          {/* Media Type */}
          <div>
            <Label className="block text-sm font-semibold text-foreground mb-3">Media Type</Label>
            <div className="flex items-center gap-3">
              {(["image", "video", "link"] as MediaAssetType[]).map((key) => {
                const icons = { image: ImageIcon, video: Video, link: Link2 };
                const Icon = icons[key];
                const active = mediaType === key;
                return (
                  <button
                    key={key}
                    type="button"
                    onClick={() => { setMediaType(key); setFile(null); setFileUrl(""); setError(null); }}
                    className={cn(
                      "flex items-center gap-2 px-5 py-2.5 rounded-xl border-2 font-semibold text-sm transition-all capitalize",
                      active
                        ? "border-primary bg-primary/5 text-primary"
                        : "border-border text-muted-foreground hover:border-muted-foreground/50",
                    )}
                  >
                    <Icon className="h-4 w-4" />
                    {key}
                  </button>
                );
              })}
            </div>
          </div>

          {/* File upload or URL */}
          {mediaType === "link" ? (
            <div>
              <Label className="block text-sm font-semibold mb-2">Link URL</Label>
              <Input
                placeholder="https://example.com/resource"
                value={fileUrl}
                onChange={(e) => setFileUrl(e.target.value)}
                className="h-11 rounded-xl"
              />
            </div>
          ) : (
            <div>
              <div
                onClick={() => fileInputRef.current?.click()}
                className="rounded-xl p-4 text-center bg-muted/40 border-2 border-dashed border-border cursor-pointer transition-colors hover:bg-muted/60 hover:border-primary/40"
              >
                <div className="flex flex-col items-center gap-1.5">
                  <div className="flex h-9 w-9 items-center justify-center rounded-full bg-primary/10">
                    <UploadCloud className="h-4 w-4 text-primary" />
                  </div>
                  {file ? (
                    <div className="flex items-center gap-2 text-sm font-semibold text-primary">
                      <span className="max-w-[240px] truncate">{file.name}</span>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); setFile(null); }}
                        className="text-muted-foreground hover:text-destructive"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  ) : (
                    <>
                      <p className="text-sm font-semibold text-foreground">
                        Drop files here or click to browse
                      </p>
                      <p className="text-xs text-muted-foreground">
                        {mediaType === "image"
                          ? "Supports: JPG, PNG, GIF (Max 50MB)"
                          : "Supports: MP4, MOV (Max 500MB)"}
                      </p>
                      <button
                        type="button"
                        onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}
                        className="mt-1 px-4 py-1.5 bg-card border border-border rounded-lg text-xs font-semibold text-foreground hover:bg-muted transition-all"
                      >
                        Browse Files
                      </button>
                    </>
                  )}
                </div>
              </div>
              <input
                ref={fileInputRef}
                type="file"
                accept={mediaType === "image" ? "image/*" : "video/*"}
                className="hidden"
                onChange={(e) => setFile(e.target.files?.[0] ?? null)}
              />
            </div>
          )}

          {/* Title */}
          <div>
            <Label className="block text-sm font-semibold mb-2">Title</Label>
            <Input
              placeholder="Enter media title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          {/* Label */}
          <div>
            <Label className="block text-sm font-semibold mb-2">Label</Label>
            <Input
              placeholder="e.g. Library, Admissions"
              value={label}
              onChange={(e) => setLabel(e.target.value)}
              className="h-12 rounded-xl"
            />
          </div>

          {/* Description */}
          <div>
            <Label className="block text-sm font-semibold mb-2">Description / Label</Label>
            <Textarea
              placeholder="Add a brief description or label"
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="rounded-xl resize-none"
            />
          </div>

          {error && <p className="text-xs font-medium text-destructive">{error}</p>}
        </div>

        {/* Footer */}
        <div className="px-6 py-4 bg-muted/30 border-t border-border flex items-center justify-end gap-3">
          <DialogClose asChild>
            <Button variant="outline" disabled={saving} className="rounded-xl px-6">
              Cancel
            </Button>
          </DialogClose>
          <Button
            onClick={handleSubmit}
            disabled={saving}
            className="bg-accent text-accent-foreground hover:bg-accent/90 rounded-xl px-6 gap-2"
          >
            {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Upload className="h-4 w-4" />}
            {saving ? "Uploading…" : "Upload Media"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CategoryDetailPage() {
  const { category } = Route.useParams();
  const { name: categoryName } = Route.useSearch();
  const categoryId = Number(category);
  const title = categoryName || `Category ${categoryId}`;

  // ── State ──────────────────────────────────────────────────────────────
  const [assets, setAssets] = useState<MediaAsset[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [total, setTotal] = useState(0);
  const PER_PAGE = 10;

  const [activeTab, setActiveTab] = useState<MediaAssetType>("image");
  const [searchInput, setSearchInput] = useState("");
  const [uploadOpen, setUploadOpen] = useState(false);
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  // ── Fetch ──────────────────────────────────────────────────────────────
  const fetchAssets = useCallback(async (p: number) => {
    setLoading(true);
    setError(null);
    try {
      const res = await getMediaAssets(categoryId, p, PER_PAGE);
      setAssets(res.items);
      setTotalPages(res.meta.total_pages);
      setTotal(res.meta.total);
    } catch {
      setError("Failed to load assets. Please try again.");
    } finally {
      setLoading(false);
    }
  }, [categoryId]);

  useEffect(() => { fetchAssets(page); }, [fetchAssets, page]);

  // ── Client-side filter by tab + search ────────────────────────────────
  const filtered = assets.filter((a) => {
    const matchesTab = a.type === activeTab;
    const q = searchInput.trim().toLowerCase();
    const matchesSearch = q
      ? a.title.toLowerCase().includes(q) || a.label.toLowerCase().includes(q)
      : true;
    return matchesTab && matchesSearch;
  });

  const handleSearchChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchInput(e.target.value);
    if (debounceTimer.current) clearTimeout(debounceTimer.current);
    debounceTimer.current = setTimeout(() => setPage(1), 300);
  };

  // ── Delete ─────────────────────────────────────────────────────────────
  const handleDelete = async (id: number) => {
    if (!confirm("Delete this asset?")) return;
    try {
      await deleteMediaAsset(id);
      setAssets((prev) => prev.filter((a) => a.id !== id));
      setTotal((t) => t - 1);
    } catch {
      alert("Failed to delete asset.");
    }
  };

  // ── After upload: refetch ──────────────────────────────────────────────
  const handleCreated = async (asset: MediaAsset) => {
    setActiveTab(asset.type);
    await fetchAssets(page);
  };

  const goToPage = (p: number) => {
    if (p < 1 || p > totalPages) return;
    setPage(p);
  };

  const startItem = total === 0 ? 0 : (page - 1) * PER_PAGE + 1;
  const endItem = Math.min(page * PER_PAGE, total);

  const isListView = activeTab === "link";

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <AdminLayout
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Media Library — {title}
            </h1>
            <p className="text-sm text-muted-foreground">Manage reusable media assets</p>
          </div>
          <Button
            onClick={() => setUploadOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Upload className="h-4 w-4" />
            Upload Media
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">

        {/* Tabs + search */}
        <div className="rounded-2xl border border-border bg-card shadow-sm p-6">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between mb-0">
            {/* Tabs */}
            <div className="flex items-center gap-0 border-b border-border">
              {TABS.map((t) => (
                <button
                  key={t}
                  onClick={() => { setActiveTab(t); setPage(1); }}
                  className={cn(
                    "relative px-6 py-3 text-sm font-semibold transition-all",
                    activeTab === t
                      ? "text-primary after:absolute after:bottom-0 after:left-0 after:right-0 after:h-[3px] after:rounded-t-sm after:bg-primary"
                      : "text-muted-foreground hover:text-foreground",
                  )}
                >
                  {tabLabel(t)}
                </button>
              ))}
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="pointer-events-none absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                placeholder="Search media..."
                className="w-full pl-11 pr-8 sm:w-64 rounded-xl"
                value={searchInput}
                onChange={handleSearchChange}
              />
              {searchInput && (
                <button
                  onClick={() => setSearchInput("")}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
                >
                  <X className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>

        {/* Loading */}
        {loading && (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-muted-foreground">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading assets…
          </div>
        )}

        {/* Error */}
        {error && !loading && (
          <p className="text-sm text-destructive">{error}</p>
        )}

        {/* Content */}
        {!loading && !error && (
          <>
            {filtered.length > 0 ? (
              isListView ? (
                /* ── Link list view ── */
                <div className="flex flex-col gap-2">
                  {filtered.map((asset) => (
                    <FileRow key={asset.id} asset={asset} onDelete={handleDelete} />
                  ))}
                </div>
              ) : (
                /* ── Image / video grid view ── */
                <div className="grid grid-cols-2 gap-6 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-4">
                  {filtered.map((asset) => (
                    <AssetCard key={asset.id} asset={asset} onDelete={handleDelete} />
                  ))}
                </div>
              )
            ) : (
              <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-border py-16 text-center text-muted-foreground">
                <UploadCloud className="h-10 w-10 opacity-30" />
                <p className="text-sm font-medium">
                  {searchInput.trim()
                    ? `No ${activeTab}s found for "${searchInput.trim()}"`
                    : `No ${activeTab}s yet. Click "Upload Media" to add one.`}
                </p>
              </div>
            )}

            {/* Pagination */}
            {total > 0 && (
              <div className="flex items-center justify-center gap-2">
                <button
                  onClick={() => goToPage(page - 1)}
                  disabled={page === 1}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-all"
                >
                  <ChevronLeft className="h-4 w-4" />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1).map((p) => (
                  <button
                    key={p}
                    onClick={() => goToPage(p)}
                    className={cn(
                      "h-10 w-10 rounded-lg text-sm font-semibold transition-all",
                      p === page
                        ? "bg-primary text-primary-foreground"
                        : "border border-border text-muted-foreground hover:bg-muted",
                    )}
                  >
                    {p}
                  </button>
                ))}
                <button
                  onClick={() => goToPage(page + 1)}
                  disabled={page === totalPages}
                  className="flex h-10 w-10 items-center justify-center rounded-lg border border-border hover:bg-muted disabled:opacity-40 transition-all"
                >
                  <ChevronRight className="h-4 w-4" />
                </button>
              </div>
            )}
          </>
        )}
      </div>

      <UploadDialog
        open={uploadOpen}
        onOpenChange={setUploadOpen}
        categoryId={categoryId}
        onCreated={handleCreated}
      />
    </AdminLayout>
  );
}