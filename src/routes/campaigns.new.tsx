import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState, useRef } from "react";
import {
  ArrowLeft, Save, Send, UploadCloud, Phone,
  Loader2, AlertCircle, CheckCircle2, Image as ImageIcon,
  Megaphone, Layers, MessageSquare, X, Video,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  getBatches,
  createCampaign,
  uploadCampaignMedia,
  launchCampaign,
  getSendingNumbers,
  type Batch,
  type SendingNumber,
} from "@/api/campaigns";

export const Route = createFileRoute("/campaigns/new")({
  head: () => ({
    meta: [
      { title: "Create Campaign — MUST Connect" },
      { name: "description", content: "Set up a new outreach campaign." },
    ],
  }),
  component: CreateCampaignPage,
});

const MAX_FILES       = 5;
const MAX_BYTES       = 10 * 1024 * 1024;
const ACCEPTED_MIME   = ["image/png", "image/jpeg", "video/mp4"];
const ACCEPTED_ACCEPT = "image/png,image/jpeg,video/mp4";

function fmtBytes(b: number) {
  if (b < 1024)        return `${b} B`;
  if (b < 1024 * 1024) return `${(b / 1024).toFixed(1)} KB`;
  return `${(b / 1024 / 1024).toFixed(2)} MB`;
}

function distribute(numbers: SendingNumber[], total: number) {
  const active = numbers.filter((n) => n.availability_status === "active");
  if (!active.length || !total) return [] as { number: SendingNumber; contacts: number }[];
  const base = Math.floor(total / active.length);
  const rem  = total % active.length;
  return active.map((n, i) => ({ number: n, contacts: base + (i < rem ? 1 : 0) }));
}

function SectionCard({
  step, icon, title, subtitle, children,
}: {
  step: number;
  icon: React.ReactNode;
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="rounded-xl border border-border bg-card shadow-sm">
      <header className="flex items-start gap-3 border-b border-border px-5 py-4">
        <div className="flex h-9 w-9 items-center justify-center rounded-full bg-accent/10 text-accent">
          {icon}
        </div>
        <div className="flex-1">
          <p className="text-xs font-medium text-muted-foreground">Step {step}</p>
          <h2 className="text-base font-semibold text-foreground">{title}</h2>
          <p className="text-xs text-muted-foreground">{subtitle}</p>
        </div>
      </header>
      <div className="px-5 py-5">{children}</div>
    </section>
  );
}

function FileCard({ file, onRemove }: { file: File; onRemove: () => void }) {
  const isVideo = file.type.includes("video");
  const preview = !isVideo ? URL.createObjectURL(file) : null;
  return (
    <div className="group relative overflow-hidden rounded-lg border border-border bg-muted/30">
      <div className="flex h-20 items-center justify-center overflow-hidden bg-muted/50">
        {preview ? (
          <img src={preview} alt={file.name} className="h-full w-full object-cover" />
        ) : (
          <Video className="h-7 w-7 text-muted-foreground" />
        )}
      </div>
      <div className="px-2 py-1.5">
        <p className="truncate text-xs font-medium text-foreground" title={file.name}>
          {file.name}
        </p>
        <p className="text-[10px] text-muted-foreground">{fmtBytes(file.size)}</p>
      </div>
      <button
        type="button"
        onClick={onRemove}
        className="absolute right-1 top-1 rounded-full bg-white/90 p-0.5 text-muted-foreground opacity-0 shadow transition-opacity hover:text-red-600 group-hover:opacity-100"
      >
        <X className="h-3.5 w-3.5" />
      </button>
    </div>
  );
}

function CreateCampaignPage() {
  const navigate = useNavigate();

  const [batches,     setBatches]     = useState<Batch[]>([]);
  const [numbers,     setNumbers]     = useState<SendingNumber[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [name,            setName]            = useState("");
  const [description,     setDescription]     = useState("");
  const [selectedBatchId, setSelectedBatchId] = useState<number | null>(null);
  const [message,         setMessage]         = useState(
    "Hi {name}, applications for the Spring 2026 admissions are now open at MUST University. Reply YES to learn more."
  );
  const [mediaFiles, setMediaFiles] = useState<File[]>([]);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const [saving, setSaving] = useState(false);
  const [error,  setError]  = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getBatches(), getSendingNumbers()])
      .then(([b, n]) => { if (!cancelled) { setBatches(b); setNumbers(n); } })
      .catch((err) => { if (!cancelled) setError(err?.message ?? "Failed to load data"); })
      .finally(() => { if (!cancelled) setLoadingMeta(false); });
    return () => { cancelled = true; };
  }, []);

  const selectedBatch = batches.find((b) => b.id === selectedBatchId) ?? null;
  const activeNumbers = numbers.filter((n) => n.availability_status === "active");
  const distribution  = selectedBatch
    ? distribute(activeNumbers, selectedBatch.valid_whatsapp_count)
    : [];

  function handleFilePick(e: React.ChangeEvent<HTMLInputElement>) {
    const picked = Array.from(e.target.files ?? []);
    const slots  = MAX_FILES - mediaFiles.length;

    if (slots <= 0) {
      setError(`You've reached the maximum of ${MAX_FILES} files. Remove a file to add another.`);
      e.target.value = "";
      return;
    }

    const toAdd: File[] = [];
    for (const f of picked) {
      if (toAdd.length >= slots) {
        setError(`Only ${slots} more file${slots !== 1 ? "s" : ""} can be added (limit: ${MAX_FILES}).`);
        break;
      }
      if (!ACCEPTED_MIME.includes(f.type)) {
        setError("Only PNG, JPG, or MP4 files are allowed.");
        continue;
      }
      if (f.size > MAX_BYTES) {
        setError("File must be 10 MB or smaller.");
        continue;
      }
      toAdd.push(f);
    }

    if (toAdd.length > 0) setMediaFiles((prev) => [...prev, ...toAdd]);
    e.target.value = "";
  }

  function removeFile(idx: number) {
    setMediaFiles((prev) => prev.filter((_, i) => i !== idx));
  }

  async function handleSubmit(launch: boolean) {
    if (!name.trim())     { setError("Campaign name is required."); return; }
    if (!selectedBatchId) { setError("Please select a batch."); return; }
    if (!message.trim())  { setError("Message text is required."); return; }

    setError(null);
    setSaving(true);

    try {
      const created = await createCampaign({
        name:         name.trim(),
        description:  description.trim(),
        batch_id:     Number(selectedBatchId),
        message_text: message.trim(),
      });

      if (mediaFiles.length > 0) {
        await uploadCampaignMedia(created.id, mediaFiles);
      }

      if (launch) {
        await launchCampaign(created.id);
      }

      navigate({ to: "/campaigns" });
    } catch (err: any) {
      setError(err?.response?.data?.detail ?? err?.message ?? "Failed to create campaign");
    } finally {
      setSaving(false);
    }
  }

  return (
    <AdminLayout
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div className="flex items-center gap-3">
            <Link
              to="/campaigns"
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Back to campaigns"
            >
              <ArrowLeft className="h-5 w-5" />
            </Link>
            <div>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Create Campaign</h1>
              <p className="mt-1 text-sm text-muted-foreground">Set up a new outreach campaign</p>
            </div>
          </div>
          <div className="flex flex-wrap items-center gap-2">
            <Button variant="outline" onClick={() => handleSubmit(false)} disabled={saving}>
              <Save className="mr-2 h-4 w-4" />
              Save Draft
            </Button>
            <Button
              className="bg-accent text-accent-foreground hover:bg-accent/90"
              onClick={() => handleSubmit(true)}
              disabled={saving}
            >
              {saving
                ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                : <Send className="mr-2 h-4 w-4" />}
              Launch Campaign
            </Button>
          </div>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <AlertCircle className="h-4 w-4 shrink-0" />
            <span className="flex-1">{error}</span>
            <button onClick={() => setError(null)} className="text-red-400 hover:text-red-700">
              <X className="h-4 w-4" />
            </button>
          </div>
        )}

        <SectionCard
          step={1}
          icon={<Megaphone className="h-4 w-4" />}
          title="Campaign Information"
          subtitle="Basic details about your campaign"
        >
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">
                Campaign Name <span className="text-destructive">*</span>
              </Label>
              <Input
                id="name"
                placeholder="e.g., Spring 2026 Admissions"
                value={name}
                onChange={(e) => setName(e.target.value)}
              />
            </div>
            <div className="space-y-1.5">
              <Label htmlFor="description">Description</Label>
              <Textarea
                id="description"
                placeholder="Brief description of this campaign"
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                rows={3}
              />
            </div>
          </div>
        </SectionCard>

        <SectionCard
          step={2}
          icon={<Layers className="h-4 w-4" />}
          title="Select Batch"
          subtitle="Choose one batch to include in this campaign"
        >
          {loadingMeta ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : batches.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No validated batches found.
            </p>
          ) : (
            <div className="space-y-2">
              {batches.map((b) => {
                const selected = selectedBatchId === b.id;
                return (
                  <label
                    key={b.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      selected ? "border-accent bg-accent/5" : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <input
                        type="radio"
                        name="batch"
                        checked={selected}
                        onChange={() => setSelectedBatchId(b.id)}
                        className="accent-accent"
                      />
                      <div>
                        <p className="text-sm font-semibold text-foreground">
                          {b.batch_name} — {b.education_year}
                        </p>
                        <p className="text-xs text-muted-foreground">{b.title}</p>
                      </div>
                    </div>
                    <div className="text-right">
                      <p className="text-sm font-semibold text-foreground">
                        {b.valid_whatsapp_count.toLocaleString()}
                      </p>
                      <p className="text-xs text-muted-foreground">valid contacts</p>
                    </div>
                  </label>
                );
              })}
            </div>
          )}
        </SectionCard>

        <SectionCard
          step={3}
          icon={<MessageSquare className="h-4 w-4" />}
          title="Message Setup"
          subtitle="Compose the WhatsApp message and optional media"
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="message">
                  Message Body <span className="text-destructive">*</span>
                </Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use{" "}
                  <code className="rounded bg-muted px-1">{"{{name}}"}</code> to
                  personalise. {message.length}/1024 characters
                </p>
              </div>

              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <Label>
                    Attach Media{" "}
                    <span className="font-normal text-muted-foreground">(optional)</span>
                  </Label>
                  <span className={`text-xs font-medium ${mediaFiles.length >= MAX_FILES ? "text-red-500" : "text-muted-foreground"}`}>
                    {mediaFiles.length}/{MAX_FILES} files
                  </span>
                </div>

                {mediaFiles.length < MAX_FILES ? (
                  <div
                    onClick={() => fileInputRef.current?.click()}
                    className="cursor-pointer rounded-lg border border-dashed border-border bg-muted/30 px-4 py-5 text-center transition-colors hover:bg-muted/50 hover:border-accent"
                  >
                    <UploadCloud className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                    <p className="text-sm font-medium text-foreground">Click to upload media</p>
                    <p className="text-xs text-muted-foreground">
                      PNG, JPG or MP4 · max {MAX_FILES} files · 10 MB each
                    </p>
                  </div>
                ) : (
                  <div className="rounded-lg border border-dashed border-red-200 bg-red-50 px-4 py-4 text-center">
                    <p className="text-sm font-medium text-red-600">
                      Maximum {MAX_FILES} files reached
                    </p>
                    <p className="text-xs text-red-400">Remove a file to upload another</p>
                  </div>
                )}

                <input
                  ref={fileInputRef}
                  type="file"
                  accept={ACCEPTED_ACCEPT}
                  multiple
                  className="hidden"
                  disabled={mediaFiles.length >= MAX_FILES}
                  onChange={handleFilePick}
                />

                {mediaFiles.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 sm:grid-cols-4 md:grid-cols-5">
                    {mediaFiles.map((f, i) => (
                      <FileCard key={i} file={f} onRemove={() => removeFile(i)} />
                    ))}
                  </div>
                )}
              </div>
            </div>

            <div className="rounded-lg border border-border bg-muted/40 p-4">
              <p className="mb-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground">
                Preview
              </p>
              <div className="rounded-lg bg-card p-3 shadow-sm">
                <div className="mb-2 flex items-center gap-2">
                  <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                    M
                  </div>
                  <p className="text-xs font-semibold">MUST University</p>
                </div>
                {(() => {
                  const first = mediaFiles.find((f) => f.type.startsWith("image/"));
                  return (
                    <div className="mb-2 flex h-24 items-center justify-center overflow-hidden rounded bg-muted">
                      {first ? (
                        <img
                          src={URL.createObjectURL(first)}
                          alt="preview"
                          className="h-full w-full object-cover"
                        />
                      ) : (
                        <ImageIcon className="h-6 w-6 text-muted-foreground" />
                      )}
                    </div>
                  );
                })()}
                <p className="text-xs leading-relaxed text-foreground">
                  {message
                    .replace(/\{\{name\}\}/g, "Ahmad")
                    .replace(/\{name\}/g, "Ahmad")}
                </p>
              </div>
            </div>
          </div>
        </SectionCard>

        <SectionCard
          step={4}
          icon={<Phone className="h-4 w-4" />}
          title="Sending Numbers Assignment"
          subtitle="Contacts will be automatically distributed across available numbers"
        >
          {loadingMeta ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : numbers.length === 0 ? (
            <p className="py-6 text-center text-sm text-muted-foreground">
              No sending numbers available.
            </p>
          ) : (
            <div className="space-y-3">
              <div className="flex items-start gap-3 rounded-lg border border-blue-200 bg-blue-50 px-4 py-3">
                <AlertCircle className="mt-0.5 h-4 w-4 shrink-0 text-blue-500" />
                <div>
                  <p className="text-sm font-semibold text-blue-700">Automatic Distribution</p>
                  <p className="text-xs text-blue-600 mt-0.5">
                    {!selectedBatch
                      ? "Select a batch above to see how contacts will be distributed across sending numbers."
                      : activeNumbers.length === 0
                        ? "No active sending numbers found. Messages will use the default number."
                        : `The system will evenly distribute your contacts across ${activeNumbers.length} active sending number${activeNumbers.length !== 1 ? "s" : ""} to ensure optimal delivery rates and avoid spam detection.`}
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {numbers.map((n) => {
                  const isActive      = n.availability_status === "active";
                  const share         = distribution.find((d) => d.number.id === n.id);
                  const contactsLabel = selectedBatch
                    ? isActive && share
                      ? `${share.contacts.toLocaleString()} contacts`
                      : "Not assigned"
                    : "Select a batch to see assignment";

                  return (
                    <div
                      key={n.id}
                      className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
                        isActive ? "border-border bg-card" : "border-border bg-muted/30 opacity-60"
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                          <Phone className="h-4 w-4" />
                        </div>
                        <div>
                          <p className="font-mono text-sm font-semibold text-foreground">
                            {n.phone_number}
                          </p>
                          <p className="text-xs text-muted-foreground">
                            {selectedBatch
                              ? `${selectedBatch.batch_name} • ${contactsLabel}`
                              : "Business Stub · WhatsApp Business"}
                          </p>
                        </div>
                      </div>
                      <span className={`inline-flex shrink-0 items-center gap-1 rounded-full border px-2.5 py-0.5 text-xs font-medium ${
                        isActive
                          ? "border-emerald-200 bg-emerald-50 text-emerald-700"
                          : "border-slate-200 bg-slate-100 text-slate-500"
                      }`}>
                        {isActive
                          ? <CheckCircle2 className="h-3 w-3" />
                          : <AlertCircle className="h-3 w-3" />}
                        {isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </SectionCard>

        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Ready to launch? Review the message, batch, and sending numbers before clicking{" "}
          <strong>Launch Campaign</strong>.
        </div>

        <div className="flex flex-col-reverse items-stretch justify-end gap-2 pb-4 sm:flex-row sm:items-center">
          <Button variant="outline" onClick={() => handleSubmit(false)} disabled={saving}>
            <Save className="mr-2 h-4 w-4" />
            Save Draft
          </Button>
          <Button
            className="bg-accent text-accent-foreground hover:bg-accent/90"
            onClick={() => handleSubmit(true)}
            disabled={saving}
          >
            {saving
              ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              : <Send className="mr-2 h-4 w-4" />}
            Launch Campaign
          </Button>
        </div>

      </div>
    </AdminLayout>
  );
}