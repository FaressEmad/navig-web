"use client";

import React, { useState } from "react";
import { useRouter } from "next/navigation";
import Layout from "../../components/Layout";
import { useTranslation } from "../../hooks/useTranslation";
import { Lock, ShieldAlert, ArrowRight, User } from "lucide-react";

export default function LoginPage() {
  const router = useRouter();
  const { t } = useTranslation();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleLogin = (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    // Mock Authentication Logic (Admins only, username: admin, password: admin123)
    setTimeout(() => {
      if (username === "admin" && password === "admin123") {
        // Set a mock session in local storage for navigation guards
        if (typeof window !== "undefined") {
          localStorage.setItem("cu_navigate_admin_session", "true");
        }
        router.push("/admin");
      } else {
        setError(t("loginError"));
        setLoading(false);
      }
    }, 800);
  };

  return (
    <Layout>
      <div className="flex-1 w-full flex items-center justify-center py-16 px-margin-mobile md:px-margin-desktop bg-background/50">
        <div className="w-full max-w-md flex flex-col gap-6">
          
          {/* Card Container */}
          <form 
            onSubmit={handleLogin}
            className="glass-card rounded-[2rem] p-8 shadow-2xl flex flex-col gap-6 border border-outline-variant/10 text-left"
          >
            {/* Header info */}
            <div className="flex flex-col items-center gap-3 text-center border-b border-outline-variant/10 pb-6">
              <div className="w-12 h-12 bg-primary/10 text-primary rounded-2xl flex items-center justify-center shadow-inner">
                <Lock className="w-5 h-5" />
              </div>
              <h2 className="text-xl font-black text-on-surface mt-2">{t("adminLoginTitle")}</h2>
              <p className="text-xs text-secondary max-w-[260px]">{t("adminLoginSubtitle")}</p>
            </div>

            {/* Error alerts */}
            {error && (
              <div className="p-3.5 bg-red-500/10 border border-red-500/20 text-red-600 rounded-xl text-xs font-bold flex items-center gap-2">
                <ShieldAlert className="w-4 h-4 flex-shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {/* Inputs */}
            <div className="flex flex-col gap-1.5">
              <label htmlFor="username" className="text-[10px] font-bold text-secondary uppercase tracking-wider pl-1">
                {t("username")}
              </label>
              <div className="relative flex items-center bg-surface-container rounded-xl p-0.5 border border-outline-variant/10">
                <User className="w-4 h-4 text-secondary ml-3 flex-shrink-0" />
                <input
                  id="username"
                  type="text"
                  required
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none focus:ring-0 py-3 px-2 text-xs md:text-sm text-on-surface"
                  placeholder="Enter admin username"
                />
              </div>
            </div>

            <div className="flex flex-col gap-1.5">
              <label htmlFor="password" className="text-[10px] font-bold text-secondary uppercase tracking-wider pl-1">
                {t("password")}
              </label>
              <div className="relative flex items-center bg-surface-container rounded-xl p-0.5 border border-outline-variant/10">
                <Lock className="w-4 h-4 text-secondary ml-3 flex-shrink-0" />
                <input
                  id="password"
                  type="password"
                  required
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  className="w-full bg-transparent border-0 outline-none focus:ring-0 py-3 px-2 text-xs md:text-sm text-on-surface"
                  placeholder="Enter password"
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={loading}
              className="mt-2 bg-primary hover:bg-primary-container text-white py-3.5 rounded-xl font-bold text-sm shadow-lg shadow-primary/20 flex items-center justify-center gap-2 transition-all active:scale-95 disabled:opacity-50 cursor-pointer"
            >
              <span>{loading ? "Verifying..." : t("loginBtn")}</span>
              {!loading && <ArrowRight className="w-4 h-4" />}
            </button>

            {/* Help micro-copy */}
            <div className="text-center pt-2">
              <span className="text-[10px] text-secondary font-medium italic">
                Demo accounts: Use <strong>admin</strong> / <strong>admin123</strong>
              </span>
            </div>

          </form>

        </div>
      </div>
    </Layout>
  );
}
