const fs = require('fs');
const path = require('path');
const root = path.join(__dirname, '..');

const files = {
  'pages/index.js': `import Link from "next/link";
import Navbar from "../components/Navbar";

const features = [
  {
    title: "Merit-based support",
    description: "Funding for ambitious students with strong academic and leadership potential.",
  },
  {
    title: "Guidance and mentorship",
    description: "Access to resources, workshops, and a supportive scholarship community.",
  },
  {
    title: "Simple application process",
    description: "Quick online submission and transparent review updates.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-950 text-slate-100">
        <section className="mx-auto max-w-6xl px-6 py-16 lg:flex lg:items-center lg:justify-between">
          <div className="max-w-2xl">
            <span className="inline-flex rounded-full bg-sky-500/20 px-4 py-1 text-sm font-semibold text-sky-200">
              Scholarship fund for driven students
            </span>
            <h1 className="mt-8 text-4xl font-bold tracking-tight text-white sm:text-5xl">
              NDI NKEMNJINJU SCHOLARSHIP FUND
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-slate-300">
              Empowering the next generation of leaders by supporting education, growth,
              and community impact across the region.
            </p>
            <div className="mt-10 flex flex-col gap-4 sm:flex-row">
              <a
                href="/apply"
                className="inline-flex items-center justify-center rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 shadow-lg shadow-sky-500/20 transition hover:bg-sky-400"
              >
                Apply now
              </a>
              <a
                href="/about"
                className="inline-flex items-center justify-center rounded-full border border-slate-700 px-6 py-3 text-sm font-semibold text-slate-100 transition hover:border-slate-500 hover:text-white"
              >
                Learn more
              </a>
            </div>
          </div>
          <div className="mt-14 grid gap-6 sm:mt-0 sm:w-full sm:max-w-md lg:max-w-lg">
            <div className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-xl shadow-slate-950/20">
              <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Impact</p>
              <h2 className="mt-4 text-3xl font-bold text-white">Support that changes lives</h2>
              <p className="mt-4 text-slate-300">
                Our scholarship fund helps students focus on their education while building the skills they need to succeed.
              </p>
            </div>
            <div className="rounded-3xl bg-slate-800/90 p-8 shadow-xl shadow-slate-950/20">
              <h3 className="text-xl font-semibold text-white">Who qualifies?</h3>
              <p className="mt-3 text-slate-300">
                High-achieving secondary and university applicants with financial need, strong leadership, and a vision for community impact.
              </p>
            </div>
          </div>
        </section>

        <section className="border-t border-slate-800 py-16 px-6">
          <div className="mx-auto max-w-6xl">
            <h2 className="text-3xl font-bold text-white">What we offer</h2>
            <div className="mt-10 grid gap-6 md:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="rounded-3xl border border-white/10 bg-slate-900/80 p-8 shadow-lg shadow-slate-950/10">
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-4 text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="bg-slate-900/90 py-16 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-10 lg:grid-cols-3">
              <div className="rounded-3xl bg-white/5 p-8">
                <p className="text-sm uppercase tracking-[0.24em] text-sky-300">How it works</p>
                <h2 className="mt-4 text-2xl font-bold text-white">A simple three-step process</h2>
              </div>
              <div className="space-y-6 rounded-3xl border border-white/10 bg-slate-950/80 p-8">
                <div>
                  <h3 className="font-semibold text-white">1. Submit your application</h3>
                  <p className="mt-2 text-slate-300">Fill out the online form and tell us about your goals.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">2. Review and selection</h3>
                  <p className="mt-2 text-slate-300">Our team evaluates applications based on merit, need, and impact.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">3. Receive support</h3>
                  <p className="mt-2 text-slate-300">Selected students receive scholarship support and ongoing mentorship.</p>
                </div>
              </div>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
`,
  'pages/apply.js': `import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";

const initialForm = {
  name: "",
  email: "",
  education: "High School",
  program: "Undergraduate",
  goals: "",
};

export default function Apply() {
  const [form, setForm] = useState(initialForm);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");

  const validateEmail = (value) => /^[^\\s@]+@[^\\s@]+\\.[^\\s@]+$/.test(value);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.goals) {
      setError("Please complete all required fields.");
      return;
    }

    if (!validateEmail(form.email)) {
      setError("Enter a valid email address.");
      return;
    }

    setStatus("loading");

    try {
      const response = await axios.post("/api/applications", form);

      if (response?.data?.success) {
        setStatus("success");
        setForm(initialForm);
      } else {
        throw new Error(response?.data?.error || "Submission failed.");
      }
    } catch (err) {
      setStatus("error");
      setError(err?.response?.data?.error || err.message || "Unable to submit application.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-slate-950 text-slate-100">
        <section className="mx-auto max-w-4xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/20">
            <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
              <div>
                <p className="text-sm uppercase tracking-[0.24em] text-sky-300">Application</p>
                <h1 className="mt-4 text-4xl font-bold text-white">Apply for scholarship support</h1>
                <p className="mt-4 max-w-2xl text-slate-300">
                  Complete the form below and share your academic background and ambitions.
                </p>
              </div>
            </div>

            <form onSubmit={handleSubmit} className="space-y-6">
              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-100">
                  Full name
                  <input
                    type="text"
                    value={form.name}
                    onChange={(e) => setForm({ ...form, name: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                    placeholder="Your full name"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-100">
                  Email address
                  <input
                    type="email"
                    value={form.email}
                    onChange={(e) => setForm({ ...form, email: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                    placeholder="you@example.com"
                  />
                </label>
              </div>

              <div className="grid gap-6 sm:grid-cols-2">
                <label className="block text-sm font-medium text-slate-100">
                  Education level
                  <select
                    value={form.education}
                    onChange={(e) => setForm({ ...form, education: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  >
                    <option>High School</option>
                    <option>College / University</option>
                    <option>Graduate</option>
                    <option>Other</option>
                  </select>
                </label>

                <label className="block text-sm font-medium text-slate-100">
                  Program of interest
                  <select
                    value={form.program}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                    className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  >
                    <option>Undergraduate</option>
                    <option>Postgraduate</option>
                    <option>Technical training</option>
                    <option>Continuing education</option>
                  </select>
                </label>
              </div>

              <label className="block text-sm font-medium text-slate-100">
                Why should you receive this scholarship?
                <textarea
                  value={form.goals}
                  onChange={(e) => setForm({ ...form, goals: e.target.value })}
                  rows={5}
                  className="mt-2 w-full rounded-2xl border border-white/10 bg-slate-950 px-4 py-3 text-slate-100 outline-none transition focus:border-sky-400 focus:ring-2 focus:ring-sky-400/20"
                  placeholder="Tell us about your goals, experience, and financial need."
                />
              </label>

              {error && (
                <div className="rounded-2xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                  {error}
                </div>
              )}

              {status === "success" && (
                <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                  Your application was submitted successfully. We will contact you soon.
                </div>
              )}

              <button
                type="submit"
                disabled={status === "loading"}
                className="inline-flex items-center justify-center rounded-2xl bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400 disabled:cursor-not-allowed disabled:bg-slate-700"
              >
                {status === "loading" ? "Submitting..." : "Submit Application"}
              </button>
            </form>
          </div>
        </section>
      </main>
    </>
  );
}
`,
  'pages/about.js': `import Link from "next/link";
import Navbar from "../components/Navbar";

export default function About() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-950 text-slate-100">
        <section className="mx-auto max-w-5xl px-6 py-16">
          <div className="rounded-3xl border border-white/10 bg-slate-900/90 p-10 shadow-xl shadow-slate-950/20">
            <p className="text-sm uppercase tracking-[0.24em] text-sky-300">About us</p>
            <h1 className="mt-4 text-4xl font-bold text-white">Our mission</h1>
            <p className="mt-6 text-slate-300 leading-8">
              The NDI NKEMNJINJU Scholarship Fund exists to support talented young people who demonstrate academic excellence,
              leadership potential, and a commitment to community development.
            </p>

            <div className="mt-10 grid gap-8 md:grid-cols-2">
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8">
                <h2 className="text-2xl font-semibold text-white">What we believe in</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  Education is the foundation for individual and community progress. We believe that financial barriers should not
                  prevent motivated students from reaching their potential.
                </p>
              </div>
              <div className="rounded-3xl border border-white/10 bg-slate-950/80 p-8">
                <h2 className="text-2xl font-semibold text-white">Who we support</h2>
                <p className="mt-4 text-slate-300 leading-7">
                  Applicants who demonstrate academic drive, financial need, strong character, and a vision for making a positive impact.
                </p>
              </div>
            </div>

            <div className="mt-10 rounded-3xl border border-white/10 bg-slate-800/90 p-8">
              <h2 className="text-2xl font-semibold text-white">How to apply</h2>
              <ul className="mt-4 space-y-3 text-slate-300">
                <li>1. Visit the Apply page.</li>
                <li>2. Complete the form with your academic details and goals.</li>
                <li>3. Submit your application and wait for our response.</li>
              </ul>
            </div>

            <div className="mt-10 flex justify-start">
              <Link href="/apply" className="rounded-full bg-sky-500 px-6 py-3 text-sm font-semibold text-slate-950 transition hover:bg-sky-400">
                Start your application
              </Link>
            </div>
          </div>
        </section>
      </main>
    </>
  );
}
`,
  'pages/api/applications.js': `export default function handler(req, res) {
  if (req.method !== "POST") {
    res.setHeader("Allow", ["POST"]);
    return res.status(405).json({ error: "Method not allowed" });
  }

  const { name, email, education, program, goals } = req.body || {};

  if (!name || !email || !goals) {
    return res.status(400).json({ error: "Name, email, and goals are required." });
  }

  console.log("Received scholarship application:", { name, email, education, program, goals });

  return res.status(201).json({ success: true, message: "Application received." });
}
`,
  'src/styles/globals.css': `@import "tailwindcss";

:root {
  --background: #020617;
  --foreground: #e2e8f0;
}

@theme inline {
  --color-background: var(--background);
  --color-foreground: var(--foreground);
  --font-sans: ui-sans-serif, system-ui, -apple-system, BlinkMacSystemFont, "Segoe UI", sans-serif;
  --font-mono: ui-monospace, SFMono-Regular, Menlo, Monaco, Consolas, "Liberation Mono", "Courier New", monospace;
}

* {
  box-sizing: border-box;
}

html {
  scroll-behavior: smooth;
}

body {
  margin: 0;
  min-height: 100vh;
  background: radial-gradient(circle at top, #0f172a 0%, #020617 45%, #020617 100%);
  color: var(--foreground);
  font-family: var(--font-sans);
}

button,
input,
select,
textarea {
  font: inherit;
}

::selection {
  background: rgba(56, 189, 248, 0.25);
  color: #ffffff;
}
`,
};

for (const [relativePath, content] of Object.entries(files)) {
  const targetPath = path.join(root, relativePath);
  const dir = path.dirname(targetPath);
  if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir, { recursive: true });
  }
  fs.writeFileSync(targetPath, content, "utf8");
}
console.log("rewritePages completed");
