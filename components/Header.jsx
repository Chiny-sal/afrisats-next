"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const NAV_LINKS = [
  { href: "/", label: "Marketplace" },
  { href: "/converter", label: "Converter" },
  { href: "/dashboard", label: "Dashboard" },
  { href: "/sell", label: "Sell" },
];

export default function Header() {
  const pathname = usePathname();
  const [health, setHealth] = useState({ connected: null, loading: true });
  const [menuOpen, setMenuOpen] = useState(false);
  const [sessionChip, setSessionChip] = useState("");

  useEffect(() => {
    let cancelled = false;

    async function checkHealth() {
      try {
        const res = await fetch("/api/health");
        const data = await res.json();
        if (!cancelled) {
          setHealth({ connected: data.connected, loading: false, message: data.message });
        }
      } catch {
        if (!cancelled) {
          setHealth({ connected: false, loading: false, message: "Network error" });
        }
      }
    }

    checkHealth();
    const interval = setInterval(checkHealth, 30000);
    return () => {
      cancelled = true;
      clearInterval(interval);
    };
  }, []);

  useEffect(() => {
    const stored = localStorage.getItem("afrisats_buyer_chip");
    if (stored) {
      setSessionChip(stored.slice(0, 8));
    } else {
      const chip = `B-${Math.random().toString(36).slice(2, 8)}`;
      localStorage.setItem("afrisats_buyer_chip", chip);
      setSessionChip(chip.slice(2));
    }
  }, []);

  return (
    <header className="sticky top-0 z-40 border-b border-white/10 bg-surface/95 backdrop-blur">
      <div className="mx-auto flex max-w-7xl items-center justify-between px-4 py-3 sm:px-6 lg:px-8">
        <div className="flex items-center gap-4">
          <Link href="/" className="flex items-center gap-2 font-display text-xl font-bold">
            <span className="text-gold">⚡</span>
            <span>Afri<span className="text-gold">Sats</span></span>
          </Link>

          <nav className="hidden items-center gap-1 md:flex">
            {NAV_LINKS.map((link) => (
              <Link
                key={link.href}
                href={link.href}
                className={`rounded-md px-3 py-2 text-sm font-medium transition-colors ${
                  pathname === link.href
                    ? "bg-jade/20 text-jade"
                    : "text-muted hover:text-primary"
                }`}
              >
                {link.label}
              </Link>
            ))}
          </nav>
        </div>

        <div className="flex items-center gap-3">
          {sessionChip && (
            <span className="hidden rounded-full bg-violet/20 px-2.5 py-1 font-mono text-xs text-violet sm:inline">
              buyer:{sessionChip}
            </span>
          )}

          {health.loading ? (
            <span className="text-xs text-muted">Checking…</span>
          ) : health.connected ? (
            <span className="flex items-center gap-1.5 rounded-full bg-jade/20 px-3 py-1 text-xs font-medium text-jade">
              <span className="h-2 w-2 rounded-full bg-jade" />
              <span className="hidden sm:inline">Lightning Connected</span>
              <span className="sm:hidden">LN ✓</span>
            </span>
          ) : (
            <span
              className="flex items-center gap-1.5 rounded-full bg-coral/20 px-3 py-1 text-xs font-medium text-coral"
              title={health.message}
            >
              <span className="h-2 w-2 rounded-full bg-coral" />
              Offline
            </span>
          )}

          <button
            className="rounded-md p-2 text-muted hover:text-primary md:hidden"
            onClick={() => setMenuOpen(!menuOpen)}
            aria-label="Toggle menu"
          >
            {menuOpen ? "✕" : "☰"}
          </button>
        </div>
      </div>

      {menuOpen && (
        <nav className="border-t border-white/10 px-4 py-3 md:hidden">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              onClick={() => setMenuOpen(false)}
              className={`block rounded-md px-3 py-2 text-sm font-medium ${
                pathname === link.href ? "bg-jade/20 text-jade" : "text-muted"
              }`}
            >
              {link.label}
            </Link>
          ))}
        </nav>
      )}
    </header>
  );
}
