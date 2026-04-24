import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft, Pause, StopCircle, Loader2, AlertCircle,
  Image as ImageIcon, Layers, Info, ChartLine,
  Phone, CheckCircle2,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { getCampaign, pauseCampaign, stopCampaign, type CampaignStatus } from "@/api/campaigns";

// ─── Types ────────────────────────────────────────────────────────────────────

interface ActiveContact {
  id: number;
  name: string;
  phone_number: string;
}

interface BatchDetail {
  id: number;
  batch_name: string;
  title: string;
  total_contacts: number;
  valid_whatsapp_count: number;
  created_at: string;
  active_contacts: ActiveContact[];
}

interface CampaignDetailFull {
  id: number;
  name: string;
  description: string;
  status: CampaignStatus;
  message_text: string;
  created_at: string;
  start_date: string | null;
  batch_id: number;
  sent_count: number;
  pending_count: number;
  total_contacts: number;
  progress_percent: number;
  batch: BatchDetail;
}

export const Route = createFileRoute("/campaigns/$campaignId")({
  head: () => ({
    meta: [
      { title: "Campaign Details — MUST Connect" },
      { name: "description", content: "View campaign details and progress." },
    ],
  }),
  component: CampaignDetailPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status?: CampaignStatus) {
  if (!status) return "bg-slate-100 text-slate-600";
  const map: Record<CampaignStatus, string> = {
    running:   "bg-emerald-50 text-emerald-700 border border-emerald-200",
    completed: "bg-blue-50 text-blue-700 border border-blue-200",
    draft:     "bg-slate-100 text-slate-600 border border-slate-200",
    paused:    "bg-amber-50 text-amber-700 border border-amber-200",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Not started";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "long", day: "numeric", year: "numeric",
  });
}

function extractError(err: any): string {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((d: any) => String(d?.msg ?? "Unknown error")).join(", ");
  if (typeof detail === "string") return detail;
  return err?.message ?? "Something went wrong.";
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CampaignDetailPage() {
  const { campaignId } = Route.useParams();
  const [data, setData]       = useState<CampaignDetailFull | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]     = useState<string | null>(null);
  const [acting, setActing]   = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    getCampaign(Number(campaignId))
      .then((d) => { if (!cancelled) setData(d as unknown as CampaignDetailFull); })
      .catch((err) => { if (!cancelled) setError(extractError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [campaignId]);

  const handlePause = async () => {
    if (!data) return;
    setActing(true); setError(null);
    try {
      await pauseCampaign(data.id);
      setData((prev) => prev ? { ...prev, status: "paused" } : prev);
    } catch (err) { setError(extractError(err)); }
    finally { setActing(false); }
  };

  const handleStop = async () => {
    if (!data) return;
    setActing(true); setError(null);
    try {
      await stopCampaign(data.id);
      setData((prev) => prev ? { ...prev, status: "completed" } : prev);
    } catch (err) { setError(extractError(err)); }
    finally { setActing(false); }
  };

  const pct = data?.progress_percent ?? 0;

  return (
    <AdminLayout
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-start sm:justify-between">
          <div className="flex-1">
            <div className="flex items-center gap-3 mb-2">
              <Link
                to="/campaigns"
                className="text-muted-foreground hover:text-foreground transition-colors"
                aria-label="Back to campaigns"
              >
                <ArrowLeft className="h-4 w-4" />
              </Link>
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">Campaign Details</h1>
            </div>
            {data && (
              <div className="flex flex-wrap items-center gap-3 mt-3">
                <h2 className="text-lg font-semibold text-foreground">{data.name}</h2>
                <Badge className={statusBadge(data.status)}>
                  {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                </Badge>
              </div>
            )}
          </div>

          {data?.status === "running" && (
            <div className="flex flex-wrap items-center gap-3">
              <Button variant="outline" onClick={handlePause} disabled={acting}>
                {acting
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Pause className="mr-2 h-4 w-4" />}
                Pause Campaign
              </Button>
              <Button
                variant="outline"
                className="border-red-200 text-destructive hover:bg-red-50"
                onClick={handleStop}
                disabled={acting}
              >
                <StopCircle className="mr-2 h-4 w-4" />
                Stop Campaign
              </Button>
            </div>
          )}
        </div>
      }
    >
      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
        </div>
      ) : error ? (
        <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
          <AlertCircle className="h-4 w-4" />
          <span>{error}</span>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">

          {/* ── Left column ── */}
          <div className="space-y-6 lg:col-span-2">

            {/* Campaign Summary */}
            <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Info className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Campaign Summary</h2>
                  <p className="text-sm text-muted-foreground">Overview of campaign configuration</p>
                </div>
              </div>
              <div className="grid grid-cols-1 gap-5 sm:grid-cols-2">
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Campaign Name</p>
                  <p className="text-base font-semibold text-foreground">{data.name}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Status</p>
                  <Badge className={statusBadge(data.status)}>
                    {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                  </Badge>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Description</p>
                  <p className="text-base font-semibold text-foreground">{data.description || "—"}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Created Date</p>
                  <p className="text-base font-semibold text-foreground">{formatDate(data.created_at)}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Start Date</p>
                  <p className="text-base font-semibold text-foreground">{formatDate(data.start_date)}</p>
                </div>
                <div className="rounded-xl border border-border bg-muted/30 p-4">
                  <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground mb-1">Total Contacts</p>
                  <p className="text-base font-semibold text-foreground">{data.total_contacts.toLocaleString()}</p>
                </div>
              </div>
            </section>

            {/* Progress Overview */}
            <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <ChartLine className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Progress Overview</h2>
                  <p className="text-sm text-muted-foreground">Campaign sending progress and results</p>
                </div>
              </div>
              <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                  <p className="text-sm font-semibold text-foreground">Overall Progress</p>
                  <p className="text-sm font-bold text-accent">{pct.toFixed(0)}%</p>
                </div>
                <Progress value={pct} className="h-3" />
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-5 text-center">
                  <p className="text-2xl font-bold text-emerald-700 mb-1">
                    {data.sent_count.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-emerald-600">Sent</p>
                </div>
                <div className="rounded-xl border border-blue-200 bg-blue-50 p-5 text-center">
                  <p className="text-2xl font-bold text-blue-700 mb-1">
                    {data.pending_count.toLocaleString()}
                  </p>
                  <p className="text-xs font-semibold uppercase tracking-wide text-blue-600">Pending</p>
                </div>
              </div>
            </section>

            {/* Linked Batch */}
            <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <Layers className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Linked Batch</h2>
                  <p className="text-sm text-muted-foreground">Batch included in this campaign</p>
                </div>
              </div>
              <div className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4">
                <div className="flex items-center gap-4">
                  <div className="flex h-10 w-10 items-center justify-center rounded-lg border border-border bg-card">
                    <Layers className="h-4 w-4 text-accent" />
                  </div>
                  <div>
                    <p className="font-semibold text-foreground text-sm">{data.batch.batch_name}</p>
                    <p className="text-xs text-muted-foreground mt-0.5">
                      {data.batch.title} • Uploaded {formatDate(data.batch.created_at)}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-6 text-right">
                  <div>
                    <p className="text-sm font-semibold text-foreground">
                      {data.batch.total_contacts.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Total</p>
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-emerald-600">
                      {data.batch.valid_whatsapp_count.toLocaleString()}
                    </p>
                    <p className="text-xs text-muted-foreground">Valid WhatsApp</p>
                  </div>
                </div>
              </div>
            </section>

            {/* Sending Numbers — from batch.active_contacts */}
            {(data.batch.active_contacts?.length ?? 0) > 0 && (
              <section className="rounded-2xl border border-border bg-card p-8 shadow-sm">
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                    <Phone className="h-5 w-5 text-accent" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold text-foreground">Sending Numbers</h2>
                    <p className="text-sm text-muted-foreground">Active numbers used in this campaign</p>
                  </div>
                </div>
                <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
                  {data.batch.active_contacts.map((contact) => (
                    <div
                      key={contact.id}
                      className="flex items-center justify-between rounded-xl border border-border bg-muted/30 p-4"
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-8 w-8 items-center justify-center rounded-lg border border-border bg-card">
                          <Phone className="h-4 w-4 text-accent" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-foreground">{contact.phone_number}</p>
                          <p className="text-xs text-muted-foreground">{contact.name}</p>
                        </div>
                      </div>
                      <span className="inline-flex items-center gap-1 rounded-full border border-emerald-200 bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
                        <CheckCircle2 className="h-3 w-3" />
                        Active
                      </span>
                    </div>
                  ))}
                </div>
              </section>
            )}

          </div>

          {/* ── Right column — Message Preview ── */}
          <aside className="lg:col-span-1">
            <section className="sticky top-28 rounded-2xl border border-border bg-card p-8 shadow-sm">
              <div className="flex items-center gap-3 mb-6">
                <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-accent/10">
                  <ImageIcon className="h-5 w-5 text-accent" />
                </div>
                <div>
                  <h2 className="text-xl font-bold text-foreground">Message Preview</h2>
                  <p className="text-sm text-muted-foreground">Campaign message template</p>
                </div>
              </div>
              <div className="rounded-xl border border-border bg-muted/30 p-5">
                <div className="rounded-lg border border-border bg-card p-5 shadow-sm">
                  <div className="flex items-start gap-3">
                    <div className="flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-full bg-accent text-white text-sm font-bold">
                      M
                    </div>
                    <div className="flex-1">
                      <p className="text-xs font-semibold text-foreground mb-2">MUST Connect</p>
                      <div className="rounded-lg rounded-tl-none bg-accent/10 p-4">
                        <p className="text-sm text-foreground leading-relaxed">
                          {(data.message_text ?? "")
                            .replace(/\{name\}/g, "Ahmad")
                            .replace(/\{\{name\}\}/g, "Ahmad")}
                        </p>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
              <div className="mt-4 space-y-2 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Characters</span>
                  <span className="font-medium text-foreground">{data.message_text?.length ?? 0}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Batch</span>
                  <span className="font-medium text-foreground">{data.batch.batch_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Valid Contacts</span>
                  <span className="font-medium text-emerald-600">
                    {data.batch.valid_whatsapp_count.toLocaleString()}
                  </span>
                </div>
              </div>
            </section>
          </aside>

        </div>
      ) : null}
    </AdminLayout>
  );
}