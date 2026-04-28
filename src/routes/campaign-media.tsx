import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Checkbox } from "@/components/ui/checkbox";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import {
  Search,
  Upload,
  Filter,
  ArrowUpDown,
  Download,
  Trash2,
  FileText,
  Image as ImageIcon,
  Video as VideoIcon,
  UploadCloud,
} from "lucide-react";

export const Route = createFileRoute("/campaign-media")({
  head: () => ({
    meta: [
      { title: "Campaign Media — MUST Connect" },
      { name: "description", content: "Manage and organize media assets for outreach campaigns." },
    ],
  }),
  component: CampaignMediaPage,
});

type Item = {
  title: string;
  campaign: string;
  size: string;
  type: "PDF" | "JPG" | "MP4";
  tint: string;
};

const items: Item[] = [
  { title: "Admissions Brochure 2024", campaign: "Spring Campaign", size: "2.4 MB", type: "PDF", tint: "bg-blue-100" },
  { title: "Engineering Programs Guide", campaign: "Fall Campaign", size: "3.1 MB", type: "PDF", tint: "bg-purple-100" },
  { title: "Scholarship Information Pack", campaign: "Financial Aid", size: "1.8 MB", type: "PDF", tint: "bg-green-100" },
  { title: "Campus Life Highlights", campaign: "Welcome Campaign", size: "4.2 MB", type: "JPG", tint: "bg-orange-100" },
  { title: "Business School Prospectus", campaign: "MBA Campaign", size: "2.9 MB", type: "PDF", tint: "bg-pink-100" },
  { title: "Research Facilities Overview", campaign: "Graduate Campaign", size: "3.5 MB", type: "PDF", tint: "bg-indigo-100" },
  { title: "Virtual Campus Tour", campaign: "Welcome Campaign", size: "24.7 MB", type: "MP4", tint: "bg-teal-100" },
  { title: "Student Success Stories", campaign: "Testimonial Campaign", size: "2.1 MB", type: "PDF", tint: "bg-yellow-100" },
];

function TypeIcon({ type }: { type: Item["type"] }) {
  if (type === "MP4") return <VideoIcon className="h-12 w-12 text-foreground/30" />;
  if (type === "JPG") return <ImageIcon className="h-12 w-12 text-foreground/30" />;
  return <FileText className="h-12 w-12 text-foreground/30" />;
}

function CampaignMediaPage() {
  const [open, setOpen] = useState(false);

  return (
    <AdminLayout
      header={
        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">Campaign Media</h1>
            <p className="text-sm text-muted-foreground">
              Manage and organize media assets for outreach campaigns
            </p>
          </div>
          <Button
            onClick={() => setOpen(true)}
            className="bg-accent text-accent-foreground hover:bg-accent/90"
          >
            <Upload className="h-4 w-4" />
            Upload Media
          </Button>
        </div>
      }
    >
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Toolbar */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-3 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex flex-1 flex-col gap-3 sm:flex-row">
              <div className="relative flex-1 max-w-md">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search media by title or campaign..." className="pl-9" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-40">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Types</SelectItem>
                  <SelectItem value="pdf">PDF</SelectItem>
                  <SelectItem value="jpg">Image</SelectItem>
                  <SelectItem value="mp4">Video</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="flex gap-2">
              <Button variant="outline" size="sm">
                <Filter className="h-4 w-4" />
                Filter
              </Button>
              <Button variant="outline" size="sm">
                <ArrowUpDown className="h-4 w-4" />
                Sort
              </Button>
            </div>
          </div>
        </div>

        <div>
          <h2 className="mb-4 text-lg font-bold">Media Library</h2>
          <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
            {items.map((it) => (
              <div
                key={it.title}
                className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
              >
                <div className={`relative flex aspect-[4/3] items-center justify-center ${it.tint}`}>
                  <TypeIcon type={it.type} />
                  <span className="absolute bottom-2 left-2 rounded bg-white/80 px-2 py-0.5 text-[10px] font-bold text-foreground">
                    {it.type}
                  </span>
                  <div className="absolute right-2 top-2 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                    <button className="rounded bg-white p-1.5 shadow-sm hover:bg-muted" aria-label="Download">
                      <Download className="h-3.5 w-3.5 text-foreground" />
                    </button>
                    <button className="rounded bg-white p-1.5 shadow-sm hover:bg-destructive/10" aria-label="Delete">
                      <Trash2 className="h-3.5 w-3.5 text-destructive" />
                    </button>
                  </div>
                </div>
                <div className="p-3">
                  <p className="truncate text-sm font-semibold">{it.title}</p>
                  <p className="mt-1 truncate text-xs text-accent">{it.campaign}</p>
                  <p className="text-xs text-muted-foreground">{it.size}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Upload dialog */}
      <Dialog open={open} onOpenChange={setOpen}>
        <DialogContent className="sm:max-w-md">
          <DialogHeader>
            <DialogTitle>Upload Campaign Media</DialogTitle>
            <p className="text-sm text-muted-foreground">
              Add media files for your outreach campaigns
            </p>
          </DialogHeader>

          <div className="flex flex-col items-center justify-center gap-2 rounded-lg border-2 border-dashed border-accent/40 bg-accent/5 px-6 py-8 text-center">
            <div className="flex h-12 w-12 items-center justify-center rounded-full bg-accent/10">
              <UploadCloud className="h-6 w-6 text-accent" />
            </div>
            <p className="text-sm font-medium text-accent">Drop files here or click to browse</p>
            <p className="text-xs text-muted-foreground">
              Supported formats: PDF, JPG, PNG, MP4, DOCX (Max 50MB)
            </p>
          </div>

          <div className="space-y-2">
            <Label htmlFor="cm-title" className="text-sm font-semibold">
              Media Title <span className="text-destructive">*</span>
            </Label>
            <Input id="cm-title" placeholder="Enter media title" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="cm-desc" className="text-sm font-semibold">Description</Label>
            <Textarea id="cm-desc" placeholder="Add a brief description of this media" rows={3} />
          </div>

          <div className="flex items-start gap-2 rounded-lg bg-muted/50 p-3">
            <Checkbox id="cm-active" className="mt-0.5" />
            <div>
              <Label htmlFor="cm-active" className="text-sm font-semibold cursor-pointer">
                Set as Active
              </Label>
              <p className="text-xs text-muted-foreground">
                This media will be immediately available for campaigns
              </p>
            </div>
          </div>

          <DialogFooter>
            <DialogClose asChild>
              <Button variant="outline">Cancel</Button>
            </DialogClose>
            <Button
              onClick={() => setOpen(false)}
              className="bg-accent text-accent-foreground hover:bg-accent/90"
            >
              <Upload className="h-4 w-4" />
              Upload Media
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </AdminLayout>
  );
}