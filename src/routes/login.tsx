import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { Mail, Lock, ArrowRight, GraduationCap } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — MUST Connect" },
      { name: "description", content: "Sign in to MUST Connect Admin Portal." },
    ],
  }),
  component: LoginPage,
});

function LoginPage() {
  const navigate = useNavigate();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/" });
  };

  return (
    <div className="flex min-h-screen w-full flex-col md:flex-row">
      {/* Left brand panel */}
      <div className="relative flex flex-col justify-between bg-[image:var(--gradient-brand)] p-8 text-primary-foreground md:w-1/2 md:p-12">
        <div className="flex items-center gap-3">
          <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-white/15 backdrop-blur">
            <GraduationCap className="h-7 w-7" />
          </div>
          <div>
            <p className="text-lg font-bold">MUST University</p>
            <p className="text-xs text-white/70">Outreach Platform</p>
          </div>
        </div>

        <div className="my-12 max-w-md">
          <h1 className="text-3xl font-bold leading-tight md:text-4xl">
            Empowering Student Outreach{" "}
            <span className="text-accent">at Scale.</span>
          </h1>
          <p className="mt-4 text-sm text-white/80 md:text-base">
            A unified WhatsApp-based admissions and engagement platform that helps the MUST team
            connect with thousands of prospective students efficiently.
          </p>
        </div>

        <p className="text-xs text-white/60">
          © 2026 MUST University. All rights reserved.
        </p>
      </div>

      {/* Right form panel */}
      <div className="flex flex-1 items-center justify-center bg-background p-6 md:p-12">
        <div className="w-full max-w-md">
          <div className="mb-8">
            <h2 className="text-2xl font-bold text-foreground md:text-3xl">Welcome back</h2>
            <p className="mt-2 text-sm text-muted-foreground">
              Sign in to access your admin dashboard
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label htmlFor="email">Email Address</Label>
              <div className="relative">
                <Mail className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@must.edu"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="password">Password</Label>
                <a href="#" className="text-xs font-medium text-primary hover:underline">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>

            <div className="flex items-center gap-2">
              <Checkbox id="remember" />
              <Label htmlFor="remember" className="text-sm font-normal text-muted-foreground">
                Remember me for 30 days
              </Label>
            </div>

            <Button
              type="submit"
              className="h-11 w-full bg-accent text-accent-foreground hover:bg-accent-hover"
            >
              Sign In to Dashboard
              <ArrowRight className="ml-2 h-4 w-4" />
            </Button>
          </form>

          <p className="mt-6 text-center text-xs text-muted-foreground">
            Need help? <Link to="/" className="font-medium text-primary hover:underline">Contact IT support</Link>
          </p>
        </div>
      </div>
    </div>
  );
}