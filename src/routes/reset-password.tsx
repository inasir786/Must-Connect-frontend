import { createFileRoute, Link, useNavigate } from "@tanstack/react-router";
import { useState, useCallback, memo, type FormEvent } from "react";
import { GraduationCap, Lock, Eye, EyeOff, Unlock, ArrowRight, ArrowLeft, Loader2 } from "lucide-react";
import { resetPassword } from "@/api/auth";

export const Route = createFileRoute("/reset-password")({
  head: () => ({
    meta: [
      { title: "Reset Password — MUST Connect" },
      { name: "description", content: "Reset your MUST Connect admin password." },
    ],
  }),
  component: () => <ResetPasswordPage />,
});

const ResetPasswordPage = memo(function ResetPasswordPage() {
  const navigate = useNavigate();

  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [showPwd, setShowPwd] = useState(false);
  const [showConfirm, setShowConfirm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ password: "", confirm: "" });
  const [apiError, setApiError] = useState("");
  const [success, setSuccess] = useState(false);

  const validate = useCallback(() => {
    const newErrors = { password: "", confirm: "" };
    let valid = true;

    if (!password) {
      newErrors.password = "New password is required.";
      valid = false;
    } else if (password.length < 8) {
      newErrors.password = "Password must be at least 8 characters.";
      valid = false;
    } else if (!/[A-Z]/.test(password)) {
      newErrors.password = "Password must contain at least one uppercase letter.";
      valid = false;
    } else if (!/[0-9]/.test(password)) {
      newErrors.password = "Password must contain at least one number.";
      valid = false;
    }

    if (!confirm) {
      newErrors.confirm = "Please confirm your password.";
      valid = false;
    } else if (password !== confirm) {
      newErrors.confirm = "Passwords do not match.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }, [password, confirm]);

  const handleSubmit = useCallback((e: FormEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setApiError("");
    if (!validate()) return;

    const doReset = async () => {
      setLoading(true);
      try {
        await resetPassword({ new_password: password, confirm_password: confirm });
        setSuccess(true);
        setTimeout(() => navigate({ to: "/login" }), 2000);
      } catch (err: any) {
        const msg =
          err?.response?.data?.detail ||
          err?.message ||
          "Something went wrong. Please try again.";
        setApiError(msg);
      } finally {
        setLoading(false);
      }
    };

    doReset();
  }, [password, confirm, validate, navigate]);

  const borderColor = (field: "password" | "confirm") =>
    errors[field] ? "#ef4444" : "#e2e8f0";

  const handleFocus = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    e.currentTarget.style.borderColor = hasError ? "#ef4444" : "#3b82f6";
    e.currentTarget.style.backgroundColor = "#fff";
    e.currentTarget.style.boxShadow = hasError
      ? "0 0 0 3px rgba(239,68,68,0.15)"
      : "0 0 0 3px rgba(59,130,246,0.15)";
  };

  const handleBlur = (e: React.FocusEvent<HTMLInputElement>, hasError: boolean) => {
    e.currentTarget.style.borderColor = hasError ? "#ef4444" : "#e2e8f0";
    e.currentTarget.style.backgroundColor = "#f8fafc";
    e.currentTarget.style.boxShadow = "none";
  };

  return (
    <main className="flex w-full h-screen overflow-hidden font-[Inter,sans-serif] text-slate-800 antialiased bg-slate-50">

      {/* ── Left Brand Panel ── */}
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

      {/* ── Right Form Panel ── */}
      <section className="w-full lg:w-7/12 flex items-center justify-center p-6 sm:p-8 lg:p-12 bg-slate-50 relative overflow-hidden">

        <div className="absolute top-8 left-8 lg:hidden flex items-center gap-2">
          <div className="w-8 h-8 rounded flex items-center justify-center" style={{ backgroundColor: "#003d82" }}>
            <GraduationCap className="w-4 h-4 text-white" />
          </div>
          <span className="font-bold text-slate-900 tracking-tight">MUST Connect</span>
        </div>

        <div
          className="w-full max-w-[380px] bg-white border border-slate-100 p-5 sm:p-6"
          style={{
            borderRadius: "24px",
            boxShadow: "0 4px 6px -1px rgba(0,0,0,0.05), 0 2px 4px -1px rgba(0,0,0,0.03), 0 20px 25px -5px rgba(0,0,0,0.05)",
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

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* ── New Password ── */}
            <div className="space-y-1">
              <label htmlFor="new-pwd" className="block text-sm font-medium text-slate-700">
                New Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4" style={{ color: errors.password ? "#ef4444" : "#94a3b8" }} />
                </div>
                <input
                  id="new-pwd"
                  type={showPwd ? "text" : "password"}
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                  }}
                  placeholder="Enter new password"
                  className="block w-full pl-11 pr-12 py-3 bg-slate-50 border text-slate-900 text-sm outline-none transition-all duration-200"
                  style={{ borderRadius: "12px", borderColor: borderColor("password") }}
                  onFocus={(e) => handleFocus(e, !!errors.password)}
                  onBlur={(e) => handleBlur(e, !!errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPwd((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium mt-1" style={{ color: "#ef4444" }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* ── Confirm Password ── */}
            <div className="space-y-1">
              <label htmlFor="confirm-pwd" className="block text-sm font-medium text-slate-700">
                Confirm Password
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Lock className="w-4 h-4" style={{ color: errors.confirm ? "#ef4444" : "#94a3b8" }} />
                </div>
                <input
                  id="confirm-pwd"
                  type={showConfirm ? "text" : "password"}
                  value={confirm}
                  onChange={(e) => {
                    setConfirm(e.target.value);
                    if (errors.confirm) setErrors((p) => ({ ...p, confirm: "" }));
                  }}
                  placeholder="Re-enter new password"
                  className="block w-full pl-11 pr-12 py-3 bg-slate-50 border text-slate-900 text-sm outline-none transition-all duration-200"
                  style={{ borderRadius: "12px", borderColor: borderColor("confirm") }}
                  onFocus={(e) => handleFocus(e, !!errors.confirm)}
                  onBlur={(e) => handleBlur(e, !!errors.confirm)}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirm((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showConfirm ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.confirm && (
                <p className="text-xs font-medium mt-1" style={{ color: "#ef4444" }}>
                  {errors.confirm}
                </p>
              )}
            </div>

            {/* ── API Error + Success + Submit ── */}
            <div className="pt-2 space-y-3">

              {apiError && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z" clipRule="evenodd" />
                  </svg>
                  {apiError}
                </div>
              )}

              {success && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#f0fdf4", color: "#16a34a", border: "1px solid #bbf7d0" }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd" />
                  </svg>
                  Password reset successful! Redirecting to login...
                </div>
              )}

              <button
                type="submit"
                disabled={loading || success}
                className="w-full flex items-center justify-center py-3 px-4 text-sm font-semibold text-white transition-all duration-200 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ borderRadius: "12px", backgroundColor: "#ea580c" }}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#c2410c"; }}
                onMouseOut={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#ea580c"; }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Resetting...
                  </>
                ) : (
                  <>
                    Reset Password
                    <ArrowRight className="ml-2 w-4 h-4 opacity-80" />
                  </>
                )}
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
});