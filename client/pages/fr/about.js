import Link from "next/link";
import NavbarFr from "../../components/NavbarFr";
import Footer from "../../components/Footer";

const values = [
  {
    title: "Leadership",
    description: "Nous soutenons les étudiants capables d’inspirer un changement positif autour d’eux.",
  },
  {
    title: "Accès à l’opportunité",
    description: "Nous aidons les apprenants déterminés à franchir les barrières financières et éducatives.",
  },
  {
    title: "Accompagnement durable",
    description: "Le soutien inclut mentorat, orientation et encouragement tout au long du parcours.",
  },
];

export default function AboutFr() {
  return (
    <>
      <NavbarFr />
      <main className="bg-slate-950 text-slate-100">
        <section className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="absolute inset-x-0 top-0 h-48 bg-gradient-to-b from-sky-500/10 to-transparent" />
          <div className="surface-card-strong relative">
            <div className="grid gap-10 lg:grid-cols-[1.1fr_0.9fr] lg:items-start">
              <div className="space-y-6">
                <p className="text-sm uppercase tracking-[0.3em] text-sky-300">À propos</p>
                <h1 className="text-5xl font-semibold tracking-tight text-white">
                  Notre mission est d’ouvrir des chemins d’avenir grâce au soutien éducatif.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  Le Fonds NDI NKEMNJINJU aide des étudiants prometteurs à accéder à l’éducation, à développer leur leadership et à renforcer leurs communautés.
                </p>
              </div>

              <div className="surface-panel space-y-5">
                <div>
                  <h2 className="text-2xl font-semibold text-white">Qui nous soutenons</h2>
                  <p className="mt-3 text-slate-300 leading-7">
                    Des candidats qui montrent sérieux, mérite, besoin réel et désir d’avoir un impact positif.
                  </p>
                </div>
                <div>
                  <h2 className="text-2xl font-semibold text-white">Ce que nous offrons</h2>
                  <p className="mt-3 text-slate-300 leading-7">
                    Un mélange de financement, de mentorat et d’encouragement concret pour avancer avec confiance.
                  </p>
                </div>
              </div>
            </div>

            <div className="mt-12 grid gap-6 md:grid-cols-3">
              {values.map((value) => (
                <div key={value.title} className="surface-panel transition hover:-translate-y-1 hover:border-sky-500/20">
                  <h3 className="text-xl font-semibold text-white">{value.title}</h3>
                  <p className="mt-4 text-slate-300">{value.description}</p>
                </div>
              ))}
            </div>

            <div className="surface-panel mt-12">
              <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                <div>
                  <p className="text-sm uppercase tracking-[0.3em] text-slate-400">Comment postuler</p>
                  <p className="mt-3 max-w-2xl text-slate-300 leading-7">
                    Remplissez votre dossier, partagez vos objectifs, puis notre équipe examinera votre candidature avec attention.
                  </p>
                </div>
                <Link href="/fr/apply" className="btn-primary !px-6">
                  Commencer la demande
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
