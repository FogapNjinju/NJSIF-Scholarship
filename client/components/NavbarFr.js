import Image from "next/image";
import Link from "next/link";
import { useState } from "react";

export default function NavbarFr() {
  const [open, setOpen] = useState(false);

  return (
    <nav className="sticky top-0 z-50 border-b border-white/10 bg-slate-950/85 backdrop-blur-2xl shadow-xl shadow-slate-950/30">
      <div className="mx-auto max-w-6xl px-6 py-4">
        <div className="flex items-center justify-between gap-4">
          <Link href="/fr" className="flex items-center text-white">
            <Image
              src="/njsif-mark.svg"
              alt="Logo NJSIF"
              width={46}
              height={46}
              priority
              className="h-11 w-11 rounded-2xl"
            />
            <span className="ml-3 flex flex-col">
              <span className="brand-wordmark text-xl font-semibold leading-none text-white">NJSIF</span>
              <span className="brand-caption !ml-0 mt-1">Bourse</span>
            </span>
          </Link>

          <div className="hidden items-center gap-2 md:flex">
            <Link href="/fr" className="nav-link">
              Accueil
            </Link>
            <Link href="/fr/about" className="nav-link">
              À propos
            </Link>
            <Link href="/testimonials" className="nav-link">
              Témoignages
            </Link>
            <Link href="/admin/login" className="nav-link">
              Admin
            </Link>
            <Link href="/apply" className="btn-secondary !min-h-10 !px-4 !py-2">
              EN
            </Link>
            <Link href="/fr/apply" className="btn-primary !min-h-10 !px-5 !py-2">
              Postuler
            </Link>
          </div>

          <button
            type="button"
            onClick={() => setOpen((value) => !value)}
            className="inline-flex h-11 w-11 items-center justify-center rounded-full border border-white/10 bg-slate-900 text-slate-100 transition hover:border-slate-500 md:hidden"
            aria-label="Toggle navigation menu"
          >
            <span className="text-xl">☰</span>
          </button>
        </div>

        {open && (
          <div className="animate-fade-in mt-4 rounded-[2rem] border border-white/10 bg-slate-900/95 p-4 md:hidden">
            <div className="flex flex-col gap-2 text-sm text-slate-200">
              <Link href="/fr" className="rounded-2xl px-4 py-2.5 transition hover:bg-white/5 hover:text-white" onClick={() => setOpen(false)}>
                Accueil
              </Link>
              <Link href="/fr/about" className="rounded-2xl px-4 py-2.5 transition hover:bg-white/5 hover:text-white" onClick={() => setOpen(false)}>
                À propos
              </Link>
              <Link href="/testimonials" className="rounded-2xl px-4 py-2.5 transition hover:bg-white/5 hover:text-white" onClick={() => setOpen(false)}>
                Témoignages
              </Link>
              <Link href="/admin/login" className="rounded-2xl px-4 py-2.5 transition hover:bg-white/5 hover:text-white" onClick={() => setOpen(false)}>
                Admin
              </Link>
              <Link href="/apply" className="rounded-2xl px-4 py-2.5 transition hover:bg-white/5 hover:text-white" onClick={() => setOpen(false)}>
                Version anglaise
              </Link>
              <Link href="/fr/apply" className="btn-primary" onClick={() => setOpen(false)}>
                Postuler
              </Link>
            </div>
          </div>
        )}
      </div>
    </nav>
  );
}
