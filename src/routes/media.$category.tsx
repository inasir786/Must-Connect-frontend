import { createFileRoute, Link } from "@tanstack/react-router";
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
  Pagination,
  PaginationContent,
  PaginationEllipsis,
  PaginationItem,
  PaginationLink,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Upload, Search } from "lucide-react";

export const Route = createFileRoute("/media/$category")({
  head: ({ params }) => ({
    meta: [
      { title: `Media Library — ${decodeURIComponent(params.category)}` },
      { name: "description", content: "Manage reusable media assets." },
    ],
  }),
  component: CategoryDetailPage,
});

type MediaItem = {
  title: string;
  tag: string;
  size: string;
  img: string;
};

const items: MediaItem[] = [
  { title: "Campus Main Building", tag: "Admissions", size: "2.4 MB", img: "https://images.unsplash.com/photo-1562774053-701939374585?w=600&auto=format&fit=crop" },
  { title: "Library Study Area", tag: "Events", size: "1.8 MB", img: "https://images.unsplash.com/photo-1521587760476-6c12a4b040da?w=600&auto=format&fit=crop" },
  { title: "Graduation Ceremony 2024", tag: "Events", size: "3.1 MB", img: "https://images.unsplash.com/photo-1523580494863-6f3031224c94?w=600&auto=format&fit=crop" },
  { title: "Computer Science Lab", tag: "Programs", size: "2.7 MB", img: "https://images.unsplash.com/photo-1581091226825-a6a2a5aee158?w=600&auto=format&fit=crop" },
  { title: "Sports Complex", tag: "Admissions", size: "2.2 MB", img: "https://images.unsplash.com/photo-1505666287802-931dc83a0fe4?w=600&auto=format&fit=crop" },
  { title: "Main Auditorium", tag: "Events", size: "1.9 MB", img: "https://images.unsplash.com/photo-1503424886307-b090341d25d1?w=600&auto=format&fit=crop" },
  { title: "Student Cafeteria", tag: "Admissions", size: "2.0 MB", img: "https://images.unsplash.com/photo-1567521464027-f127ff144326?w=600&auto=format&fit=crop" },
  { title: "Research Laboratory", tag: "Programs", size: "2.5 MB", img: "https://images.unsplash.com/photo-1532094349884-543bc11b234d?w=600&auto=format&fit=crop" },
  { title: "Campus Green Spaces", tag: "Admissions", size: "3.3 MB", img: "https://images.unsplash.com/photo-1498243691581-b145c3f54a5a?w=600&auto=format&fit=crop" },
  { title: "Engineering Workshop", tag: "Programs", size: "2.8 MB", img: "https://images.unsplash.com/photo-1581092919535-1b51f8b9e6e7?w=600&auto=format&fit=crop" },
  { title: "Convocation 2024", tag: "Events", size: "3.5 MB", img: "https://images.unsplash.com/photo-1627556704290-2b1f5853ff78?w=600&auto=format&fit=crop" },
  { title: "Admissions Office", tag: "Admissions", size: "1.7 MB", img: "https://images.unsplash.com/photo-1497366216548-37526070297c?w=600&auto=format&fit=crop" },
];

const tabs = ["Images", "Links", "Videos"] as const;

function CategoryDetailPage() {
  const { category } = Route.useParams();
  const name = decodeURIComponent(category);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-7xl space-y-6">
        {/* Header */}
        <div className="flex flex-col gap-4 rounded-xl border border-border bg-card p-5 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <h1 className="text-2xl font-bold tracking-tight">
              Media Library <span className="text-muted-foreground">-</span> {name}
            </h1>
            <p className="text-sm text-muted-foreground">Manage reusable media assets</p>
          </div>
          <Button className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Upload className="h-4 w-4" />
            Upload Media
          </Button>
        </div>

        {/* Tabs + filters */}
        <div className="rounded-xl border border-border bg-card p-4">
          <div className="flex flex-col gap-4 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex items-center gap-6 border-b border-border lg:border-b-0">
              {tabs.map((t, i) => {
                const active = i === 0;
                return (
                  <button
                    key={t}
                    className={`relative pb-3 text-sm font-medium transition-colors ${
                      active ? "text-accent" : "text-muted-foreground hover:text-foreground"
                    }`}
                  >
                    {t}
                    {active && (
                      <span className="absolute inset-x-0 -bottom-px h-0.5 rounded-full bg-accent" />
                    )}
                  </button>
                );
              })}
            </div>
            <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
              <div className="relative">
                <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input placeholder="Search media..." className="w-full pl-9 sm:w-64" />
              </div>
              <Select defaultValue="all">
                <SelectTrigger className="w-full sm:w-44">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">All Categories</SelectItem>
                  <SelectItem value="admissions">Admissions</SelectItem>
                  <SelectItem value="events">Events</SelectItem>
                  <SelectItem value="programs">Programs</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        {/* Grid */}
        <div className="grid grid-cols-1 gap-5 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {items.map((it) => (
            <div
              key={it.title}
              className="group overflow-hidden rounded-xl border border-border bg-card shadow-sm transition-shadow hover:shadow-md"
            >
              <div className="aspect-[4/3] overflow-hidden bg-muted">
                <img
                  src={it.img}
                  alt={it.title}
                  loading="lazy"
                  className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-[1.03]"
                />
              </div>
              <div className="p-3">
                <p className="truncate text-sm font-semibold text-accent">{it.title}</p>
                <div className="mt-1 flex items-center justify-between text-xs text-muted-foreground">
                  <span>{it.tag}</span>
                  <span>{it.size}</span>
                </div>
              </div>
            </div>
          ))}
        </div>

        {/* Pagination */}
        <Pagination>
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious href="#" />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#" isActive>1</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">2</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">3</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationEllipsis />
            </PaginationItem>
            <PaginationItem>
              <PaginationLink href="#">12</PaginationLink>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext href="#" />
            </PaginationItem>
          </PaginationContent>
        </Pagination>

        <div className="hidden">
          <Link to="/media">back</Link>
        </div>
      </div>
    </AdminLayout>
  );
}