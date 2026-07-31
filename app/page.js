"use client";

import { useCallback, useEffect, useState, Suspense } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import ItemCard from "@/components/ItemCard";
import ItemGridSkeleton from "@/components/ItemGridSkeleton";
import EmptyState from "@/components/EmptyState";
import CheckoutModal from "@/components/CheckoutModal";
import SearchBar from "@/components/SearchBar";

function MarketplaceContent() {
  const searchParams = useSearchParams();
  const router = useRouter();

  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [selectedItem, setSelectedItem] = useState(null);

  const filters = {
    query: searchParams.get("q") || "",
    country: searchParams.get("country") || "all",
    category: searchParams.get("category") || "all",
    productType: searchParams.get("productType") || "all",
  };

  const updateFilters = useCallback(
    (newFilters) => {
      const params = new URLSearchParams();
      if (newFilters.query) params.set("q", newFilters.query);
      if (newFilters.country !== "all") params.set("country", newFilters.country);
      if (newFilters.category !== "all") params.set("category", newFilters.category);
      if (newFilters.productType !== "all") params.set("productType", newFilters.productType);
      const qs = params.toString();
      router.replace(qs ? `/?${qs}` : "/", { scroll: false });
    },
    [router]
  );

  const clearFilters = () => {
    router.replace("/", { scroll: false });
  };

  useEffect(() => {
    async function fetchItems() {
      setLoading(true);
      setError(null);
      try {
        const params = new URLSearchParams();
        if (filters.query) params.set("q", filters.query);
        if (filters.country !== "all") params.set("country", filters.country);
        if (filters.category !== "all") params.set("category", filters.category);
        if (filters.productType !== "all") params.set("productType", filters.productType);

        const res = await fetch(`/api/items?${params.toString()}`);
        if (!res.ok) throw new Error("Failed to load items");
        const data = await res.json();
        setItems(data.items);
      } catch (err) {
        setError(err.message);
      } finally {
        setLoading(false);
      }
    }
    fetchItems();
  }, [filters.query, filters.country, filters.category, filters.productType]);

  return (
    <div>
      <div className="mb-8">
        <h1 className="mb-2 font-display text-3xl font-bold">
          African Marketplace
        </h1>
        <p className="text-muted">
          Digital services & physical goods from creators across Africa — pay
          instantly with Bitcoin Lightning ⚡
        </p>
      </div>

      <div className="mb-6">
        <SearchBar filters={filters} onChange={updateFilters} onClear={clearFilters} />
      </div>

      {loading && <ItemGridSkeleton />}

      {error && (
        <div className="rounded-lg bg-coral/20 p-4 text-sm text-coral">
          {error} — try refreshing the page.
        </div>
      )}

      {!loading && !error && items.length === 0 && (
        <EmptyState onClear={clearFilters} />
      )}

      {!loading && !error && items.length > 0 && (
        <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item) => (
            <ItemCard key={item.id} item={item} onBuy={setSelectedItem} />
          ))}
        </div>
      )}

      {selectedItem && (
        <CheckoutModal
          item={selectedItem}
          onClose={() => setSelectedItem(null)}
        />
      )}
    </div>
  );
}

export default function MarketplacePage() {
  return (
    <Suspense fallback={<ItemGridSkeleton />}>
      <MarketplaceContent />
    </Suspense>
  );
}
