import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-[1400px] flex-col items-center justify-center px-5 text-center">
      <p className="label text-[var(--accent)]">404 — Off the map</p>
      <h1 className="font-display mt-4 text-6xl md:text-8xl font-bold tracking-tight">LOST IN<br />THE BUSH.</h1>
      <p className="mt-4 text-white/55">Even our Roam can&apos;t find this page.</p>
      <Link href="/" className="mt-8 bg-[var(--accent)] px-7 py-3.5 text-[13px] font-bold tracking-[0.14em] uppercase clip-slant">
        Back to base
      </Link>
    </div>
  );
}
