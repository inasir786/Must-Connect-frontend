import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
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
import { ArrowLeft, Calendar, Download, Filter, MessageSquare, RotateCw } from "lucide-react";

export const Route = createFileRoute("/chats/highly-engaged")({
  head: () => ({
    meta: [
      { title: "Highly Engaged Students — MUST Connect" },
      { name: "description", content: "Students showing high interest and active engagement." },
    ],
  }),
  component: HighlyEngagedPage,
});

const students = [
  { id: "ST2024001", name: "Sarah Ahmed", phone: "+92 300 1234567", campaign: "Spring 2024", color: "bg-chart-1/15 text-chart-1", avatar: "https://i.pravatar.cc/80?img=47" },
  { id: "ST2024002", name: "Ali Hassan", phone: "+92 301 2345678", campaign: "Engineering", color: "bg-chart-4/15 text-chart-4", avatar: "https://i.pravatar.cc/80?img=12" },
  { id: "ST2024003", name: "Fatima Khan", phone: "+92 302 3456789", campaign: "Scholarship", color: "bg-chart-5/15 text-chart-5", avatar: "https://i.pravatar.cc/80?img=45" },
  { id: "ST2024004", name: "Ahmed Raza", phone: "+92 303 4567890", campaign: "Fall 2024", color: "bg-chart-1/15 text-chart-1", avatar: "https://i.pravatar.cc/80?img=15" },
  { id: "ST2024005", name: "Ayesha Malik", phone: "+92 304 5678901", campaign: "Admissions", color: "bg-chart-3/15 text-chart-3", avatar: "https://i.pravatar.cc/80?img=44" },
  { id: "ST2024006", name: "Bilal Tariq", phone: "+92 305 6789012", campaign: "Spring 2024", color: "bg-chart-1/15 text-chart-1", avatar: "https://i.pravatar.cc/80?img=33" },
  { id: "ST2024007", name: "Usman Khalid", phone: "+92 306 7890123", campaign: "Engineering", color: "bg-chart-4/15 text-chart-4", avatar: "https://i.pravatar.cc/80?img=68" },
  { id: "ST2024008", name: "Zainab Hussain", phone: "+92 307 8901234", campaign: "Scholarship", color: "bg-chart-5/15 text-chart-5", avatar: "https://i.pravatar.cc/80?img=49" },
];

function HighlyEngagedPage() {
  const navigate = useNavigate();
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
              <p className="text-sm text-muted-foreground">Students showing high interest and active engagement</p>
            </div>
          </div>
          <Button variant="outline" size="sm">
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
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground">DATE RANGE</label>
              <Select defaultValue="7">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Last 7 Days</SelectItem>
                  <SelectItem value="30">Last 30 Days</SelectItem>
                  <SelectItem value="90">Last 90 Days</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground">FROM DATE</label>
              <div className="relative">
                <Input defaultValue="04/01/2024" />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground">TO DATE</label>
              <div className="relative">
                <Input defaultValue="04/27/2024" />
                <Calendar className="pointer-events-none absolute right-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
              </div>
            </div>
            <div>
              <label className="mb-1.5 block text-[11px] font-semibold tracking-wider text-muted-foreground">CAMPAIGN</label>
              <Select defaultValue="all">
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Campaigns</SelectItem>
                  <SelectItem value="spring">Spring 2024</SelectItem>
                  <SelectItem value="fall">Fall 2024</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button className="flex-1"><Filter className="mr-2 h-4 w-4" /> Apply Filter</Button>
              <Button variant="outline" size="icon"><RotateCw className="h-4 w-4" /></Button>
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
                <TableHead className="text-[11px] font-semibold tracking-wider text-muted-foreground">ACTION</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {students.map((s) => (
                <TableRow key={s.id}>
                  <TableCell className="px-4 py-3">
                    <div className="flex items-center gap-3">
                      <img src={s.avatar} alt={s.name} className="h-9 w-9 rounded-full object-cover" />
                      <div>
                        <p className="text-sm font-semibold text-foreground">{s.name}</p>
                        <p className="text-xs text-muted-foreground">ID: {s.id}</p>
                      </div>
                    </div>
                  </TableCell>
                  <TableCell className="text-sm text-foreground">{s.phone}</TableCell>
                  <TableCell>
                    <span className={`rounded-full px-2.5 py-1 text-xs font-medium ${s.color}`}>{s.campaign}</span>
                  </TableCell>
                  <TableCell>
                    <Link to="/chats" className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-primary text-primary-foreground hover:bg-primary/90">
                      <MessageSquare className="h-4 w-4" />
                    </Link>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
          <div className="flex items-center justify-between border-t border-border px-4 py-3 text-sm">
            <p className="text-muted-foreground">Showing <span className="font-medium text-foreground">1-10</span> of <span className="font-medium text-foreground">89</span> students</p>
            <div className="flex items-center gap-1">
              <Button variant="outline" size="sm">‹</Button>
              <Button size="sm">1</Button>
              <Button variant="outline" size="sm">2</Button>
              <Button variant="outline" size="sm">3</Button>
              <span className="px-1 text-muted-foreground">…</span>
              <Button variant="outline" size="sm">9</Button>
              <Button variant="outline" size="sm">›</Button>
            </div>
          </div>
        </div>
      </div>
    </AdminLayout>
  );
}
