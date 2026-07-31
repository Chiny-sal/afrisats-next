import ItemCard from "./ItemCard";

export default function LivePreviewCard({ formData, sellerName, sellerFlag, sellerCountry }) {
  const previewItem = {
    id: formData.id || "preview-item",
    title: formData.title || "Your Product Title",
    description: formData.description || "Product description will appear here…",
    price_sats: Number(formData.price_sats) || 0,
    category: formData.category || "Design",
    product_type: formData.product_type || "digital",
    image_url: formData.image_url || "",
    seller_name: sellerName || "You",
    seller_flag: sellerFlag || "🌍",
    seller_country: sellerCountry || "",
  };

  return (
    <div>
      <h3 className="mb-3 font-display text-sm font-semibold text-muted">
        Live Preview
      </h3>
      <ItemCard item={previewItem} preview />
    </div>
  );
}
