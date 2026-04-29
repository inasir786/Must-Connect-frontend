import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Calendar, Clock, ChevronDown } from "lucide-react";

export const Route = createFileRoute("/visits")({
  head: () => ({
    meta: [
      { title: "Visits — MUST Connect" },
      { name: "description", content: "Manage campus visit schedules." },
    ],
  }),
  component: VisitsPage,
});

type VisitStatus = "Pending" | "Done" | "Missed";

interface Visit {
  id: number;
  name: string;
  number: string;
  date: string;
  time: string;
  status: VisitStatus;
  avatarColor: string;
}

const visits: Visit[] = [
  { id: 1, name: "Sarah Ahmed", number: "+92 300 1234567", date: "Jan 15, 2024", time: "10:00 AM", status: "Pending", avatarColor: "#fde68a" },
  { id: 2, name: "Ali Hassan", number: "+92 301 9876543", date: "Jan 15, 2024", time: "11:30 AM", status: "Done", avatarColor: "#bfdbfe" },
  { id: 3, name: "Fatima Khan", number: "+92 333 5551234", date: "Jan 16, 2024", time: "2:00 PM", status: "Missed", avatarColor: "#fecaca" },
  { id: 4, name: "Ahmed Raza", number: "+92 321 4567890", date: "Jan 16, 2024", time: "3:30 PM", status: "Done", avatarColor: "#bbf7d0" },
  { id: 5, name: "Ayesha Malik", number: "+92 345 7778888", date: "Jan 17, 2024", time: "9:00 AM", status: "Pending", avatarColor: "#e9d5ff" },
  { id: 6, name: "Bilal Tariq", number: "+92 312 9998765", date: "Jan 17, 2024", time: "1:00 PM", status: "Missed", avatarColor: "#fed7aa" },
  { id: 7, name: "Zainab Ali", number: "+92 334 2223344", date: "Jan 18, 2024", time: "10:30 AM", status: "Done", avatarColor: "#a5f3fc" },
  { id: 8, name: "Usman Qadir", number: "+92 322 6667777", date: "Jan 18, 2024", time: "2:30 PM", status: "Pending", avatarColor: "#fbcfe8" },
  { id: 9, name: "Maria Saleem", number: "+92 335 1112233", date: "Jan 19, 2024", time: "11:00 AM", status: "Done", avatarColor: "#d9f99d" },
  { id: 10, name: "Hassan Mahmood", number: "+92 346 8889990", date: "Jan 19, 2024", time: "4:00 PM", status: "Pending", avatarColor: "#fcd34d" },
];

function StatusBadge({ status }: { status: VisitStatus }) {
  const styles: Record<VisitStatus, { bg: string; color: string; border: string }> = {
    Pending: { bg: "#fffbeb", color: "#b45309", border: "#fde68a" },
    Done: { bg: "#f0fdf4", color: "#15803d", border: "#bbf7d0" },
    Missed: { bg: "#fef2f2", color: "#b91c1c", border: "#fecaca" },
  };
  const s = styles[status];
  return (
    <span
      className="inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-semibold"
      style={{ backgroundColor: s.bg, color: s.color, borderColor: s.border }}
    >
      {status}
      <ChevronDown className="h-3 w-3" />
    </span>
  );
}

function VisitsPage() {
  const [statusFilter, setStatusFilter] = useState("All Status");
  const [dateFilter, setDateFilter] = useState("All Dates");

  return (
    <AdminLayout
      header={
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold text-foreground tracking-tight">Visits</h1>
          <p className="text-muted-foreground text-sm sm:text-base mt-1">Manage campus visit schedules</p>
        </div>
      }
    >
      <main className="px-0 max-w-[1400px]">
        {/* Stats */}
        <section className="mb-6 grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-6 max-w-2xl">
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "#eff6ff" }}>
              <Calendar className="w-5 h-5" style={{ color: "#003d82" }} />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Total Visits</p>
            <p className="text-3xl font-bold text-slate-900">248</p>
          </div>
          <div className="bg-white rounded-xl border border-slate-200 p-6 shadow-sm">
            <div className="w-10 h-10 rounded-lg flex items-center justify-center mb-4" style={{ backgroundColor: "#fffbeb" }}>
              <Clock className="w-5 h-5" style={{ color: "#d97706" }} />
            </div>
            <p className="text-sm font-medium text-slate-500 mb-1">Pending</p>
            <p className="text-3xl font-bold text-slate-900">42</p>
          </div>
        </section>

        {/* Visit Schedule Table */}
        <section className="bg-white rounded-2xl border border-slate-200 shadow-sm overflow-hidden">
          <div className="px-6 sm:px-8 py-5 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
            <h3 className="text-lg font-bold text-slate-900">Visit Schedule</h3>
            <div className="flex items-center gap-3">
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700"
              >
                <option>All Status</option>
                <option>Pending</option>
                <option>Done</option>
                <option>Missed</option>
              </select>
              <select
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
                className="text-sm border border-slate-200 rounded-lg px-3 py-1.5 bg-white text-slate-700"
              >
                <option>All Dates</option>
                <option>Today</option>
                <option>This Week</option>
              </select>
            </div>
          </div>

          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-slate-50">
                <tr>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Name</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Number</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Date of Visit</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Time</th>
                  <th className="text-left text-xs font-semibold text-slate-500 uppercase tracking-wider px-6 py-3">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100">
                {visits.map((v) => (
                  <tr key={v.id} className="hover:bg-slate-50 transition-colors">
                    <td className="px-6 py-4">
                      <div className="flex items-center gap-3">
                        <div
                          className="h-9 w-9 rounded-full flex items-center justify-center text-xs font-semibold text-slate-700"
                          style={{ backgroundColor: v.avatarColor }}
                        >
                          {v.name.split(" ").map((p) => p[0]).join("").slice(0, 2)}
                        </div>
                        <span className="text-sm font-medium text-slate-900">{v.name}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.number}</td>
                    <td className="px-6 py-4 text-sm" style={{ color: "#003d82" }}>{v.date}</td>
                    <td className="px-6 py-4 text-sm text-slate-600">{v.time}</td>
                    <td className="px-6 py-4"><StatusBadge status={v.status} /></td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="px-6 sm:px-8 py-4 border-t border-slate-200 flex flex-col sm:flex-row items-center justify-between gap-3">
            <p className="text-sm text-slate-500">Showing 1 to 10 of 248 visits</p>
            <div className="flex items-center gap-1">
              <button className="px-3 py-1.5 text-sm text-slate-600 rounded-md border border-slate-200 hover:bg-slate-50">Previous</button>
              <button className="px-3 py-1.5 text-sm text-white rounded-md font-semibold" style={{ backgroundColor: "#003d82" }}>1</button>
              <button className="px-3 py-1.5 text-sm text-slate-600 rounded-md hover:bg-slate-50">2</button>
              <button className="px-3 py-1.5 text-sm text-slate-600 rounded-md hover:bg-slate-50">3</button>
              <button className="px-3 py-1.5 text-sm text-slate-600 rounded-md border border-slate-200 hover:bg-slate-50">Next</button>
            </div>
          </div>
        </section>
      </main>
    </AdminLayout>
  );
}