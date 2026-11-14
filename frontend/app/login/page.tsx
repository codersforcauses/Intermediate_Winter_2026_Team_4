"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import Sidebar from "../components/Sidebar";
import { useAuth } from "../lib/auth";

type Tab = "login" | "register";

const inputClass =
  "w-full h-10 border border-line rounded-[10px] bg-surface-2 text-text px-3 text-sm focus:outline-none focus:border-accent";

function Field({
  label,
  type,
  placeholder,
  value,
  onChange,
  autoComplete,
}: {
  label: string;
  type: string;
  placeholder: string;
  value: string;
  onChange: (value: string) => void;
  autoComplete?: string;
}) {
  return (
    <div className="mb-[14px]">
      <label className="block text-xs font-medium text-muted mb-[6px]">{label}</label>
      <input
        type={type}
        placeholder={placeholder}
        value={value}
        autoComplete={autoComplete}
        onChange={(e) => onChange(e.target.value)}
        required
        className={inputClass}
      />
    </div>
  );
}

export default function LoginPage() {
  const router = useRouter();
  const { user, login, register } = useAuth();

  const [tab, setTab] = useState<Tab>("login");
  const [error, setError] = useState("");
  const [submitting, setSubmitting] = useState(false);

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });

  // Once signed in (either just now, or already from an earlier visit), leave this page.
  useEffect(() => {
    if (user) router.replace("/dashboard");
  }, [user, router]);

  function switchTab(next: Tab) {
    setTab(next);
    setError("");
  }

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError("");
    setSubmitting(true);
    try {
      if (tab === "login") {
        await login(loginForm.email, loginForm.password);
      } else {
        await register(registerForm.name, registerForm.email, registerForm.password);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-bg flex">
      <Sidebar />

      <main className="ml-[220px] flex-1 flex items-center justify-center p-6">
        <div className="bg-surface border border-line rounded-2xl p-8 w-full max-w-[360px]">
          <div className="text-xl font-bold mb-[6px]">Welcome to JobRader</div>
          <div className="text-[13px] text-muted mb-6">
            Sign in or create an account to save jobs and searches.
          </div>

          <div className="flex gap-1 border-b border-line mb-6">
            {(["login", "register"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => switchTab(t)}
                className={`px-4 py-2 text-sm border-b-2 -mb-[0.5px] transition-colors ${
                  tab === t
                    ? "text-text border-accent font-medium"
                    : "text-muted border-transparent hover:text-text"
                }`}
              >
                {t === "login" ? "Sign in" : "Create account"}
              </button>
            ))}
          </div>

          <form onSubmit={handleSubmit}>
            {tab === "login" ? (
              <>
                <Field
                  label="Email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={loginForm.email}
                  onChange={(email) => setLoginForm({ ...loginForm, email })}
                />
                <Field
                  label="Password"
                  type="password"
                  placeholder="••••••••"
                  autoComplete="current-password"
                  value={loginForm.password}
                  onChange={(password) => setLoginForm({ ...loginForm, password })}
                />
              </>
            ) : (
              <>
                <Field
                  label="Name"
                  type="text"
                  placeholder="Yeona Kim"
                  autoComplete="name"
                  value={registerForm.name}
                  onChange={(name) => setRegisterForm({ ...registerForm, name })}
                />
                <Field
                  label="Email"
                  type="email"
                  placeholder="name@example.com"
                  autoComplete="email"
                  value={registerForm.email}
                  onChange={(email) => setRegisterForm({ ...registerForm, email })}
                />
                <Field
                  label="Password"
                  type="password"
                  placeholder="At least 8 characters"
                  autoComplete="new-password"
                  value={registerForm.password}
                  onChange={(password) => setRegisterForm({ ...registerForm, password })}
                />
              </>
            )}

            {error && (
              <p role="alert" className="text-[13px] text-red-600 mb-[10px]">
                {error}
              </p>
            )}

            <button
              type="submit"
              disabled={submitting}
              className="w-full h-10 bg-accent text-white rounded-[10px] text-sm font-medium mt-[6px] hover:opacity-90 transition-opacity disabled:opacity-60"
            >
              {submitting ? "Please wait…" : tab === "login" ? "Sign in" : "Create account"}
            </button>

            <p className="text-center text-[13px] text-muted mt-4">
              {tab === "login" ? "Don’t have an account? " : "Already have an account? "}
              <button
                type="button"
                onClick={() => switchTab(tab === "login" ? "register" : "login")}
                className="text-accent"
              >
                {tab === "login" ? "Create one" : "Sign in"}
              </button>
            </p>
          </form>
        </div>
      </main>
    </div>
  );
}
