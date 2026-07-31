"use client";

export default function RoleToggle({ role, onChange }) {
  return (
    <div className="inline-flex rounded-lg border border-white/10 bg-base p-1">
      <button
        onClick={() => onChange("buyer")}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          role === "buyer"
            ? "bg-jade/20 text-jade"
            : "text-muted hover:text-primary"
        }`}
      >
        Buyer
      </button>
      <button
        onClick={() => onChange("seller")}
        className={`rounded-md px-4 py-2 text-sm font-medium transition-colors ${
          role === "seller"
            ? "bg-gold/20 text-gold"
            : "text-muted hover:text-primary"
        }`}
      >
        Seller
      </button>
    </div>
  );
}
