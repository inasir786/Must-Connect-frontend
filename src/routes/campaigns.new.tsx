import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Save,
  Send,
  UploadCloud,
  Phone,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Image as ImageIcon,
  Megaphone,
  Layers,
  MessageSquare,
  CircleAlert,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  createCampaign,
  getCampaignBatchOptions,
  getSendingNumbers,
  type CampaignBatchOption,
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

function SectionCard({
  step,
  icon,
  title,
  subtitle,
  children,
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

function CreateCampaignPage() {
  const navigate = useNavigate();
  const [batches, setBatches] = useState<CampaignBatchOption[]>([]);
  const [numbers, setNumbers] = useState<SendingNumber[]>([]);
  const [loadingMeta, setLoadingMeta] = useState(true);

  const [name, setName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedBatches, setSelectedBatches] = useState<number[]>([]);
  const [templateName, setTemplateName] = useState("");
  const [message, setMessage] = useState(
    "Hi {{name}}, applications for the Spring 2026 admissions are now open at MUST University. Reply YES to learn more."
  );
  const [selectedNumbers, setSelectedNumbers] = useState<number[]>([]);

  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    Promise.all([getCampaignBatchOptions(), getSendingNumbers()])
      .then(([b, n]) => {
        if (cancelled) return;
        setBatches(b);
        setNumbers(n);
      })
      .finally(() => {
        if (!cancelled) setLoadingMeta(false);
      });
    return () => {
      cancelled = true;
    };
  }, []);

  const toggleBatch = (id: number) =>
    setSelectedBatches((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const toggleNumber = (id: number) =>
    setSelectedNumbers((cur) => (cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id]));

  const handleSubmit = async (launch: boolean) => {
    setError(null);
    setSaving(true);
    try {
      const created = await createCampaign({
        name,
        description,
        batch_ids: selectedBatches,
        message_template: message,
        sending_number_ids: selectedNumbers,
      });
      if (launch) {
        navigate({
          to: "/campaigns/success",
          search: {
            name: created.name || name || "Untitled Campaign",
            contacts: totalContacts,
          },
        });
      } else {
        navigate({ to: "/campaigns" });
      }
    } catch (err: any) {
      navigate({
        to: "/campaigns/failed",
        search: { reason: err?.message ?? "Failed to create campaign" },
      });
    } finally {
      setSaving(false);
    }
  };

  const totalContacts = batches
    .filter((b) => selectedBatches.includes(b.id))
    .reduce((sum, b) => sum + b.valid_whatsapp_count, 0);

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
              <p className="mt-1 text-sm text-muted-foreground">
                Set up a new outreach campaign
              </p>
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
              {saving ? (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              ) : (
                <Send className="mr-2 h-4 w-4" />
              )}
              Launch Campaign
            </Button>
          </div>
        </div>
      }
    >
      <div className="mx-auto max-w-5xl space-y-6">
        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <AlertCircle className="h-4 w-4" />
            <span>{error}</span>
          </div>
        )}

        {/* Step 1 — Campaign Information */}
        <SectionCard
          step={1}
          icon={<Megaphone className="h-4 w-4" />}
          title="Campaign Information"
          subtitle="Basic details about your campaign"
        >
          <div className="grid gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="name">Campaign Name</Label>
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

        {/* Step 2 — Select Batches */}
        <SectionCard
          step={2}
          icon={<Layers className="h-4 w-4" />}
          title="Select Batches"
          subtitle="Choose batches to include in this campaign"
        >
          {loadingMeta ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {batches.map((b) => {
                const selected = selectedBatches.includes(b.id);
                return (
                  <label
                    key={b.id}
                    className={`flex cursor-pointer items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      selected
                        ? "border-accent bg-accent/5"
                        : "border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selected}
                        onCheckedChange={() => toggleBatch(b.id)}
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
          {selectedBatches.length > 0 && (
            <p className="mt-3 text-xs text-muted-foreground">
              {selectedBatches.length} batch(es) selected • {totalContacts.toLocaleString()} total contacts
            </p>
          )}
        </SectionCard>

        {/* Step 3 — Message Setup */}
        <SectionCard
          step={3}
          icon={<MessageSquare className="h-4 w-4" />}
          title="Message Setup"
          subtitle="Compose the WhatsApp message and optional media"
        >
          <div className="grid gap-5 lg:grid-cols-[1fr_280px]">
            <div className="space-y-4">
              <div className="space-y-1.5">
                <Label htmlFor="template">Template Name</Label>
                <Input
                  id="template"
                  placeholder="spring_admissions_v1"
                  value={templateName}
                  onChange={(e) => setTemplateName(e.target.value)}
                />
              </div>
              <div className="space-y-1.5">
                <Label htmlFor="message">Message Body</Label>
                <Textarea
                  id="message"
                  rows={6}
                  value={message}
                  onChange={(e) => setMessage(e.target.value)}
                />
                <p className="text-xs text-muted-foreground">
                  Use <code className="rounded bg-muted px-1">{"{{name}}"}</code> to personalize.{" "}
                  {message.length}/1024 characters
                </p>
              </div>
              <div className="rounded-lg border border-dashed border-border bg-muted/30 px-4 py-6 text-center">
                <UploadCloud className="mx-auto mb-2 h-6 w-6 text-muted-foreground" />
                <p className="text-sm font-medium text-foreground">Attach Media (optional)</p>
                <p className="text-xs text-muted-foreground">
                  PNG, JPG or MP4 up to 10 MB
                </p>
              </div>
            </div>

            {/* Preview */}
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
                <div className="mb-2 flex h-24 items-center justify-center rounded bg-muted text-muted-foreground">
                  <ImageIcon className="h-6 w-6" />
                </div>
                <p className="text-xs leading-relaxed text-foreground">{message}</p>
              </div>
            </div>
          </div>
        </SectionCard>

        {/* Step 4 — Sending Numbers */}
        <SectionCard
          step={4}
          icon={<Phone className="h-4 w-4" />}
          title="Sending Numbers Assignment"
          subtitle="Assign one or more WhatsApp Business numbers"
        >
          {loadingMeta ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-6 w-6 animate-spin text-muted-foreground" />
            </div>
          ) : (
            <div className="space-y-2">
              {numbers.map((n) => {
                const selected = selectedNumbers.includes(n.id);
                const disabled = n.status !== "active";
                return (
                  <label
                    key={n.id}
                    className={`flex items-center justify-between gap-3 rounded-lg border px-4 py-3 transition-colors ${
                      disabled
                        ? "cursor-not-allowed border-border bg-muted/30 opacity-60"
                        : selected
                          ? "cursor-pointer border-accent bg-accent/5"
                          : "cursor-pointer border-border hover:bg-muted/40"
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <Checkbox
                        checked={selected}
                        disabled={disabled}
                        onCheckedChange={() => toggleNumber(n.id)}
                      />
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{n.label}</p>
                        <p className="text-xs text-muted-foreground">
                          WhatsApp Business {n.status === "active" ? "• Healthy" : "• Inactive"}
                        </p>
                      </div>
                    </div>
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-medium ${
                        n.status === "active"
                          ? "bg-emerald-100 text-emerald-700"
                          : "bg-slate-100 text-slate-500"
                      }`}
                    >
                      {n.status === "active" ? (
                        <CheckCircle2 className="h-3 w-3" />
                      ) : (
                        <CircleAlert className="h-3 w-3" />
                      )}
                      {n.status === "active" ? "Active" : "Inactive"}
                    </span>
                  </label>
                );
              })}
            </div>
          )}
        </SectionCard>

        {/* Bottom note + actions */}
        <div className="rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-3 text-sm text-emerald-700">
          Ready to launch? Make sure you've reviewed the message, batch selection, and sending
          numbers before clicking <strong>Launch Campaign</strong>.
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
            {saving ? (
              <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            ) : (
              <Send className="mr-2 h-4 w-4" />
            )}
            Launch Campaign
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}