import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff } from "lucide-react";

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
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/" });
  };

  return (
    <main className="flex w-full h-screen overflow-hidden font-[Inter,sans-serif] text-slate-800 antialiased bg-slate-50">

      {/* ── Left Brand Panel ── */}
      <section
        className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12 flex-shrink-0"
        style={{ backgroundColor: "#003d82" }}
      >
        {/* Dot pattern overlay */}
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#003d82 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            opacity: 0.1,
            mixBlendMode: "overlay",
          }}
        />

        {/* Glow blobs */}
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{
            backgroundColor: "#1d4ed8",
            filter: "blur(100px)",
            opacity: 0.6,
          }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{
            backgroundColor: "#1e40af",
            filter: "blur(120px)",
            opacity: 0.8,
          }}
        />

        {/* Top Branding */}
        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <GraduationCap className="w-5 h-5" style={{ color: "#003d82" }} />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight">MUST</h2>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">University</p>
          </div>
        </div>

        {/* Center Content */}
        <div className="relative z-10 my-auto max-w-md">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Empowering<br />Student Outreach<br />
            <span style={{ color: "#f97316" }}>at Scale.</span>
          </h1>
          <p className="text-blue-50 text-lg leading-relaxed font-light" style={{ opacity: 0.9 }}>
            The centralized portal for managing lead batches, validating
            contacts, and running intelligent engagement campaigns.
          </p>
        </div>

        {/* Bottom Credits */}
        <div className="relative z-10 text-sm font-medium" style={{ color: "rgba(219,234,254,0.6)" }}>
          <span>© 2026 Multan University of Science and Technology</span>
        </div>
      </section>

      {/* ── Right Form Panel ── */}
      <section className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-50 relative overflow-hidden">

        {/* Mobile Logo */}
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <div
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{ backgroundColor: "#003d82" }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">MUST Connect</span>
        </div>

        {/* Login Card */}
    <div
  className="w-full max-w-[380px] bg-white border border-slate-100 p-5 sm:p-6"
  style={{
    borderRadius: "24px",
    boxShadow:
      "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03), 0 20px 25px -5px rgba(0,0,0,0.05)",
  }}
>
  <div className="mb-6 text-center lg:text-left">
    <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight">
      Welcome back
    </h2>
    <p className="text-slate-500 text-sm sm:text-base">
      Sign in to MUST Connect Admin Portal
    </p>
  </div>

  <form onSubmit={handleSubmit} className="space-y-4">
    <div className="space-y-1">
      <label htmlFor="email" className="block text-sm font-medium text-slate-700">
        Email Address
      </label>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Mail className="w-4 h-4 text-slate-400" />
        </div>

        <input
          id="email"
          type="email"
          name="email"
          placeholder="admin@must.edu.pk"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="block w-full pl-11 pr-4 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none transition-all duration-200"
          style={{ borderRadius: "12px" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.backgroundColor = "#f8fafc";
            e.currentTarget.style.boxShadow = "none";
          }}
        />
      </div>
    </div>

    <div className="space-y-1">
      <div className="flex items-center justify-between">
        <label htmlFor="password" className="block text-sm font-medium text-slate-700">
          Password
        </label>

        <Link
          to="/reset-password"
          className="text-sm font-medium transition-colors"
          style={{ color: "#2563eb" }}
          onMouseOver={(e) => (e.currentTarget.style.color = "#1e40af")}
          onMouseOut={(e) => (e.currentTarget.style.color = "#2563eb")}
        >
          Forgot password?
        </Link>
      </div>

      <div className="relative">
        <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
          <Lock className="w-4 h-4 text-slate-400" />
        </div>

        <input
          id="password"
          type={showPassword ? "text" : "password"}
          name="password"
          placeholder="••••••••"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          className="block w-full pl-11 pr-12 py-3 bg-slate-50 border border-slate-200 text-slate-900 text-sm outline-none transition-all duration-200"
          style={{ borderRadius: "12px" }}
          onFocus={(e) => {
            e.currentTarget.style.borderColor = "#3b82f6";
            e.currentTarget.style.backgroundColor = "#fff";
            e.currentTarget.style.boxShadow = "0 0 0 3px rgba(59,130,246,0.15)";
          }}
          onBlur={(e) => {
            e.currentTarget.style.borderColor = "#e2e8f0";
            e.currentTarget.style.backgroundColor = "#f8fafc";
            e.currentTarget.style.boxShadow = "none";
          }}
        />

        <button
          type="button"
          onClick={() => setShowPassword((v) => !v)}
          className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
        >
          {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
        </button>
      </div>
    </div>

    <div className="flex items-center gap-3 pt-1">
      <div className="relative flex items-center justify-center cursor-pointer">
        <input
          type="checkbox"
          id="remember"
          checked={rememberMe}
          onChange={(e) => setRememberMe(e.target.checked)}
          className="sr-only peer"
        />

        <div
          onClick={() => setRememberMe((v) => !v)}
          className="w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-all duration-200"
          style={{
            borderColor: rememberMe ? "#2563eb" : "#cbd5e1",
            backgroundColor: rememberMe ? "#2563eb" : "transparent",
          }}
        >
          {rememberMe && (
            <svg className="w-3 h-3 text-white" fill="none" viewBox="0 0 12 12">
              <path
                d="M2 6l3 3 5-5"
                stroke="currentColor"
                strokeWidth="1.8"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          )}
        </div>
      </div>

      <label
        htmlFor="remember"
        className="text-sm font-medium text-slate-600 cursor-pointer select-none hover:text-slate-900 transition-colors"
        onClick={() => setRememberMe((v) => !v)}
      >
        Remember me
      </label>
    </div>

    <div className="pt-2">
      <button
        type="submit"
        className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-semibold text-white transition-all duration-200 focus:outline-none focus:ring-2 focus:ring-offset-2"
        style={{
          borderRadius: "12px",
          backgroundColor: "#ea580c",
        }}
        onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c2410c")}
        onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ea580c")}
      >
        Sign In to Dashboard
        <ArrowRight className="ml-2 w-4 h-4 opacity-80" />
      </button>
    </div>
  </form>

  <div className="mt-6 text-center">
    <p className="text-xs text-slate-500">
      Secure access restricted to authorized MUST personnel only.
    </p>
  </div>
</div>
      </section>
    </main>
  );
}