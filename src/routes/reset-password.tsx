import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, type FormEvent } from "react";
import { GraduationCap, Lock, Eye, EyeOff, Unlock, ArrowRight, ArrowLeft } from "lucide-react";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — MUST Connect" },
      { name: "description", content: "Reset your MUST Connect admin password." },
    ],
  }),
  component: ResetPasswordPage,
});

function ResetPasswordPage() {
  const navigate = useNavigate();
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault();
    navigate({ to: "/settings" });
  };

  return (
    <main className="flex w-full h-screen overflow-hidden font-[Inter,sans-serif] text-slate-800 antialiased bg-slate-50">
      {/* Left brand panel */}
      <section
        className="hidden lg:flex lg:w-5/12 relative overflow-hidden flex-col justify-between p-12 flex-shrink-0"
        style={{ backgroundColor: "#003d82" }}
      >
        <div
          className="absolute inset-0 pointer-events-none"
          style={{
            backgroundImage: "radial-gradient(#003d82 1px, transparent 1px)",
            backgroundSize: "24px 24px",
            opacity: 0.1,
            mixBlendMode: "overlay",
          }}
        />
        <div
          className="absolute top-[-10%] left-[-10%] w-[500px] h-[500px] rounded-full pointer-events-none"
          style={{ backgroundColor: "#1d4ed8", filter: "blur(100px)", opacity: 0.6 }}
        />
        <div
          className="absolute bottom-[-10%] right-[-10%] w-[600px] h-[600px] rounded-full pointer-events-none"
          style={{ backgroundColor: "#1e40af", filter: "blur(120px)", opacity: 0.8 }}
        />

        <div className="relative z-10 flex items-center gap-3">
          <div className="w-10 h-10 bg-white rounded-lg flex items-center justify-center shadow-lg">
            <GraduationCap className="w-5 h-5" style={{ color: "#003d82" }} />
          </div>
          <div>
            <h2 className="text-white font-bold text-xl tracking-tight">MUST</h2>
            <p className="text-blue-100 text-xs font-medium uppercase tracking-wider">University</p>
          </div>
        </div>

        <div className="relative z-10 my-auto max-w-md">
          <h1 className="text-4xl lg:text-5xl font-bold text-white leading-[1.1] mb-6 tracking-tight">
            Secure Your<br />Account<br />
            <span style={{ color: "#f97316" }}>Access.</span>
          </h1>
          <p className="text-blue-50 text-lg leading-relaxed font-light" style={{ opacity: 0.9 }}>
            Create a strong password to protect your MUST Connect admin account
            and ensure secure access to student outreach operations.
          </p>
        </div>

        <div className="relative z-10 text-sm font-medium" style={{ color: "rgba(219,234,254,0.6)" }}>
          <span>© 2026 Multan University of Science and Technology</span>
        </div>
      </section>

      {/* Right form panel */}
      <section className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-50 relative overflow-hidden">
        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <div
            className="w-8 h-8 rounded flex items-center justify-center"
            style={{ backgroundColor: "#003d82" }}
          >
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">MUST Connect</span>
        </div>

        <div
          className="w-full max-w-[380px] bg-white border border-slate-100 p-5 sm:p-6"
          style={{
            borderRadius: "24px",
            boxShadow:
              "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03), 0 20px 25px -5px rgba(0,0,0,0.05)",
          }}
        >
          <div className="mb-6">
            <div
              className="w-11 h-11 rounded-xl flex items-center justify-center mb-4"
              style={{ backgroundColor: "rgba(234,88,12,0.1)" }}
            >
              <Unlock className="w-5 h-5" style={{ color: "#ea580c" }} />
            </div>
            <h2 className="text-2xl sm:text-3xl font-bold text-slate-900 mb-1 tracking-tight">
              Reset Password
            </h2>
            <p className="text-slate-500 text-sm">
              Create a new secure password for your account
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* New password */}
            <div className="space-y-1">
              <label htmlFor="new-pwd" className="block text-sm font-medium text-slate-700">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="new-pwd"
                  type={showPwd ? "text" : "password"}
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter new password"
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
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {/* Confirm password */}
            <div className="space-y-1">
              <label htmlFor="confirm-pwd" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4 text-slate-400" />
                </div>
                <input
                  id="confirm-pwd"
                  type={showConfirm ? "text" : "password"}
                  required
                  value={confirm}
                  onChange={(e) => setConfirm(e.target.value)}
                  placeholder="Re-enter new password"
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
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            <div className="pt-2">
              <button
                type="submit"
                className="w-full flex items-center justify-center py-3 px-4 border border-transparent text-sm font-semibold text-white transition-all duration-200 focus:outline-none"
                style={{ borderRadius: "12px", backgroundColor: "#ea580c" }}
                onMouseOver={(e) => (e.currentTarget.style.backgroundColor = "#c2410c")}
                onMouseOut={(e) => (e.currentTarget.style.backgroundColor = "#ea580c")}
              >
                Reset Password
                <ArrowRight className="ml-2 w-4 h-4 opacity-80" />
              </button>
            </div>

            <div className="text-center pt-1">
              <Link
                to="/login"
                className="inline-flex items-center gap-1.5 text-sm font-medium text-slate-600 hover:text-slate-900 transition-colors"
              >
                <ArrowLeft className="w-3.5 h-3.5" />
                Back to Login
              </Link>
            </div>
          </form>

          <div className="mt-6 text-center">
            <p className="text-xs text-slate-500">
              Your password will be securely encrypted and stored.
            </p>
          </div>
        </div>
      </section>
    </main>
  );
}
