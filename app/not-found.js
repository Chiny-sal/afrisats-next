import Link from "next/link";

export const metadata = {
  title: "Page Not Found",
};

export default function NotFound() {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <span className="mb-4 font-display text-6xl font-bold text-gold">404</span>
      <h2 className="mb-2 font-display text-xl font-bold">Page not found</h2>
      <p className="mb-6 max-w-md text-sm text-muted">
        The page you&apos;re looking for doesn&apos;t exist or has been moved.
      </p>
      <Link href="/" className="btn-gold">
        Back to Marketplace
      </Link>
    </div>
  );
}
