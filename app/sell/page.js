"use client";

import { useEffect, useState } from "react";
import {
  COUNTRIES,
  COUNTRY_FLAGS,
  DIGITAL_CATEGORIES,
  PHYSICAL_CATEGORIES,
} from "@/lib/constants";
import LivePreviewCard from "@/components/LivePreviewCard";
import { useToast } from "@/components/Toast";

function SellPageContent() {
  const { showToast } = useToast();
  const [sellerToken, setSellerToken] = useState("");
  const [sellerInfo, setSellerInfo] = useState(null);
  const [showListingForm, setShowListingForm] = useState(false);
  const [myListings, setMyListings] = useState([]);
  const [submitting, setSubmitting] = useState(false);

  const [sellerForm, setSellerForm] = useState({
    name: "",
    email: "",
    location: "",
    country: "Kenya",
    lnbits_invoice_key: "",
    payout_note: "",
  });

  const [itemForm, setItemForm] = useState({
    title: "",
    description: "",
    category: "Design",
    product_type: "digital",
    price_sats: 500,
    image_url: "",
    delivery_method: "link",
    delivery_value: "",
  });

  useEffect(() => {
    const stored = localStorage.getItem("afrisats_seller_token");
    if (stored) {
      setSellerToken(stored);
      setShowListingForm(true);
      fetchSeller(stored);
      fetchListings(stored);
    }
  }, []);

  async function fetchSeller(token) {
    try {
      const res = await fetch("/api/sellers/me", {
        headers: { "X-Seller-Token": token },
      });
      if (res.ok) {
        const data = await res.json();
        setSellerInfo(data.seller);
      }
    } catch {}
  }

  async function fetchListings(token) {
    try {
      const res = await fetch("/api/items");
      const data = await res.json();
      const sellerRes = await fetch("/api/sellers/me", {
        headers: { "X-Seller-Token": token },
      });
      if (sellerRes.ok) {
        const { seller } = await sellerRes.json();
        setMyListings(
          data.items.filter((i) => i.seller_id === seller.id)
        );
      }
    } catch {}
  }

  async function handleBecomeSeller(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const res = await fetch("/api/sellers", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(sellerForm),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      localStorage.setItem("afrisats_seller_token", data.seller_token);
      setSellerToken(data.seller_token);
      setSellerInfo(data.seller);
      setShowListingForm(true);
      showToast("Seller account created! Token saved.");
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function handleListProduct(e) {
    e.preventDefault();
    setSubmitting(true);
    try {
      const payload = { ...itemForm };
      if (payload.product_type === "physical") {
        payload.delivery_method = "shipping";
      }

      const res = await fetch("/api/items", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "X-Seller-Token": sellerToken,
        },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error);

      showToast("Product listed successfully!");
      setItemForm({
        title: "",
        description: "",
        category: "Design",
        product_type: "digital",
        price_sats: 500,
        image_url: "",
        delivery_method: "link",
        delivery_value: "",
      });
      fetchListings(sellerToken);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSubmitting(false);
    }
  }

  async function toggleActive(itemId, active) {
    const res = await fetch("/api/items", {
      method: "PATCH",
      headers: {
        "Content-Type": "application/json",
        "X-Seller-Token": sellerToken,
      },
      body: JSON.stringify({ itemId, active: !active }),
    });
    if (res.ok) fetchListings(sellerToken);
  }

  const categories =
    itemForm.product_type === "digital"
      ? DIGITAL_CATEGORIES
      : PHYSICAL_CATEGORIES;

  return (
    <div>
      <h1 className="mb-2 font-display text-3xl font-bold">Sell on AfriSats</h1>
      <p className="mb-8 text-muted">
        Register as a seller and list digital or physical products.
      </p>

      {!showListingForm && (
        <div className="mb-8 rounded-xl border border-white/10 bg-surface p-6">
          <h2 className="mb-4 font-display text-lg font-semibold">
            Panel A — Become a Seller
          </h2>
          <form onSubmit={handleBecomeSeller} className="grid gap-4 sm:grid-cols-2">
            <input
              placeholder="Name *"
              value={sellerForm.name}
              onChange={(e) => setSellerForm({ ...sellerForm, name: e.target.value })}
              className="input-field"
              required
            />
            <input
              type="email"
              placeholder="Email *"
              value={sellerForm.email}
              onChange={(e) => setSellerForm({ ...sellerForm, email: e.target.value })}
              className="input-field"
              required
            />
            <input
              placeholder="Location *"
              value={sellerForm.location}
              onChange={(e) => setSellerForm({ ...sellerForm, location: e.target.value })}
              className="input-field"
              required
            />
            <select
              value={sellerForm.country}
              onChange={(e) => setSellerForm({ ...sellerForm, country: e.target.value })}
              className="select-field"
            >
              {COUNTRIES.map((c) => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
            <input
              placeholder="LNbits Invoice Key *"
              value={sellerForm.lnbits_invoice_key}
              onChange={(e) =>
                setSellerForm({ ...sellerForm, lnbits_invoice_key: e.target.value })
              }
              className="input-field sm:col-span-2"
              required
            />
            <input
              placeholder="Payout Note (optional)"
              value={sellerForm.payout_note}
              onChange={(e) =>
                setSellerForm({ ...sellerForm, payout_note: e.target.value })
              }
              className="input-field sm:col-span-2"
            />
            <button type="submit" disabled={submitting} className="btn-gold sm:col-span-2">
              {submitting ? "Creating…" : "Register as Seller"}
            </button>
          </form>
        </div>
      )}

      {showListingForm && (
        <div className="grid gap-8 lg:grid-cols-2">
          <div className="rounded-xl border border-white/10 bg-surface p-6">
            <h2 className="mb-1 font-display text-lg font-semibold">
              Panel B — List a Product
            </h2>
            {sellerInfo && (
              <p className="mb-4 text-xs text-muted">
                Selling as {sellerInfo.name} ({sellerInfo.country})
              </p>
            )}

            <form onSubmit={handleListProduct} className="space-y-4">
              <div className="flex gap-2">
                <button
                  type="button"
                  onClick={() =>
                    setItemForm({
                      ...itemForm,
                      product_type: "digital",
                      category: "Design",
                      delivery_method: "link",
                    })
                  }
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
                    itemForm.product_type === "digital"
                      ? "bg-violet/20 text-violet"
                      : "bg-white/5 text-muted"
                  }`}
                >
                  Digital
                </button>
                <button
                  type="button"
                  onClick={() =>
                    setItemForm({
                      ...itemForm,
                      product_type: "physical",
                      category: "Fashion",
                      delivery_method: "shipping",
                    })
                  }
                  className={`flex-1 rounded-lg px-4 py-2 text-sm font-medium ${
                    itemForm.product_type === "physical"
                      ? "bg-coral/20 text-coral"
                      : "bg-white/5 text-muted"
                  }`}
                >
                  Physical
                </button>
              </div>

              <input
                placeholder="Product Title *"
                value={itemForm.title}
                onChange={(e) => setItemForm({ ...itemForm, title: e.target.value })}
                className="input-field"
                required
              />

              <select
                value={itemForm.category}
                onChange={(e) => setItemForm({ ...itemForm, category: e.target.value })}
                className="select-field w-full"
              >
                {categories.map((c) => (
                  <option key={c} value={c}>{c}</option>
                ))}
              </select>

              <textarea
                placeholder="Description (max 500 chars) *"
                value={itemForm.description}
                onChange={(e) =>
                  setItemForm({ ...itemForm, description: e.target.value.slice(0, 500) })
                }
                rows={3}
                className="input-field resize-none"
                required
              />
              <p className="text-right text-xs text-muted">
                {itemForm.description.length}/500
              </p>

              <input
                type="url"
                placeholder="Image URL (optional)"
                value={itemForm.image_url}
                onChange={(e) => setItemForm({ ...itemForm, image_url: e.target.value })}
                className="input-field"
              />
              <p className="text-xs text-muted">
                Leave blank to use a placeholder image for now.
              </p>

              <input
                type="number"
                placeholder="Price (sats) *"
                min={1}
                max={5000}
                value={itemForm.price_sats}
                onChange={(e) =>
                  setItemForm({ ...itemForm, price_sats: Number(e.target.value) })
                }
                className="input-field font-mono-num"
                required
              />

              {itemForm.product_type === "digital" ? (
                <div>
                  <p className="mb-2 text-sm text-muted">Delivery Method</p>
                  <div className="mb-3 flex gap-4">
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        checked={itemForm.delivery_method === "link"}
                        onChange={() =>
                          setItemForm({ ...itemForm, delivery_method: "link" })
                        }
                      />
                      Download Link
                    </label>
                    <label className="flex items-center gap-2 text-sm">
                      <input
                        type="radio"
                        checked={itemForm.delivery_method === "instructions"}
                        onChange={() =>
                          setItemForm({ ...itemForm, delivery_method: "instructions" })
                        }
                      />
                      Instructions
                    </label>
                  </div>
                  <input
                    placeholder={
                      itemForm.delivery_method === "link"
                        ? "Download URL *"
                        : "Delivery instructions *"
                    }
                    value={itemForm.delivery_value}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, delivery_value: e.target.value })
                    }
                    className="input-field"
                    required
                  />
                </div>
              ) : (
                <div>
                  <label className="mb-1 block text-sm text-muted">
                    Shipping Notes *
                  </label>
                  <textarea
                    placeholder="Processing time, what's included, shipping regions…"
                    value={itemForm.delivery_value}
                    onChange={(e) =>
                      setItemForm({ ...itemForm, delivery_value: e.target.value })
                    }
                    rows={3}
                    className="input-field resize-none"
                    required
                  />
                </div>
              )}

              <button type="submit" disabled={submitting} className="btn-gold w-full">
                {submitting ? "Listing…" : "List Product"}
              </button>
            </form>
          </div>

          <LivePreviewCard
            formData={itemForm}
            sellerName={sellerInfo?.name}
            sellerFlag={sellerInfo?.flag || COUNTRY_FLAGS[sellerForm.country]}
            sellerCountry={sellerInfo?.country || sellerForm.country}
          />
        </div>
      )}

      {myListings.length > 0 && (
        <div className="mt-8">
          <h2 className="mb-4 font-display text-lg font-semibold">My Listings</h2>
          <div className="overflow-x-auto">
            <table className="w-full text-left text-sm">
              <thead>
                <tr className="border-b border-white/10 text-xs text-muted">
                  <th className="pb-3 pr-4">Title</th>
                  <th className="pb-3 pr-4">Type</th>
                  <th className="pb-3 pr-4">Price</th>
                  <th className="pb-3 pr-4">Status</th>
                  <th className="pb-3">Action</th>
                </tr>
              </thead>
              <tbody>
                {myListings.map((item) => (
                  <tr key={item.id} className="border-b border-white/5">
                    <td className="py-3 pr-4">{item.title}</td>
                    <td className="py-3 pr-4 capitalize">{item.product_type}</td>
                    <td className="py-3 pr-4 font-mono-num text-gold">
                      {item.price_sats.toLocaleString()} sats
                    </td>
                    <td className="py-3 pr-4">
                      <span
                        className={`text-xs ${
                          item.active ? "text-jade" : "text-coral"
                        }`}
                      >
                        {item.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="py-3">
                      <button
                        onClick={() => toggleActive(item.id, item.active)}
                        className="text-xs text-gold underline"
                      >
                        {item.active ? "Deactivate" : "Activate"}
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
}

export default function SellPage() {
  return <SellPageContent />;
}
