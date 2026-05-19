import { Link } from "wouter";
import { useGetCart, useRemoveFromCart, useUpdateCartItem, useClearCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { Trash2, ShoppingBag, ArrowRight } from "lucide-react";

export function Cart() {
  const { data: cart, isLoading } = useGetCart();
  const removeFromCart = useRemoveFromCart();
  const updateCartItem = useUpdateCartItem();
  const clearCart = useClearCart();
  const queryClient = useQueryClient();

  const handleRemove = (productId: number) => {
    removeFromCart.mutate({ productId }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    });
  };

  const handleQuantityChange = (productId: number, qty: number) => {
    if (qty < 1) {
      handleRemove(productId);
      return;
    }
    updateCartItem.mutate({ productId, data: { quantity: qty } }, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    });
  };

  const handleClear = () => {
    clearCart.mutate(undefined, {
      onSuccess: () => queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() }),
    });
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  const items = cart?.items ?? [];

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <ShoppingBag size={64} className="mx-auto text-muted-foreground mb-6" />
          <h2 className="font-serif text-3xl text-foreground mb-3">Your bag is empty</h2>
          <p className="text-muted-foreground font-body text-sm mb-8">Discover our curated collection of luxury South Asian fashion.</p>
          <Link href="/shop">
            <button data-testid="button-continue-shopping" className="bg-primary text-primary-foreground px-10 py-4 font-body uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors">
              Start Shopping
            </button>
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-5xl mx-auto px-6 py-12">
        <div className="flex justify-between items-center mb-10">
          <h1 className="font-serif text-4xl text-foreground">Shopping Bag</h1>
          <button
            data-testid="button-clear-cart"
            onClick={handleClear}
            className="text-xs uppercase tracking-widest font-body text-muted-foreground hover:text-destructive transition-colors flex items-center gap-2"
          >
            <Trash2 size={14} /> Clear All
          </button>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12">
          {/* Items */}
          <div className="lg:col-span-2 space-y-6">
            {items.map((item) => (
              <div key={item.productId} className="flex gap-6 p-4 bg-card border border-border" data-testid={`cart-item-${item.productId}`}>
                <div className="w-24 h-28 bg-background overflow-hidden shrink-0">
                  <img
                    src={item.image}
                    alt={item.name}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = "/product-images/wallets-reference.jpg"; }}
                  />
                </div>
                <div className="flex-1">
                  <h3 className="font-serif text-lg text-foreground mb-1">{item.name}</h3>
                  {item.size && <p className="text-xs font-body text-muted-foreground mb-3">Size: {item.size}</p>}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center border border-border">
                      <button
                        data-testid={`qty-decrease-${item.productId}`}
                        onClick={() => handleQuantityChange(item.productId, item.quantity - 1)}
                        className="px-3 py-1 text-foreground hover:text-primary transition-colors font-body text-lg"
                      >-</button>
                      <span className="px-4 py-1 border-x border-border font-body text-sm">{item.quantity}</span>
                      <button
                        data-testid={`qty-increase-${item.productId}`}
                        onClick={() => handleQuantityChange(item.productId, item.quantity + 1)}
                        className="px-3 py-1 text-foreground hover:text-primary transition-colors font-body text-lg"
                      >+</button>
                    </div>
                    <div className="flex items-center gap-4">
                      <span className="font-serif text-lg text-primary">£{(item.price * item.quantity).toFixed(2)}</span>
                      <button
                        data-testid={`remove-item-${item.productId}`}
                        onClick={() => handleRemove(item.productId)}
                        className="text-muted-foreground hover:text-destructive transition-colors"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Order Summary */}
          <div className="bg-card border border-border p-6 h-fit">
            <h2 className="font-serif text-xl text-foreground mb-6">Order Summary</h2>
            <div className="space-y-3 mb-6">
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">Subtotal ({cart?.itemCount} items)</span>
                <span className="text-foreground">£{cart?.total.toFixed(2)}</span>
              </div>
              <div className="flex justify-between text-sm font-body">
                <span className="text-muted-foreground">UK Delivery</span>
                <span className="text-primary">Included</span>
              </div>
            </div>
            <div className="border-t border-border pt-4 mb-6">
              <div className="flex justify-between font-serif text-xl">
                <span>Total</span>
                <span className="text-primary">£{cart?.total.toFixed(2)}</span>
              </div>
            </div>
            <Link href="/checkout">
              <button data-testid="button-checkout" className="w-full bg-primary text-primary-foreground py-4 font-body uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors flex items-center justify-center gap-2">
                Proceed to Checkout <ArrowRight size={16} />
              </button>
            </Link>
            <Link href="/shop">
              <button data-testid="button-continue-shopping" className="w-full mt-3 border border-border text-foreground py-3 font-body text-xs uppercase tracking-widest hover:border-primary hover:text-primary transition-colors">
                Continue Shopping
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
