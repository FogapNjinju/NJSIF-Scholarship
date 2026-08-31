import Link from "next/link";
import { useRouter } from "next/router";
import { useEffect, useState } from "react";

const ADMIN_EMAIL = process.env.NEXT_PUBLIC_ADMIN_EMAIL || "admin@njsif.org";
const ADMIN_PASSWORD = process.env.NEXT_PUBLIC_ADMIN_PASSWORD || "NJSIFAdmin2026!";
const SESSION_KEY = "njsif-admin-session";

export default function AdminLogin() {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");

  useEffect(() => {
    if (typeof window !== "undefined" && localStorage.getItem(SESSION_KEY) === "active") {
      router.replace("/admin");
    }
  }, [router]);

  const handleSubmit = (e) => {
    e.preventDefault();
    setError("");

    if (email === ADMIN_EMAIL && password === ADMIN_PASSWORD) {
      localStorage.setItem(SESSION_KEY, "active");
      router.push("/admin");
      return;
    }

    setError("Invalid admin credentials.");
  };

  return (
    <main className="min-h-screen bg-slate-950 px-6 py-16 text-slate-100">
      <div className="mx-auto max-w-md rounded-[2rem] border border-white/10 bg-slate-900/90 p-8 shadow-2xl shadow-slate-950/30">
        <div className="mb-8 space-y-3 text-center">
          <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Admin access</p>
          <h1 className="text-3xl font-semibold text-white">Scholarship dashboard login</h1>
          <p className="text-sm text-slate-400">
            Sign in to review applications, update statuses, and monitor insights.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          <label className="block text-sm font-medium text-slate-100">
            Email
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              placeholder="admin@njsif.org"
            />
          </label>

          <label className="block text-sm font-medium text-slate-100">
            Password
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="mt-2 w-full rounded-3xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
              placeholder="Enter password"
            />
          </label>

          {error && (
            <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
              {error}
            </div>
          )}

          <button
            type="submit"
            className="inline-flex w-full items-center justify-center rounded-3xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400"
          >
            Log in
          </button>
        </form>

        <div className="mt-6 text-center text-sm text-slate-400">
          <Link href="/" className="text-sky-300 transition hover:text-sky-200">
            Return to website
          </Link>
        </div>
      </div>
    </main>
  );
}
