"use client";

import { useState } from "react";
import Link from "next/link";

export default function LoginPage() {
  const [tab, setTab] = useState("login");

  const [loginForm, setLoginForm] = useState({ email: "", password: "" });
  const [registerForm, setRegisterForm] = useState({ name: "", email: "", password: "" });

  const handleLogin = () => {
    // TODO: connect to Django JWT auth endpoint
    window.location.href = "/";
  };

  const handleRegister = () => {
    // TODO: connect to Django register endpoint
    window.location.href = "/";
  };

  return (
    <div className="min-h-screen bg-bg flex">
      {/* Sidebar */}
      <aside className="w-[220px] min-h-screen bg-surface border-r border-line flex flex-col fixed top-0 left-0 z-30">
        <div className="px-[18px] py-5 border-b border-line">
          <div className="font-bold text-[17px] text-accent tracking-tight">CFC Project</div>
          <div className="text-[11px] text-muted mt-[1px]">Job market insights</div>
        </div>
        <nav className="flex-1 p-2">
          <Link href="/market" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text">
            <span className="text-base w-5 text-center">📈</span> Market overview
          </Link>
          <Link href="/" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text">
            <span className="text-base w-5 text-center">🔍</span> Job listings
          </Link>
          <Link href="/me" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text">
            <span className="text-base w-5 text-center">👤</span> Me
          </Link>
        </nav>
        <div className="p-2 border-t border-line">
          <Link href="/login" className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm bg-accent-soft text-accent font-medium">
            <span className="text-base w-5 text-center">→</span> Login / Register
          </Link>
          <button className="flex items-center gap-[10px] px-[10px] py-[9px] rounded-lg text-sm text-muted hover:bg-surface-2 hover:text-text w-full text-left">
            <span className="text-base w-5 text-center">↩</span> Log off
          </button>
        </div>
      </aside>

      {/* Main */}
      <main className="ml-[220px] flex-1 flex items-center justify-center p-6">
        <div className="bg-surface border border-line rounded-2xl p-8 w-full max-w-[360px]">
          <div className="text-xl font-bold mb-[6px]">Welcome to CFC Project</div>
          <div className="text-[13px] text-muted mb-6">Sign in or create an account to save jobs and searches.</div>

          {/* Tabs */}
          <div className="flex gap-1 border-b border-line mb-6">
            {["login", "register"].map((t) => (
              <button
                key={t}
                onClick={() => setTab(t)}
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

          {/* Login Form */}
          {tab === "login" && (
            <div>
              <div className="mb-[14px]">
                <label className="block text-xs font-medium text-muted mb-[6px]">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={loginForm.email}
                  onChange={(e) => setLoginForm({ ...loginForm, email: e.target.value })}
                  className="w-full h-10 border border-line rounded-[10px] bg-surface-2 text-text px-3 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div className="mb-[14px]">
                <label className="block text-xs font-medium text-muted mb-[6px]">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={loginForm.password}
                  onChange={(e) => setLoginForm({ ...loginForm, password: e.target.value })}
                  className="w-full h-10 border border-line rounded-[10px] bg-surface-2 text-text px-3 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <button
                onClick={handleLogin}
                className="w-full h-10 bg-accent text-white rounded-[10px] text-sm font-medium mt-[6px] hover:opacity-90 transition-opacity"
              >
                Sign in
              </button>
              <p className="text-center text-[13px] text-muted mt-4">
                Don't have an account?{" "}
                <button onClick={() => setTab("register")} className="text-accent">
                  Create one
                </button>
              </p>
            </div>
          )}

          {/* Register Form */}
          {tab === "register" && (
            <div>
              <div className="mb-[14px]">
                <label className="block text-xs font-medium text-muted mb-[6px]">Name</label>
                <input
                  type="text"
                  placeholder="Yeona Kim"
                  value={registerForm.name}
                  onChange={(e) => setRegisterForm({ ...registerForm, name: e.target.value })}
                  className="w-full h-10 border border-line rounded-[10px] bg-surface-2 text-text px-3 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div className="mb-[14px]">
                <label className="block text-xs font-medium text-muted mb-[6px]">Email</label>
                <input
                  type="email"
                  placeholder="name@example.com"
                  value={registerForm.email}
                  onChange={(e) => setRegisterForm({ ...registerForm, email: e.target.value })}
                  className="w-full h-10 border border-line rounded-[10px] bg-surface-2 text-text px-3 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <div className="mb-[14px]">
                <label className="block text-xs font-medium text-muted mb-[6px]">Password</label>
                <input
                  type="password"
                  placeholder="••••••••"
                  value={registerForm.password}
                  onChange={(e) => setRegisterForm({ ...registerForm, password: e.target.value })}
                  className="w-full h-10 border border-line rounded-[10px] bg-surface-2 text-text px-3 text-sm focus:outline-none focus:border-accent"
                />
              </div>
              <button
                onClick={handleRegister}
                className="w-full h-10 bg-accent text-white rounded-[10px] text-sm font-medium mt-[6px] hover:opacity-90 transition-opacity"
              >
                Create account
              </button>
              <p className="text-center text-[13px] text-muted mt-4">
                Already have an account?{" "}
                <button onClick={() => setTab("login")} className="text-accent">
                  Sign in
                </button>
              </p>
            </div>
          )}

        </div>
      </main>
    </div>
  );
}