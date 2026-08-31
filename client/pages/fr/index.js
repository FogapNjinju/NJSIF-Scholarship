import Link from "next/link";
import NavbarFr from "../../components/NavbarFr";
import Footer from "../../components/Footer";

const features = [
  {
    title: "Soutien fondé sur le mérite",
    description: "Un appui pour les étudiants ambitieux qui démontrent excellence académique et potentiel de leadership.",
  },
  {
    title: "Mentorat et communauté",
    description: "Des conseils, un accompagnement humain et un réseau qui aide chaque candidat à progresser.",
  },
  {
    title: "Processus clair et rapide",
    description: "Une candidature simple avec des étapes lisibles et des décisions suivies avec attention.",
  },
];

export default function HomeFr() {
  return (
    <>
      <NavbarFr />
      <main className="relative overflow-hidden bg-slate-950 text-slate-100">
        <div className="pointer-events-none absolute left-1/2 top-0 h-[420px] w-[420px] -translate-x-1/2 rounded-full bg-sky-500/20 blur-3xl" />
        <div className="pointer-events-none absolute right-0 top-24 h-72 w-72 rounded-full bg-fuchsia-500/20 blur-3xl" />

        <section className="relative mx-auto max-w-6xl px-6 py-24 lg:px-8">
          <div className="grid gap-14 lg:grid-cols-[1.2fr_0.95fr] lg:items-center">
            <div className="space-y-8">
              <span className="eyebrow">Fonds de bourse pour étudiants motivés</span>
              <div className="space-y-6">
                <h1 className="max-w-3xl text-5xl font-semibold tracking-tight text-white sm:text-6xl">
                  Investir dans l’éducation et révéler les leaders de demain.
                </h1>
                <p className="max-w-2xl text-lg leading-8 text-slate-300">
                  Le Fonds de Bourse NDI NKEMNJINJU soutient les étudiants qui allient excellence, engagement et volonté d’impact positif dans leur communauté.
                </p>
              </div>

              <div className="flex flex-col gap-3 sm:flex-row">
                <Link href="/fr/apply" className="btn-primary !px-6">
                  Postuler maintenant
                </Link>
                <Link href="/fr/about" className="btn-secondary !px-6">
                  En savoir plus
                </Link>
              </div>
            </div>

            <div className="grid gap-6">
              <div className="surface-card overflow-hidden p-0">
                <img
                  src="/images/scholarship-hero.svg"
                  alt="Illustration de soutien éducatif"
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                <div className="surface-panel">
                  <p className="text-sm text-slate-400">Candidatures reçues</p>
                  <p className="mt-2 text-3xl font-bold text-white">150+</p>
                </div>
                <div className="surface-panel">
                  <p className="text-sm text-slate-400">Accompagnement</p>
                  <p className="mt-2 text-3xl font-bold text-white">1:1</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        <section className="border-t border-white/10 py-20 px-6">
          <div className="mx-auto max-w-6xl">
            <div className="grid gap-8 xl:grid-cols-3">
              {features.map((feature) => (
                <div key={feature.title} className="surface-panel transition hover:-translate-y-1 hover:border-sky-500/20">
                  <h3 className="text-xl font-semibold text-white">{feature.title}</h3>
                  <p className="mt-4 text-slate-300">{feature.description}</p>
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
