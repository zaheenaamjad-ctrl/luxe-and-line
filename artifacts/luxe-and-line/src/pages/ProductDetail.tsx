import { useState, useEffect, useRef } from "react";
import { useParams } from "wouter";
import { useGetProduct, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { ShoppingBag, Check, Truck, ZoomIn, X, ChevronLeft, ChevronRight, RotateCcw } from "lucide-react";
import { Link } from "wouter";
import { useToast } from "@/hooks/use-toast";

function computeOriginalPrice(price: number): number {
  const bumped = price / 0.65;
  return Math.ceil(bumped / 5) * 5;
}

function ZoomModal({
  images,
  startIdx,
  onClose,
}: {
  images: string[];
  startIdx: number;
  onClose: () => void;
}) {
  const [idx, setIdx] = useState(startIdx);
  const [scale, setScale] = useState(1);
  const [pos, setPos] = useState({ x: 0, y: 0 });
  const [auto360, setAuto360] = useState(false);
  const dragging = useRef(false);
  const dragStart = useRef({ x: 0, y: 0, px: 0, py: 0 });
  const touchStart = useRef({ x: 0, y: 0 });
  const auto360Timer = useRef<ReturnType<typeof setInterval> | null>(null);

  useEffect(() => {
    setScale(1);
    setPos({ x: 0, y: 0 });
  }, [idx]);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
      if (e.key === "ArrowLeft") setIdx((i) => (i - 1 + images.length) % images.length);
      if (e.key === "ArrowRight") setIdx((i) => (i + 1) % images.length);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [images.length, onClose]);

  /* 360° auto-cycle */
  useEffect(() => {
    if (auto360 && images.length > 1) {
      auto360Timer.current = setInterval(() => {
        setIdx((i) => (i + 1) % images.length);
      }, 900);
    } else {
      if (auto360Timer.current) clearInterval(auto360Timer.current);
    }
    return () => { if (auto360Timer.current) clearInterval(auto360Timer.current); };
  }, [auto360, images.length]);

  const handleWheel = (e: React.WheelEvent) => {
    e.preventDefault();
    setScale((s) => Math.max(1, Math.min(5, s - e.deltaY * 0.002)));
  };

  const handleMouseDown = (e: React.MouseEvent) => {
    dragging.current = true;
    dragStart.current = { x: e.clientX, y: e.clientY, px: pos.x, py: pos.y };
  };
  const handleMouseMove = (e: React.MouseEvent) => {
    if (!dragging.current) return;
    if (scale > 1) {
      setPos({
        x: dragStart.current.px + (e.clientX - dragStart.current.x),
        y: dragStart.current.py + (e.clientY - dragStart.current.y),
      });
    }
  };
  const handleMouseUp = (e: React.MouseEvent) => {
    if (scale <= 1) {
      const dx = e.clientX - dragStart.current.x;
      if (Math.abs(dx) > 40) {
        if (dx < 0) setIdx((i) => (i + 1) % images.length);
        else setIdx((i) => (i - 1 + images.length) % images.length);
      }
    }
    dragging.current = false;
  };

  /* Touch swipe */
  const handleTouchStart = (e: React.TouchEvent) => {
    touchStart.current = { x: e.touches[0].clientX, y: e.touches[0].clientY };
  };
  const handleTouchEnd = (e: React.TouchEvent) => {
    const dx = touchStart.current.x - e.changedTouches[0].clientX;
    if (Math.abs(dx) > 50) {
      if (dx > 0) setIdx((i) => (i + 1) % images.length);
      else setIdx((i) => (i - 1 + images.length) % images.length);
    }
  };

  return (
    <div
      className="fixed inset-0 z-[200] bg-black/96 flex flex-col"
      onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}
    >
      {/* Top bar */}
      <div className="flex items-center justify-between px-5 py-3 border-b border-white/10">
        <div className="flex items-center gap-3">
          <p className="text-white/50 font-body text-xs uppercase tracking-widest">
            {idx + 1} / {images.length}
          </p>
          {images.length > 1 && (
            <button
              onClick={() => setAuto360((v) => !v)}
              className={`text-[9px] uppercase tracking-widest px-2.5 py-1 font-body font-semibold border transition-all ${
                auto360
                  ? "bg-primary border-primary text-white"
                  : "border-white/30 text-white/50 hover:border-primary hover:text-primary"
              }`}
            >
              360°
            </button>
          )}
        </div>
        <div className="flex items-center gap-3">
          <button
            onClick={() => { setScale(1); setPos({ x: 0, y: 0 }); }}
            className="text-white/40 hover:text-primary transition-colors"
            title="Reset zoom"
          >
            <RotateCcw size={15} />
          </button>
          <span className="text-white/25 font-body text-[10px] tabular-nums">{Math.round(scale * 100)}%</span>
          <button onClick={onClose} className="text-white/50 hover:text-white transition-colors">
            <X size={20} />
          </button>
        </div>
      </div>

      {/* Image area */}
      <div
        className="flex-1 relative overflow-hidden flex items-center justify-center select-none"
        onWheel={handleWheel}
        onMouseDown={handleMouseDown}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
        onMouseLeave={() => { dragging.current = false; }}
        onTouchStart={handleTouchStart}
        onTouchEnd={handleTouchEnd}
        style={{ cursor: scale > 1 ? "grabbing" : "zoom-in" }}
      >
        <img
          key={idx}
          src={images[idx]}
          alt=""
          draggable={false}
          className="max-h-full max-w-full object-contain"
          style={{
            transform: `scale(${scale}) translate(${pos.x / scale}px, ${pos.y / scale}px)`,
            transition: scale === 1 && pos.x === 0 && pos.y === 0 ? "opacity 0.25s ease" : "transform 0.08s ease",
          }}
          onClick={() => {
            if (!dragging.current) setScale((s) => (s >= 3 ? 1 : s + 1));
          }}
        />
        {/* 360 spinning label */}
        {auto360 && (
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 text-primary text-[10px] uppercase tracking-widest font-body bg-black/60 px-3 py-1 border border-primary/40">
            360° Auto · Click to stop
          </div>
        )}
      </div>

      {/* Controls hint */}
      <p className="text-center text-white/20 text-[9px] font-body tracking-widest py-1.5 uppercase">
        Scroll to zoom · Click to step · Drag to pan · Swipe to browse · 360° auto-cycle
      </p>

      {/* Thumbnail strip */}
      {images.length > 1 && (
        <div className="flex justify-center gap-2 pb-4 px-6 overflow-x-auto scrollbar-none">
          {images.map((img, i) => (
            <button
              key={i}
              onClick={() => setIdx(i)}
              className="shrink-0 w-14 h-14 overflow-hidden border-2 transition-all"
              style={{ borderColor: idx === i ? "hsl(270,80%,65%)" : "rgba(255,255,255,0.12)" }}
            >
              <img src={img} alt="" className="w-full h-full object-cover" />
            </button>
          ))}
        </div>
      )}

      {/* Prev / Next arrows */}
      {images.length > 1 && (
        <>
          <button
            onClick={() => setIdx((i) => (i - 1 + images.length) % images.length)}
            className="absolute left-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-primary text-white p-3 transition-all"
          >
            <ChevronLeft size={20} />
          </button>
          <button
            onClick={() => setIdx((i) => (i + 1) % images.length)}
            className="absolute right-3 top-1/2 -translate-y-1/2 bg-black/60 hover:bg-primary text-white p-3 transition-all"
          >
            <ChevronRight size={20} />
          </button>
        </>
      )}
    </div>
  );
}

export function ProductDetail() {
  const { id } = useParams<{ id: string }>();
  const productId = parseInt(id ?? "0");
  const [currentImage, setCurrentImage] = useState(0);
  const [quantity, setQuantity] = useState(1);
  const [addedToCart, setAddedToCart] = useState(false);
  const [zoomOpen, setZoomOpen] = useState(false);
  const [selectedSize, setSelectedSize] = useState<string>("M");

  const { data: product, isLoading } = useGetProduct(productId, {
    query: { enabled: !!productId, queryKey: [["product", productId]] }
  });
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const images = (product?.images ?? []) as string[];
  const isShalwarKameez = product?.category === "shalwar-kameez";
  const originalPrice = product ? computeOriginalPrice(product.price) : null;

  const handleAddToCart = () => {
    if (!product) return;
    addToCart.mutate(
      { data: { productId: product.id, quantity } },
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
      {zoomOpen && (
        <ZoomModal images={images} startIdx={currentImage} onClose={() => setZoomOpen(false)} />
      )}

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

          {/* ── Image Gallery ─────────────────────────────────────── */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className="relative bg-card overflow-hidden group cursor-zoom-in"
              style={{ aspectRatio: "3/4" }}
              onClick={() => setZoomOpen(true)}
            >
              <img
                src={images[currentImage]}
                alt={product.name}
                className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.04]"
              />
              {/* Zoom hint overlay */}
              <div className="absolute inset-0 bg-black/0 group-hover:bg-black/20 transition-all duration-300 flex items-center justify-center">
                <div className="bg-black/60 text-white px-4 py-2 flex items-center gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300 text-xs font-body uppercase tracking-widest">
                  <ZoomIn size={14} /> Click to zoom
                </div>
              </div>
              {/* Sale badge */}
              <div className="absolute top-3 right-3 bg-red-600 text-white text-[9px] uppercase tracking-widest px-3 py-1 font-body font-semibold">
                Sale
              </div>
            </div>

            {/* Thumbnail strip — view all angles */}
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
                {/* Click-to-zoom hint under thumbnails */}
                <button
                  onClick={() => setZoomOpen(true)}
                  className="w-[88px] h-[108px] border-2 border-dashed flex flex-col items-center justify-center gap-1 text-muted-foreground hover:text-primary hover:border-primary transition-all"
                  style={{ borderColor: "hsl(220,15%,18%)" }}
                >
                  <ZoomIn size={18} />
                  <span className="text-[9px] uppercase tracking-widest font-body">360°</span>
                </button>
              </div>
            )}
          </div>

          {/* ── Product Info ──────────────────────────────────────── */}
          <div className="flex flex-col lg:pt-4">
            {/* Category + unstitched badge */}
            <div className="flex items-center gap-3 mb-3">
              <p className="text-[10px] uppercase tracking-[0.3em] text-primary font-body">
                {product.category.replace(/-/g, " ")}
              </p>
              {isShalwarKameez && (
                <span className="text-[9px] uppercase tracking-widest font-body border border-primary/50 text-primary px-2 py-0.5">
                  Unstitched Lawn
                </span>
              )}
            </div>

            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-5 leading-tight">
              {product.name}
            </h1>

            {/* Price — Shopify style big white */}
            <div className="mb-5">
              {originalPrice && (
                <div className="flex items-center gap-2 mb-1">
                  <span className="bg-red-600 text-white text-[9px] uppercase tracking-widest px-2 py-0.5 font-body font-bold">SALE</span>
                  <span className="text-red-400 text-xs font-body">Save £{originalPrice - product.price} ({Math.round((1 - product.price / originalPrice) * 100)}% off)</span>
                </div>
              )}
              <div className="flex items-baseline gap-4">
                <span className="font-serif text-5xl text-white font-medium leading-none price-glow">
                  £{product.price}
                </span>
                {originalPrice && (
                  <span className="font-body text-2xl text-red-500 line-through font-medium">
                    £{originalPrice}
                  </span>
                )}
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

            {/* Size selector — S / M / L for shalwar kameez */}
            {isShalwarKameez && (
              <div className="mb-6">
                <div className="flex items-center justify-between mb-3">
                  <p className="text-xs uppercase tracking-widest font-body text-muted-foreground">Size</p>
                  <span className="text-primary text-xs font-body font-medium">{selectedSize} selected</span>
                </div>
                <div className="flex gap-3">
                  {["S", "M", "L"].map((size) => (
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
                  Unstitched fabric — we recommend ordering your usual size. Local stitching available.
                </p>
              </div>
            )}

            {/* Description */}
            <p className="text-muted-foreground font-body text-sm leading-[1.9] mb-6">
              {product.description}
            </p>

            {/* Unstitched info card */}
            {isShalwarKameez && (
              <div className="border border-primary/25 bg-primary/5 px-5 py-4 mb-6">
                <p className="text-primary text-[10px] uppercase tracking-widest font-body font-semibold mb-1">
                  What's included
                </p>
                <ul className="text-sm font-body text-muted-foreground space-y-1">
                  <li>· Kameez fabric (printed &amp; embroidered)</li>
                  <li>· Trouser fabric</li>
                  <li>· Dupatta / Chiffon scarf</li>
                  <li>· Delivered unstitched — take to any local tailor</li>
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
              href={`https://wa.me/447405358689?text=Hi%2C%20I%27d%20like%20to%20order%20${encodeURIComponent(product.name)}%20(%C2%A3${product.price})%20from%20Luxe%20%26%20Line`}
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
    </div>
  );
}
