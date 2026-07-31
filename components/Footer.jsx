export default function Footer() {
  return (
    <footer className="mt-auto border-t border-white/10 bg-surface py-8">
      <div className="mx-auto max-w-7xl px-4 text-center sm:px-6 lg:px-8">
        <p className="text-sm text-muted">
          AfriSats uses the public{" "}
          <a
            href="https://demo.lnbits.com"
            target="_blank"
            rel="noopener noreferrer"
            className="text-gold underline"
          >
            demo.lnbits.com
          </a>{" "}
          Lightning node — real mainnet sats on a shared custodial wallet. Amounts are
          intentionally small for safe live demos.
        </p>
        <p className="mt-2 text-xs text-muted/60">
          © {new Date().getFullYear()} AfriSats — Built for the Lightning hackathon
        </p>
      </div>
    </footer>
  );
}
