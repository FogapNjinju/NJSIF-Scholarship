import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const features = [
  {
    icon: "💸",
    title: "Merit-based support",
    description: "Funding for ambitious students with academic excellence and leadership potential.",
  },
  {
    icon: "🤝",
    title: "Mentorship and community",
    description: "Guidance from advisors and connection to a strong scholarship network.",
  },
  {
    icon: "🌟",
    title: "Fast online process",
    description: "Submit your application in minutes with clear next-step updates.",
  },
]




;

const faqs = [
  {
    question: "Who can apply for the scholarship?",
    answer: "Students with academic promise, financial need, and a strong desire to create positive impact in their communities.",
  },
  {
    question: "What documents should I prepare?",
    answer: "Applicants may submit GCE results, transcripts, attestation documents, and a passport or ID card where available.",
  },
  {
    question: "How long does the review process take?",
    answer: "Applications are reviewed as they come in, and shortlisted candidates are contacted with the next steps as quickly as possible.",
  },
];

const supportAreas = [
  {
    title: "Tuition and study support",
    description: "Practical financial help that reduces pressure and allows students to stay focused on learning.",
  },
  {
    title: "Mentorship and accountability",
    description: "Guidance from experienced voices who encourage discipline, confidence, and long-term planning.",
  },
  {
    title: "Leadership and service mindset",
    description: "A strong emphasis on using education to uplift families, schools, and wider communities.",
  },
];

const impactHighlights = [
  { value: "150+", label: "Applications supported" },
  { value: "30 June", label: "2026 application deadline" },
  { value: "Secondary to graduate", label: "Learners we support" },
];

const communityQuotes = [
  {
    name: "Future scholars",
    quote: "We want every promising student to feel that financial limitations do not have to define the size of their ambition.",
  },
  {
    name: "Families and mentors",
    quote: "The fund is designed to do more than pay fees it aims to strengthen confidence, support systems, and long-term opportunity.",
  },
  {
    name: "Communities",
    quote: "When one student is empowered, the benefits often ripple outward into classrooms, homes, and entire neighborhoods.",
  },
];

export default function Home() {
  return (
    <>
      <Navbar />
      <main className="relative overflow-hidden bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <section className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[1.2fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <span className="eyebrow">
                Scholarship fund for driven students
              </span>
              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  Invest in education, uplift talent, and empower future leaders.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  NDI NKEMNJINJU Scholarship Fund supports students who combine academic excellence with community impact. Apply now to access funding, mentorship, and confidence to achieve your ambitions.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/apply" className="btn-primary !px-6">
                  Apply now
                </Link>
                <Link href="/about" className="btn-secondary !px-6">
                  Learn more
                </Link>
              </div>
            </div>
            <div className="grid gap-6">
              <div className="surface-card overflow-hidden p-0">
                <img
                  src="/images/scholarship-hero.png"
                  alt="Scholarship-themed illustration showing education support and student growth"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="surface-panel">
                  <p className="text-sm text-slate-400">Applicants reached</p>
                  <p className="mt-2 text-3xl font-bold text-white">150+</p>
                </div>
                <div className="surface-panel">
                  <p className="text-sm text-slate-400">Mentorship support</p>
                  <p className="mt-2 text-3xl font-bold text-white">1:1</p>
                </div>
              </div>
              <div className="surface-card">
                <h3 className="text-xl font-semibold text-white">Who qualifies?</h3>
                <p className="mt-3 text-slate-300">
                  Students who demonstrate strong academic performance, financial need, and a clear vision for positive change.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 xl:grid-cols-3">
              {features.map((feature) => (
                <div
                  key={feature.title}
                  className="surface-panel transition hover:-translate-y-1 hover:border-sky-500/20"
                >
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-2xl">
                    {feature.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-4 text-slate-300">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-3xl">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">What scholars gain</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Support that goes beyond a single award</h2>
              <p className="mt-3 text-slate-300 leading-7">
                The fund is built to help students remain steady, motivated, and future-focused throughout their educational journey.
              </p>
            </div>

            <div className="grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="grid gap-4">
                {supportAreas.map((item) => (
                  <div key={item.title} className="surface-panel">
                    <h3 className="text-lg font-semibold text-white">{item.title}</h3>
                    <p className="mt-2 leading-7 text-slate-300">{item.description}</p>
                  </div>
                ))}
              </div>

              <div className="surface-card-strong">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Impact at a glance</p>
                <div className="mt-6 grid gap-4">
                  {impactHighlights.map((item) => (
                    <div key={item.label} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4">
                      <p className="text-2xl font-semibold text-white">{item.value}</p>
                      <p className="mt-1 text-sm text-slate-400">{item.label}</p>
                    </div>
                  ))}
                </div>
                <p className="mt-6 text-sm leading-7 text-slate-300">
                  Every application is reviewed with care, with close attention to potential, need, character, and long-term impact.
                </p>
              </div>
            </div>
          </div>
        </section>

        <section className="px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Our community</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Scholarship stories, support, and student growth</h2>
            </div>
            <div className="grid gap-6 md:grid-cols-2">
              <div className="surface-card overflow-hidden p-0">
                <img
                  src="/images/community-support.png"
                  alt="Community support illustration representing students and mentorship"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="surface-card overflow-hidden p-0">
                <img
                  src="/images/student-growth.png"
                  alt="Student growth illustration showing academic progress and opportunity"
                  className="h-full w-full object-cover"
                />
              </div>
            </div>
          </div>
        </section>

        <section className="bg-slate-900/90 py-20 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 lg:grid-cols-3">
              <div className="surface-card bg-white/5 text-slate-100">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">How it works</p>
                <h2 className="mt-4 text-3xl font-bold text-white">A simple three-step process</h2>
              </div>
              <div className="surface-panel space-y-6">
                <div>
                  <h3 className="font-semibold text-white">1. Submit your application</h3>
                  <p className="mt-2 text-slate-300">Tell us about your achievements, goals, and why you need support.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">2. Review and selection</h3>
                  <p className="mt-2 text-slate-300">Our committee evaluates every application carefully and fairly.</p>
                </div>
                <div>
                  <h3 className="font-semibold text-white">3. Receive support</h3>
                  <p className="mt-2 text-slate-300">Successful applicants receive funding and ongoing mentorship.</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-y border-white/10 bg-slate-950/70 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-3xl">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Why this matters</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">A scholarship can change more than one student’s path</h2>
              <p className="mt-3 text-slate-300 leading-7">
                We believe educational support should strengthen confidence, create access, and open the door to meaningful service and leadership.
              </p>
            </div>

            <div className="grid gap-6 md:grid-cols-3">
              {communityQuotes.map((item) => (
                <article key={item.name} className="surface-panel">
                  <p className="text-base leading-8 text-slate-200">“{item.quote}”</p>
                  <p className="mt-4 text-sm font-semibold text-white">{item.name}</p>
                </article>
              ))}
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 px-6 py-20">
          <div className="mx-auto max-w-6xl">
            <div className="mb-8 max-w-2xl">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">FAQ</p>
              <h2 className="mt-3 text-3xl font-semibold text-white">Frequently asked questions</h2>
              <p className="mt-3 text-slate-300">
                Everything applicants often want to know before submitting their scholarship application.
              </p>
            </div>

            <div className="grid gap-4">
              {faqs.map((item) => (
                <div key={item.question} className="surface-panel">
                  <h3 className="text-lg font-semibold text-white">{item.question}</h3>
                  <p className="mt-3 text-slate-300 leading-7">{item.answer}</p>
                </div>
              ))}
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}