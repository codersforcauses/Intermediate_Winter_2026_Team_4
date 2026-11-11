"use client";

import { useState } from "react";
import Sidebar from "../components/Sidebar";

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
      <Sidebar />

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
                Don&apos;t have an account?{" "}
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