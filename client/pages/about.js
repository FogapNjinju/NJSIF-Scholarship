import Link from "next/link";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const values = [
  {
    icon: "👑",
    title: "Leadership",
    description: "We support students who can lead positive change in their communities.",
  },
  {
    icon: "🚀",
    title: "Opportunity",
    description: "We create access to education for ambitious learners with drive and determination.",
  },
  {
    icon: "🤝",
    title: "Support",
    description: "We connect scholars with funding, mentorship, and a network of peers.",
  },
];

const commitments = [
  "Fair and thoughtful application review",
  "Respect for both academic merit and financial reality",
  "Mentorship that continues beyond selection",
  "A strong focus on community-minded leadership",
];

const processSteps = [
  {
    title: "Identify promise",
    description: "We look for students with discipline, potential, and a clear desire to grow through education.",
  },
  {
    title: "Review with care",
    description: "Applications are assessed on merit, need, motivation, and the likely long-term impact of support.",
  },
  {
    title: "Support and follow through",
    description: "Selected scholars receive more than recognition they gain encouragement, accountability, and opportunity.",
  },
];

export default function About() {
  return (
    <>
      <Navbar />
      <main className="bg-slate-950 text-slate-100">
        <section className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-sky-500/10 to-transparent" />
          <div className="surface-card-strong relative">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">About us</p>
                <h1 className="text-5xl font-semibold tracking-tight text-white">Our mission is to unlock potential through scholarship support.</h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  The NDI NKEMNJINJU Scholarship Fund helps talented students access education, develop leadership, and build stronger communities.
                </p>
              </div>

              <div className="surface-panel space-y-5">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Who we support</h2>
                  <p className="mt-3 text-slate-300 leading-7">
                    Applicants showing academic excellence, financial need, and a commitment to uplifting others.
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">What we offer</h2>
                  <p className="mt-3 text-slate-300 leading-7">
                    A combination of scholarship funding, personalized mentorship, and real opportunity to grow.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
              <div className="surface-panel">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Our story</p>
                <p className="mt-4 leading-7 text-slate-300">
                      The NKEMNJINJU SCHOLARSHIP (NJINJUS), established in 2019, is a registered 
    United Kingdom Charity (No. 09876437).  The scholarship was established in 
    memory of PA NKEMNJINJU PETER FOGAP, one of the sons of HRH Tongwa 
    Fogap of the Ndunguated Fondom. Late Pa. NkemNjinju was a passionate 
    educationalist who found strong relevance in education. He sponsored many 
    children both from and outside the Fogap’s Family. He provided food and shelter 
    even to non-Cameroonians once he identified an innate zeal and desire for 
    education in the individual. This scholarship was established to continue the love 
    and dedication that PaNkemnjinju Peter Fogap placed on the importance of 
    education. 
                </p>
                <p className="mt-4 leading-7 text-slate-300">
                  The fund exists to help committed learners move forward with dignity, structure, and encouragement while preparing to give back through leadership and service.
                </p>
              </div>

              <div className="surface-panel">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Our commitments</p>
                <ul className="mt-4 space-y-3 text-slate-300">
                  {commitments.map((item) => (
                    <li key={item}>• {item}</li>
                  ))}
                </ul>
              </div>
            </div>

            <div className="mt-12 overflow-hidden rounded-4xl border border-white/10 bg-slate-900/70 shadow-xl shadow-slate-950/20">
              <img
                src="/images/community-support.svg"
                alt="Community and student support illustration"
                className="h-full w-full object-cover"
              />
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {values.map((value) => (
                <div key={value.title} className="surface-panel transition hover:-translate-y-1 hover:border-sky-500/20">
                  <div className="mb-4 inline-flex h-12 w-12 items-center justify-center rounded-2xl bg-sky-500/10 text-2xl">
                    {value.icon}
                  </div>
                  <h3 className="text-xl font-semibold text-white">{value.title}</h3>
                  <p className="mt-4 text-slate-300">{value.description}</p>
                </div>
              ))}
            </div>

            <div className="mt-12 grid gap-6 lg:grid-cols-3">
              {processSteps.map((step) => (
                <div key={step.title} className="surface-panel">
                  <p className="text-sm uppercase tracking-[0.28em] text-sky-300">{step.title}</p>
                  <p className="mt-3 leading-7 text-slate-300">{step.description}</p>
                </div>
              ))}
            </div>

            <div className="surface-panel mt-12">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">How to apply</p>
                  <p className="mt-3 max-w-2xl text-slate-300 leading-7">
                    Complete our application and share your goals. We review each submission and notify candidates with the next steps.
                  </p>
                </div>
                <Link
                  href="/apply"
                  className="btn-primary !px-6"
                >
                  Start your application
                </Link>
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
