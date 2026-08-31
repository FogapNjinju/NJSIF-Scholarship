import axios from "axios";
import { useEffect, useState } from "react";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const initialForm = {
  name: "",
  location: "",
  program: "",
  quote: "",
  outcome: "",
};

export default function TestimonialsPage() {
  const [form, setForm] = useState(initialForm);
  const [testimonials, setTestimonials] = useState([]);
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [loadingList, setLoadingList] = useState(true);

  const loadTestimonials = async () => {
    try {
      setLoadingList(true);
      const response = await axios.get("/api/testimonials");
      setTestimonials(response.data || []);
      setError("");
    } catch (err) {
      setError(err?.response?.data?.error || err.message || "Unable to load testimonials.");
    } finally {
      setLoadingList(false);
    }
  };

  useEffect(() => {
    loadTestimonials();
  }, []);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setStatus("loading");
    setError("");

    try {
      await axios.post("/api/testimonials", form);
      setForm(initialForm);
      setStatus("success");
      loadTestimonials();
    } catch (err) {
      setStatus("error");
      setError(err?.response?.data?.error || err.message || "Unable to submit testimonial.");
    }
  };

  return (
    <>
      <Navbar />
      <main className="bg-slate-950 text-slate-100">
        <section className="mx-auto max-w-7xl px-6 py-20 lg:px-8">
          <div className="surface-card-strong mb-10">
            <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Testimonials</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Stories from applicants and scholars</h1>
            <p className="mt-3 max-w-3xl text-slate-300 leading-8">
              Hear how the scholarship has supported growth, education, and opportunity and share your own experience.
            </p>
          </div>

          <div className="grid gap-8 lg:grid-cols-[0.95fr_1.05fr]">
            <div className="surface-card-strong">
              <h2 className="text-2xl font-semibold text-white">Share your experience</h2>
              <p className="mt-2 text-sm text-slate-400">
                Tell others how this opportunity has helped your education, confidence, or career path.
              </p>

              <form onSubmit={handleSubmit} className="mt-6 space-y-5">
                <div className="grid gap-5 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-100">
                    Full name
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="field-control"
                      placeholder="Your name"
                      required
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-100">
                    Location
                    <input
                      type="text"
                      value={form.location}
                      onChange={(e) => setForm({ ...form, location: e.target.value })}
                      className="field-control"
                      placeholder="City / Region"
                    />
                  </label>
                </div>

                <label className="block text-sm font-medium text-slate-100">
                  Program or level
                  <input
                    type="text"
                    value={form.program}
                    onChange={(e) => setForm({ ...form, program: e.target.value })}
                    className="field-control"
                    placeholder="Undergraduate / Secondary / Graduate"
                  />
                </label>

                <label className="block text-sm font-medium text-slate-100">
                  Your testimonial
                  <textarea
                    value={form.quote}
                    onChange={(e) => setForm({ ...form, quote: e.target.value })}
                    rows={5}
                    className="field-control"
                    placeholder="Describe how this scholarship has helped you."
                    required
                  />
                </label>

                <label className="block text-sm font-medium text-slate-100">
                  Outcome or achievement
                  <input
                    type="text"
                    value={form.outcome}
                    onChange={(e) => setForm({ ...form, outcome: e.target.value })}
                    className="field-control"
                    placeholder="Example: improved grades, confidence, university access"
                  />
                </label>

                {error && (
                  <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {status === "success" && (
                  <div className="animate-fade-in rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100 shadow-lg shadow-emerald-500/10">
                    ✅ Thank you — your testimonial has been shared.
                  </div>
                )}

                <button
                  type="submit"
                  disabled={status === "loading"}
                  className="btn-primary w-full gap-2"
                >
                  {status === "loading" ? (
                    <>
                      <span className="animate-spin-slow inline-block h-4 w-4 rounded-full border-2 border-slate-950 border-t-transparent" />
                      Submitting...
                    </>
                  ) : (
                    "Submit testimonial"
                  )}
                </button>
              </form>
            </div>

            <div className="surface-card-strong">
              <h2 className="text-2xl font-semibold text-white">Applicant voices</h2>
              <p className="mt-2 text-sm text-slate-400">
                A growing collection of stories from applicants and beneficiaries.
              </p>

              <div className="mt-6 grid gap-4">
                {loadingList ? (
                  [1, 2, 3].map((item) => (
                    <div key={item} className="surface-panel shimmer">
                      <div className="h-4 w-full rounded-lg bg-slate-800" />
                      <div className="mt-3 h-4 w-5/6 rounded-lg bg-slate-800" />
                      <div className="mt-4 h-3 w-32 rounded-lg bg-slate-800" />
                    </div>
                  ))
                ) : testimonials.length > 0 ? (
                  testimonials.map((item) => (
                    <article key={item._id} className="surface-panel">
                      <p className="text-base leading-8 text-slate-200">“{item.quote}”</p>
                      <div className="mt-4 flex flex-wrap items-center gap-2 text-sm text-slate-400">
                        <span className="font-semibold text-white">{item.name}</span>
                        {item.location && <span>• {item.location}</span>}
                        {item.program && <span>• {item.program}</span>}
                      </div>
                      {item.outcome && (
                        <div className="eyebrow !mt-3 !normal-case !tracking-normal">
                          {item.outcome}
                        </div>
                      )}
                    </article>
                  ))
                ) : (
                  <div className="rounded-3xl border border-white/10 bg-slate-950/70 p-6 text-sm text-slate-300">
                    No testimonials yet. Be the first to share your story.
                  </div>
                )}
              </div>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
