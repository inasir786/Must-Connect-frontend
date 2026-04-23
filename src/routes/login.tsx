import { createFileRoute, useNavigate, Link } from "@tanstack/react-router";
import { useState, useCallback, memo, useEffect, type FormEvent } from "react";
import { GraduationCap, Mail, Lock, ArrowRight, Eye, EyeOff, Loader2 } from "lucide-react";
import { login, getStoredToken } from "@/api/auth";
import { useAppDispatch } from "@/store/hooks";
import { setCredentials } from "@/store/authSlice";

export const Route = createFileRoute("/login")({
  head: () => ({
    meta: [
      { title: "Sign In — MUST Connect" },
      { name: "description", content: "Sign in to MUST Connect Admin Portal." },
    ],
  }),
  component: LoginPage,
});

const LoginPage = memo(function LoginPage() {
  const navigate = useNavigate();
  const dispatch = useAppDispatch();

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [rememberMe, setRememberMe] = useState(false);
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({ email: "", password: "" });
  const [apiError, setApiError] = useState("");

  useEffect(() => {
    if (getStoredToken()) {
      navigate({ to: "/" });
    }
  }, [navigate]);

  const validate = useCallback(() => {
    const newErrors = { email: "", password: "" };
    let valid = true;

    if (!email.trim()) {
      newErrors.email = "Email is required.";
      valid = false;
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      newErrors.email = "Enter a valid email address.";
      valid = false;
    }

    if (!password) {
      newErrors.password = "Password is required.";
      valid = false;
    } else if (password.length < 6) {
      newErrors.password = "Password must be at least 6 characters.";
      valid = false;
    }

    setErrors(newErrors);
    return valid;
  }, [email, password]);

  const handleSubmit = useCallback(
    (e: FormEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setApiError("");
      if (!validate()) return;

      const doLogin = async () => {
        setLoading(true);
        try {
          const data = await login({ email, password, remember_me: rememberMe });
          dispatch(
            setCredentials({
              user: { id: String(data.admin_id), name: data.full_name, email: data.email },
              token: data.access_token,
            })
          );
          navigate({ to: "/" });
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

      doLogin();
    },
    [email, password, rememberMe, validate, dispatch, navigate]
  );

  const inputBase =
    "block w-full pl-11 pr-4 py-3 bg-slate-50 border text-slate-900 text-sm outline-none transition-all duration-200";

  const borderColor = (field: "email" | "password") =>
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
            Empowering<br />Student Outreach<br />
            <span style={{ color: "#f97316" }}>at Scale.</span>
          </h1>
          <p className="text-blue-50 text-lg leading-relaxed font-light" style={{ opacity: 0.9 }}>
            The centralized portal for managing lead batches, validating
            contacts, and running intelligent engagement campaigns.
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

          <form onSubmit={handleSubmit} className="space-y-4" noValidate>

            {/* ── Email ── */}
            <div className="space-y-1">
              <label htmlFor="email" className="block text-sm font-medium text-slate-700">
                Email Address
              </label>
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none">
                  <Mail className="w-4 h-4" style={{ color: errors.email ? "#ef4444" : "#94a3b8" }} />
                </div>
                <input
                  id="email"
                  type="email"
                  placeholder="admin@must.edu.pk"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                    if (errors.email) setErrors((p) => ({ ...p, email: "" }));
                  }}
                  className={inputBase}
                  style={{ borderRadius: "12px", borderColor: borderColor("email") }}
                  onFocus={(e) => handleFocus(e, !!errors.email)}
                  onBlur={(e) => handleBlur(e, !!errors.email)}
                />
              </div>
              {errors.email && (
                <p className="text-xs font-medium mt-1" style={{ color: "#ef4444" }}>
                  {errors.email}
                </p>
              )}
            </div>

            {/* ── Password ── */}
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
                  <Lock className="w-4 h-4" style={{ color: errors.password ? "#ef4444" : "#94a3b8" }} />
                </div>
                <input
                  id="password"
                  type={showPassword ? "text" : "password"}
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                    if (errors.password) setErrors((p) => ({ ...p, password: "" }));
                  }}
                  className={`${inputBase} pr-12`}
                  style={{ borderRadius: "12px", borderColor: borderColor("password") }}
                  onFocus={(e) => handleFocus(e, !!errors.password)}
                  onBlur={(e) => handleBlur(e, !!errors.password)}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword((v) => !v)}
                  className="absolute inset-y-0 right-0 pr-4 flex items-center text-slate-400 hover:text-slate-600 transition-colors focus:outline-none"
                >
                  {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
              {errors.password && (
                <p className="text-xs font-medium mt-1" style={{ color: "#ef4444" }}>
                  {errors.password}
                </p>
              )}
            </div>

            {/* ── Remember Me ── */}
            <div className="flex items-center gap-3 pt-1">
              <div
                onClick={() => setRememberMe((v) => !v)}
                className="w-5 h-5 border-2 rounded flex items-center justify-center cursor-pointer transition-all duration-200 flex-shrink-0"
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
              <label
                className="text-sm font-medium text-slate-600 cursor-pointer select-none hover:text-slate-900 transition-colors"
                onClick={() => setRememberMe((v) => !v)}
              >
                Remember me
              </label>
            </div>

            {/* ── API Error + Submit ── */}
            <div className="pt-2 space-y-3">
              {apiError && (
                <div
                  className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
                  style={{ backgroundColor: "#fef2f2", color: "#dc2626", border: "1px solid #fecaca" }}
                >
                  <svg className="w-4 h-4 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path
                      fillRule="evenodd"
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM8.707 7.293a1 1 0 00-1.414 1.414L8.586 10l-1.293 1.293a1 1 0 101.414 1.414L10 11.414l1.293 1.293a1 1 0 001.414-1.414L11.414 10l1.293-1.293a1 1 0 00-1.414-1.414L10 8.586 8.707 7.293z"
                      clipRule="evenodd"
                    />
                  </svg>
                  {apiError}
                </div>
              )}

              <button
                type="submit"
                disabled={loading}
                className="w-full flex items-center justify-center py-3 px-4 text-sm font-semibold text-white transition-all duration-200 focus:outline-none disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ borderRadius: "12px", backgroundColor: "#ea580c" }}
                onMouseOver={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#c2410c"; }}
                onMouseOut={(e) => { if (!loading) e.currentTarget.style.backgroundColor = "#ea580c"; }}
              >
                {loading ? (
                  <>
                    <Loader2 className="mr-2 w-4 h-4 animate-spin" />
                    Signing in...
                  </>
                ) : (
                  <>
                    Sign In to Dashboard
                    <ArrowRight className="ml-2 w-4 h-4 opacity-80" />
                  </>
                )}
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
});