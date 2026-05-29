import { useState, useEffect, useRef, useCallback } from "react";
import { useParams } from "wouter";
import { useGetProduct, useAddToCart, getGetCartQueryKey, useListProducts } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Check, Truck, ChevronLeft, ChevronRight } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

function computeOriginalPrice(price: number): number {
  const bumped = price / 0.65;
  return Math.ceil(bumped / 5) * 5;
}


export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0");
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("");
  const [customJeansSize, setCustomJeansSize] = useState<string>("");

  /* ── Data fetching (must come before zoom hooks that use images) ─ */
  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: [["product", productId]] }
  });
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const images = (product?.images ?? []) as string[];
  const isShalwarKameez = product?.category === "shalwar-kameez";
  const isJeans = product?.category === "jeans";
  const originalPrice = product ? computeOriginalPrice(product.price) : null;

  /* ── Inline zoom/pan/360 state ───────────────────────────── */
  const [imgScale, setImgScale] = useState(1);
  const [imgPos, setImgPos] = useState({ x: 0, y: 0 });
  const [auto360, setAuto360] = useState(false);
  const imgDragging = useRef(false);
  const imgDragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const imgTouchStart = useRef({ x: 0, y: 0 });
  const lastImgClick = useRef(0);
  const auto360Timer = useRef<ReturnType<typeof setInterval> | null>(null);
  const imgContainerRef = useRef<HTMLDivElement>(null);

  /* 360° auto-cycle */
  useEffect(() => {
    if (auto360) {
      auto360Timer.current = setInterval(() => {
        setCurrentImage((i) => (i + 1) % Math.max(1, images.length));
      }, 900);
    } else {
      if (auto360Timer.current) clearInterval(auto360Timer.current);
    }
    return () => { if (auto360Timer.current) clearInterval(auto360Timer.current); };
  }, [auto360, images.length]);

  /* Reset zoom when image changes */
  useEffect(() => {
    setImgScale(1);
    setImgPos({ x: 0, y: 0 });
  }, [currentImage]);

  /* Non-passive wheel listener for zoom */
  useEffect(() => {
    const el = imgContainerRef.current;
    if (!el) return;
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      setImgScale((s) => Math.max(1, Math.min(5, s - e.deltaY * 0.003)));
    };
    el.addEventListener("wheel", onWheel, { passive: false });
    return () => el.removeEventListener("wheel", onWheel);
  }, []);

  const handleImgMouseDown = useCallback((e: React.MouseEvent) => {
    imgDragging.current = true;
    imgDragStart.current = { x: e.clientX, y: e.clientY, px: imgPos.x, py: imgPos.y };
  }, [imgPos]);

  const handleImgMouseMove = useCallback((e: React.MouseEvent) => {
    if (!imgDragging.current) return;
    if (imgScale > 1) {
      setImgPos({
        x: imgDragStart.current.px + (e.clientX - imgDragStart.current.x),
        y: imgDragStart.current.py + (e.clientY - imgDragStart.current.y),
      });
    }
  }, [imgScale]);

  const handleImgMouseUp = useCallback((e: React.MouseEvent) => {
    if (imgScale <= 1) {
      const dx = e.clientX - imgDragStart.current.x;
      if (Math.abs(dx) > 40) {
        if (dx < 0) setCurrentImage((i) => (i + 1) % images.length);
        else setCurrentImage((i) => (i - 1 + images.length) % images.length);
      }
    }
    imgDragging.current = false;
  }, [imgScale, images.length]);

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate(
      { data: { productId: product.id, quantity, size: selectedSize || null } },
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
        <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center text-center">
        <div>
          <p className="font-serif text-2xl text-foreground mb-4">Product not found</p>
          <Link href="/shop" className="text-primary text-sm font-body hover:underline">Back to Shop</Link>
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

          {/* ── Image Gallery — inline zoom/pan/360 ───────────────── */}
          <div className="space-y-4">
            {/* Main image — scroll to zoom, drag to pan, swipe to browse */}
            <div
              ref={imgContainerRef}
              className="relative bg-card overflow-hidden select-none"
              style={{
                aspectRatio: "3/4",
                cursor: imgScale > 1 ? "grab" : "crosshair",
                touchAction: "none",
              }}
              onMouseDown={handleImgMouseDown}
              onMouseMove={handleImgMouseMove}
              onMouseUp={handleImgMouseUp}
              onMouseLeave={() => { imgDragging.current = false; }}
              onTouchStart={(e) => {
                imgTouchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
              }}
              onTouchEnd={(e) => {
                const dx = imgTouchStart.current.x - e.changedTouches[0].clientX;
                if (Math.abs(dx) > 50) {
                  if (dx > 0) setCurrentImage((i) => (i + 1) % images.length);
                  else setCurrentImage((i) => (i - 1 + images.length) % images.length);
                }
              }}
            >
              <img
                src={images[currentImage]}
                alt={product.name}
                draggable={false}
                className="w-full h-full object-cover"
                style={{
                  transform: `scale(${imgScale}) translate(${imgPos.x / imgScale}px, ${imgPos.y / imgScale}px)`,
                  transition: imgDragging.current ? "none" : "transform 0.12s ease",
                }}
                onClick={() => {
                  if (imgDragging.current) return;
                  const now = Date.now();
                  const elapsed = now - lastImgClick.current;
                  lastImgClick.current = now;
                  if (elapsed < 300) {
                    lastImgClick.current = 0;
                    setImgScale(1);
                    setImgPos({ x: 0, y: 0 });
                  } else {
                    setImgScale((s) => (s >= 4 ? 1 : s + 1));
                  }
                }}
              />

              {/* Zoom level indicator */}
              {imgScale > 1 && (
                <div className="absolute top-3 left-3 bg-black/70 text-white text-[9px] px-2.5 py-1 font-body tracking-widest z-10">
                  {Math.round(imgScale * 100)}%
                </div>
              )}

              {/* Bottom control bar */}
              <div className="absolute bottom-0 left-0 right-0 flex items-center justify-between px-3 py-2.5 bg-gradient-to-t from-black/70 to-transparent z-10">
                <div className="flex gap-1.5">
                  {imgScale > 1 && (
                    <button
                      onClick={(e) => { e.stopPropagation(); setImgScale(1); setImgPos({ x: 0, y: 0 }); }}
                      className="bg-black/70 hover:bg-primary text-white text-[9px] px-2 h-7 font-body uppercase tracking-widest transition-all"
                    >Reset</button>
                  )}
                </div>
                {images.length > 1 && (
                  <button
                    onClick={(e) => { e.stopPropagation(); setAuto360((v) => !v); }}
                    className={`text-[9px] px-2.5 h-7 font-body uppercase tracking-widest border transition-all ${
                      auto360
                        ? "bg-primary border-primary text-white"
                        : "bg-black/70 border-white/30 text-white hover:bg-primary hover:border-primary"
                    }`}
                  >
                    {auto360 ? "360° ·Stop" : "360°"}
                  </button>
                )}
              </div>

              {/* Prev / Next arrows */}
              {images.length > 1 && (
                <>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImage((i) => (i - 1 + images.length) % images.length); }}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-primary text-white p-2 transition-all z-10"
                  >
                    <ChevronLeft size={16} />
                  </button>
                  <button
                    onClick={(e) => { e.stopPropagation(); setCurrentImage((i) => (i + 1) % images.length) ; }}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-primary text-white p-2 transition-all z-10"
                  >
                    <ChevronRight size={16} />
                  </button>
                </>
              )}
            </div>

            {/* Controls hint */}
            <p className="text-[9px] uppercase tracking-widest font-body text-muted-foreground/60 text-center">
              Click to zoom · Double-click to reset · Drag to pan · Swipe to browse
            </p>

            {/* Thumbnail strip */}
            {images.length > 1 && (
              <div className="flex gap-3">
                {images.map((img, i) => (
                  <button
                    key={i}
                    data-testid={`thumbnail-${i}`}
                    onClick={() => setCurrentImage(i)}
                    className="relative overflow-hidden border-2 transition-all"
                    style={{
                      width: 88,
                      height: 108,
                      borderColor: currentImage === i ? "hsl(270,80%,65%)" : "hsl(265,18%,16%)",
                    }}
                  >
                    <img src={img} alt="" className="w-full h-full object-cover" />
                    {currentImage === i && (
                      <div className="absolute inset-0 bg-primary/10" />
                    )}
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── Product Info ──────────────────────────────────────── */}
          <div className="flex flex-col lg:pt-4">
            {/* Category + stitched badge */}
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-body">
                {product.category.replace(/-/g, " ")}
              </p>
              {isShalwarKameez && (
                <span className="text-[9px] uppercase tracking-widest font-body border border-primary/50 text-primary px-2 py-0.5">
                  Fully Stitched
                </span>
              )}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-5 leading-tight">
              {product.name}
            </h1>

            {/* Price */}
            <div className="mb-5">
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-5xl text-white font-medium leading-none price-glow">
                  £{product.price}
                </span>
              </div>
              {product.deliveryIncluded && (
                <p className="text-xs font-body text-muted-foreground flex items-center gap-1 mt-1.5">
                  <Truck size={11} /> Free UK delivery included
                </p>
              )}
            </div>

            {/* Purple divider */}
            <div
              className="mb-5"
              style={{
                height: 1,
                background: "linear-gradient(90deg, hsl(270,80%,65%), transparent)",
                width: "60%",
              }}
            />

            {/* Size selector — S / M / L / XL / XXL for shalwar kameez */}
            {isShalwarKameez && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest font-body text-muted-foreground">Size</p>
                  {selectedSize && <span className="text-primary text-xs font-body font-medium">{selectedSize} selected</span>}
                </div>
                <div className="flex flex-wrap gap-2">
                  {["XS", "S", "M", "L", "XL", "XXL"].map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className="font-body font-semibold text-sm transition-all duration-200"
                      style={{
                        width: 52,
                        height: 52,
                        border: selectedSize === size
                          ? "2px solid hsl(270,80%,65%)"
                          : "1px solid hsl(265,18%,22%)",
                        background: selectedSize === size
                          ? "hsl(270,80%,65%)"
                          : "transparent",
                        color: selectedSize === size ? "#fff" : "hsl(280,20%,75%)",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="text-muted-foreground text-[10px] font-body mt-2">
                  Fully stitched suit — select your size above. Sizes S–XXL available.
                </p>
              </div>
            )}

            {/* Size selector for jeans — waist × length */}
            {isJeans && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest font-body text-muted-foreground">Waist × Length <span className="text-muted-foreground/60">(inches)</span></p>
                  {selectedSize && <span className="text-primary text-xs font-body font-medium">{selectedSize}</span>}
                </div>
                <div className="flex flex-wrap gap-2 mb-4">
                  {["27×30", "28×31", "29×31", "30×30", "32×29", "32×30", "34×30", "34×31"].map((size) => (
                    <button
                      key={size}
                      onClick={() => { setSelectedSize(size); setCustomJeansSize(""); }}
                      className="font-body text-xs font-medium transition-all duration-200 px-3 py-2.5"
                      style={{
                        border: selectedSize === size && !customJeansSize
                          ? "2px solid hsl(270,80%,65%)"
                          : "1px solid hsl(265,18%,22%)",
                        background: selectedSize === size && !customJeansSize
                          ? "hsl(270,80%,65%)"
                          : "transparent",
                        color: selectedSize === size && !customJeansSize ? "#fff" : "hsl(280,20%,75%)",
                      }}
                    >
                      {size}
                    </button>
                  ))}
                </div>
                <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground mb-2">Or enter a custom size</p>
                <input
                  type="text"
                  value={customJeansSize}
                  onChange={(e) => { setCustomJeansSize(e.target.value); setSelectedSize(e.target.value); }}
                  placeholder="e.g. 31×32 or describe your measurements"
                  className="w-full bg-background border border-border/50 focus:border-primary px-3 py-2.5 text-sm font-body text-foreground placeholder:text-muted-foreground/40 focus:outline-none transition-colors"
                />
                <p className="text-muted-foreground text-[10px] font-body mt-2">
                  Waist × Length in inches. Not sure? WhatsApp us on +44 7449 507661 and we'll help.
                </p>
              </div>
            )}

            {/* Description */}
            <p className="text-muted-foreground font-body text-sm leading-[1.9] mb-6">
              {product.description}
            </p>

            {/* Stitched suit info card */}
            {isShalwarKameez && (
              <div className="border border-primary/25 bg-primary/5 px-5 py-4 mb-6">
                <p className="text-primary text-[10px] uppercase tracking-widest font-body font-semibold mb-1">
                  What's included
                </p>
                <ul className="text-sm font-body text-muted-foreground space-y-1">
                  <li>· Fully stitched embroidered kameez</li>
                  <li>· Matching stitched trouser</li>
                  <li>· Chiffon dupatta / scarf</li>
                  <li>· Ready to wear — delivered straight to your door</li>
                </ul>
              </div>
            )}

            {/* Quantity */}
            <div className="flex items-center gap-5 mb-6">
              <p className="text-xs uppercase tracking-widest font-body text-muted-foreground">Qty</p>
              <div className="flex items-center border border-border">
                <button
                  data-testid="qty-decrease"
                  onClick={() => setQuantity((q) => Math.max(1, q - 1))}
                  className="px-4 py-2.5 text-foreground hover:text-primary transition-colors font-body text-lg"
                >
                  −
                </button>
                <span className="px-6 py-2.5 border-x border-border font-body text-sm w-14 text-center">
                  {quantity}
                </span>
                <button
                  data-testid="qty-increase"
                  onClick={() => setQuantity((q) => q + 1)}
                  className="px-4 py-2.5 text-foreground hover:text-primary transition-colors font-body text-lg"
                >
                  +
                </button>
              </div>
            </div>

            {/* Add to Cart */}
            <button
              data-testid="button-add-to-cart"
              onClick={handleAddToCart}
              disabled={addToCart.isPending || !product.inStock}
              className="w-full py-4 font-body uppercase tracking-[0.2em] text-sm font-semibold transition-all duration-300 flex items-center justify-center gap-3 mb-4"
              style={{
                background: addedToCart
                  ? "hsl(142,60%,35%)"
                  : product.inStock
                  ? "hsl(270,80%,65%)"
                  : "hsl(265,15%,20%)",
                color: "#fff",
                cursor: product.inStock ? "pointer" : "not-allowed",
              }}
            >
              {addedToCart ? (
                <><Check size={18} /> Added to Bag</>
              ) : addToCart.isPending ? (
                <div className="w-5 h-5 border-2 border-primary-foreground/50 border-t-transparent rounded-full animate-spin" />
              ) : (
                <><ShoppingBag size={18} /> {product.inStock ? "Add to Bag" : "Out of Stock"}</>
              )}
            </button>

            {/* WhatsApp quick order */}
            <a
              href={`https://wa.me/447449507661?text=Hi%2C%20I%27d%20like%20to%20order%20${encodeURIComponent(product.name)}%20(%C2%A3${product.price})%20x${quantity}${selectedSize ? `%20%E2%80%94%20Size%3A%20${encodeURIComponent(selectedSize)}` : ""}%20from%20Luxe%20%26%20Line`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-full py-3.5 border font-body uppercase tracking-[0.2em] text-xs font-medium transition-all duration-300 flex items-center justify-center gap-2 mb-8 hover:bg-green-900/30"
              style={{ borderColor: "hsl(142,50%,35%)", color: "hsl(142,60%,55%)" }}
            >
              <svg viewBox="0 0 24 24" width="14" height="14" fill="currentColor">
                <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
              </svg>
              Order via WhatsApp
            </a>

            {/* Trust signals */}
            <div className="grid grid-cols-2 gap-3 text-xs font-body text-muted-foreground border-t border-border pt-6">
              <div className="flex items-center gap-2"><Truck size={13} className="text-primary" /> UK Delivery Included</div>
              <div className="flex items-center gap-2"><Check size={13} className="text-primary" /> Authentic Designs</div>
              <div className="flex items-center gap-2"><Check size={13} className="text-primary" /> Quality Guaranteed</div>
              <div className="flex items-center gap-2"><ShoppingBag size={13} className="text-primary" /> Secure Checkout</div>
            </div>
          </div>
        </div>
      </div>

      {/* Related Products */}
      {product && <RelatedProducts category={product.category} currentId={product.id} />}
    </div>
  );
}

function RelatedProducts({ category, currentId }: { category: string; currentId: number }) {
  const { data: products } = useListProducts(
    category ? { category } : {},
    { query: { queryKey: [["related", category]] } }
  );
  const GOLD = "hsl(43,65%,50%)";

  const related = (products ?? []).filter((p) => p.id !== currentId).slice(0, 4);
  if (!related.length) return null;

  return (
    <div className="border-t border-border/30 bg-card/20">
      <div className="max-w-7xl mx-auto px-6 py-16">
        <div className="text-center mb-10">
          <p className="text-[10px] uppercase tracking-[0.4em] font-body mb-3" style={{ color: GOLD }}>
            You May Also Like
          </p>
          <h2 className="font-serif text-3xl text-foreground">
            More from <em style={{ color: GOLD }}>{category.replace(/-/g, " ")}</em>
          </h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
          {related.map((p) => {
            const imgs = (p.images as string[]) ?? [];
            return (
              <Link key={p.id} href={`/product/${p.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden mb-3" style={{ aspectRatio: "3/4" }}>
                    <img
                      src={imgs[0]}
                      alt={p.name}
                      loading="lazy"
                      className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/0 group-hover:bg-black/30 transition-colors duration-400" />
                  </div>
                  <h3 className="font-serif text-sm text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
                    {p.name}
                  </h3>
                  <p className="font-serif text-base font-semibold" style={{ color: GOLD }}>£{p.price}</p>
                </div>
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}
