import { useState } from "react";
import { useLocation } from "wouter";
import { useGetCart, useCreateOrder, getGetCartQueryKey, useClearCart } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Truck } from "lucide-react";

export function Checkout() {
  const { data: cart } = useGetCart();
  const [, setLocation] = useLocation();
  const createOrder = useCreateOrder();
  const clearCart = useClearCart();
  const queryClient = useQueryClient();

  const [form, setForm] = useState({
    customerName: "",
    customerEmail: "",
    customerPhone: "",
    address: "",
    paymentMethod: "bank-transfer",
    notes: "",
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const validate = () => {
    const e: Record<string, string> = {};
    if (!form.customerName.trim()) e.customerName = "Name is required";
    if (!form.customerEmail.trim() || !form.customerEmail.includes("@")) e.customerEmail = "Valid email required";
    if (!form.customerPhone.trim()) e.customerPhone = "Phone is required";
    if (!form.address.trim()) e.address = "Address is required";
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    if (!cart?.items.length) return;

    createOrder.mutate(
      {
        data: {
          ...form,
          items: cart.items,
          total: cart.total,
          notes: form.notes || null,
        },
      },
      {
        onSuccess: (order) => {
          clearCart.mutate(undefined, {
            onSuccess: () => {
              queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
              setLocation(`/order-confirmation/${order.id}`);
            },
          });
        },
      }
    );
  };

  const field = (name: keyof typeof form, label: string, type = "text", placeholder = "") => (
    <div>
      <label className="block text-xs uppercase tracking-widest font-body text-muted-foreground mb-2">{label}</label>
      <input
        type={type}
        data-testid={`input-${name}`}
        value={form[name]}
        onChange={(e) => setForm((f) => ({ ...f, [name]: e.target.value }))}
        placeholder={placeholder}
        className="w-full bg-card border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors"
      />
      {errors[name] && <p className="text-destructive text-xs mt-1 font-body">{errors[name]}</p>}
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <h1 className="font-serif text-4xl text-foreground mb-10">Checkout</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Form */}
          <form onSubmit={handleSubmit} className="lg:col-span-2 space-y-6">
            <div>
              <h2 className="font-serif text-xl text-foreground mb-6">Delivery Information</h2>
              <div className="space-y-4">
                {field("customerName", "Full Name", "text", "Your full name")}
                {field("customerEmail", "Email Address", "email", "your@email.com")}
                {field("customerPhone", "Phone Number", "tel", "+44...")}
                <div>
                  <label className="block text-xs uppercase tracking-widest font-body text-muted-foreground mb-2">Delivery Address</label>
                  <textarea
                    data-testid="input-address"
                    value={form.address}
                    onChange={(e) => setForm((f) => ({ ...f, address: e.target.value }))}
                    placeholder="Full UK delivery address including postcode"
                    rows={3}
                    className="w-full bg-card border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                  {errors.address && <p className="text-destructive text-xs mt-1 font-body">{errors.address}</p>}
                </div>
                <div>
                  <label className="block text-xs uppercase tracking-widest font-body text-muted-foreground mb-2">Order Notes (Optional)</label>
                  <textarea
                    data-testid="input-notes"
                    value={form.notes}
                    onChange={(e) => setForm((f) => ({ ...f, notes: e.target.value }))}
                    placeholder="Size measurements, special requests, colour preference..."
                    rows={3}
                    className="w-full bg-card border border-border px-4 py-3 text-sm font-body text-foreground placeholder:text-muted-foreground focus:border-primary focus:outline-none transition-colors resize-none"
                  />
                </div>
              </div>
            </div>

            <div>
              <h2 className="font-serif text-xl text-foreground mb-6">Payment Method</h2>
              <div className="space-y-3">
                {[
                  { value: "bank-transfer", label: "Bank Transfer", desc: "We'll send you account details via email after placing your order." },
                  { value: "cash-on-delivery", label: "Cash on Delivery", desc: "Pay when your order arrives (UK only)." },
                ].map((method) => (
                  <label key={method.value} className={`flex items-start gap-4 p-4 border cursor-pointer transition-all ${form.paymentMethod === method.value ? "border-primary bg-primary/5" : "border-border hover:border-primary/50"}`}>
                    <input
                      type="radio"
                      data-testid={`payment-${method.value}`}
                      name="paymentMethod"
                      value={method.value}
                      checked={form.paymentMethod === method.value}
                      onChange={(e) => setForm((f) => ({ ...f, paymentMethod: e.target.value }))}
                      className="mt-1 accent-primary"
                    />
                    <div>
                      <p className="font-body text-sm text-foreground font-medium">{method.label}</p>
                      <p className="text-xs text-muted-foreground font-body mt-1">{method.desc}</p>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            <button
              type="submit"
              data-testid="button-place-order"
              disabled={createOrder.isPending || !cart?.items.length}
              className="w-full bg-primary text-primary-foreground py-4 font-body uppercase tracking-widest text-sm hover:bg-primary/90 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {createOrder.isPending ? "Placing Order..." : `Place Order — £${cart?.total.toFixed(2)}`}
            </button>
          </form>

          {/* Order Summary */}
          <div className="bg-card border border-border p-6 h-fit">
            <h2 className="font-serif text-xl text-foreground mb-6">Your Order</h2>
            <div className="space-y-4 mb-6">
              {(cart?.items ?? []).map((item) => (
                <div key={item.productId} className="flex gap-3">
                  <div className="w-14 h-16 bg-background overflow-hidden shrink-0">
                    <img src={item.image} alt={item.name} className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/product-images/wallets-reference.jpg"; }} />
                  </div>
                  <div className="flex-1">
                    <p className="font-body text-sm text-foreground">{item.name}</p>
                    {item.size && <p className="text-xs text-muted-foreground font-body">Size: {item.size}</p>}
                    <p className="text-xs text-muted-foreground font-body">Qty: {item.quantity}</p>
                  </div>
                  <span className="font-serif text-sm text-primary">£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
            </div>
            <div className="border-t border-border pt-4">
              <div className="flex justify-between font-serif text-xl">
                <span>Total</span>
                <span className="text-primary">£{cart?.total.toFixed(2)}</span>
              </div>
              <div className="flex items-center gap-2 text-xs font-body text-muted-foreground mt-3">
                <Truck size={12} className="text-primary" /> UK Delivery Included
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
