import Link from "next/link";

export default function MainNav() {
  return (
    <nav className="hidden items-center justify-center gap-1 xl:flex">
      <HeaderLink href="/listings">Market</HeaderLink>
      <HeaderLink href="/create-listing">İlan Ver</HeaderLink>
      <HeaderLink href="/favorites">Favorilerim</HeaderLink>
      <HeaderLink href="/notifications">Bildirimler</HeaderLink>
      <HeaderLink href="/messages">Mesajlar</HeaderLink>
      <HeaderLink href="/profile">Profil</HeaderLink>
      <HeaderLink href="/help">Yardım</HeaderLink>
    </nav>
  );
}

function HeaderLink({
  href,
  children,
}: {
  href: string;
  children: React.ReactNode;
}) {
  return (
    <Link
      href={href}
      className="whitespace-nowrap rounded-full px-3 py-2 text-sm font-semibold text-neutral-300 transition hover:bg-neutral-900 hover:text-white"
    >
      {children}
    </Link>
  );
}