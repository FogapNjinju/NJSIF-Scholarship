import Image from "next/image";
import Link from "next/link";

const quickLinks = [
  { label: "Home", href: "/" },
  { label: "About", href: "/about" },
  { label: "Apply", href: "/apply" },
  { label: "Testimonials", href: "/testimonials" },
  { label: "Admin", href: "/admin/login" },
];

const socialLinks = [
  { label: "Facebook", href: "#" },
  { label: "Instagram", href: "#" },
  { label: "LinkedIn", href: "#" },
];

export default function Footer() {
  return (
    <footer className="border-t border-white/10 bg-slate-950/80 text-slate-200 backdrop-blur-xl">
      <div className="mx-auto max-w-7xl px-6 py-14 lg:px-8">
        <div className="grid gap-6 md:grid-cols-2 xl:grid-cols-4">
          <div className="surface-panel">
            <Image
              src="/njsif-mark.svg"
              alt="NJSIF Scholarship Fund logo"
              width={220}
              height={64}
              className="h-auto w-auto max-w-full"
            />
            <p className="mt-4 max-w-sm text-sm leading-7 text-slate-300">
              Supporting ambitious students with funding, mentorship, and access to educational opportunity.
            </p>
          </div>

          <div className="surface-panel">
            <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Contact</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              <li>Email: forbialem@gmail.com</li>
              <li>Phone: +237 657 387 764 </li>
              <li>Location: Cameroon, Buea</li>
            </ul>
          </div>

          <div className="surface-panel">
            <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Quick links</h4>
            <ul className="mt-4 space-y-2 text-sm text-slate-300">
              {quickLinks.map((link) => (
                <li key={link.href}>
                  <Link href={link.href} className="transition hover:text-white">
                    {link.label}
                  </Link>
                </li>
              ))}
            </ul>
          </div>

          <div className="surface-panel">
            <h4 className="text-sm font-semibold uppercase tracking-[0.3em] text-sky-300">Deadlines & social</h4>
            <div className="mt-4 space-y-4 text-sm text-slate-300">
              <div>
                <p className="font-medium text-white">Scholarship deadline</p>
                <p>Applications close: 30 June 2026</p>
              </div>
              <div>
                <p className="font-medium text-white">Follow us</p>
                <div className="mt-2 flex flex-wrap gap-2">
                  {socialLinks.map((item) => (
                    <a
                      key={item.label}
                      href={item.href}
                      className="btn-secondary !min-h-0 !px-3 !py-1.5 !text-xs !font-medium"
                    >
                      {item.label}
                    </a>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-10 border-t border-white/10 pt-6 text-center text-sm text-slate-500">
          © {new Date().getFullYear()} NJSIF Scholarship Fund. All rights reserved.
        </div>
      </div>
    </footer>
  );
}
