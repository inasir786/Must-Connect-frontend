import { createFileRoute, useNavigate } from "@tanstack/react-router";
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
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  ArrowLeft,
  Calendar,
  Download,
  Filter,
  Loader2,
  AlertCircle,
  MessageSquare,
  RotateCw,
} from "lucide-react";
import { useState, useEffect, useMemo } from "react";
import { getFeeInquiryLeads, type FeeInquiryLead } from "@/api/chats";

export const Route = createFileRoute("/chats/fee-inquiry")({
  head: () => ({
    meta: [
      { title: "Fee Inquiry Leads — MUST Connect" },
      { name: "description", content: "Prospective students inquiring about fees and financial details." },
    ],
  }),
  component: FeeInquiryPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayInputDate(): string {
  const d = new Date();
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

function daysAgoInputDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  return `${String(d.getMonth() + 1).padStart(2, "0")}/${String(d.getDate()).padStart(2, "0")}/${d.getFullYear()}`;
}

function parseInputDate(s: string): Date | null {
  const [mm, dd, yyyy] = s.split("/");
  if (!mm || !dd || !yyyy) return null;
  const d = new Date(Number(yyyy), Number(mm) - 1, Number(dd));
  return isNaN(d.getTime()) ? null : d;
}

function initials(name: string) {
  return name.split(" ").map((w) => w[0]).join("").slice(0, 2).toUpperCase();
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function FeeInquiryPage() {
  const navigate = useNavigate();

  // ── Filter UI state ──────────────────────────────────────────────────
  const [dateRange, setDateRange]         = useState("7");
  const [fromDate, setFromDate]           = useState(() => daysAgoInputDate(7));
  const [toDate, setToDate]               = useState(() => todayInputDate());
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  // ── Applied (committed on Apply click) ───────────────────────────────
  const [appliedFrom, setAppliedFrom]         = useState(() => daysAgoInputDate(7));
  const [appliedTo, setAppliedTo]             = useState(() => todayInputDate());
  const [appliedCampaign, setAppliedCampaign] = useState("all");

  // ── Page ─────────────────────────────────────────────────────────────
  const [page, setPage] = useState(1);
  const PER_PAGE = 20;

  // ── Raw API data ──────────────────────────────────────────────────────
  const [allLeads, setAllLeads]         = useState<FeeInquiryLead[]>([]);
  const [campaigns, setCampaigns]       = useState<{ id: number; name: string }[]>([]);
  const [loading, setLoading]           = useState(true);
  const [error, setError]               = useState<string | null>(null);

  // ── Fetch all once ────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getFeeInquiryLeads({ page: 1, per_page: 200 })
      .then((res) => {
        if (cancelled) return;
        setAllLeads(res.items);

        // Unique campaigns
        const map = new Map<number, { id: number; name: string }>();
        res.items.forEach((l) => map.set(l.campaign.id, l.campaign));
        setCampaigns(Array.from(map.values()));
      })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Client-side filtering ─────────────────────────────────────────────
  const visibleLeads = useMemo(() => {
    const from = parseInputDate(appliedFrom);
    const to   = parseInputDate(appliedTo);
    if (to) to.setHours(23, 59, 59, 999);

    return allLeads.filter((l) => {
      if (appliedCampaign !== "all" && String(l.campaign.id) !== appliedCampaign) return false;
      const msgDate = new Date(l.last_message_at);
      if (from && msgDate < from) return false;
      if (to   && msgDate > to)   return false;
      return true;
    });
  }, [allLeads, appliedFrom, appliedTo, appliedCampaign]);

  const totalPages  = Math.max(1, Math.ceil(visibleLeads.length / PER_PAGE));
  const safePage    = Math.min(page, totalPages);
  const pageSlice   = visibleLeads.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // ── Handlers ──────────────────────────────────────────────────────────
  function handleDateRangeChange(val: string) {
    setDateRange(val);
    if (val !== "custom") {
      setFromDate(daysAgoInputDate(Number(val)));
      setToDate(todayInputDate());
    }
  }

  function handleApply() {
    setAppliedFrom(fromDate);
    setAppliedTo(toDate);
    setAppliedCampaign(selectedCampaign);
    setPage(1);
  }

  function handleReset() {
    const f = daysAgoInputDate(7);
    const t = todayInputDate();
    setDateRange("7");
    setFromDate(f);
    setToDate(t);
    setSelectedCampaign("all");
    setAppliedFrom(f);
    setAppliedTo(t);
    setAppliedCampaign("all");
    setPage(1);
  }

  function handleExport() {
    if (visibleLeads.length === 0) return;

    const headers = ["Student Name", "Phone Number", "Program Interest", "Campaign", "First Inquiry At", "Last Message At"];
    const rows = visibleLeads.map((l) => [
      l.student_name,
      `+${l.phone_number}`,
      l.program_interest ?? "—",
      l.campaign.name,
      new Date(l.first_inquiry_at).toLocaleString(),
      new Date(l.last_message_at).toLocaleString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(","))
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `fee-inquiry-leads-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // ── Pagination pages ──────────────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (safePage > 3) pages.push("…");
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) pages.push(p);
    if (safePage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }, [safePage, totalPages]);

  const showFrom = visibleLeads.length === 0 ? 0 : (safePage - 1) * PER_PAGE + 1;
  const showTo   = Math.min(safePage * PER_PAGE, visibleLeads.length);

  // ── Render ────────────────────────────────────────────────────────────
  return (
    <AdminLayout
      header={
        <div className="flex w-full items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <button
              onClick={() => navigate({ to: "/chats" })}
              className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
              aria-label="Back"
            >
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-2xl font-bold tracking-tight">Fee Inquiry Leads</h1>
              <p className="text-sm text-muted-foreground">
                Prospective students inquiring about fees and financial details
              </p>
            </div>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleExport}
            disabled={loading || visibleLeads.length === 0}
          >
            <Download className="mr-2 h-4 w-4" /> Export
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-5">
        {/* Filter bar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-5">
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground">
                DATE RANGE
              </label>
              <Select value={dateRange} onValueChange={handleDateRangeChange}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                  <SelectItem value="custom">Custom</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground">
                FROM DATE
              </label>
              <div className="relative">
                <Input
                  value={fromDate}
                  onChange={(e) => { setFromDate(e.target.value); setDateRange("custom"); }}
                  placeholder="MM/DD/YYYY"
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground">
                TO DATE
              </label>
              <div className="relative">
                <Input
                  value={toDate}
                  onChange={(e) => { setToDate(e.target.value); setDateRange("custom"); }}
                  placeholder="MM/DD/YYYY"
                />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>

            <div>
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground">
                CAMPAIGN
              </label>
              <Select value={selectedCampaign} onValueChange={setSelectedCampaign}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  {campaigns.map((c) => (
                    <SelectItem key={c.id} value={String(c.id)}>{c.name}</SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex gap-2">
              <Button className="flex-1" onClick={handleApply} disabled={loading}>
                {loading
                  ? <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                  : <Filter className="mr-2 h-4 w-4" />}
                Apply Filter
              </Button>
              <Button variant="outline" size="icon" onClick={handleReset} disabled={loading}>
                <RotateCw className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-hidden rounded-xl border border-border bg-card">
          <Table>
            <TableHeader>
              <TableRow className="bg-muted/40">
                <TableHead className="px-4 py-3 text-[11px] font-semibold tracking-wider text-muted-foreground">STUDENT</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">PHONE NUMBER</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">PROGRAM INTEREST</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">CAMPAIGN</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {loading && (
                <TableRow>
                  <TableCell colSpan={5} className="py-16 text-center">
                    <Loader2 className="mx-auto h-5 w-5 animate-spin text-muted-foreground" />
                  </TableCell>
                </TableRow>
              )}

              {!loading && error && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2">
                      <AlertCircle className="h-5 w-5 text-destructive" />
                      <p className="text-sm text-destructive">{error}</p>
                    </div>
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error && pageSlice.length === 0 && (
                <TableRow>
                  <TableCell colSpan={5} className="py-12 text-center text-sm text-muted-foreground">
                    No fee inquiry leads found for the selected filters.
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error && pageSlice.map((l) => (
                <TableRow key={l.conversation_id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {initials(l.student_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{l.student_name}</p>
                        <p className="text-xs text-muted-foreground">ID: {l.conversation_id}</p>
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-sm text-foreground">
                    +{l.phone_number}
                  </TableCell>

                  <TableCell>
                    {l.program_interest ? (
                      <p className="text-sm font-medium text-foreground">{l.program_interest}</p>
                    ) : (
                      <p className="text-sm text-muted-foreground">—</p>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="rounded-full bg-chart-1/15 px-2.5 py-1 text-xs font-medium text-chart-1">
                      {l.campaign.name}
                    </span>
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() =>
                        navigate({
                          to: "/chats",
                          search: { phone: l.phone_number },
                        })
                      }
                      className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90"
                    >
                      <MessageSquare className="h-4 w-4" />
                    </button>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>

          {/* Pagination */}
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <p className="text-muted-foreground">
              Showing{" "}
              <span className="font-medium text-foreground">{showFrom}–{showTo}</span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{visibleLeads.length}</span> leads
            </p>
            <div className="flex items-center gap-1">
              <Button
                variant="outline" size="sm"
                disabled={safePage <= 1}
                onClick={() => setPage(safePage - 1)}
              >‹</Button>

              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="px-1 text-muted-foreground">…</span>
                ) : (
                  <Button
                    key={p} size="sm"
                    variant={p === safePage ? "default" : "outline"}
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}

              <Button
                variant="outline" size="sm"
                disabled={safePage >= totalPages}
                onClick={() => setPage(safePage + 1)}
              >›</Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}