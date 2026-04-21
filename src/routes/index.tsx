import { createFileRoute } from "@tanstack/react-router";
import {
  Upload,
  MessageSquare,
  Eye,
  CheckCircle2,
  Clock,
  ArrowRight,
  FileText,
} from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Dashboard — MUST Connect" },
      { name: "description", content: "MUST Connect admin dashboard overview." },
    ],
  }),
  component: Dashboard,
});

const stats = [
  { label: "Total Batches Uploaded", value: "12,847", icon: Upload, accent: "text-primary", bg: "bg-primary/10" },
  { label: "Total Engagement", value: "600", icon: MessageSquare, accent: "text-accent", bg: "bg-accent/10" },
  { label: "University Visits", value: "142", icon: Eye, accent: "text-success", bg: "bg-success/10" },
];

const uploads = [
  { name: "Batch_Spring2026_Engineering.csv", date: "Jan 15, 2026", contacts: "1,250 contacts", status: "Validated" },
  { name: "Batch_Spring2026_Business.csv", date: "Jan 14, 2026", contacts: "892 contacts", status: "Validated" },
  { name: "Batch_Spring2026_Sciences.csv", date: "Jan 13, 2026", contacts: "1,540 contacts", status: "Processing" },
  { name: "Batch_Spring2026_Arts.csv", date: "Jan 12, 2026", contacts: "678 contacts", status: "Validated" },
];

function Dashboard() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Dashboard</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Welcome back! Here's what's happening with your campaigns.
          </p>
        </div>

        {/* Campaign card */}
        <div className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-lg font-semibold text-foreground">Spring 2026 Admissions Campaign</h2>
                <Badge className="bg-success text-success-foreground hover:bg-success">Active</Badge>
              </div>
              <p className="mt-1 text-sm text-muted-foreground">
                Outreach campaign for Spring 2026 student admissions
              </p>
            </div>
            <Button className="bg-primary text-primary-foreground hover:bg-primary-glow">
              Manage Campaign
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </div>

          {/* Progress */}
          <div className="mt-6 space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-muted-foreground">Campaign Progress</span>
              <span className="font-medium text-foreground">68%</span>
            </div>
            <div className="h-2 w-full overflow-hidden rounded-full bg-muted">
              <div className="h-full rounded-full bg-primary" style={{ width: "68%" }} />
            </div>
          </div>

          {/* Sub-stats */}
          <div className="mt-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Sent</p>
              <p className="mt-1 text-2xl font-bold text-primary">3,420</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Pending</p>
              <p className="mt-1 text-2xl font-bold text-warning">1,580</p>
            </div>
            <div className="rounded-lg bg-muted/50 p-4">
              <p className="text-xs text-muted-foreground">Engagement</p>
              <p className="mt-1 text-2xl font-bold text-accent">284</p>
            </div>
          </div>
        </div>

        {/* Stat cards */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {stats.map((s) => {
            const Icon = s.icon;
            return (
              <div key={s.label} className="rounded-xl border border-border bg-card p-5 shadow-sm">
                <div className="flex items-center justify-between">
                  <p className="text-sm text-muted-foreground">{s.label}</p>
                  <div className={`flex h-10 w-10 items-center justify-center rounded-lg ${s.bg}`}>
                    <Icon className={`h-5 w-5 ${s.accent}`} />
                  </div>
                </div>
                <p className="mt-3 text-3xl font-bold text-foreground">{s.value}</p>
              </div>
            );
          })}
        </div>

        {/* Recent uploads */}
        <div className="rounded-xl border border-border bg-card shadow-sm">
          <div className="flex items-center justify-between border-b border-border px-6 py-4">
            <div>
              <h3 className="font-semibold text-foreground">Recent Batch Uploads</h3>
              <p className="text-xs text-muted-foreground">Latest CSV files uploaded to the system</p>
            </div>
            <Button variant="ghost" size="sm" className="text-primary">
              View All
            </Button>
          </div>
          <ul className="divide-y divide-border">
            {uploads.map((u) => (
              <li key={u.name} className="flex items-center justify-between gap-3 px-6 py-4">
                <div className="flex min-w-0 items-center gap-3">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-primary/10">
                    <FileText className="h-5 w-5 text-primary" />
                  </div>
                  <div className="min-w-0">
                    <p className="truncate text-sm font-medium text-foreground">{u.name}</p>
                    <p className="text-xs text-muted-foreground">
                      {u.date} • {u.contacts}
                    </p>
                  </div>
                </div>
                {u.status === "Validated" ? (
                  <Badge className="shrink-0 bg-success/15 text-success hover:bg-success/15">
                    <CheckCircle2 className="mr-1 h-3 w-3" /> Validated
                  </Badge>
                ) : (
                  <Badge className="shrink-0 bg-warning/20 text-warning hover:bg-warning/20">
                    <Clock className="mr-1 h-3 w-3" /> Processing
                  </Badge>
                )}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </AdminLayout>
  );
}
