import { useState } from "react";
import axios from "axios";
import Navbar from "../components/Navbar";
import Footer from "../components/Footer";

const initialForm = {
  name: "",
  email: "",
  education: "High School",
  program: "Undergraduate",
  goals: "",
};

const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000";
const APPLICATION_DEADLINE = new Date("2026-06-30T23:59:59");
const SUPPORT_EMAIL = "info@njsif.org";
const steps = [
  "Personal info",
  "Education details",
  "Goals and motivation",
  "Supporting documents",
  "Review and submit",
];

const eligibilityItems = [
  "Strong academic promise and consistent effort",
  "Demonstrated financial need or limited access to support",
  "Clear educational goals and a desire to grow",
  "Commitment to positive impact in school, family, or community",
];

const afterApplySteps = [
  "Your application is reviewed carefully by the scholarship team.",
  "Shortlisted candidates may be contacted for clarification or next steps.",
  "Final decisions are communicated by email after review is completed.",
];

export default function Apply() {
  const [form, setForm] = useState(initialForm);
  const [documents, setDocuments] = useState({
    gceOLevel: null,
    gceALevel: null,
    transcript: null,
    attestation: null,
    idCard: null,
  });
  const [status, setStatus] = useState("idle");
  const [error, setError] = useState("");
  const [step, setStep] = useState(0);

  const timeLeft = APPLICATION_DEADLINE.getTime() - Date.now();
  const daysLeft = Math.max(0, Math.ceil(timeLeft / (1000 * 60 * 60 * 24)));

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleDocumentChange = (key, file) => {
    setDocuments((prev) => ({ ...prev, [key]: file }));
  };

  const nextStep = () => {
    setError("");

    if (step === 0 && (!form.name || !form.email || !validateEmail(form.email))) {
      setError("Please enter a valid name and email before continuing.");
      return;
    }

    if (step === 2 && !form.goals) {
      setError("Please share your goals and motivation before continuing.");
      return;
    }

    setStep((current) => Math.min(current + 1, steps.length - 1));
  };

  const prevStep = () => {
    setError("");
    setStep((current) => Math.max(current - 1, 0));
  };

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
      const formData = new FormData();
      formData.append("name", form.name);
      formData.append("email", form.email);
      formData.append("education", form.education);
      formData.append("program", form.program);
      formData.append("goals", form.goals);

      if (documents.gceOLevel) formData.append("gceOLevel", documents.gceOLevel);
      if (documents.gceALevel) formData.append("gceALevel", documents.gceALevel);
      if (documents.transcript) formData.append("transcript", documents.transcript);
      if (documents.attestation) formData.append("attestation", documents.attestation);
      if (documents.idCard) formData.append("idCard", documents.idCard);

      const response = await axios.post(`${API_URL}/api/applications`, formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      if (response?.status === 200 && response?.data?._id) {
        setStatus("success");
        setForm(initialForm);
        setDocuments({
          gceOLevel: null,
          gceALevel: null,
          transcript: null,
          attestation: null,
          idCard: null,
        });
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
        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="surface-card">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Apply now</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Scholarship application</h1>
              <p className="mt-4 text-slate-300 leading-8">
                Tell us about your background, education, and goals. Our team will review your application and share next steps quickly.
              </p>

              <div className="surface-panel mt-10 space-y-6">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Application deadline</p>
                  <p className="mt-2 text-2xl font-semibold text-white">30 June 2026</p>
                  <p className="mt-2 text-sm text-slate-300">About <span className="font-semibold text-white">{daysLeft} days left</span> to submit your application.</p>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Eligibility criteria</p>
                  <ul className="mt-4 space-y-3 text-slate-300">
                    {eligibilityItems.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">What you get</p>
                  <ul className="mt-4 space-y-3 text-slate-300">
                    <li>• Financial support for your studies.</li>
                    <li>• Mentorship, coaching, and networking.</li>
                    <li>• A supportive scholarship community.</li>
                  </ul>
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">Need help before applying?</p>
                  <p className="mt-2">Email us at <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-sky-200 underline underline-offset-4">{SUPPORT_EMAIL}</a> for guidance on eligibility or required documents.</p>
                </div>
              </div>
            </div>

            <div className="surface-card-strong">
              <div className="sticky top-20 z-20 -mx-2 mb-6 rounded-3xl border border-white/10 bg-slate-950/95 px-3 py-3 shadow-lg shadow-slate-950/20 backdrop-blur md:static md:mx-0 md:mb-8 md:border-0 md:bg-transparent md:px-0 md:py-0 md:shadow-none">
                <div className="mb-3 flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-slate-300 sm:text-xs">
                  <span>Application progress</span>
                  <span>Step {step + 1} of {steps.length}</span>
                </div>
                <div className="grid grid-cols-2 gap-2 sm:grid-cols-5">
                  {steps.map((label, index) => (
                    <div
                      key={label}
                      className={`min-h-12 rounded-2xl border px-3 py-3 text-center text-[11px] font-semibold leading-tight sm:text-xs ${
                        index === step
                          ? "border-sky-500/40 bg-sky-500/10 text-sky-200"
                          : index < step
                            ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                            : "border-white/10 bg-slate-950/60 text-slate-400"
                      }`}
                    >
                      {label}
                    </div>
                  ))}
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                {step === 0 && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-100">
                      <span>Full name</span>
                      <span className="mt-1 block text-xs font-normal text-slate-300">Enter your official name as it appears on your school documents.</span>
                      <input
                        type="text"
                        value={form.name}
                        onChange={(e) => setForm({ ...form, name: e.target.value })}
                        className="field-control"
                        placeholder="Your full name"
                      />
                    </label>

                    <label className="block text-sm font-medium text-slate-100">
                      <span>Email address</span>
                      <span className="mt-1 block text-xs font-normal text-slate-300">Use an email you check regularly for scholarship updates.</span>
                      <input
                        type="email"
                        value={form.email}
                        onChange={(e) => setForm({ ...form, email: e.target.value })}
                        className="field-control"
                        placeholder="you@example.com"
                      />
                    </label>
                  </div>
                )}

                {step === 1 && (
                  <div className="grid gap-6 sm:grid-cols-2">
                    <label className="block text-sm font-medium text-slate-100">
                      Education level
                      <select
                        value={form.education}
                        onChange={(e) => setForm({ ...form, education: e.target.value })}
                        className="field-control"
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
                        className="field-control"
                      >
                        <option>Undergraduate</option>
                        <option>Postgraduate</option>
                        <option>Technical training</option>
                        <option>Continuing education</option>
                      </select>
                    </label>
                  </div>
                )}

                {step === 2 && (
                  <label className="block text-sm font-medium text-slate-100">
                    <span>Why should you receive this scholarship?</span>
                    <span className="mt-1 block text-xs font-normal text-slate-300">Share your motivation, future goals, and how this support would help you continue your studies.</span>
                    <textarea
                      value={form.goals}
                      onChange={(e) => setForm({ ...form, goals: e.target.value })}
                      rows={8}
                      className="field-control"
                      placeholder="Tell us about your goals, experience, leadership, and financial need."
                    />
                  </label>
                )}

                {step === 3 && (
                  <div className="surface-panel">
                    <p className="text-sm font-semibold text-white">Supporting documents</p>
                    <p className="mt-2 text-sm text-slate-300">
                      Upload any available supporting files: GCE O/L, GCE A/L, university transcript, attestation, and passport or ID card.
                    </p>
                    <p className="mt-2 text-xs text-slate-300">
                      Accepted formats: PDF, JPG, JPEG, PNG. Each file helps reviewers better understand your academic record.
                    </p>

                    <div className="mt-6 space-y-4">
                      {[
                        { key: "gceOLevel", label: "GCE Ordinary Level" },
                        { key: "gceALevel", label: "GCE Advanced Level" },
                        { key: "transcript", label: "University transcript" },
                        { key: "attestation", label: "Attestation letter" },
                        { key: "idCard", label: "Passport or ID card" },
                      ].map((field) => {
                        const selectedFile = documents[field.key];

                        return (
                          <label key={field.key} className="block text-sm font-medium text-slate-100" aria-live="polite">
                            <div className="flex flex-wrap items-center justify-between gap-2">
                              <span>{field.label}</span>
                              <span
                                className={`rounded-full border px-3 py-1 text-[11px] font-semibold ${
                                  selectedFile
                                    ? "border-emerald-500/30 bg-emerald-500/10 text-emerald-200"
                                    : "border-white/10 bg-slate-900 text-slate-400"
                                }`}
                              >
                                {selectedFile ? "Ready ✓" : "Optional"}
                              </span>
                            </div>
                            <input
                              type="file"
                              accept=".pdf,.jpg,.jpeg,.png"
                              onChange={(e) => handleDocumentChange(field.key, e.target.files?.[0] || null)}
                              className="field-control block file:mr-4 file:rounded-full file:border-0 file:bg-sky-500/10 file:px-3 file:py-1.5 file:font-medium file:text-sky-200"
                            />
                            {selectedFile ? (
                              <div className="mt-2 rounded-2xl border border-emerald-500/20 bg-emerald-500/10 px-3 py-2 text-xs text-emerald-100">
                                ✓ Attached successfully: {selectedFile.name}
                              </div>
                            ) : (
                              <p className="mt-2 text-xs text-slate-500">No file selected yet.</p>
                            )}
                          </label>
                        );
                      })}
                    </div>
                  </div>
                )}

                {step === 4 && (
                  <div className="surface-panel text-sm text-slate-300">
                    <h2 className="text-lg font-semibold text-white">Review your application</h2>
                    <div className="mt-4 grid gap-3 sm:grid-cols-2">
                      <div><span className="text-slate-400">Name:</span> {form.name || "—"}</div>
                      <div><span className="text-slate-400">Email:</span> {form.email || "—"}</div>
                      <div><span className="text-slate-400">Education:</span> {form.education || "—"}</div>
                      <div><span className="text-slate-400">Program:</span> {form.program || "—"}</div>
                    </div>
                    <div className="mt-4">
                      <p className="text-slate-400">Goals and motivation:</p>
                      <p className="mt-2 leading-7">{form.goals || "No response yet."}</p>
                    </div>
                    <div className="mt-4">
                      <p className="text-slate-400">Uploaded documents:</p>
                      <ul className="mt-2 space-y-1">
                        {Object.entries(documents).map(([key, file]) => (
                          <li key={key}>{key}: {file?.name || "Not uploaded"}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                )}

                {error && (
                  <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {status === "success" && (
                  <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    Your application and selected documents were submitted successfully. We will contact you soon.
                  </div>
                )}

                <div className="flex flex-col gap-3 sm:flex-row sm:justify-between sm:pt-2">
                  <button
                    type="button"
                    onClick={prevStep}
                    disabled={step === 0}
                    className="btn-secondary !min-h-12 !rounded-full !px-6"
                  >
                    Back
                  </button>

                  {step < steps.length - 1 ? (
                    <button
                      type="button"
                      onClick={nextStep}
                      className="btn-primary !px-6"
                    >
                      Continue
                    </button>
                  ) : (
                    <button
                      type="submit"
                      disabled={status === "loading"}
                      className="btn-primary !px-6"
                    >
                      {status === "loading" ? "Submitting..." : "Submit application"}
                    </button>
                  )}
                </div>
              </form>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}