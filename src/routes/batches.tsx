import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, useRef } from "react";
import {
  Search,
  Upload,
  MoreVertical,
  Layers,
  ChevronLeft,
  ChevronRight,
  Loader2,
  AlertCircle,
  X,
  FileText,
  CalendarDays,
  User,
  Hash,
  RefreshCw,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetDescription,
} from "@/components/ui/sheet";
import { Label } from "@/components/ui/label";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  UploadCloud,
  Eye,
  ArrowUpCircle,
  GitMerge,
  Archive,
  ArchiveRestore,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getBatches,
  getBatch,
  createBatch,
  toggleArchiveBatch,
  mergeBatch,
  upgradeBatch,
  type Batch,
  type BatchDetail,
  type BatchListMeta,
} from "@/api/batches";

export const Route = createFileRoute("/batches")({
  head: () => ({
    meta: [
      { title: "Batches — MUST Connect" },
      {
        name: "description",
        content: "Manage student contact batches and data uploads.",
      },
    ],
  }),
  component: BatchesPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function extractError(err: any): string {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail))
    return detail.map((d: any) => String(d?.msg || "Unknown error")).join(", ");
  if (typeof detail === "string") return detail;
  return err?.message || "Something went wrong. Please try again.";
}

function batchDisplayName(batch: Batch): string {
  return `${batch.batch_name} ${batch.education_year}`;
}

const ICON_PALETTES = [
  { bg: "bg-blue-100", text: "text-blue-600" },
  { bg: "bg-purple-100", text: "text-purple-600" },
  { bg: "bg-orange-100", text: "text-orange-600" },
  { bg: "bg-emerald-100", text: "text-emerald-600" },
  { bg: "bg-rose-100", text: "text-rose-600" },
];

function paletteFor(id: number) {
  return ICON_PALETTES[id % ICON_PALETTES.length];
}

function formatDate(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });
}

function formatDateShort(iso: string): string {
  return new Date(iso).toLocaleString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function cleanDescription(raw: string): string {
  let clean = raw.replace(/\s*—.*$/, "");
  clean = clean.replace(/:\s*\{.*\}/, "");
  return clean.trim();
}

// ─── Polling: field-by-field comparison for batch list ────────────────────────

function batchListChanged(prev: Batch[], next: Batch[]): boolean {
  if (prev.length !== next.length) return true;
  return prev.some((b, i) =>
    b.id                    !== next[i].id                    ||
    b.status                !== next[i].status                ||
    b.total_contacts        !== next[i].total_contacts        ||
    b.valid_whatsapp_count  !== next[i].valid_whatsapp_count  ||
    b.batch_name            !== next[i].batch_name            ||
    b.education_year        !== next[i].education_year        ||
    b.title                 !== next[i].title
  );
}

// ─── Sub-components ───────────────────────────────────────────────────────────

function ErrorBanner({ message }: { message: string }) {
  return (
    <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
      <AlertCircle className="h-4 w-4 flex-shrink-0" />
      <span>{message}</span>
    </div>
  );
}

// ─── Batch Detail Drawer ───────────────────────────────────────────────────────

const ACTION_STYLES: Record<string, { dot: string; label: string }> = {
  validated: { dot: "bg-emerald-500", label: "text-emerald-700" },
  merged: { dot: "bg-blue-500", label: "text-blue-700" },
  updated: { dot: "bg-purple-500", label: "text-purple-700" },
  archived: { dot: "bg-slate-400", label: "text-slate-600" },
  unarchived: { dot: "bg-amber-500", label: "text-amber-700" },
  uploaded: { dot: "bg-indigo-500", label: "text-indigo-700" },
};

function actionStyle(type: string) {
  return ACTION_STYLES[type] ?? { dot: "bg-slate-400", label: "text-slate-600" };
}

interface BatchDetailDrawerProps {
  batchId: number | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onMerge: (batch: Batch) => void;
  onUpgrade: (batch: Batch) => void;
  onToggleArchive: (batch: Batch) => void;
}

function BatchDetailDrawer({
  batchId,
  open,
  onOpenChange,
  onMerge,
  onUpgrade,
  onToggleArchive,
}: BatchDetailDrawerProps) {
  const [detail, setDetail] = useState<BatchDetail | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!batchId || !open) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    getBatch(batchId)
      .then((d) => { if (!cancelled) setDetail(d); })
      .catch((err) => { if (!cancelled) setError(extractError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [batchId, open]);

  const isArchived = detail?.status === "archived";
  const validPercent =
    detail && detail.total_contacts > 0
      ? ((detail.valid_whatsapp_count / detail.total_contacts) * 100).toFixed(1)
      : null;

  return (
    <Sheet open={open} onOpenChange={onOpenChange}>
      <SheetContent
        side="right"
        className="flex w-full flex-col gap-0 p-0 sm:max-w-[480px]"
      >
        <SheetHeader className="border-b border-border px-6 py-4">
          <SheetTitle className="text-base">Batch Details</SheetTitle>
          <SheetDescription className="text-xs">
            Complete batch information and actions
          </SheetDescription>
        </SheetHeader>

        {loading && (
          <div className="flex flex-1 items-center justify-center py-20">
            <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
          </div>
        )}

        {error && !loading && (
          <div className="p-6">
            <ErrorBanner message={error} />
          </div>
        )}

        {detail && !loading && (
          <ScrollArea className="flex-1">
            <div className="space-y-6 px-6 py-5">
              <div className="rounded-xl bg-[oklch(0.305_0.135_265)] px-5 py-4">
                <h2 className="text-lg font-bold text-accent-foreground leading-tight">
                  {batchDisplayName(detail)}
                </h2>
                <p className="mt-0.5 text-sm text-accent-foreground/70">{detail.title}</p>
              </div>

              <div className="grid grid-cols-3 gap-3">
                <div className="rounded-xl border border-border bg-card p-4">
                  <p className="text-xs text-muted-foreground">Total Contacts</p>
                  <p className="mt-1 text-2xl font-bold text-foreground">
                    {detail.total_contacts.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-4">
                  <p className="text-xs text-emerald-700">Valid WhatsApp</p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700">
                    {detail.valid_whatsapp_count.toLocaleString()}
                  </p>
                  {validPercent && (
                    <p className="text-xs text-emerald-600">{validPercent}% valid</p>
                  )}
                </div>
                <div className="rounded-xl border border-red-200 bg-red-50 p-4">
                  <p className="text-xs text-red-600">Invalid Contacts</p>
                  <p className="mt-1 text-2xl font-bold text-red-600">
                    {detail.invalid_count.toLocaleString()}
                  </p>
                  {detail.total_contacts > 0 && (
                    <p className="text-xs text-red-500">
                      {((detail.invalid_count / detail.total_contacts) * 100).toFixed(1)}% of total
                    </p>
                  )}
                </div>
              </div>

              <Separator />

              <div>
                <h3 className="mb-3 text-sm font-semibold text-foreground">Batch Information</h3>
                <dl className="space-y-3">
                  {[
                    { icon: <CalendarDays className="h-3.5 w-3.5" />, label: "Upload Date", value: formatDateShort(detail.created_at) },
                    { icon: <RefreshCw className="h-3.5 w-3.5" />, label: "Last Updated", value: formatDateShort(detail.updated_at) },
                    { icon: <User className="h-3.5 w-3.5" />, label: "Uploaded By", value: "Admin User" },
                    { icon: <Hash className="h-3.5 w-3.5" />, label: "Batch ID", value: `BATCH-${String(detail.batch_id).padStart(4, "0")}` },
                  ].map(({ icon, label, value }) => (
                    <div key={label} className="flex items-center justify-between">
                      <dt className="flex items-center gap-1.5 text-xs text-muted-foreground">
                        {icon}{label}
                      </dt>
                      <dd className="text-xs font-medium text-foreground">{value}</dd>
                    </div>
                  ))}
                </dl>
              </div>

              <Separator />

              {detail.files.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">
                    Files ({detail.files.length})
                  </h3>
                  <div className="space-y-2">
                    {detail.files.map((f) => (
                      <div key={f.id} className="flex items-center gap-3 rounded-lg border border-border bg-muted/30 px-3 py-2.5">
                        <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-md bg-blue-100">
                          <FileText className="h-4 w-4 text-blue-600" />
                        </div>
                        <div className="min-w-0 flex-1">
                          <p className="truncate text-xs font-medium text-foreground">{f.file_name}</p>
                          <p className="text-xs text-muted-foreground">{formatDate(f.uploaded_at)}</p>
                        </div>
                        <Badge variant="secondary" className="text-xs uppercase">{f.file_type}</Badge>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <Separator />

              {detail.activity_logs.length > 0 && (
                <div>
                  <h3 className="mb-3 text-sm font-semibold text-foreground">Recent Activity</h3>
                  <div className="space-y-3">
                    {detail.activity_logs.slice(0, 6).map((log) => {
                      const style = actionStyle(log.action_type);
                      return (
                        <div key={log.id} className="flex gap-3">
                          <div className="flex flex-col items-center">
                            <div className={`mt-1 h-2 w-2 flex-shrink-0 rounded-full ${style.dot}`} />
                            <div className="mt-1 w-px flex-1 bg-border" />
                          </div>
                          <div className="pb-3">
                            <p className="text-xs text-foreground leading-snug">
                              {cleanDescription(log.description)}
                            </p>
                            <p className="mt-0.5 text-xs text-muted-foreground">
                              {formatDate(log.created_at)}
                            </p>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </ScrollArea>
        )}

        {detail && !loading && (
          <div className="border-t border-border px-6 py-4 space-y-2">
            <Button
              className="w-full bg-[oklch(0.305_0.135_265)] text-accent-foreground hover:bg-[oklch(0.305_0.135_265)]/90"
              onClick={() => { onMerge(detail); onOpenChange(false); }}
            >
              <GitMerge className="mr-2 h-4 w-4" />Merge Batch
            </Button>
            <Button variant="outline" className="w-full"
              onClick={() => { onUpgrade(detail); onOpenChange(false); }}>
              <ArrowUpCircle className="mr-2 h-4 w-4" />Upgrade Batch
            </Button>
            <Button
              variant="outline"
              className={`w-full ${isArchived ? "border-emerald-300 text-emerald-700 hover:bg-emerald-50" : "border-red-200 text-destructive hover:bg-red-50"}`}
              onClick={() => { onToggleArchive(detail); onOpenChange(false); }}
            >
              {isArchived
                ? <><ArchiveRestore className="mr-2 h-4 w-4" />Unarchive Batch</>
                : <><Archive className="mr-2 h-4 w-4" />Archive Batch</>
              }
            </Button>
          </div>
        )}
      </SheetContent>
    </Sheet>
  );
}

// ─── Upload Dialog ─────────────────────────────────────────────────────────────

interface UploadFormState {
  title: string;
  batch_name: string;
  education_year: string;
  file: File | null;
}

interface UploadDialogProps {
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

function UploadDialog({ open, onOpenChange, onSuccess }: UploadDialogProps) {
  const [form, setForm] = useState<UploadFormState>({ title: "", batch_name: "", education_year: "", file: null });
  const [errors, setErrors] = useState<Partial<Record<keyof UploadFormState, string>>>({});
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setForm({ title: "", batch_name: "", education_year: "", file: null });
    setErrors({});
    setServerError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const validate = (): boolean => {
    const e: typeof errors = {};
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.batch_name.trim()) e.batch_name = "Batch name is required.";
    if (!form.education_year) e.education_year = "Education year is required.";
    if (!form.file) e.file = "Please upload a file.";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async () => {
    setServerError(null);
    if (!validate()) return;
    setSaving(true);
    try {
      await createBatch({ file: form.file!, title: form.title, batch_name: form.batch_name, education_year: form.education_year });
      reset();
      onOpenChange(false);
      onSuccess();
    } catch (err: any) {
      setServerError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[480px]">
        <DialogHeader>
          <DialogTitle>Upload Batch</DialogTitle>
          <DialogDescription>Add a new student contact batch</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {serverError && <ErrorBanner message={serverError} />}
          <div className="space-y-1">
            <Label htmlFor="title">Title</Label>
            <Input id="title" placeholder="e.g., Fall Admissions 2024" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="batch-name">Batch Name</Label>
            <Input id="batch-name" placeholder="e.g., Fall 2024" value={form.batch_name}
              onChange={(e) => setForm((f) => ({ ...f, batch_name: e.target.value }))} />
            {errors.batch_name && <p className="text-xs text-red-500">{errors.batch_name}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="education-year">Education Year</Label>
            <Select value={form.education_year} onValueChange={(v) => setForm((f) => ({ ...f, education_year: v }))}>
              <SelectTrigger id="education-year"><SelectValue placeholder="Select education year" /></SelectTrigger>
              <SelectContent>
                {["2022", "2023", "2024", "2025", "2026"].map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.education_year && <p className="text-xs text-red-500">{errors.education_year}</p>}
          </div>
          <div className="space-y-1">
            <Label>Upload File</Label>
            <label htmlFor="file-upload"
              className="flex cursor-pointer flex-col items-center justify-center rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-10 text-center transition-colors hover:bg-muted/50">
              <div className="mb-3 flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
                <UploadCloud className="h-6 w-6 text-accent" />
              </div>
              {form.file ? (
                <p className="text-sm font-medium text-foreground">{form.file.name}</p>
              ) : (
                <>
                  <p className="text-sm font-medium text-foreground">Drop your file here or click to browse</p>
                  <p className="mt-1 text-xs text-muted-foreground">Supports CSV and Excel files (max 10MB)</p>
                </>
              )}
              <input ref={fileInputRef} id="file-upload" type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={(e) => setForm((f) => ({ ...f, file: e.target.files?.[0] ?? null }))} />
            </label>
            {errors.file && <p className="text-xs text-red-500">{errors.file}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <Upload className="mr-2 h-4 w-4" />}
            Upload Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Merge Dialog ──────────────────────────────────────────────────────────────

interface MergeDialogProps {
  batch: Batch | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

function MergeDialog({ batch, open, onOpenChange, onSuccess }: MergeDialogProps) {
  const [file, setFile] = useState<File | null>(null);
  const [fileError, setFileError] = useState("");
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const reset = () => {
    setFile(null); setFileError(""); setServerError(null);
    if (fileInputRef.current) fileInputRef.current.value = "";
  };

  const handleSubmit = async () => {
    setServerError(null);
    if (!file) { setFileError("Please upload a file."); return; }
    if (!batch) return;
    setSaving(true);
    try {
      await mergeBatch(batch.id, file);
      reset(); onOpenChange(false); onSuccess();
    } catch (err: any) {
      setServerError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  const palette = batch ? paletteFor(batch.id) : ICON_PALETTES[0];

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Merge Batch</DialogTitle>
          <DialogDescription>Add more contacts into this batch</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {serverError && <ErrorBanner message={serverError} />}
          {batch && (
            <div className="flex items-center gap-3 rounded-xl border border-border bg-muted/30 px-4 py-3">
              <div className={`flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg ${palette.bg}`}>
                <Layers className={`h-4 w-4 ${palette.text}`} />
              </div>
              <div>
                <p className="text-sm font-semibold text-foreground">{batchDisplayName(batch)}</p>
                <p className="text-xs text-muted-foreground">
                  {batch.total_contacts.toLocaleString()} contacts
                  {batch.valid_whatsapp_count > 0 && (
                    <> · {batch.valid_whatsapp_count.toLocaleString()} valid WhatsApp
                      {batch.total_contacts > 0 && (
                        <> ({((batch.valid_whatsapp_count / batch.total_contacts) * 100).toFixed(1)}%)</>
                      )}
                    </>
                  )}
                </p>
              </div>
            </div>
          )}
          <div className="space-y-1">
            <label htmlFor="merge-file-upload"
              className="flex cursor-pointer items-center justify-center gap-3 rounded-lg border-2 border-dashed border-border bg-muted/30 px-6 py-6 text-center transition-colors hover:bg-muted/50">
              <UploadCloud className="h-5 w-5 text-accent flex-shrink-0" />
              <div>
                <p className="text-sm font-medium text-foreground">{file ? file.name : "Upload New File"}</p>
                {!file && <p className="text-xs text-muted-foreground">CSV or Excel (max 10MB)</p>}
              </div>
              <input ref={fileInputRef} id="merge-file-upload" type="file" accept=".csv,.xlsx,.xls" className="hidden"
                onChange={(e) => { setFile(e.target.files?.[0] ?? null); setFileError(""); }} />
            </label>
            {fileError && <p className="text-xs text-red-500">{fileError}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <GitMerge className="mr-2 h-4 w-4" />}
            Merge Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Upgrade Dialog ────────────────────────────────────────────────────────────

interface UpgradeDialogProps {
  batch: Batch | null;
  open: boolean;
  onOpenChange: (v: boolean) => void;
  onSuccess: () => void;
}

function UpgradeDialog({ batch, open, onOpenChange, onSuccess }: UpgradeDialogProps) {
  const [form, setForm] = useState({ title: "", batch_name: "", education_year: "" });
  const [errors, setErrors] = useState({ title: "", batch_name: "", education_year: "" });
  const [saving, setSaving] = useState(false);
  const [serverError, setServerError] = useState<string | null>(null);

  useEffect(() => {
    if (batch) setForm({ title: batch.title, batch_name: batch.batch_name, education_year: batch.education_year });
  }, [batch]);

  const reset = () => { setErrors({ title: "", batch_name: "", education_year: "" }); setServerError(null); };

  const validate = (): boolean => {
    const e = { title: "", batch_name: "", education_year: "" };
    if (!form.title.trim()) e.title = "Title is required.";
    if (!form.batch_name.trim()) e.batch_name = "Batch name is required.";
    if (!form.education_year) e.education_year = "Education year is required.";
    setErrors(e);
    return !e.title && !e.batch_name && !e.education_year;
  };

  const handleSubmit = async () => {
    setServerError(null);
    if (!validate() || !batch) return;
    setSaving(true);
    try {
      await upgradeBatch(batch.id, form);
      reset(); onOpenChange(false); onSuccess();
    } catch (err: any) {
      setServerError(extractError(err));
    } finally {
      setSaving(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { if (!v) reset(); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-[440px]">
        <DialogHeader>
          <DialogTitle>Upgrade Batch</DialogTitle>
          <DialogDescription>Update the batch title, name and education year</DialogDescription>
        </DialogHeader>
        <div className="space-y-4">
          {serverError && <ErrorBanner message={serverError} />}
          <div className="space-y-1">
            <Label htmlFor="upgrade-title">Title</Label>
            <Input id="upgrade-title" placeholder="e.g., Fall Admissions 2025" value={form.title}
              onChange={(e) => setForm((f) => ({ ...f, title: e.target.value }))} />
            {errors.title && <p className="text-xs text-red-500">{errors.title}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="upgrade-batch-name">Batch Name</Label>
            <Input id="upgrade-batch-name" placeholder="e.g., Fall 2025" value={form.batch_name}
              onChange={(e) => setForm((f) => ({ ...f, batch_name: e.target.value }))} />
            {errors.batch_name && <p className="text-xs text-red-500">{errors.batch_name}</p>}
          </div>
          <div className="space-y-1">
            <Label htmlFor="upgrade-education-year">Education Year</Label>
            <Select value={form.education_year} onValueChange={(v) => setForm((f) => ({ ...f, education_year: v }))}>
              <SelectTrigger id="upgrade-education-year"><SelectValue placeholder="Select education year" /></SelectTrigger>
              <SelectContent>
                {["2022", "2023", "2024", "2025", "2026"].map((y) => (
                  <SelectItem key={y} value={y}>{y}</SelectItem>
                ))}
              </SelectContent>
            </Select>
            {errors.education_year && <p className="text-xs text-red-500">{errors.education_year}</p>}
          </div>
        </div>
        <DialogFooter>
          <Button variant="outline" onClick={() => { reset(); onOpenChange(false); }}>Cancel</Button>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={handleSubmit} disabled={saving}>
            {saving ? <Loader2 className="mr-2 h-4 w-4 animate-spin" /> : <ArrowUpCircle className="mr-2 h-4 w-4" />}
            Upgrade Batch
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}

// ─── Batch Card ────────────────────────────────────────────────────────────────

interface BatchCardProps {
  batch: Batch;
  onViewDetail: (batch: Batch) => void;
  onToggleArchive: (batch: Batch) => void;
  onMerge: (batch: Batch) => void;
  onUpgrade: (batch: Batch) => void;
}

function BatchCard({ batch, onViewDetail, onToggleArchive, onMerge, onUpgrade }: BatchCardProps) {
  const palette = paletteFor(batch.id);
  const isProcessing = batch.status === "processing";
  const isArchived = batch.status === "archived";
  const validPercent =
    batch.total_contacts > 0
      ? `${((batch.valid_whatsapp_count / batch.total_contacts) * 100).toFixed(1)}%`
      : null;

  return (
    <article className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md">
      <div className="mb-4 flex items-start justify-between">
        <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${palette.bg}`}>
          <Layers className={`h-5 w-5 ${palette.text}`} />
        </div>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button type="button"
              className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="More options">
              <MoreVertical className="h-4 w-4" />
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-44">
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onViewDetail(batch); }}>
              <Eye className="mr-2 h-4 w-4 text-muted-foreground" />View Details
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onUpgrade(batch); }}>
              <ArrowUpCircle className="mr-2 h-4 w-4 text-muted-foreground" />Upgrade Batch
            </DropdownMenuItem>
            <DropdownMenuItem onSelect={(e) => { e.preventDefault(); onMerge(batch); }}>
              <GitMerge className="mr-2 h-4 w-4 text-muted-foreground" />Merge Batch
            </DropdownMenuItem>
            <DropdownMenuItem
              className={isArchived ? "text-emerald-600 focus:text-emerald-600" : "text-destructive focus:text-destructive"}
              onSelect={(e) => { e.preventDefault(); onToggleArchive(batch); }}
            >
              {isArchived
                ? <><ArchiveRestore className="mr-2 h-4 w-4" />Unarchive Batch</>
                : <><Archive className="mr-2 h-4 w-4" />Archive Batch</>
              }
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>

      <h3 className="font-semibold text-foreground">{batchDisplayName(batch)}</h3>
      <p className="mb-4 text-xs text-muted-foreground">{batch.title}</p>

      <dl className="space-y-2 text-sm">
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Total Contacts</dt>
          <dd className="font-semibold text-foreground">{batch.total_contacts.toLocaleString()}</dd>
        </div>
        <div className="flex items-center justify-between">
          <dt className="text-muted-foreground">Valid WhatsApp</dt>
          <dd className={`font-semibold ${isProcessing ? "text-orange-600" : "text-foreground"}`}>
            {isProcessing ? "Processing..." : batch.valid_whatsapp_count.toLocaleString()}
            {!isProcessing && validPercent && (
              <span className="ml-1 text-xs text-muted-foreground">({validPercent})</span>
            )}
          </dd>
        </div>
      </dl>

      {isProcessing && (
        <div className="mt-4">
          <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
            <div className="h-full w-2/3 animate-pulse bg-orange-500 transition-all" />
          </div>
        </div>
      )}

      <div className="mt-4 border-t border-border pt-3">
        <div className="flex items-end justify-between">
          <div>
            <p className="text-xs text-muted-foreground">Uploaded</p>
            <p className="text-xs font-medium text-foreground">{formatDate(batch.created_at)}</p>
          </div>
          <Badge
            className={
              batch.status === "validated"
                ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                : batch.status === "processing"
                  ? "bg-orange-100 text-orange-700 hover:bg-orange-100"
                  : "bg-slate-100 text-slate-600 hover:bg-slate-100"
            }
          >
            {batch.status.charAt(0).toUpperCase() + batch.status.slice(1)}
          </Badge>
        </div>
      </div>
    </article>
  );
}

// ─── Main Page ─────────────────────────────────────────────────────────────────

function BatchesPage() {
  const [batches, setBatches] = useState<Batch[]>([]);
  const [meta, setMeta] = useState<BatchListMeta>({ total: 0, page: 1, per_page: 10, total_pages: 1 });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const [query, setQuery] = useState("");
  const [status, setStatus] = useState("all");
  const [sort, setSort] = useState("latest");
  const [page, setPage] = useState(1);

  const [uploadOpen, setUploadOpen] = useState(false);
  const [mergeTarget, setMergeTarget] = useState<Batch | null>(null);
  const [upgradeTarget, setUpgradeTarget] = useState<Batch | null>(null);
  const [detailId, setDetailId] = useState<number | null>(null);
  const [detailOpen, setDetailOpen] = useState(false);

  // ── Polling refs ──
  const batchesRef = useRef<Batch[]>([]);
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const searchTimeout = useRef<ReturnType<typeof setTimeout> | null>(null);

  const fetchBatches = useCallback(async (isInitial = false) => {
    if (isInitial) setLoading(true);
    setError(null);
    try {
      const res = await getBatches({
        page,
        per_page: 9,
        search: query || undefined,
        status: status !== "all" ? status : undefined,
        sort: sort !== "latest" ? sort : undefined,
      });
      // ✅ Only update state if cards actually changed
      if (batchListChanged(batchesRef.current, res.items)) {
        batchesRef.current = res.items;
        setBatches(res.items);
        setMeta(res.meta);
      }
    } catch (err: any) {
      setError(extractError(err));
    } finally {
      if (isInitial) setLoading(false);
    }
  }, [page, query, status, sort]);

  useEffect(() => {
    fetchBatches(true); // initial load with spinner

    intervalRef.current = setInterval(() => {
      fetchBatches(false); // silent poll every 60s
    }, 60_000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
    };
  }, [fetchBatches]);

  const handleQueryChange = (val: string) => {
    setQuery(val);
    setPage(1);
    if (searchTimeout.current) clearTimeout(searchTimeout.current);
    searchTimeout.current = setTimeout(() => fetchBatches(false), 400);
  };

  const handleViewDetail = useCallback((batch: Batch) => {
    setDetailId(batch.id);
    setDetailOpen(true);
  }, []);

  const handleToggleArchive = useCallback(async (batch: Batch) => {
    try {
      await toggleArchiveBatch(batch.id);
      fetchBatches(false);
    } catch (err: any) {
      setError(extractError(err));
    }
  }, [fetchBatches]);

  const pageNumbers = Array.from(
    { length: Math.min(meta.total_pages, 3) },
    (_, i) => i + 1
  );

  return (
    <AdminLayout
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Batches</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage student contact batches and data uploads
            </p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90" onClick={() => setUploadOpen(true)}>
            <Upload className="mr-2 h-4 w-4" />Upload Batch
          </Button>
        </div>
      }
    >
      <UploadDialog open={uploadOpen} onOpenChange={setUploadOpen} onSuccess={() => fetchBatches(false)} />

      <MergeDialog
        batch={mergeTarget}
        open={!!mergeTarget}
        onOpenChange={(v) => { if (!v) setMergeTarget(null); }}
        onSuccess={() => fetchBatches(false)}
      />

      <UpgradeDialog
        batch={upgradeTarget}
        open={!!upgradeTarget}
        onOpenChange={(v) => { if (!v) setUpgradeTarget(null); }}
        onSuccess={() => fetchBatches(false)}
      />

      <BatchDetailDrawer
        batchId={detailId}
        open={detailOpen}
        onOpenChange={(v) => { setDetailOpen(v); if (!v) setDetailId(null); }}
        onMerge={(b) => setMergeTarget(b)}
        onUpgrade={(b) => setUpgradeTarget(b)}
        onToggleArchive={handleToggleArchive}
      />

      <div className="space-y-6">
        {error && <ErrorBanner message={error} />}

        {/* Filters */}
        <div className="flex flex-col gap-3 p-4 sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input value={query} onChange={(e) => handleQueryChange(e.target.value)}
              placeholder="Search batches by name..." className="pl-9" />
          </div>
          <div className="flex gap-3">
            <Select value={status} onValueChange={(v) => { setStatus(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[140px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
                <SelectItem value="archived">Archived</SelectItem>
              </SelectContent>
            </Select>
            <Select value={sort} onValueChange={(v) => { setSort(v); setPage(1); }}>
              <SelectTrigger className="w-full sm:w-[160px]"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Sort by: Latest</SelectItem>
                <SelectItem value="oldest">Sort by: Oldest</SelectItem>
                <SelectItem value="name">Sort by: Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards Grid */}
        {loading ? (
          <div className="flex items-center justify-center py-20">
            <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
          </div>
        ) : batches.length === 0 ? (
          <div className="flex flex-col items-center justify-center gap-2 py-20 text-muted-foreground">
            <Layers className="h-10 w-10 opacity-30" />
            <p className="text-sm">No batches found.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {batches.map((b) => (
              <BatchCard
                key={b.id}
                batch={b}
                onViewDetail={handleViewDetail}
                onToggleArchive={handleToggleArchive}
                onMerge={setMergeTarget}
                onUpgrade={setUpgradeTarget}
              />
            ))}
          </div>
        )}

        {/* Pagination */}
        {!loading && meta.total > 0 && (
          <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm sm:flex-row">
            <p className="text-sm text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">
                {(meta.page - 1) * meta.per_page + 1}–{Math.min(meta.page * meta.per_page, meta.total)}
              </span>{" "}
              of <span className="font-medium text-foreground">{meta.total}</span> batches
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="icon" className="h-8 w-8"
                disabled={page === 1} onClick={() => setPage((p) => Math.max(1, p - 1))}>
                <ChevronLeft className="h-4 w-4" />
              </Button>
              {pageNumbers.map((p) => (
                <Button key={p} variant={p === page ? "default" : "outline"}
                  size="icon" className="h-8 w-8" onClick={() => setPage(p)}>
                  {p}
                </Button>
              ))}
              {meta.total_pages > 3 && (
                <>
                  <span className="px-2 text-muted-foreground">…</span>
                  <Button variant={page === meta.total_pages ? "default" : "outline"}
                    size="icon" className="h-8 w-8" onClick={() => setPage(meta.total_pages)}>
                    {meta.total_pages}
                  </Button>
                </>
              )}
              <Button variant="outline" size="icon" className="h-8 w-8"
                disabled={page === meta.total_pages}
                onClick={() => setPage((p) => Math.min(meta.total_pages, p + 1))}>
                <ChevronRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        )}
      </div>
    </AdminLayout>
  );
}