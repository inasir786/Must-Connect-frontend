import { createFileRoute } from "@tanstack/react-router";
import { useEffect, useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { getDashboard, DashboardData } from "@/api/dashboard";
import { useNavigate } from "@tanstack/react-router";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MUST Connect" },
      { name: "description", content: "MUST Connect admin dashboard overview." },
    ],
  }),
  component: Dashboard,
});

function formatDate(iso: string) {
  return new Date(iso).toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function capitalizeFirst(str: string) {
  return str.charAt(0).toUpperCase() + str.slice(1);
}

function StatusBadge({ status }: { status: string }) {
  const isValidated = status === "validated";
  const isActive = status === "active";
  const isCompleted = status === "completed";

  let bg = "#fffbeb", color = "#b45309", border = "#fde68a", label = capitalizeFirst(status);

  if (isValidated || isCompleted) {
    bg = "#f0fdf4"; color = "#15803d"; border = "#bbf7d0";
  } else if (isActive) {
    bg = "#eff6ff"; color = "#1d4ed8"; border = "#bfdbfe";
  }

  return (
    <span
      className="px-3 py-1 text-xs font-semibold rounded-full border w-fit"
      style={{ backgroundColor: bg, color, borderColor: border }}
    >
      {label}
    </span>
  );
}

function SkeletonCard() {
  return (
    <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-6 animate-pulse">
      <div className="h-4 bg-slate-100 rounded w-1/3 mb-4" />
      <div className="h-8 bg-slate-100 rounded w-1/2" />
    </div>
  );
}

function Dashboard() {
  const [data, setData] = useState<DashboardData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const navigate = useNavigate();
  useEffect(() => {
    let cancelled = false;
    getDashboard()
      .then((res) => { if (!cancelled) setData(res); })
      .catch((err) => {
        if (!cancelled) {
          const detail = err?.response?.data?.detail;
          setError(typeof detail === "string" ? detail : err?.message || "Failed to load dashboard.");
        }
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, []);

  const campaign = data?.active_campaign;
  const summary = data?.summary;
  const batches = data?.recent_batches ?? [];

  return (
    <AdminLayout
      header={
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">
              Dashboard
            </h1>
            <p className="text-muted-foreground text-sm sm:text-base mt-1">
              Welcome back, Admin
            </p>
          </div>
        </div>
      }
    >
      <main className="px-0 max-w-[1400px]">

        {error && (
          <div className="mb-6 px-4 py-3 rounded-xl text-sm font-medium bg-red-50 text-red-600 border border-red-200">
            {error}
          </div>
        )}

        {/* ── Primary Campaign Card ── */}
        <section className="mb-8 lg:mb-12">
          {loading ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 animate-pulse space-y-4">
              <div className="h-5 bg-slate-100 rounded w-1/3" />
              <div className="h-3 bg-slate-100 rounded w-1/2" />
              <div className="h-2 bg-slate-100 rounded-full w-full" />
              <div className="grid grid-cols-3 gap-4 pt-2">
                {[0, 1, 2].map(i => <div key={i} className="h-10 bg-slate-100 rounded" />)}
              </div>
            </div>
          ) : campaign ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm overflow-hidden">
              <div className="p-6 sm:p-7 lg:p-8">
                {/* Top Row */}
                <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between mb-6 gap-3">
                  <div>
                    <div className="flex items-center gap-3 mb-2">
                      <h2 className="text-lg sm:text-xl font-bold text-slate-900">
                        {campaign.name}
                      </h2>
                      <StatusBadge status={campaign.status} />
                    </div>
                    <p className="text-slate-500 text-xs sm:text-sm">
                      {campaign.description}
                    </p>
                  </div>
                  <button
                    onClick={() => navigate({ to: "/campaigns/$id", params: { id: String(campaign.id) } })}
                    className="flex items-center justify-center gap-2 px-4 py-2 text-white text-xs font-semibold rounded-lg shadow-sm transition-colors w-full sm:w-auto"
                    style={{ backgroundColor: "#003d82" }}
                    onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#1e40af")}
                    onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#003d82")}
                  >
                    <svg className="w-3.5 h-3.5" fill="currentColor" viewBox="0 0 20 20">
                      <path
                        fillRule="evenodd"
                        d="M11.49 3.17c-.38-1.56-2.6-1.56-2.98 0a1.532 1.532 0 01-2.286.948c-1.372-.836-2.942.734-2.106 2.106.54.886.061 2.042-.947 2.287-1.561.379-1.561 2.6 0 2.978a1.532 1.532 0 01.947 2.287c-.836 1.372.734 2.942 2.106 2.106a1.532 1.532 0 012.287.947c.379 1.561 2.6 1.561 2.978 0a1.533 1.533 0 012.287-.947c1.372.836 2.942-.734 2.106-2.106a1.533 1.533 0 01.947-2.287c1.561-.379 1.561-2.6 0-2.978a1.532 1.532 0 01-.947-2.287c.836-1.372-.734-2.942-2.106-2.106a1.532 1.532 0 01-2.287-.947zM10 13a3 3 0 100-6 3 3 0 000 6z"
                        clipRule="evenodd"
                      />
                    </svg>
                    <span>Manage Campaign</span>
                  </button>
                </div>

                {/* Progress Bar */}
                <div className="mb-6">
                  <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-semibold text-slate-700">Campaign Progress</span>
                    <span className="text-xs font-bold" style={{ color: "#003d82" }}>{campaign.progress}%</span>
                  </div>
                  <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                    <div
                      className="h-full rounded-full transition-all duration-500"
                      style={{ width: `${campaign.progress}%`, backgroundColor: "#003d82" }}
                    />
                  </div>
                </div>

                {/* Sub Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-5 sm:gap-6">
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
                        <svg className="w-3 h-3" style={{ color: "#16a34a" }} fill="currentColor" viewBox="0 0 20 20">
                          <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Sent</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{campaign.sent.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#fffbeb" }}>
                        <svg className="w-3 h-3" style={{ color: "#d97706" }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm1-12a1 1 0 10-2 0v4a1 1 0 00.293.707l2.828 2.829a1 1 0 101.415-1.415L11 9.586V6z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Pending</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{campaign.pending.toLocaleString()}</p>
                  </div>
                  <div className="space-y-1.5">
                    <div className="flex items-center gap-2">
                      <div className="w-7 h-7 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#faf5ff" }}>
                        <svg className="w-3 h-3" style={{ color: "#9333ea" }} fill="currentColor" viewBox="0 0 20 20">
                          <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                        </svg>
                      </div>
                      <span className="text-xs font-medium text-slate-500 uppercase tracking-wider">Engagement</span>
                    </div>
                    <p className="text-2xl sm:text-3xl font-bold text-slate-900">{campaign.engagement.toLocaleString()}</p>
                  </div>
                </div>
              </div>
            </div>
          ) : !error ? (
            <div className="bg-white rounded-xl border border-slate-200 shadow-sm p-8 text-center text-slate-400 text-sm">
              No active campaign found.
            </div>
          ) : null}
        </section>

        {/* ── Key Stats Row ── */}
        <section className="mb-8 lg:mb-12">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
            {/* Total Batches */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#eff6ff" }}>
                  <svg className="w-5 h-5" style={{ color: "#003d82" }} fill="currentColor" viewBox="0 0 20 20">
                    <path d="M9 2a1 1 0 000 2h2a1 1 0 100-2H9z" />
                    <path fillRule="evenodd" d="M4 5a2 2 0 012-2 3 3 0 003 3h2a3 3 0 003-3 2 2 0 012 2v11a2 2 0 01-2 2H6a2 2 0 01-2-2V5zm3 4a1 1 0 000 2h.01a1 1 0 100-2H7zm3 0a1 1 0 000 2h3a1 1 0 100-2h-3zm-3 4a1 1 0 100 2h.01a1 1 0 100-2H7zm3 0a1 1 0 100 2h3a1 1 0 100-2h-3z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Total Batches</p>
              {loading ? (
                <div className="h-8 bg-slate-100 rounded w-1/2 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-slate-900">{summary?.total_batches.toLocaleString() ?? "—"}</p>
              )}
            </div>

            {/* Engagement */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#faf5ff" }}>
                  <svg className="w-5 h-5" style={{ color: "#9333ea" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M12 7a1 1 0 110-2h5a1 1 0 011 1v5a1 1 0 11-2 0V8.414l-4.293 4.293a1 1 0 01-1.414 0L8 10.414l-4.293 4.293a1 1 0 01-1.414-1.414l5-5a1 1 0 011.414 0L11 10.586 14.586 7H12z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">Engagement</p>
              {loading ? (
                <div className="h-8 bg-slate-100 rounded w-1/2 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-slate-900">{summary?.engagement.toLocaleString() ?? "—"}</p>
              )}
            </div>

            {/* University Visits */}
            <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
              <div className="flex items-center justify-between mb-4">
                <div className="w-10 h-10 rounded-lg flex items-center justify-center" style={{ backgroundColor: "#f0fdf4" }}>
                  <svg className="w-5 h-5" style={{ color: "#16a34a" }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10.496 2.132a1 1 0 00-.992 0l-7 4A1 1 0 003 8v7a1 1 0 100 2h14a1 1 0 100-2V8a1 1 0 00.496-1.868l-7-4zM6 9a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1zm3 1a1 1 0 012 0v3a1 1 0 11-2 0v-3zm5-1a1 1 0 00-1 1v3a1 1 0 102 0v-3a1 1 0 00-1-1z" clipRule="evenodd" />
                  </svg>
                </div>
              </div>
              <p className="text-sm font-medium text-slate-500 mb-1">University Visits</p>
              {loading ? (
                <div className="h-8 bg-slate-100 rounded w-1/2 animate-pulse" />
              ) : (
                <p className="text-3xl font-bold text-slate-900">{summary?.university_visits.toLocaleString() ?? "—"}</p>
              )}
            </div>
          </div>
        </section>

        {/* ── Recent Batch Uploads ── */}
        <section className="mb-8 lg:mb-12">
          <div className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
            <div className="px-6 sm:px-8 py-6 border-b border-slate-200">
              <h3 className="text-lg font-bold text-slate-900">Recent Batch Uploads</h3>
              <p className="text-sm text-slate-500 mt-1">
                Latest contact batches uploaded to the system
              </p>
            </div>

            {loading ? (
              <div className="divide-y divide-slate-100">
                {[0, 1, 2].map((i) => (
                  <div key={i} className="px-6 sm:px-8 py-5 animate-pulse">
                    <div className="flex items-center justify-between gap-4">
                      <div className="space-y-2 flex-1">
                        <div className="h-4 bg-slate-100 rounded w-1/3" />
                        <div className="h-3 bg-slate-100 rounded w-1/4" />
                      </div>
                      <div className="h-6 bg-slate-100 rounded-full w-20" />
                    </div>
                  </div>
                ))}
              </div>
            ) : batches.length === 0 ? (
              <div className="px-6 sm:px-8 py-10 text-center text-slate-400 text-sm">
                No recent batches found.
              </div>
            ) : (
              <div className="divide-y divide-slate-100">
                {batches.map((batch) => (
                  <div
                    key={batch.id}
                    className="px-6 sm:px-8 py-5 hover:bg-slate-50 transition-colors"
                  >
                    <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                      <div className="flex-1">
                        <h4 className="font-semibold text-slate-900 mb-1">{batch.name}</h4>
                        <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7V3m8 4V3m-9 8h10M5 21h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v12a2 2 0 002 2z" />
                            </svg>
                            <span>{formatDate(batch.upload_date)}</span>
                          </span>
                          <span className="flex items-center gap-1">
                            <svg className="w-3 h-3" fill="currentColor" viewBox="0 0 20 20">
                              <path d="M9 6a3 3 0 11-6 0 3 3 0 016 0zM17 6a3 3 0 11-6 0 3 3 0 016 0zM12.93 17c.046-.327.07-.66.07-1a6.97 6.97 0 00-1.5-4.33A5 5 0 0119 16v1h-6.07zM6 11a5 5 0 015 5v1H1v-1a5 5 0 015-5z" />
                            </svg>
                            <span>{batch.total_contacts.toLocaleString()} contacts</span>
                          </span>
                        </div>
                      </div>
                      <StatusBadge status={batch.status} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </section>

      </main>
    </AdminLayout>
  );
}