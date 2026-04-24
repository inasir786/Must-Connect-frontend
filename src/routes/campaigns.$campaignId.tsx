import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import {
  ArrowLeft,
  Pause,
  StopCircle,
  Loader2,
  AlertCircle,
  Layers,
  Phone,
  Image as ImageIcon,
  CheckCircle2,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { getCampaign, type CampaignDetail } from "@/api/campaigns";

export const Route = createFileRoute("/campaigns/$campaignId")({
  head: () => ({
    meta: [
      { title: "Campaign Details — MUST Connect" },
      { name: "description", content: "View campaign details and progress." },
    ],
  }),
  component: CampaignDetailPage,
});

function CampaignDetailPage() {
  const { campaignId } = Route.useParams();
  const [data, setData] = useState<CampaignDetail | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    getCampaign(Number(campaignId))
      .then((d) => {
        if (!cancelled) setData(d);
      })
      .catch((err) => {
        if (!cancelled) setError(err?.message ?? "Failed to load campaign");
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });
    return () => {
      cancelled = true;
    };
  }, [campaignId]);

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
              <h1 className="text-2xl font-bold text-foreground md:text-3xl">
                Campaign Details
              </h1>
              <p className="mt-1 text-sm text-muted-foreground">
                {data?.name ?? "Loading…"}
              </p>
            </div>
          </div>
          {data && (
            <div className="flex flex-wrap items-center gap-2">
              <Button variant="outline">
                <Pause className="mr-2 h-4 w-4" />
                Pause Campaign
              </Button>
              <Button variant="outline" className="border-red-200 text-destructive hover:bg-red-50">
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
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-6 lg:col-span-2">
            {/* Summary */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <div className="mb-4 flex items-center justify-between">
                <h2 className="text-base font-semibold text-foreground">Campaign Summary</h2>
                <Badge className="bg-emerald-100 text-emerald-700 hover:bg-emerald-100">
                  {data.status.charAt(0).toUpperCase() + data.status.slice(1)}
                </Badge>
              </div>
              <dl className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Name</dt>
                  <dd className="mt-1 font-medium text-foreground">{data.name}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Description</dt>
                  <dd className="mt-1 font-medium text-foreground">{data.description}</dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Start Date</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {data.start_date
                      ? new Date(data.start_date).toLocaleDateString("en-US", {
                          month: "short",
                          day: "numeric",
                          year: "numeric",
                        })
                      : "Not started"}
                  </dd>
                </div>
                <div>
                  <dt className="text-xs uppercase tracking-wider text-muted-foreground">Total Contacts</dt>
                  <dd className="mt-1 font-medium text-foreground">
                    {data.contacts.toLocaleString()}
                  </dd>
                </div>
              </dl>
            </section>

            {/* Progress */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">Progress Overview</h2>
              <div className="mb-2 flex items-center justify-between text-sm">
                <span className="text-muted-foreground">Sent</span>
                <span className="font-semibold text-foreground">
                  {data.progress.sent.toLocaleString()} / {data.progress.total.toLocaleString()}
                </span>
              </div>
              <Progress
                value={
                  data.progress.total > 0
                    ? (data.progress.sent / data.progress.total) * 100
                    : 0
                }
              />
              <div className="mt-4 grid grid-cols-2 gap-4 text-sm">
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Sent</p>
                  <p className="mt-0.5 text-xl font-bold text-emerald-600">
                    {data.progress.sent.toLocaleString()}
                  </p>
                </div>
                <div className="rounded-lg border border-border bg-muted/30 p-3">
                  <p className="text-xs text-muted-foreground">Pending</p>
                  <p className="mt-0.5 text-xl font-bold text-amber-600">
                    {data.progress.pending.toLocaleString()}
                  </p>
                </div>
              </div>
            </section>

            {/* Linked batches */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <Layers className="h-4 w-4 text-muted-foreground" />
                Linked Batches
              </h2>
              <div className="space-y-2">
                {data.linked_batches.map((b) => (
                  <div
                    key={b.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-foreground">
                        {b.batch_name} — {b.education_year}
                      </p>
                      <p className="text-xs text-muted-foreground">{b.title}</p>
                    </div>
                    <p className="text-sm font-semibold text-foreground">
                      {b.valid_whatsapp_count.toLocaleString()}{" "}
                      <span className="text-xs font-normal text-muted-foreground">contacts</span>
                    </p>
                  </div>
                ))}
              </div>
            </section>

            {/* Sending numbers */}
            <section className="rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 flex items-center gap-2 text-base font-semibold text-foreground">
                <Phone className="h-4 w-4 text-muted-foreground" />
                Sending Numbers
              </h2>
              <div className="space-y-2">
                {data.sending_numbers.map((n) => (
                  <div
                    key={n.id}
                    className="flex items-center justify-between rounded-lg border border-border px-4 py-3"
                  >
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-emerald-100 text-emerald-700">
                        <Phone className="h-4 w-4" />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{n.label}</p>
                        <p className="text-xs text-muted-foreground">WhatsApp Business</p>
                      </div>
                    </div>
                    <span className="inline-flex items-center gap-1 rounded-full bg-emerald-100 px-2.5 py-0.5 text-xs font-medium text-emerald-700">
                      <CheckCircle2 className="h-3 w-3" /> Active
                    </span>
                  </div>
                ))}
              </div>
            </section>
          </div>

          {/* Right column — Message preview */}
          <aside className="lg:col-span-1">
            <section className="sticky top-28 rounded-xl border border-border bg-card p-5 shadow-sm">
              <h2 className="mb-4 text-base font-semibold text-foreground">Message Preview</h2>
              <div className="rounded-lg bg-muted/40 p-3">
                <div className="rounded-lg bg-card p-3 shadow-sm">
                  <div className="mb-2 flex items-center gap-2">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-emerald-500 text-[10px] font-bold text-white">
                      M
                    </div>
                    <p className="text-xs font-semibold">MUST University</p>
                  </div>
                  <div className="mb-2 flex h-28 items-center justify-center rounded bg-muted text-muted-foreground">
                    <ImageIcon className="h-6 w-6" />
                  </div>
                  <p className="text-xs leading-relaxed text-foreground">
                    {data.message_template}
                  </p>
                </div>
              </div>
              <Separator className="my-4" />
              <div className="space-y-1.5 text-xs">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Template</span>
                  <span className="font-medium text-foreground">{data.template_name}</span>
                </div>
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Characters</span>
                  <span className="font-medium text-foreground">
                    {data.message_template.length}
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