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
import {
  getEngagedStudents,
  type EngagedStudent,
  type EngagedStudentCampaign,
} from "@/api/chats";

export const Route = createFileRoute("/chats/highly-engaged")({
  head: () => ({
    meta: [
      { title: "Highly Engaged Students — MUST Connect" },
      { name: "description", content: "Students showing high interest and active engagement." },
    ],
  }),
  component: HighlyEngagedPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function todayInputDate(): string {
  const d = new Date();
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

function daysAgoInputDate(days: number): string {
  const d = new Date();
  d.setDate(d.getDate() - days);
  const mm = String(d.getMonth() + 1).padStart(2, "0");
  const dd = String(d.getDate()).padStart(2, "0");
  return `${mm}/${dd}/${d.getFullYear()}`;
}

// "MM/DD/YYYY" → Date (start of day)
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

function HighlyEngagedPage() {
  const navigate = useNavigate();

  // ── Filter UI state ──────────────────────────────────────────────────
  const [dateRange, setDateRange] = useState("7");
  const [fromDate, setFromDate] = useState(() => daysAgoInputDate(7));
  const [toDate, setToDate]     = useState(() => todayInputDate());
  const [selectedCampaign, setSelectedCampaign] = useState("all");

  // ── Page state ───────────────────────────────────────────────────────
  const [page, setPage] = useState(1);

  // ── Raw data from API ────────────────────────────────────────────────
  const [allStudents, setAllStudents] = useState<EngagedStudent[]>([]);
  const [allCampaigns, setAllCampaigns] = useState<EngagedStudentCampaign[]>([]);
  const [totalFromApi, setTotalFromApi] = useState(0);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState<string | null>(null);

  // ── Fetch ALL records once (no server-side filter since API ignores them) ──
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getEngagedStudents({ page: 1, per_page: 200 })
      .then((res) => {
        if (cancelled) return;
        setAllStudents(res.items);
        setTotalFromApi(res.meta.total);

        // Build unique campaigns list
        const map = new Map<number, EngagedStudentCampaign>();
        res.items.forEach((s) => map.set(s.campaign.id, s.campaign));
        setAllCampaigns(Array.from(map.values()));
      })
      .catch((err: Error) => { if (!cancelled) setError(err.message); })
      .finally(() => { if (!cancelled) setLoading(false); });

    return () => { cancelled = true; };
  }, []);

  // ── Client-side filtering ────────────────────────────────────────────
  const PER_PAGE = 20;

  const filtered = useMemo(() => {
    const from = parseInputDate(fromDate);
    const to   = parseInputDate(toDate);
    // set "to" to end of day
    if (to) to.setHours(23, 59, 59, 999);

    return allStudents.filter((s) => {
      // Campaign filter
      if (selectedCampaign !== "all" && String(s.campaign.id) !== selectedCampaign) return false;

      // Date filter on last_message_at
      const msgDate = new Date(s.last_message_at);
      if (from && msgDate < from) return false;
      if (to   && msgDate > to)   return false;

      return true;
    });
  }, [allStudents, fromDate, toDate, selectedCampaign]);

  // Reset to page 1 whenever filter changes
  const [appliedFrom, setAppliedFrom]     = useState(fromDate);
  const [appliedTo, setAppliedTo]         = useState(toDate);
  const [appliedCampaign, setAppliedCampaign] = useState("all");

  const visibleStudents = useMemo(() => {
    const from = parseInputDate(appliedFrom);
    const to   = parseInputDate(appliedTo);
    if (to) to.setHours(23, 59, 59, 999);

    return allStudents.filter((s) => {
      if (appliedCampaign !== "all" && String(s.campaign.id) !== appliedCampaign) return false;
      const msgDate = new Date(s.last_message_at);
      if (from && msgDate < from) return false;
      if (to   && msgDate > to)   return false;
      return true;
    });
  }, [allStudents, appliedFrom, appliedTo, appliedCampaign]);

  const totalPages  = Math.max(1, Math.ceil(visibleStudents.length / PER_PAGE));
  const safePage    = Math.min(page, totalPages);
  const pageSlice   = visibleStudents.slice((safePage - 1) * PER_PAGE, safePage * PER_PAGE);

  // ── Handlers ─────────────────────────────────────────────────────────
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

  // ── Pagination pages ─────────────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    if (totalPages <= 7) return Array.from({ length: totalPages }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (safePage > 3) pages.push("…");
    for (let p = Math.max(2, safePage - 1); p <= Math.min(totalPages - 1, safePage + 1); p++) pages.push(p);
    if (safePage < totalPages - 2) pages.push("…");
    pages.push(totalPages);
    return pages;
  }, [safePage, totalPages]);

  const showFrom = (safePage - 1) * PER_PAGE + 1;
  const showTo   = Math.min(safePage * PER_PAGE, visibleStudents.length);

  // ── Export CSV ───────────────────────────────────────────────────────────
  function handleExport() {
    if (visibleStudents.length === 0) return;

    const headers = ["Student Name", "Phone Number", "Campaign", "Replies", "Last Message At"];
    const rows = visibleStudents.map((s) => [
      s.student_name,
      `+${s.student_phone}`,
      s.campaign.name,
      String(s.reply_count),
      new Date(s.last_message_at).toLocaleString(),
    ]);

    const csv = [headers, ...rows]
      .map((row) =>
        row.map((cell) => `"${cell.replace(/"/g, '""')}"`).join(",")
      )
      .join("\n");

    const blob = new Blob([csv], { type: "text/csv;charset=utf-8;" });
    const url  = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href     = url;
    link.download = `highly-engaged-students-${new Date().toISOString().slice(0, 10)}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

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
              <h1 className="text-2xl font-bold tracking-tight">Highly Engaged Students</h1>
              <p className="text-sm text-muted-foreground">
                Students showing high interest and active engagement
              </p>
            </div>
          </div>
          <Button variant="outline" size="sm" onClick={handleExport} disabled={loading || visibleStudents.length === 0}>
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
                  {allCampaigns.map((c) => (
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
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">CAMPAIGN</TableHead>
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">REPLIES</TableHead>
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
                    No students found for the selected filters.
                  </TableCell>
                </TableRow>
              )}

              {!loading && !error && pageSlice.map((s) => (
                <TableRow key={s.conversation_id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <div className="flex h-9 w-9 shrink-0 items-center justify-center rounded-full bg-primary/15 text-sm font-semibold text-primary">
                        {initials(s.student_name)}
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-foreground">{s.student_name}</p>
                      
                      </div>
                    </div>
                  </TableCell>

                  <TableCell className="font-mono text-sm text-foreground">
                    +{s.student_phone}
                  </TableCell>

                  <TableCell>
                    <span className="rounded-full bg-chart-1/15 px-2.5 py-1 text-xs font-medium text-chart-1">
                      {s.campaign.name}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm font-medium text-foreground">
                    {s.reply_count}
                  </TableCell>

                  <TableCell>
                    <button
                      onClick={() =>
                        navigate({
                          to: "/chats",
                          search: { phone: s.student_phone },
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
              <span className="font-medium text-foreground">{visibleStudents.length === 0 ? 0 : showFrom}–{showTo}</span>{" "}
              of{" "}
              <span className="font-medium text-foreground">{visibleStudents.length}</span> students
            </p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm" disabled={safePage <= 1} onClick={() => setPage(safePage - 1)}>‹</Button>
              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="px-1 text-muted-foreground">…</span>
                ) : (
                  <Button
                    key={p}
                    size="sm"
                    variant={p === safePage ? "default" : "outline"}
                    onClick={() => setPage(p as number)}
                  >
                    {p}
                  </Button>
                )
              )}
              <Button variant="outline" size="sm" disabled={safePage >= totalPages} onClick={() => setPage(safePage + 1)}>›</Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}