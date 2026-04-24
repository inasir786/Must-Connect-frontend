import { createFileRoute, Link } from "@tanstack/react-router";
import { useEffect, useState, useCallback } from "react";
import {
  Search, Plus, MoreVertical, Loader2, AlertCircle,
  ChevronLeft, ChevronRight, Eye, Pause, Square,
  Archive, Play, Rocket,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select, SelectContent, SelectItem,
  SelectTrigger, SelectValue,
} from "@/components/ui/select";
import {
  DropdownMenu, DropdownMenuContent,
  DropdownMenuItem, DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  getCampaigns, getRunningCampaign,
  launchCampaign, pauseCampaign, resumeCampaign,
  stopCampaign, updateCampaignStatus,
  type Campaign, type CampaignStatus,
} from "@/api/campaigns";

export const Route = createFileRoute("/campaigns/")({
  head: () => ({
    meta: [
      { title: "Campaigns — MUST Connect" },
      { name: "description", content: "Manage all your outreach campaigns." },
    ],
  }),
  component: CampaignsPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function statusBadge(status?: CampaignStatus) {
  if (!status) return "bg-slate-100 text-slate-600 hover:bg-slate-100";
  const map: Record<CampaignStatus, string> = {
    running:   "bg-emerald-100 text-emerald-700 hover:bg-emerald-100",
    completed: "bg-blue-100 text-blue-700 hover:bg-blue-100",
    draft:     "bg-slate-100 text-slate-600 hover:bg-slate-100",
    paused:    "bg-amber-100 text-amber-700 hover:bg-amber-100",
  };
  return map[status] ?? "bg-slate-100 text-slate-600";
}

function formatDate(iso: string | null | undefined): string {
  if (!iso) return "Not started";
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short", day: "numeric", year: "numeric",
  });
}

function extractError(err: any): string {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) return detail.map((d: any) => String(d?.msg ?? "Unknown error")).join(", ");
  if (typeof detail === "string") return detail;
  return err?.message ?? "Something went wrong.";
}

// ─── Action menu config per status ───────────────────────────────────────────

type ActionDef = {
  label: string;
  icon: React.ReactNode;
  nextStatus: "running" | "paused" | "completed" | "archived";
  destructive?: boolean;
};

function getActions(status?: CampaignStatus, hasRunning?: boolean): ActionDef[] {
  switch (status) {
    case "draft":
      return [
        ...(!hasRunning
          ? [{ label: "Launch Campaign", icon: <Rocket className="h-4 w-4" />, nextStatus: "running" as const }]
          : []
        ),
        { label: "Archive", icon: <Archive className="h-4 w-4" />, nextStatus: "archived" as const, destructive: true },
      ];
    case "running":
      return [
        { label: "Pause Campaign", icon: <Pause  className="h-4 w-4" />, nextStatus: "paused"    as const },
        { label: "Stop Campaign",  icon: <Square className="h-4 w-4" />, nextStatus: "completed" as const, destructive: true },
        { label: "Archive",        icon: <Archive className="h-4 w-4" />, nextStatus: "archived"  as const, destructive: true },
      ];
    case "paused":
      return [
        ...(!hasRunning
          ? [{ label: "Resume Campaign", icon: <Play className="h-4 w-4" />, nextStatus: "running" as const }]
          : []
        ),
        { label: "Stop Campaign", icon: <Square  className="h-4 w-4" />, nextStatus: "completed" as const, destructive: true },
        { label: "Archive",       icon: <Archive className="h-4 w-4" />, nextStatus: "archived"  as const, destructive: true },
      ];
    case "completed":
      return [
        { label: "Archive", icon: <Archive className="h-4 w-4" />, nextStatus: "archived" as const, destructive: true },
      ];
    default:
      return [];
  }
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function CampaignsPage() {
  const [campaigns, setCampaigns]         = useState<Campaign[]>([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState<string | null>(null);
  const [query, setQuery]                 = useState("");
  const [statusFilter, setStatusFilter]   = useState<string>("all");
  const [actionLoading, setActionLoading] = useState<number | null>(null);
  const [hasRunning, setHasRunning]       = useState(false);

  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);
    Promise.all([getCampaigns(), getRunningCampaign()])
      .then(([data, running]) => {
        if (cancelled) return;
        setCampaigns(data);
        setHasRunning(running.campaign_running);
      })
      .catch((err) => { if (!cancelled) setError(extractError(err)); })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const handleAction = useCallback(
    async (campaign: Campaign, nextStatus: ActionDef["nextStatus"]) => {
      setActionLoading(campaign.id);
      setError(null);
      try {
        if (nextStatus === "running" && campaign.status === "draft") {
          await launchCampaign(campaign.id);
        } else if (nextStatus === "paused") {
          await pauseCampaign(campaign.id);
        } else if (nextStatus === "running" && campaign.status === "paused") {
          await resumeCampaign(campaign.id);
        } else if (nextStatus === "completed") {
          await stopCampaign(campaign.id);
        } else {
          await updateCampaignStatus(campaign.id, nextStatus);
        }

        const [updated, running] = await Promise.all([
          getCampaigns(),
          getRunningCampaign(),
        ]);
        setCampaigns(updated);
        setHasRunning(running.campaign_running);
      } catch (err) {
        setError(extractError(err));
      } finally {
        setActionLoading(null);
      }
    },
    []
  );

  const filtered = campaigns.filter((c) => {
    const matchQ =
      !query.trim() ||
      (c.name ?? "").toLowerCase().includes(query.toLowerCase()) ||
      (c.batch_name ?? "").toLowerCase().includes(query.toLowerCase());
    const matchS = statusFilter === "all" || c.status === statusFilter;
    return matchQ && matchS;
  });

  return (
    <AdminLayout
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Campaigns</h1>
            <p className="mt-1 text-sm text-muted-foreground">Manage all your outreach campaigns</p>
          </div>
          <Button
            asChild={!hasRunning}
            disabled={hasRunning}
            className="bg-accent text-accent-foreground hover:bg-accent/90 disabled:opacity-50 disabled:cursor-not-allowed"
            title={hasRunning ? "A campaign is already running" : undefined}
          >
            {hasRunning ? (
              <span>
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </span>
            ) : (
              <Link to="/campaigns/new">
                <Plus className="mr-2 h-4 w-4" />
                Create Campaign
              </Link>
            )}
          </Button>
        </div>
      }
    >
      <div className="space-y-6">
        {hasRunning && (
          <div className="flex items-center gap-2 rounded-xl border border-amber-200 bg-amber-50 px-4 py-3 text-sm font-medium text-amber-700">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>A campaign is currently running. Stop or pause it before creating a new one.</span>
          </div>
        )}

        {error && (
          <div className="flex items-center gap-2 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm font-medium text-red-600">
            <AlertCircle className="h-4 w-4 flex-shrink-0" />
            <span>{error}</span>
          </div>
        )}

        <div className="rounded-xl border border-border bg-card shadow-sm">
          {/* Filters */}
          <div className="flex flex-col gap-3 border-b border-border p-4 sm:flex-row sm:items-center">
            <div className="relative flex-1">
              <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search campaigns..."
                className="pl-9"
              />
            </div>
            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="running">Running</SelectItem>
                <SelectItem value="draft">Draft</SelectItem>
                <SelectItem value="completed">Completed</SelectItem>
                <SelectItem value="paused">Paused</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Table */}
          {loading ? (
            <div className="flex items-center justify-center py-20">
              <Loader2 className="h-7 w-7 animate-spin text-muted-foreground" />
            </div>
          ) : filtered.length === 0 ? (
            <div className="py-20 text-center text-sm text-muted-foreground">
              No campaigns found.
            </div>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-border text-xs uppercase tracking-wider text-muted-foreground">
                    <th className="px-5 py-3 text-left font-medium">Campaign Name</th>
                    <th className="px-5 py-3 text-left font-medium">Batch</th>
                    <th className="px-5 py-3 text-left font-medium">Contacts</th>
                    <th className="px-5 py-3 text-left font-medium">Status</th>
                    <th className="px-5 py-3 text-left font-medium">Start Date</th>
                    <th className="px-5 py-3 text-right font-medium">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {filtered.map((c) => {
                    // hasRunning check excludes the currently running campaign itself
                    const actions    = getActions(c.status, hasRunning && c.status !== "running");
                    const isMutating = actionLoading === c.id;

                    return (
                      <tr
                        key={c.id}
                        className="border-b border-border last:border-0 hover:bg-muted/30"
                      >
                        <td className="px-5 py-4">
                          <Link
                            to="/campaigns/$campaignId"
                            params={{ campaignId: String(c.id) }}
                            className="font-semibold text-accent hover:underline"
                          >
                            {c.name ?? "Untitled"}
                          </Link>
                          <p className="text-xs text-muted-foreground">{c.description ?? ""}</p>
                        </td>
                        <td className="px-5 py-4">
                          <p className="text-foreground">{c.batch_name ?? "—"}</p>
                        </td>
                        <td className="px-5 py-4 font-medium text-foreground">
                          {c.total_contacts != null ? c.total_contacts.toLocaleString() : "—"}
                        </td>
                        <td className="px-5 py-4">
                          {c.status ? (
                            <Badge className={statusBadge(c.status)}>
                              {c.status.charAt(0).toUpperCase() + c.status.slice(1)}
                            </Badge>
                          ) : (
                            <span className="text-xs text-muted-foreground">—</span>
                          )}
                        </td>
                        <td className="px-5 py-4 text-muted-foreground">
                          {formatDate(c.start_date)}
                        </td>
                        <td className="px-5 py-4 text-right">
                          {isMutating ? (
                            <Loader2 className="ml-auto h-4 w-4 animate-spin text-muted-foreground" />
                          ) : (
                            <DropdownMenu>
                              <DropdownMenuTrigger asChild>
                                <button
                                  type="button"
                                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                                  aria-label="More options"
                                >
                                  <MoreVertical className="h-4 w-4" />
                                </button>
                              </DropdownMenuTrigger>
                              <DropdownMenuContent align="end" className="w-44">
                                <DropdownMenuItem asChild>
                                  <Link
                                    to="/campaigns/$campaignId"
                                    params={{ campaignId: String(c.id) }}
                                  >
                                    <Eye className="mr-2 h-4 w-4 text-muted-foreground" />
                                    View Details
                                  </Link>
                                </DropdownMenuItem>

                                {actions.length > 0 && <DropdownMenuSeparator />}

                                {actions.map((action) => (
                                  <DropdownMenuItem
                                    key={action.nextStatus}
                                    onClick={() => handleAction(c, action.nextStatus)}
                                    className={
                                      action.destructive
                                        ? "text-destructive focus:text-destructive"
                                        : ""
                                    }
                                  >
                                    <span className="mr-2">{action.icon}</span>
                                    {action.label}
                                  </DropdownMenuItem>
                                ))}
                              </DropdownMenuContent>
                            </DropdownMenu>
                          )}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          )}

          {/* Pagination */}
          {!loading && filtered.length > 0 && (
            <div className="flex flex-col items-center justify-between gap-3 border-t border-border px-5 py-3 sm:flex-row">
              <p className="text-sm text-muted-foreground">
                Showing{" "}
                <span className="font-medium text-foreground">1–{filtered.length}</span>
                {" "}of{" "}
                <span className="font-medium text-foreground">{filtered.length}</span>
                {" "}campaigns
              </p>
              <div className="flex items-center gap-1">
                <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                  <ChevronLeft className="h-4 w-4" />
                </Button>
                <Button size="icon" className="h-8 w-8 bg-accent text-accent-foreground hover:bg-accent/90">
                  1
                </Button>
                <Button variant="outline" size="icon" className="h-8 w-8" disabled>
                  <ChevronRight className="h-4 w-4" />
                </Button>
              </div>
            </div>
          )}
        </div>
      </div>
    </AdminLayout>
  );
}