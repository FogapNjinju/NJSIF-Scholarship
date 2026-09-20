import { useState } from "react";
import axios from "axios";
import NavbarFr from "../../components/NavbarFr";
import Footer from "../../components/Footer";

const initialForm = {
  name: "",
  email: "",
  education: "High School",
  program: "Undergraduate",
  goals: "",
};

const getDefaultApiUrl = () => {
  if (typeof window === "undefined") {
    return "http://localhost:5000";
  }

  const hostname = window.location.hostname;
  return hostname === "localhost" || hostname === "127.0.0.1"
    ? "http://localhost:5000"
    : window.location.origin;
};

const API_URL = (process.env.NEXT_PUBLIC_API_URL || getDefaultApiUrl()).replace(/\/$/, "");
const APPLICATION_URL = `${API_URL}/api/applications`;
const APPLICATION_YEAR = new Date().getFullYear();
const APPLICATION_DEADLINE = new Date(APPLICATION_YEAR, 9, 21, 23, 59, 59);
const SUPPORT_EMAIL = "info@njsif.org";
const APPLICATION_DEADLINE_LABEL = new Intl.DateTimeFormat("fr-FR", {
  day: "numeric",
  month: "long",
  year: "numeric",
}).format(APPLICATION_DEADLINE);

const eligibilityItems = [
  "Bon potentiel académique et engagement sérieux",
  "Besoin financier réel ou accès limité au soutien éducatif",
  "Objectifs d’étude clairs et volonté de progresser",
  "Désir d’avoir un impact positif dans la famille, l’école ou la communauté",
];

const afterApplySteps = [
  "Votre dossier est étudié avec attention par l’équipe de la bourse.",
  "Les candidats présélectionnés peuvent être contactés pour des précisions ou des étapes complémentaires.",
  "Les décisions finales sont communiquées par e-mail à la fin du processus de revue.",
];

export default function ApplyFr() {
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

  const validateEmail = (value) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value);

  const handleDocumentChange = (key, file) => {
    setDocuments((prev) => ({ ...prev, [key]: file }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    if (!form.name || !form.email || !form.goals) {
      setError("Veuillez remplir tous les champs obligatoires.");
      return;
    }

    if (!validateEmail(form.email)) {
      setError("Veuillez entrer une adresse e-mail valide.");
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

      const response = await axios.post(APPLICATION_URL, formData, {
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
        throw new Error(response?.data?.error || "Échec de l’envoi.");
      }
    } catch (err) {
      setStatus("error");
      setError(err?.response?.data?.error || err.message || "Impossible d’envoyer la candidature.");
    }
  };

  return (
    <>
      <NavbarFr />
      <main className="bg-slate-950 text-slate-100">
        <section className="mx-auto max-w-6xl px-6 py-20 lg:px-8">
          <div className="grid gap-12 lg:grid-cols-[1.05fr_0.95fr] lg:items-start">
            <div className="surface-card">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Postuler</p>
              <h1 className="mt-4 text-4xl font-semibold text-white">Demande de bourse</h1>
              <p className="mt-4 text-slate-300 leading-8">
                Parlez-nous de votre parcours, de votre niveau d’étude et de vos objectifs. Nous examinerons votre dossier avec soin.
              </p>

              <div className="surface-panel mt-10 space-y-6">
                <div className="rounded-2xl border border-amber-500/20 bg-amber-500/10 px-4 py-4">
                  <p className="text-sm uppercase tracking-[0.28em] text-amber-200">Date limite</p>
                  <p className="mt-2 text-2xl font-semibold text-white">{APPLICATION_DEADLINE_LABEL}</p>
                  <p className="mt-2 text-sm text-slate-300">La candidature se clôture à cette date pour le cycle actuel.</p>
                </div>

                <div>
                  <p className="text-sm uppercase tracking-[0.28em] text-slate-400">Critères d’éligibilité</p>
                  <ul className="mt-4 space-y-3 text-slate-300">
                    {eligibilityItems.map((item) => (
                      <li key={item}>• {item}</li>
                    ))}
                  </ul>
                </div>

                <div className="rounded-2xl border border-sky-500/20 bg-sky-500/10 px-4 py-4 text-sm text-slate-200">
                  <p className="font-semibold text-white">Besoin d’aide ?</p>
                  <p className="mt-2">Écrivez-nous à <a href={`mailto:${SUPPORT_EMAIL}`} className="font-semibold text-sky-200 underline underline-offset-4">{SUPPORT_EMAIL}</a> pour toute question sur l’éligibilité ou les documents.</p>
                </div>
              </div>
            </div>

            <div className="surface-card-strong">
              <div className="sticky top-20 z-20 -mx-2 mb-6 rounded-3xl border border-white/10 bg-slate-950/95 px-3 py-3 shadow-lg shadow-slate-950/20 backdrop-blur md:hidden">
                <div className="flex items-center justify-between text-[11px] uppercase tracking-[0.28em] text-slate-300">
                  <span>Progression</span>
                  <span>Formulaire</span>
                </div>
              </div>

              <form onSubmit={handleSubmit} className="space-y-6">
                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-100">
                    <span>Nom complet</span>
                    <span className="mt-1 block text-xs font-normal text-slate-300">Indiquez votre nom officiel tel qu’il apparaît sur vos documents scolaires.</span>
                    <input
                      type="text"
                      value={form.name}
                      onChange={(e) => setForm({ ...form, name: e.target.value })}
                      className="field-control"
                      placeholder="Votre nom complet"
                    />
                  </label>

                  <label className="block text-sm font-medium text-slate-100">
                    <span>Adresse e-mail</span>
                    <span className="mt-1 block text-xs font-normal text-slate-300">Utilisez une adresse consultée régulièrement pour les réponses du comité.</span>
                    <input
                      type="email"
                      value={form.email}
                      onChange={(e) => setForm({ ...form, email: e.target.value })}
                      className="field-control"
                      placeholder="vous@exemple.com"
                    />
                  </label>
                </div>

                <div className="grid gap-6 sm:grid-cols-2">
                  <label className="block text-sm font-medium text-slate-100">
                    Niveau d’étude
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
                    Programme visé
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

                <label className="block text-sm font-medium text-slate-100">
                  <span>Pourquoi devriez-vous recevoir cette bourse ?</span>
                  <span className="mt-1 block text-xs font-normal text-slate-300">Expliquez votre motivation, vos objectifs et en quoi ce soutien serait utile à votre parcours.</span>
                  <textarea
                    value={form.goals}
                    onChange={(e) => setForm({ ...form, goals: e.target.value })}
                    rows={6}
                    className="field-control"
                    placeholder="Parlez-nous de vos objectifs, de votre motivation et de votre besoin de soutien."
                  />
                </label>

                <div className="surface-panel">
                  <p className="text-sm font-semibold text-white">Documents justificatifs</p>
                  <p className="mt-2 text-sm text-slate-300">
                    Vous pouvez ajouter vos relevés GCE O/L, GCE A/L, transcript universitaire, attestation et carte d’identité ou passeport.
                  </p>
                  <p className="mt-2 text-xs text-slate-300">
                    Formats acceptés : PDF, JPG, JPEG, PNG. Ces pièces aident le comité à mieux comprendre votre dossier.
                  </p>

                  <div className="mt-6 space-y-4">
                    {[
                      { key: "gceOLevel", label: "GCE Ordinary Level" },
                      { key: "gceALevel", label: "GCE Advanced Level" },
                      { key: "transcript", label: "Transcript universitaire" },
                      { key: "attestation", label: "Lettre d’attestation" },
                      { key: "idCard", label: "Passeport ou carte d’identité" },
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
                              {selectedFile ? "Prêt ✓" : "Optionnel"}
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
                              ✓ Pièce jointe prête : {selectedFile.name}
                            </div>
                          ) : (
                            <p className="mt-2 text-xs text-slate-500">Aucun fichier sélectionné pour le moment.</p>
                          )}
                        </label>
                      );
                    })}
                  </div>
                </div>

                {error && (
                  <div className="rounded-3xl border border-red-500/20 bg-red-500/10 px-4 py-3 text-sm text-red-200">
                    {error}
                  </div>
                )}

                {status === "success" && (
                  <div className="rounded-3xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-100">
                    Votre candidature et vos documents sélectionnés ont bien été envoyés. Nous vous contacterons bientôt.
                  </div>
                )}

                <button type="submit" disabled={status === "loading"} className="btn-primary min-h-12 w-full">
                  {status === "loading" ? "Envoi en cours..." : "Envoyer la candidature"}
                </button>
              </form>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 px-6 py-16">
          <div className="mx-auto max-w-6xl grid gap-6 lg:grid-cols-[1.1fr_0.9fr]">
            <div className="surface-card">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Après votre candidature</p>
              <div className="mt-4 space-y-4 text-slate-300">
                {afterApplySteps.map((item, index) => (
                  <div key={item} className="rounded-2xl border border-white/10 bg-slate-950/60 px-4 py-4">
                    <p className="text-sm font-semibold text-white">Étape {index + 1}</p>
                    <p className="mt-2 leading-7">{item}</p>
                  </div>
                ))}
              </div>
            </div>

            <div className="surface-panel">
              <p className="text-sm uppercase tracking-[0.3em] text-sky-300">Contact utile</p>
              <h2 className="mt-3 text-2xl font-semibold text-white">Une question avant d’envoyer votre dossier ?</h2>
              <p className="mt-3 leading-7 text-slate-300">
                Notre équipe peut vous orienter si vous avez un doute sur votre situation, votre admissibilité ou les pièces à fournir.
              </p>
              <a href={`mailto:${SUPPORT_EMAIL}`} className="btn-primary mt-5 !px-6">
                Écrire à {SUPPORT_EMAIL}
              </a>
            </div>
          </div>
        </section>
      </main>
      <Footer />
    </>
  );
}
