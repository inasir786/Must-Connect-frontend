import { createFileRoute } from "@tanstack/react-router";
import { useState, useEffect, useCallback, memo } from "react";
import { User, Lock, Loader2, CheckCircle2, AlertCircle } from "lucide-react";
import { AdminLayout } from "@/components/AdminLayout";
import { getProfile, updateProfile, updatePassword } from "@/api/settings";

export const Route = createFileRoute("/settings")({
  head: () => ({
    meta: [
      { title: "Settings — MUST Connect" },
      { name: "description", content: "Manage your MUST Connect profile and security settings." },
    ],
  }),
  component: SettingsPage,
});

function extractError(err: any): string {
  const detail = err?.response?.data?.detail;
  if (Array.isArray(detail)) {
    return detail.map((d: any) => String(d?.msg || "Unknown error")).join(", ");
  }
  if (typeof detail === "string") return detail;
  return err?.message || "Something went wrong. Please try again.";
}

function Banner({ type, message }: { type: "success" | "error"; message: string }) {
  const isSuccess = type === "success";
  return (
    <div
      className="flex items-center gap-2 px-4 py-3 rounded-xl text-sm font-medium"
      style={{
        backgroundColor: isSuccess ? "#f0fdf4" : "#fef2f2",
        color: isSuccess ? "#16a34a" : "#dc2626",
        border: `1px solid ${isSuccess ? "#bbf7d0" : "#fecaca"}`,
      }}
    >
      {isSuccess
        ? <CheckCircle2 className="w-4 h-4 flex-shrink-0" />
        : <AlertCircle className="w-4 h-4 flex-shrink-0" />}
      <span>{message}</span>
    </div>
  );
}

const inputClass =
  "w-full px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-xl text-sm text-slate-900 outline-none transition-all duration-200";

function StyledInput(props: React.InputHTMLAttributes<HTMLInputElement> & { error?: string }) {
  const { error, ...rest } = props;
  return (
    <div>
      <input
        {...rest}
        className={inputClass}
        style={{ borderColor: error ? "#ef4444" : undefined }}
        onFocus={(e) => {
          e.currentTarget.style.borderColor = error ? "#ef4444" : "#3b82f6";
          e.currentTarget.style.backgroundColor = "#fff";
          e.currentTarget.style.boxShadow = error
            ? "0 0 0 3px rgba(239,68,68,0.15)"
            : "0 0 0 3px rgba(59,130,246,0.15)";
        }}
        onBlur={(e) => {
          e.currentTarget.style.borderColor = error ? "#ef4444" : "#e2e8f0";
          e.currentTarget.style.backgroundColor = "#f8fafc";
          e.currentTarget.style.boxShadow = "none";
        }}
      />
      {error && <p className="mt-1 text-xs font-medium" style={{ color: "#ef4444" }}>{error}</p>}
    </div>
  );
}

const SettingsPage = memo(function SettingsPage() {

  const [profile, setProfile] = useState({
    full_name: "",
    email: "",
    phone: "",
    department: "",
    role: "admin",
  });
  const [profileErrors, setProfileErrors] = useState({
    full_name: "",
    phone: "",
    department: "",
  });
  const [profileLoading, setProfileLoading] = useState(true);
  const [profileSaving, setProfileSaving] = useState(false);
  const [profileFeedback, setProfileFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  const [pwdForm, setPwdForm] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwdErrors, setPwdErrors] = useState({
    current_password: "",
    new_password: "",
    confirm_password: "",
  });
  const [pwdSaving, setPwdSaving] = useState(false);
  const [pwdFeedback, setPwdFeedback] = useState<{ type: "success" | "error"; message: string } | null>(null);

  useEffect(() => {
    let cancelled = false;
    const fetchData = async () => {
      try {
        const data = await getProfile();
        if (!cancelled) {
          setProfile({
            full_name: data.full_name ?? "",
            email: data.email ?? "",
            phone: data.phone ? String(data.phone).replace(/^\+/, "") : "",
            department: data.department ?? "",
            role: data.role ?? "admin",
          });
        }
      } catch (err: any) {
        if (!cancelled)
          setProfileFeedback({ type: "error", message: extractError(err) });
      } finally {
        if (!cancelled) setProfileLoading(false);
      }
    };
    fetchData();
    return () => { cancelled = true; };
  }, []);

  const validateProfile = useCallback(() => {
    const errs = { full_name: "", phone: "", department: "" };
    let valid = true;

    if (!profile.full_name.trim()) {
      errs.full_name = "Full name is required.";
      valid = false;
    }
    if (!profile.phone.trim()) {
      errs.phone = "Phone number is required.";
      valid = false;
    } else if (!/^[0-9]{12}$/.test(profile.phone)) {
      errs.phone = "Phone must be exactly 12 digits after + (e.g. 923411731277).";
      valid = false;
    }
    if (!profile.department.trim()) {
      errs.department = "Department is required.";
      valid = false;
    }

    setProfileErrors(errs);
    return valid;
  }, [profile]);

  const handleProfileSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setProfileFeedback(null);
    if (!validateProfile()) return;

    const doSave = async () => {
      setProfileSaving(true);
      try {
        await updateProfile({
          full_name: profile.full_name,
          phone: `+${profile.phone}`,
          department: profile.department,
          role: profile.role,
        });
        setProfileFeedback({ type: "success", message: "Profile updated successfully." });
      } catch (err: any) {
        setProfileFeedback({ type: "error", message: extractError(err) });
      } finally {
        setProfileSaving(false);
      }
    };
    doSave();
  }, [profile, validateProfile]);

  const validatePwd = useCallback(() => {
    const errs = { current_password: "", new_password: "", confirm_password: "" };
    let valid = true;

    if (!pwdForm.current_password) {
      errs.current_password = "Current password is required.";
      valid = false;
    }
    if (!pwdForm.new_password) {
      errs.new_password = "New password is required.";
      valid = false;
    } else if (pwdForm.new_password.length < 8) {
      errs.new_password = "Must be at least 8 characters.";
      valid = false;
    } else if (!/[A-Z]/.test(pwdForm.new_password)) {
      errs.new_password = "Must contain at least one uppercase letter.";
      valid = false;
    } else if (!/[0-9]/.test(pwdForm.new_password)) {
      errs.new_password = "Must contain at least one number.";
      valid = false;
    }
    if (!pwdForm.confirm_password) {
      errs.confirm_password = "Please confirm your password.";
      valid = false;
    } else if (pwdForm.new_password !== pwdForm.confirm_password) {
      errs.confirm_password = "Passwords do not match.";
      valid = false;
    }

    setPwdErrors(errs);
    return valid;
  }, [pwdForm]);

  const handlePasswordSave = useCallback((e: React.MouseEvent) => {
    e.preventDefault();
    setPwdFeedback(null);
    if (!validatePwd()) return;

    const doSave = async () => {
      setPwdSaving(true);
      try {
        await updatePassword(pwdForm);
        setPwdFeedback({ type: "success", message: "Password updated successfully." });
        setPwdForm({ current_password: "", new_password: "", confirm_password: "" });
      } catch (err: any) {
        setPwdFeedback({ type: "error", message: extractError(err) });
      } finally {
        setPwdSaving(false);
      }
    };
    doSave();
  }, [pwdForm, validatePwd]);

  return (
    <AdminLayout>
      <div className="mx-auto max-w-4xl space-y-6">
        <div>
          <h1 className="text-2xl font-bold text-foreground md:text-3xl">Settings</h1>
          <p className="mt-1 text-sm text-muted-foreground">
            Manage your account preferences and security
          </p>
        </div>

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

          {profileLoading ? (
            <div className="flex items-center gap-2 text-sm text-muted-foreground py-4">
              <Loader2 className="w-4 h-4 animate-spin" />
              Loading profile...
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Full Name</label>
                  <StyledInput
                    value={profile.full_name}
                    error={profileErrors.full_name}
                    placeholder="Admin Must"
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, full_name: e.target.value }));
                      if (profileErrors.full_name) setProfileErrors((p) => ({ ...p, full_name: "" }));
                    }}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Email Address</label>
                  <StyledInput
                    type="email"
                    value={profile.email}
                    disabled
                    className={`${inputClass} opacity-60 cursor-not-allowed`}
                  />
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">
                    Phone Number
                  
                  </label>
                  <div className="relative">
                    <span
                      className="absolute inset-y-0 left-0 flex items-center pl-4 text-sm font-medium select-none pointer-events-none"
                      style={{ color: "#64748b" }}
                    >
                      +
                    </span>
                    <input
                      value={profile.phone}
                      inputMode="numeric"
                      maxLength={12}
                      placeholder="923411731277"
                      onChange={(e) => {
                        const val = e.target.value.replace(/\D/g, "").slice(0, 12);
                        setProfile((p) => ({ ...p, phone: val }));
                        if (profileErrors.phone) setProfileErrors((p) => ({ ...p, phone: "" }));
                      }}
                      className={inputClass}
                      style={{
                        paddingLeft: "1.75rem",
                        borderColor: profileErrors.phone ? "#ef4444" : undefined,
                      }}
                      onFocus={(e) => {
                        e.currentTarget.style.borderColor = profileErrors.phone ? "#ef4444" : "#3b82f6";
                        e.currentTarget.style.backgroundColor = "#fff";
                        e.currentTarget.style.boxShadow = profileErrors.phone
                          ? "0 0 0 3px rgba(239,68,68,0.15)"
                          : "0 0 0 3px rgba(59,130,246,0.15)";
                      }}
                      onBlur={(e) => {
                        e.currentTarget.style.borderColor = profileErrors.phone ? "#ef4444" : "#e2e8f0";
                        e.currentTarget.style.backgroundColor = "#f8fafc";
                        e.currentTarget.style.boxShadow = "none";
                      }}
                    />
                    {profileErrors.phone && (
                      <p className="mt-1 text-xs font-medium" style={{ color: "#ef4444" }}>{profileErrors.phone}</p>
                    )}
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="block text-sm font-medium text-slate-700">Department</label>
                  <StyledInput
                    value={profile.department}
                    error={profileErrors.department}
                    placeholder="Computer Science"
                    onChange={(e) => {
                      setProfile((p) => ({ ...p, department: e.target.value }));
                      if (profileErrors.department) setProfileErrors((p) => ({ ...p, department: "" }));
                    }}
                  />
                </div>

               
              </div>

              {profileFeedback && <Banner type={profileFeedback.type} message={profileFeedback.message} />}

              <div className="flex justify-end">
                <button
                  onClick={handleProfileSave}
                  disabled={profileSaving}
                  className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                  style={{ backgroundColor: "#003d82" }}
                  onMouseOver={(e) => { if (!profileSaving) e.currentTarget.style.backgroundColor = "#002a5c"; }}
                  onMouseOut={(e) => { if (!profileSaving) e.currentTarget.style.backgroundColor = "#003d82"; }}
                >
                  {profileSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                  {profileSaving ? "Saving..." : "Save Changes"}
                </button>
              </div>
            </div>
          )}
        </section>

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

          <div className="space-y-4">
            <div className="space-y-1.5">
              <label className="block text-sm font-medium text-slate-700">Current Password</label>
              <StyledInput
                type="password"
                placeholder="••••••••"
                value={pwdForm.current_password}
                error={pwdErrors.current_password}
                onChange={(e) => {
                  setPwdForm((p) => ({ ...p, current_password: e.target.value }));
                  if (pwdErrors.current_password) setPwdErrors((p) => ({ ...p, current_password: "" }));
                }}
              />
            </div>
            <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">New Password</label>
                <StyledInput
                  type="password"
                  placeholder="••••••••"
                  value={pwdForm.new_password}
                  error={pwdErrors.new_password}
                  onChange={(e) => {
                    setPwdForm((p) => ({ ...p, new_password: e.target.value }));
                    if (pwdErrors.new_password) setPwdErrors((p) => ({ ...p, new_password: "" }));
                  }}
                />
              </div>
              <div className="space-y-1.5">
                <label className="block text-sm font-medium text-slate-700">Confirm Password</label>
                <StyledInput
                  type="password"
                  placeholder="••••••••"
                  value={pwdForm.confirm_password}
                  error={pwdErrors.confirm_password}
                  onChange={(e) => {
                    setPwdForm((p) => ({ ...p, confirm_password: e.target.value }));
                    if (pwdErrors.confirm_password) setPwdErrors((p) => ({ ...p, confirm_password: "" }));
                  }}
                />
              </div>
            </div>

            {pwdFeedback && <Banner type={pwdFeedback.type} message={pwdFeedback.message} />}

            <div className="flex justify-end">
              <button
                onClick={handlePasswordSave}
                disabled={pwdSaving}
                className="flex items-center gap-2 px-5 py-2.5 text-sm font-semibold text-white rounded-xl transition-all duration-200 disabled:opacity-70 disabled:cursor-not-allowed"
                style={{ backgroundColor: "#ea580c" }}
                onMouseOver={(e) => { if (!pwdSaving) e.currentTarget.style.backgroundColor = "#c2410c"; }}
                onMouseOut={(e) => { if (!pwdSaving) e.currentTarget.style.backgroundColor = "#ea580c"; }}
              >
                {pwdSaving && <Loader2 className="w-4 h-4 animate-spin" />}
                {pwdSaving ? "Updating..." : "Update Password"}
              </button>
            </div>
          </div>
        </section>

      </div>
    </AdminLayout>
  );
});