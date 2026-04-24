import { createFileRoute, Link } from "@tanstack/react-router";
import { CheckCircle2, Eye, Plus, ArrowLeft } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/campaigns/success")({
  head: () => ({
    meta: [
      { title: "Campaign Created — MUST Connect" },
      { name: "description", content: "Your campaign was created successfully." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    name: typeof search.name === "string" ? search.name : "",
    contacts: typeof search.contacts === "number" ? search.contacts : Number(search.contacts) || 0,
  }),
  component: CampaignSuccessPage,
});

function CampaignSuccessPage() {
  const { name, contacts } = Route.useSearch();

  return (
    <AdminLayout
      header={
        <div className="flex items-center gap-3">
          <Link
            to="/campaigns"
            className="rounded-md p-1.5 text-muted-foreground hover:bg-muted hover:text-foreground"
            aria-label="Back to campaigns"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div>
            <h1 className="text-2xl font-bold text-foreground md:text-3xl">Campaign Status</h1>
            <p className="mt-1 text-sm text-muted-foreground">Result of your campaign creation</p>
          </div>
        </div>
      }
    >
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-emerald-200 bg-emerald-50/50 px-6 py-12 text-center shadow-sm">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-emerald-100 ring-8 ring-emerald-50">
          <CheckCircle2 className="h-10 w-10 text-emerald-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Campaign Created Successfully!</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {name ? (
            <>
              Your campaign <strong className="text-foreground">"{name}"</strong> has been launched
              {contacts > 0 ? <> to <strong className="text-foreground">{contacts.toLocaleString()}</strong> contacts</> : null}.
            </>
          ) : (
            "Your campaign has been launched and is now being processed."
          )}
        </p>

        <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row">
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/campaigns">
              <Eye className="mr-2 h-4 w-4" />
              View All Campaigns
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/campaigns/new">
              <Plus className="mr-2 h-4 w-4" />
              Create Another
            </Link>
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}