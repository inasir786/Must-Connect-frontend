import { createFileRoute, Link } from "@tanstack/react-router";
import { XCircle, RefreshCw, ArrowLeft, LifeBuoy } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";

export const Route = createFileRoute("/campaigns/failed")({
  head: () => ({
    meta: [
      { title: "Campaign Failed — MUST Connect" },
      { name: "description", content: "Campaign creation failed." },
    ],
  }),
  validateSearch: (search: Record<string, unknown>) => ({
    reason: typeof search.reason === "string" ? search.reason : "",
  }),
  component: CampaignFailedPage,
});

function CampaignFailedPage() {
  const { reason } = Route.useSearch();

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
      <div className="mx-auto flex max-w-xl flex-col items-center rounded-2xl border border-red-200 bg-red-50/60 px-6 py-12 text-center shadow-sm">
        <div className="mb-5 flex h-20 w-20 items-center justify-center rounded-full bg-red-100 ring-8 ring-red-50">
          <XCircle className="h-10 w-10 text-red-600" />
        </div>
        <h2 className="text-2xl font-bold text-foreground">Campaign Creation Failed</h2>
        <p className="mt-2 max-w-md text-sm text-muted-foreground">
          {reason
            ? reason
            : "Something went wrong while creating your campaign. Please review the details and try again."}
        </p>

        <div className="mt-7 flex flex-col items-stretch gap-2 sm:flex-row">
          <Button asChild className="bg-accent text-accent-foreground hover:bg-accent/90">
            <Link to="/campaigns/new">
              <RefreshCw className="mr-2 h-4 w-4" />
              Try Again
            </Link>
          </Button>
          <Button asChild variant="outline">
            <Link to="/campaigns">
              <ArrowLeft className="mr-2 h-4 w-4" />
              Back to Campaigns
            </Link>
          </Button>
          <Button variant="ghost">
            <LifeBuoy className="mr-2 h-4 w-4" />
            Contact Support
          </Button>
        </div>
      </div>
    </AdminLayout>
  );
}