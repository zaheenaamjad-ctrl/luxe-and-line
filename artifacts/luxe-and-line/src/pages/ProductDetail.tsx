import { useState } from "react";
import { useParams } from "wouter";
import { useGetProduct, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ChevronLeft, ChevronRight, ShoppingBag, Check, Truck } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0");
  const [currentImage, setCurrentImage] = useState(0);
  const [selectedSize, setSelectedSize] = useState<string | null>(null);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: [["product", productId]] }
  });
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const images = (product?.images ?? []) as string[];

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate(
      { data: { productId: product.id, quantity, size: selectedSize } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          setAddedToCart(true);
          toast({ title: "Added to bag", description: `${product.name} added to your shopping bag.` });
          setTimeout(() => setAddedToCart(false), 3000);
        },
      }
    );
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto mb-4" />
          <p className="text-muted-foreground font-body text-sm">Loading product...</p>
        </div>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-foreground font-serif text-2xl mb-4">Product not found</p>
          <Link href="/shop" className="text-primary hover:underline font-body text-sm">Back to Shop</Link>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Breadcrumb */}
      <div className="max-w-7xl mx-auto px-6 pt-8 pb-4">
        <nav className="text-xs font-body text-muted-foreground flex items-center gap-2">
          <Link href="/" className="hover:text-primary transition-colors">Home</Link>
          <span>/</span>
          <Link href="/shop" className="hover:text-primary transition-colors">Shop</Link>
          <span>/</span>
          <span className="text-foreground">{product.name}</span>
        </nav>
      </div>

      <div className="max-w-7xl mx-auto px-6 pb-20">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-16">
          {/* Image Gallery */}
          <div className="space-y-4">
            <div className="relative bg-card aspect-square overflow-hidden group">
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                onError={(e) => {
                  (e.target as HTMLImageElement).src = "/product-images/wallets-reference.jpg";
                }}
              />
              {images.length > 1 && (
                <>
                  <button
                    data-testid="prev-image"
                    onClick={() => setCurrentImage((c) => (c - 1 + images.length) % images.length)}
                    className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronLeft size={20} />
                  </button>
                  <button
                    data-testid="next-image"
                    onClick={() => setCurrentImage((c) => (c + 1) % images.length)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/50 hover:bg-black/70 text-white p-2 transition-all opacity-0 group-hover:opacity-100"
                  >
                    <ChevronRight size={20} />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnail Strip */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    data-testid={`thumbnail-${i}`}
                    onClick={() => setCurrentImage(i)}
                    className={`w-20 h-20 overflow-hidden border-2 transition-all ${currentImage === i ? "border-primary" : "border-border hover:border-primary/50"}`}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover"
                      onError={(e) => { (e.target as HTMLImageElement).src = "/product-images/wallets-reference.jpg"; }} />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Product Info */}
          <div className="flex flex-col">
            <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-body mb-3">
              {product.category.replace("-", " ")}
            </p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">{product.name}</h1>

            <div className="flex items-baseline gap-3 mb-6">
              <span className="font-serif text-3xl text-primary">£{product.price}</span>
              {product.deliveryIncluded && (
                <span className="text-xs font-body text-muted-foreground flex items-center gap-1">
                  <Truck size={12} /> Free UK Delivery
                </span>
              )}
            </div>

            <div className="luxury-divider mb-6">
              <span className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body">Details</span>
            </div>

            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-8">{product.description}</p>

            {/* Stitching info */}
            {product.stitched !== null && product.stitched !== undefined && (
              <div className="bg-card border border-border px-4 py-3 mb-6 text-sm font-body text-muted-foreground">
                {product.stitched
                  ? "This product is sold stitched and delivered to your measurements. Please include your measurements in the order notes."
                  : "Available stitched (£75) or unstitched. Both options delivered. Please specify in order notes."}
              </div>
            )}

            {/* Sizes */}
            {(product.sizes as string[]).length > 0 && (
              <div className="mb-6">
                <p className="text-xs uppercase tracking-widest font-body text-muted-foreground mb-3">Select Size</p>
                <div className="flex flex-wrap gap-2">
                  {(product.sizes as string[]).map((size) => (
                    <button
                      key={size}
                      data-testid={`size-${size}`}
                      onClick={() => setSelectedSize(size)}
                      className={`px-4 py-2 text-xs border font-body transition-all ${
                        selectedSize === size
                          ? "border-primary bg-primary text-primary-foreground"
                          : "border-border text-foreground hover:border-primary"
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>
            )}

            {/* Colors */}
            {(product.colors as string[]).length > 0 && (
              <div className="mb-8">
                <p className="text-xs uppercase tracking-widest font-body text-muted-foreground mb-2">Available In</p>
                <p className="text-sm font-body text-foreground">{(product.colors as string[]).join(", ")}</p>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-4 mb-6">
              <p className="text-xs uppercase tracking-widest font-body text-muted-foreground">Qty</p>
              <div className="flex items-center border border-border">
                <button
                  data-testid="qty-decrease"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2 text-foreground hover:text-primary transition-colors font-body"
                >-</button>
                <span className="px-6 py-2 border-x border-border font-body text-sm">{quantity}</span>
                <button
                  data-testid="qty-increase"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2 text-foreground hover:text-primary transition-colors font-body"
                >+</button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              data-testid="button-add-to-cart"
              onClick={handleAddToCart}
              disabled={addToCart.isPending || !product.inStock}
              className={`w-full py-4 font-body uppercase tracking-widest text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-3 ${
                addedToCart
                  ? "bg-green-600 text-white"
                  : product.inStock
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-muted text-muted-foreground cursor-not-allowed"
              }`}
            >
              {addedToCart ? (
                <><Check size={18} /> Added to Bag</>
              ) : addToCart.isPending ? (
                <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <><ShoppingBag size={18} /> {product.inStock ? "Add to Bag" : "Out of Stock"}</>
              )}
            </button>

            {/* Trust signals */}
            <div className="mt-8 grid grid-cols-2 gap-4 text-xs font-body text-muted-foreground">
              <div className="flex items-center gap-2"><Truck size={14} className="text-primary" /> UK Delivery Included</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-primary" /> Authentic Designs</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-primary" /> Quality Guaranteed</div>
              <div className="flex items-center gap-2"><Check size={14} className="text-primary" /> Secure Checkout</div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
