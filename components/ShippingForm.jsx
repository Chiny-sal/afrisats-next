"use client";

export default function ShippingForm({ address, contact, onAddressChange, onContactChange, errors }) {
  return (
    <div className="space-y-4">
      <h3 className="font-display text-sm font-semibold text-primary">
        Shipping Details
      </h3>
      <p className="text-xs text-muted">
        This is a physical product. Enter your shipping address before generating an invoice.
      </p>

      <div>
        <label className="mb-1 block text-xs text-muted">Shipping Address *</label>
        <textarea
          value={address}
          onChange={(e) => onAddressChange(e.target.value)}
          rows={3}
          placeholder="Full name, street, city, postal code, country"
          className="input-field resize-none"
        />
        {errors?.address && (
          <p className="mt-1 text-xs text-coral">{errors.address}</p>
        )}
      </div>

      <div>
        <label className="mb-1 block text-xs text-muted">Contact (phone or email) *</label>
        <input
          type="text"
          value={contact}
          onChange={(e) => onContactChange(e.target.value)}
          placeholder="+254 700 000 000 or email@example.com"
          className="input-field"
        />
        {errors?.contact && (
          <p className="mt-1 text-xs text-coral">{errors.contact}</p>
        )}
      </div>
    </div>
  );
}
