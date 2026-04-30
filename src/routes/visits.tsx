import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useMemo } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getVisits, updateVisitStatus, type Visit, type VisitStatus } from "@/api/visits";

export const Route = createFileRoute("/visits")({
  head: () => ({
    meta: [
      { title: "Visits — MUST Connect" },
      { name: "description", content: "Manage campus visit schedules." },
    ],
  }),
  component: VisitsPage,
});

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatDate(iso: string): string {
  const datePart = iso.slice(0, 10);
  const [year, month, day] = datePart.split("-").map(Number);
  return new Date(year, month - 1, day).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatTime(t: string): string {
  const [h, m] = t.split(":").map(Number);
  const ampm = h >= 12 ? "PM" : "AM";
  const hour = h % 12 || 12;
  return `${hour}:${String(m).padStart(2, "0")} ${ampm}`;
}

function initials(name: string) {
  return name
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();
}

const AVATAR_COLORS = [
  "#fde68a", "#bfdbfe", "#fecaca", "#bbf7d0",
  "#e9d5ff", "#fed7aa", "#a5f3fc", "#fbcfe8",
  "#d9f99d", "#fcd34d",
];

// ─── Status Select ─────────────────────────────────────────────────────────────

function StatusSelect({
  visit,
  onUpdate,
}: {
  visit: Visit;
  onUpdate: (id: number, status: "done" | "missed") => Promise<void>;
}) {
  const [current, setCurrent] = useState<VisitStatus>(visit.status);
  const [loading, setLoading] = useState(false);

  async function handleChange(e: React.ChangeEvent<HTMLSelectElement>) {
    const next = e.target.value as VisitStatus;
    if (next === current) return;
    if (next === "pending") return;

    const prev = current;
    setLoading(true);
    setCurrent(next);

    try {
      await onUpdate(visit.id, next as "done" | "missed");
    } catch {
      setCurrent(prev);
    } finally {
      setLoading(false);
    }
  }

  // ── Static badge for done ──
  if (current === "done") {
    return (
      <span className="inline-flex items-center rounded-lg border border-green-200 bg-green-50 px-3 py-1.5 text-xs font-semibold text-green-700">
        Done
      </span>
    );
  }

  // ── Static badge for missed ──
  if (current === "missed") {
    return (
      <span className="inline-flex items-center rounded-lg border border-red-200 bg-red-50 px-3 py-1.5 text-xs font-semibold text-red-700">
        Missed
      </span>
    );
  }

  // ── Editable dropdown only for pending ──
  return (
    <div className="relative inline-flex items-center">
      <select
        value={current}
        onChange={handleChange}
        disabled={loading}
        className={[
          "appearance-none rounded-lg border px-3 py-1.5 pr-7",
          "text-xs font-semibold focus:outline-none focus:ring-2 transition-all cursor-pointer",
          "bg-amber-50 text-amber-700 border-amber-200 focus:ring-amber-200",
          loading ? "opacity-50 cursor-not-allowed" : "",
        ].join(" ")}
      >
        <option value="pending">Pending</option>
        <option value="done">Done</option>
        <option value="missed">Missed</option>
      </select>

      {loading ? (
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <svg
            className="h-3 w-3 animate-spin text-amber-700"
            fill="none"
            viewBox="0 0 24 24"
          >
            <circle
              className="opacity-25"
              cx="12"
              cy="12"
              r="10"
              stroke="currentColor"
              strokeWidth="4"
            />
            <path
              className="opacity-75"
              fill="currentColor"
              d="M4 12a8 8 0 018-8v8z"
            />
          </svg>
        </span>
      ) : (
        <span className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2">
          <svg
            className="h-3 w-3 text-amber-700"
            fill="none"
            stroke="currentColor"
            strokeWidth={2.5}
            viewBox="0 0 24 24"
          >
            <path strokeLinecap="round" strokeLinejoin="round" d="M19 9l-7 7-7-7" />
          </svg>
        </span>
      )}
    </div>
  );
}

// ─── Avatar ───────────────────────────────────────────────────────────────────

function Avatar({ name, index }: { name: string; index: number }) {
  return (
    <div
      className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-xs font-semibold text-slate-700"
      style={{ backgroundColor: AVATAR_COLORS[index % AVATAR_COLORS.length] }}
    >
      {initials(name)}
    </div>
  );
}

// ─── Spinner ──────────────────────────────────────────────────────────────────

function Spinner() {
  return (
    <svg
      className="mx-auto h-5 w-5 animate-spin text-slate-400"
      fill="none"
      viewBox="0 0 24 24"
    >
      <circle
        className="opacity-25"
        cx="12"
        cy="12"
        r="10"
        stroke="currentColor"
        strokeWidth="4"
      />
      <path
        className="opacity-75"
        fill="currentColor"
        d="M4 12a8 8 0 018-8v8z"
      />
    </svg>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

function VisitsPage() {
  const [visits, setVisits] = useState<Visit[]>([]);
  const [meta, setMeta] = useState({
    total: 0,
    page: 1,
    per_page: 20,
    total_pages: 1,
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [page, setPage] = useState(1);
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("All Dates");

  // ── Fetch ──────────────────────────────────────────────────────────────
  useEffect(() => {
    let cancelled = false;
    setLoading(true);
    setError(null);

    getVisits(page)
      .then((res) => {
        if (!cancelled) {
          setVisits(res.items);
          setMeta(res.meta);
        }
      })
      .catch((err: Error) => {
        if (!cancelled) setError(err.message);
      })
      .finally(() => {
        if (!cancelled) setLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [page]);

  // ── Status update ──────────────────────────────────────────────────────
  async function handleStatusUpdate(id: number, status: "done" | "missed") {
    const updated = await updateVisitStatus(id, status);
    setVisits((prev) =>
      prev.map((v) => (v.id === id ? { ...v, status: updated.status } : v))
    );
  }

  // ── Client-side filters ────────────────────────────────────────────────
  const filtered = useMemo(() => {
    return visits.filter((v) => {
      if (
        statusFilter !== "All Status" &&
        v.status !== statusFilter.toLowerCase()
      )
        return false;

      if (dateFilter !== "All Dates") {
        const datePart = v.visit_date.slice(0, 10);
        const [y, mo, d] = datePart.split("-").map(Number);
        const visitDate = new Date(y, mo - 1, d);
        const today = new Date();
        today.setHours(0, 0, 0, 0);

        if (dateFilter === "Today") {
          if (visitDate.getTime() !== today.getTime()) return false;
        } else if (dateFilter === "This Week") {
          const weekAgo = new Date(today);
          weekAgo.setDate(today.getDate() - 7);
          if (visitDate < weekAgo) return false;
        } else if (dateFilter === "This Month") {
          if (
            visitDate.getMonth() !== today.getMonth() ||
            visitDate.getFullYear() !== today.getFullYear()
          )
            return false;
        }
      }
      return true;
    });
  }, [visits, statusFilter, dateFilter]);

  // ── Stats ──────────────────────────────────────────────────────────────
  const pendingCount = visits.filter((v) => v.status === "pending").length;
  const doneCount = visits.filter((v) => v.status === "done").length;
  const missedCount = visits.filter((v) => v.status === "missed").length;

  // ── Pagination ─────────────────────────────────────────────────────────
  const pageNumbers = useMemo(() => {
    const total = meta.total_pages;
    if (total <= 5) return Array.from({ length: total }, (_, i) => i + 1);
    const pages: (number | "…")[] = [1];
    if (page > 3) pages.push("…");
    for (
      let p = Math.max(2, page - 1);
      p <= Math.min(total - 1, page + 1);
      p++
    )
      pages.push(p);
    if (page < total - 2) pages.push("…");
    pages.push(total);
    return pages;
  }, [page, meta.total_pages]);

  const showingFrom =
    meta.total === 0 ? 0 : (meta.page - 1) * meta.per_page + 1;
  const showingTo = Math.min(meta.page * meta.per_page, meta.total);

  // ── Render ─────────────────────────────────────────────────────────────
  return (
    <AdminLayout
      header={
        <div>
          <h1 className="text-2xl font-bold tracking-tight text-foreground sm:text-3xl">
            Visits
          </h1>
          <p className="mt-1 text-sm text-muted-foreground sm:text-base">
            Manage campus visit schedules
          </p>
        </div>
      }
    >
      <main className="max-w-[1400px] px-0">
        {/* ── Stats ── */}
        <section className="mb-8 grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4 sm:gap-6">
          {/* Total Visits */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#eff6ff" }}
              >
                <svg
                  className="h-5 w-5"
                  style={{ color: "#003d82" }}
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <rect x="3" y="4" width="18" height="18" rx="2" ry="2" />
                  <line x1="16" y1="2" x2="16" y2="6" />
                  <line x1="8" y1="2" x2="8" y2="6" />
                  <line x1="3" y1="10" x2="21" y2="10" />
                </svg>
              </div>
            </div>
            <h3 className="mb-1 text-xs font-medium text-slate-500">Total Visits</h3>
            <p className="text-2xl font-bold text-slate-900">{meta.total}</p>
          </div>

          {/* Pending */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#fffbeb" }}
              >
                <svg
                  className="h-5 w-5 text-amber-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <polyline points="12 6 12 12 16 14" />
                </svg>
              </div>
            </div>
            <h3 className="mb-1 text-xs font-medium text-slate-500">Pending</h3>
            <p className="text-2xl font-bold text-slate-900">{pendingCount}</p>
          </div>

          {/* Done */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#f0fdf4" }}
              >
                <svg
                  className="h-5 w-5 text-green-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                </svg>
              </div>
            </div>
            <h3 className="mb-1 text-xs font-medium text-slate-500">Done</h3>
            <p className="text-2xl font-bold text-slate-900">{doneCount}</p>
          </div>

          {/* Missed */}
          <div className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
            <div className="mb-2 flex items-center justify-between">
              <div
                className="flex h-10 w-10 items-center justify-center rounded-xl"
                style={{ backgroundColor: "#fef2f2" }}
              >
                <svg
                  className="h-5 w-5 text-red-600"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={1.8}
                  viewBox="0 0 24 24"
                >
                  <circle cx="12" cy="12" r="10" />
                  <line x1="12" y1="8" x2="12" y2="12" />
                  <line x1="12" y1="16" x2="12.01" y2="16" />
                </svg>
              </div>
            </div>
            <h3 className="mb-1 text-xs font-medium text-slate-500">Missed</h3>
            <p className="text-2xl font-bold text-slate-900">{missedCount}</p>
          </div>
        </section>

        {/* ── Table Section ── */}
        <section className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
          {/* Header */}
          <div className="flex flex-col gap-3 border-b border-slate-200 px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
            <h2 className="text-base font-semibold text-slate-900">Visit Schedule</h2>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => { setStatusFilter(e.target.value); setPage(1); }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#003d82] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>Done</option>
                <option>Missed</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => { setDateFilter(e.target.value); setPage(1); }}
                className="rounded-xl border border-slate-200 bg-white px-3 py-1.5 text-sm text-slate-700 focus:border-[#003d82] focus:outline-none focus:ring-2 focus:ring-blue-100 transition-all"
              >
                <option>All Dates</option>
                <option>Today</option>
                <option>This Week</option>
                <option>This Month</option>
              </select>
            </div>
          </div>

          {/* Table */}
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="border-b border-slate-200 bg-slate-50">
                <tr>
                  {["Name", "Number", "Date of Visit", "Time", "Status"].map((h) => (
                    <th
                      key={h}
                      className="px-6 py-3 text-left text-xs font-semibold uppercase tracking-wider text-slate-600"
                    >
                      {h}
                    </th>
                  ))}
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {/* Loading */}
                {loading && (
                  <tr>
                    <td colSpan={5} className="py-16 text-center">
                      <Spinner />
                    </td>
                  </tr>
                )}

                {/* Error */}
                {!loading && error && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center">
                      <div className="flex flex-col items-center gap-2">
                        <svg
                          className="h-5 w-5 text-red-500"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth={2}
                          viewBox="0 0 24 24"
                        >
                          <circle cx="12" cy="12" r="10" />
                          <line x1="12" y1="8" x2="12" y2="12" />
                          <line x1="12" y1="16" x2="12.01" y2="16" />
                        </svg>
                        <p className="text-sm text-red-600">{error}</p>
                      </div>
                    </td>
                  </tr>
                )}

                {/* Empty */}
                {!loading && !error && filtered.length === 0 && (
                  <tr>
                    <td colSpan={5} className="py-12 text-center text-sm text-slate-400">
                      No visits found for the selected filters.
                    </td>
                  </tr>
                )}

                {/* Rows */}
                {!loading &&
                  !error &&
                  filtered.map((v, i) => (
                    <tr key={v.id} className="transition-colors hover:bg-slate-50">
                      {/* Name */}
                      <td className="px-6 py-3">
                        <div className="flex items-center gap-3">
                          <Avatar name={v.student_name} index={i} />
                          <span className="text-sm font-medium text-slate-900">
                            {v.student_name}
                          </span>
                        </div>
                      </td>

                      {/* Number */}
                      <td className="px-6 py-3 text-sm text-slate-600">
                        {v.phone_number}
                      </td>

                      {/* Date */}
                      <td className="px-6 py-3 text-sm text-slate-600">
                        {formatDate(v.visit_date)}
                      </td>

                      {/* Time */}
                      <td className="px-6 py-3 text-sm text-slate-600">
                        {formatTime(v.visit_time)}
                      </td>

                      {/* Status */}
                      <td className="px-6 py-3">
                        <StatusSelect visit={v} onUpdate={handleStatusUpdate} />
                      </td>
                    </tr>
                  ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex flex-col items-center justify-between gap-3 border-t border-slate-200 px-6 py-4 sm:flex-row sm:px-8">
            <p className="text-sm text-slate-600">
              Showing{" "}
              <span className="font-medium text-slate-700">{showingFrom}–{showingTo}</span>{" "}
              of{" "}
              <span className="font-medium text-slate-700">{meta.total}</span>{" "}
              visits
            </p>
            <div className="flex items-center gap-1.5">
              <button
                disabled={page <= 1 || loading}
                onClick={() => setPage((p) => p - 1)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
                </svg>
                Previous
              </button>

              {pageNumbers.map((p, i) =>
                p === "…" ? (
                  <span key={`e${i}`} className="px-2 text-slate-400">…</span>
                ) : (
                  <button
                    key={p}
                    onClick={() => setPage(p as number)}
                    disabled={loading}
                    className="rounded-lg px-3 py-1.5 text-sm font-medium transition-colors disabled:opacity-40"
                    style={
                      p === page
                        ? { backgroundColor: "#003d82", color: "#fff" }
                        : { color: "#475569" }
                    }
                  >
                    {p}
                  </button>
                )
              )}

              <button
                disabled={page >= meta.total_pages || loading}
                onClick={() => setPage((p) => p + 1)}
                className="flex items-center gap-1 rounded-lg border border-slate-200 px-3 py-1.5 text-sm font-medium text-slate-600 transition-all hover:bg-slate-50 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Next
                <svg
                  className="h-4 w-4"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth={2}
                  viewBox="0 0 24 24"
                >
                  <path strokeLinecap="round" strokeLinejoin="round" d="M9 5l7 7-7 7" />
                </svg>
              </button>
            </div>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}