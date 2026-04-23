import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import {
  Search,
  Upload,
  MoreVertical,
  Layers,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
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
import { Badge } from "@/components/ui/badge";

export const Route = createFileRoute("/batches")({
  head: () => ({
    meta: [
      { title: "Batches — MUST Connect" },
      {
        name: "description",
        content: "Manage student contact batches and data uploads.",
      },
    ],
  }),
  component: BatchesPage,
});

type BatchStatus = "Validated" | "Processing";

interface Batch {
  id: string;
  name: string;
  term: string;
  totalContacts: number;
  validWhatsApp: string;
  validPercent?: string;
  version: string;
  uploaded: string;
  status: BatchStatus;
  progress?: number;
  iconBg: string;
  iconColor: string;
}

const batches: Batch[] = [
  {
    id: "1",
    name: "FSC Part 1 - 2026",
    term: "Spring 2026 Admissions",
    totalContacts: 2340,
    validWhatsApp: "30000",
    version: "v1.0",
    uploaded: "Apr 14, 2026 09:23 AM",
    status: "Validated",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
  {
    id: "2",
    name: "FSC Part 2- 2026",
    term: "Spring 2026 Admissions",
    totalContacts: 1890,
    validWhatsApp: "36888",
    version: "v1.0",
    uploaded: "Apr 13, 2026 02:15 PM",
    status: "Validated",
    iconBg: "bg-purple-100",
    iconColor: "text-purple-600",
  },
  {
    id: "3",
    name: "ICS Part 1 - 2026",
    term: "Spring 2026 Admissions",
    totalContacts: 1560,
    validWhatsApp: "Processing...",
    version: "v1.0",
    uploaded: "Apr 12, 2026 11:47 AM",
    status: "Processing",
    progress: 65,
    iconBg: "bg-orange-100",
    iconColor: "text-orange-600",
  },
  {
    id: "4",
    name: "FSC Part 2 - 2026",
    term: "Spring 2026 Admissions",
    totalContacts: 3120,
    validWhatsApp: "2,934",
    validPercent: "94.0%",
    version: "v2.1",
    uploaded: "Apr 11, 2026 04:32 PM",
    status: "Validated",
    iconBg: "bg-blue-100",
    iconColor: "text-blue-600",
  },
];

function BatchesPage() {
  const [query, setQuery] = useState("");

  return (
    <AdminLayout>
      <div className="space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Batches</h1>
            <p className="mt-1 text-sm text-muted-foreground">
              Manage student contact batches and data uploads
            </p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Upload className="mr-2 h-4 w-4" />
            Upload Batch
          </Button>
        </div>

        {/* Filters */}
        <div className="flex flex-col gap-3  p-4  sm:flex-row sm:items-center">
          <div className="relative flex-1">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search batches by name..."
              className="pl-9"
            />
          </div>
          <div className="flex gap-3">
            <Select defaultValue="all">
              <SelectTrigger className="w-full sm:w-[140px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Status</SelectItem>
                <SelectItem value="validated">Validated</SelectItem>
                <SelectItem value="processing">Processing</SelectItem>
              </SelectContent>
            </Select>
            <Select defaultValue="latest">
              <SelectTrigger className="w-full sm:w-[160px]">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="latest">Sort by: Latest</SelectItem>
                <SelectItem value="oldest">Sort by: Oldest</SelectItem>
                <SelectItem value="name">Sort by: Name</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Cards Grid */}
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {batches.map((b) => (
            <article
              key={b.id}
              className="group rounded-xl border border-border bg-card p-5 shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="mb-4 flex items-start justify-between">
                <div
                  className={`flex h-10 w-10 items-center justify-center rounded-lg ${b.iconBg}`}
                >
                  <Layers className={`h-5 w-5 ${b.iconColor}`} />
                </div>
                <button
                  type="button"
                  className="rounded-md p-1 text-muted-foreground hover:bg-muted hover:text-foreground"
                  aria-label="More options"
                >
                  <MoreVertical className="h-4 w-4" />
                </button>
              </div>

              <h3 className="font-semibold text-foreground">{b.name}</h3>
              <p className="mb-4 text-xs text-muted-foreground">{b.term}</p>

              <dl className="space-y-2 text-sm">
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Total Contacts</dt>
                  <dd className="font-semibold text-foreground">
                    {b.totalContacts.toLocaleString()}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Valid WhatsApp</dt>
                  <dd
                    className={`font-semibold ${
                      b.status === "Processing" ? "text-orange-600" : "text-foreground"
                    }`}
                  >
                    {b.validWhatsApp}
                    {b.validPercent && (
                      <span className="ml-1 text-xs text-muted-foreground">
                        ({b.validPercent})
                      </span>
                    )}
                  </dd>
                </div>
                <div className="flex items-center justify-between">
                  <dt className="text-muted-foreground">Version</dt>
                  <dd>
                    <Badge variant="secondary" className="font-medium">
                      {b.version}
                    </Badge>
                  </dd>
                </div>
              </dl>

              {b.status === "Processing" && b.progress !== undefined && (
                <div className="mt-4">
                  <div className="mb-1 flex items-center justify-between text-xs">
                    <span className="text-muted-foreground">Processing</span>
                    <span className="font-medium text-orange-600">{b.progress}%</span>
                  </div>
                  <div className="h-1.5 w-full overflow-hidden rounded-full bg-muted">
                    <div
                      className="h-full bg-orange-500 transition-all"
                      style={{ width: `${b.progress}%` }}
                    />
                  </div>
                </div>
              )}

              <div className="mt-4 border-t border-border pt-3">
                <div className="flex items-end justify-between">
                  <div>
                    <p className="text-xs text-muted-foreground">Uploaded</p>
                    <p className="text-xs font-medium text-foreground">{b.uploaded}</p>
                  </div>
                  <Badge
                    className={
                      b.status === "Validated"
                        ? "bg-emerald-100 text-emerald-700 hover:bg-emerald-100"
                        : "bg-orange-100 text-orange-700 hover:bg-orange-100"
                    }
                  >
                    {b.status}
                  </Badge>
                </div>
              </div>
            </article>
          ))}
        </div>

        {/* Pagination */}
        <div className="flex flex-col items-center justify-between gap-3 rounded-xl border border-border bg-card px-4 py-3 shadow-sm sm:flex-row">
          <p className="text-sm text-muted-foreground">
            Showing <span className="font-medium text-foreground">1-6</span> of{" "}
            <span className="font-medium text-foreground">47</span> batches
          </p>
          <div className="flex items-center gap-1">
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronLeft className="h-4 w-4" />
            </Button>
            {[1, 2, 3].map((p) => (
              <Button
                key={p}
                variant={p === 1 ? "default" : "outline"}
                size="icon"
                className="h-8 w-8"
              >
                {p}
              </Button>
            ))}
            <span className="px-2 text-muted-foreground">…</span>
            <Button variant="outline" size="icon" className="h-8 w-8">
              8
            </Button>
            <Button variant="outline" size="icon" className="h-8 w-8">
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
