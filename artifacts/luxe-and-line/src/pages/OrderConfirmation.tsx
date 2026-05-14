import { useParams, Link } from "wouter";
import { useGetOrder } from "@workspace/api-client-react";
import { CheckCircle, Phone, Mail, MapPin } from "lucide-react";

export function OrderConfirmation() {
  const { id } = useParams<{ id: string }>();
  const orderId = parseInt(id ?? "0");
  const { data: order, isLoading } = useGetOrder(orderId, {
    query: { enabled: !!orderId, queryKey: [["order", orderId]] }
  });

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background flex items-center justify-center px-6">
      <div className="max-w-2xl w-full text-center">
        <div className="inline-flex items-center justify-center w-20 h-20 rounded-full border-2 border-primary mb-6">
          <CheckCircle size={40} className="text-primary" />
        </div>

        <h1 className="font-serif text-4xl text-foreground mb-3">Order Confirmed</h1>
        <p className="text-muted-foreground font-body mb-2">Thank you for your order, <span className="text-foreground">{order?.customerName}</span></p>
        <p className="text-xs uppercase tracking-widest font-body text-primary mb-8">Order #{order?.id}</p>

        <div className="bg-card border border-border p-6 text-left mb-8">
          <h2 className="font-serif text-lg mb-4">What happens next?</h2>
          <div className="space-y-3 text-sm font-body text-muted-foreground">
            <p>1. We will confirm your order within 24 hours via WhatsApp or email.</p>
            {order?.paymentMethod === "bank-transfer" && (
              <p>2. We will send you our bank details for payment. Please transfer within 48 hours.</p>
            )}
            <p className={order?.paymentMethod === "bank-transfer" ? "3." : "2."}> Your order will be dispatched once payment is confirmed. Delivery: 3-7 business days.</p>
            <p>For any queries, contact us directly:</p>
          </div>

          <div className="mt-4 space-y-2 text-sm font-body">
            <div className="flex items-center gap-2 text-foreground"><Phone size={14} className="text-primary" /> +44 7405 358689</div>
            <div className="flex items-center gap-2 text-foreground"><Mail size={14} className="text-primary" /> hello@luxeandline.co.uk</div>
            <div className="flex items-center gap-2 text-muted-foreground"><MapPin size={14} className="text-primary" /> 39 Stanley Street, L7 0JN, Liverpool, UK</div>
          </div>
        </div>

        {order && (
          <div className="bg-card border border-border p-6 text-left mb-8">
            <h2 className="font-serif text-lg mb-4">Order Summary</h2>
            <div className="space-y-3">
              {(order.items as any[]).map((item, i) => (
                <div key={i} className="flex justify-between text-sm font-body">
                  <span className="text-muted-foreground">{item.name} x{item.quantity}</span>
                  <span className="text-foreground">£{(item.price * item.quantity).toFixed(2)}</span>
                </div>
              ))}
              <div className="border-t border-border pt-3 flex justify-between font-serif">
                <span>Total Paid</span>
                <span className="text-primary">£{order.total.toFixed(2)}</span>
              </div>
            </div>
          </div>
        )}

        <div className="flex gap-4 justify-center">
          <Link href="/shop">
            <button data-testid="button-continue-shopping" className="bg-primary text-primary-foreground px-8 py-3 font-body uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors">
              Continue Shopping
            </button>
          </Link>
          <Link href="/">
            <button data-testid="button-go-home" className="border border-border text-foreground px-8 py-3 font-body uppercase tracking-widest text-xs hover:border-primary hover:text-primary transition-colors">
              Home
            </button>
          </Link>
        </div>
      </div>
    </div>
  );
}
