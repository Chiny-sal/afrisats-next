"use client";

import {
  COUNTRIES,
  DIGITAL_CATEGORIES,
  PHYSICAL_CATEGORIES,
  ALL_CATEGORIES,
} from "@/lib/constants";

export default function SearchBar({ filters, onChange, onClear }) {
  const categories =
    filters.productType === "digital"
      ? DIGITAL_CATEGORIES
      : filters.productType === "physical"
      ? PHYSICAL_CATEGORIES
      : ALL_CATEGORIES;

  return (
    <div className="flex flex-col gap-3 lg:flex-row lg:items-center">
      <input
        type="text"
        placeholder="Search items, sellers…"
        value={filters.query}
        onChange={(e) => onChange({ ...filters, query: e.target.value })}
        className="input-field flex-1"
      />

      <select
        value={filters.productType}
        onChange={(e) =>
          onChange({ ...filters, productType: e.target.value, category: "all" })
        }
        className="select-field"
      >
        <option value="all">All Types</option>
        <option value="digital">Digital</option>
        <option value="physical">Physical</option>
      </select>

      <select
        value={filters.country}
        onChange={(e) => onChange({ ...filters, country: e.target.value })}
        className="select-field"
      >
        <option value="all">All Countries</option>
        {COUNTRIES.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>

      <select
        value={filters.category}
        onChange={(e) => onChange({ ...filters, category: e.target.value })}
        className="select-field"
      >
        <option value="all">All Categories</option>
        {categories.map((c) => (
          <option key={c} value={c}>
            {c}
          </option>
        ))}
      </select>
    </div>
  );
}
