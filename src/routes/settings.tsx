import { createFileRoute } from "@tanstack/react-router";
import { User, Lock } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MUST Connect" },
      { name: "description", content: "Manage your MUST Connect profile and security settings." },
    ],
  }),
  component: SettingsPage,
});

function SettingsPage() {
  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account preferences and security
          </p>
        </div>

        {/* Profile */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-primary/10">
              <User className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Profile Settings</h2>
              <p className="text-xs text-muted-foreground">Update your personal information</p>
            </div>
          </div>

          <form className="space-y-4">
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="fullName">Full Name</Label>
                <Input id="fullName" defaultValue="Admin User" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="emailAddr">Email Address</Label>
                <Input id="emailAddr" type="email" defaultValue="admin@must.edu" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input id="phone" defaultValue="+1 (555) 000-0000" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="dept">Department</Label>
                <Input id="dept" defaultValue="Admissions" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" className="bg-primary text-primary-foreground hover:bg-primary-glow">
                Save Changes
              </Button>
            </div>
          </form>
        </section>

        {/* Security */}
        <section className="rounded-xl border border-border bg-card p-6 shadow-sm">
          <div className="mb-5 flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-lg bg-accent/10">
              <Lock className="h-5 w-5 text-accent" />
            </div>
            <div>
              <h2 className="font-semibold text-foreground">Security</h2>
              <p className="text-xs text-muted-foreground">Update your password to keep your account safe</p>
            </div>
          </div>

          <form className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="curPwd">Current Password</Label>
              <Input id="curPwd" type="password" placeholder="••••••••" />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <Label htmlFor="newPwd">New Password</Label>
                <Input id="newPwd" type="password" placeholder="••••••••" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="confirmPwd">Confirm Password</Label>
                <Input id="confirmPwd" type="password" placeholder="••••••••" />
              </div>
            </div>
            <div className="flex justify-end">
              <Button type="button" className="bg-accent text-accent-foreground hover:bg-accent-hover">
                Update Password
              </Button>
            </div>
          </form>
        </section>
      </div>
    </AdminLayout>
  );
}