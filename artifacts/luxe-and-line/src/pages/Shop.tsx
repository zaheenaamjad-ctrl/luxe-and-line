import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { Filter, ArrowRight } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All Products" },
  { value: "shalwar-kameez", label: "Shalwar Kameez" },
  { value: "jeans", label: "Jeans" },
  { value: "wallets", label: "Wallets" },
  { value: "food", label: "Gourmet" },
];

const GOLD = "hsl(43,65%,50%)";

function RevealSection({ children, delay = 0 }: { children: React.ReactNode; delay?: number }) {
  const [vis, setVis] = useState(false);
  const ref = (el: HTMLDivElement | null) => {
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.05, rootMargin: "0px 0px -20px 0px" }
    );
    obs.observe(el);
  };
  return (
    <div
      ref={ref}
      style={{
        transition: `opacity 0.8s ease ${delay}ms, transform 0.8s ease ${delay}ms`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(24px)",
      }}
    >
      {children}
    </div>
  );
}

function ProductCard({ product, delay = 0 }: {
  product: {
    id: number;
    name: string;
    price: number;
    category: string;
    images: unknown;
    featured?: boolean | null;
    deliveryIncluded?: boolean | null;
  };
  delay?: number;
}) {
  const images = (product.images as string[]) ?? [];
  const [hovered, setHovered] = useState(false);

  return (
    <RevealSection delay={delay}>
      <Link href={`/product/${product.id}`}>
        <div
          className="group cursor-pointer"
          onMouseEnter={() => setHovered(true)}
          onMouseLeave={() => setHovered(false)}
        >
          <div className="relative overflow-hidden bg-card mb-4" style={{ aspectRatio: "3/4" }}>
            <img
              src={images[0]}
              alt={product.name}
              loading="lazy"
              className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
              style={{ transform: hovered ? "scale(1.06)" : "scale(1)", opacity: hovered && images[1] ? 0 : 1 }}
            />
            {images[1] && (
              <img
                src={images[1]}
                alt={product.name}
                loading="lazy"
                className="absolute inset-0 w-full h-full object-cover transition-all duration-700"
                style={{ transform: hovered ? "scale(1.04)" : "scale(1.08)", opacity: hovered ? 1 : 0 }}
              />
            )}

            {/* SALE badge */}
            {product.featured && (
              <div className="absolute top-3 left-3 z-10 bg-red-600 text-white text-[9px] uppercase tracking-widest px-3 py-1.5 font-body font-semibold shadow-lg">
                Sale
              </div>
            )}

            {/* Hover overlay */}
            <div
              className="absolute inset-0 bg-black/50 flex items-end pb-6 px-4 transition-opacity duration-400"
              style={{ opacity: hovered ? 1 : 0 }}
            >
              <span className="text-white text-[10px] uppercase tracking-[0.25em] font-body border-b pb-1 flex items-center gap-2" style={{ borderColor: GOLD }}>
                View Details <ArrowRight size={10} />
              </span>
            </div>
          </div>

          <div>
            <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-1">
              {product.category.replace(/-/g, " ")}
            </p>
            <h3 className="font-serif text-base text-foreground group-hover:text-primary transition-colors duration-300 leading-tight mb-1">
              {product.name}
            </h3>
            <div className="flex items-baseline gap-2">
              <p className="font-serif text-lg font-semibold" style={{ color: GOLD }}>
                £{product.price}
              </p>
              {product.deliveryIncluded && (
                <span className="text-muted-foreground text-[10px] font-body uppercase tracking-wide">
                  incl. delivery
                </span>
              )}
            </div>
          </div>
        </div>
      </Link>
    </RevealSection>
  );
}

export function Shop() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const [activeCategory, setActiveCategory] = useState(params.get("category") ?? "");

  const { data: products, isLoading } = useListProducts(
    activeCategory ? { category: activeCategory } : {}
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Page hero */}
      <div className="relative overflow-hidden border-b border-border/30" style={{ height: "44vh", minHeight: 280 }}>
        <div
          className="absolute inset-0"
          style={{
            backgroundImage: "linear-gradient(hsl(265,28%,10%) 1px, transparent 1px), linear-gradient(90deg, hsl(265,28%,10%) 1px, transparent 1px)",
            backgroundSize: "60px 60px",
            backgroundColor: "hsl(265,30%,6%)",
          }}
        />
        <div
          className="absolute inset-0"
          style={{ background: "radial-gradient(ellipse at 50% 120%, rgba(167,139,250,0.08) 0%, transparent 65%)" }}
        />
        <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-6">
          <p className="text-[10px] uppercase tracking-[0.45em] font-body mb-5" style={{ color: GOLD }}>
            Our Collection
          </p>
          <h1 className="font-serif mb-5 leading-none" style={{ fontSize: "clamp(3rem, 8vw, 7rem)" }}>
            <span className="text-white">The </span>
            <em style={{ color: GOLD }}>Edit</em>
          </h1>
          <div style={{ width: 80, height: 1, background: `linear-gradient(90deg, transparent, ${GOLD}, transparent)` }} />
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category filter bar */}
        <div className="flex items-center gap-2 mb-12 overflow-x-auto pb-2 scrollbar-none">
          <Filter size={13} className="text-primary shrink-0 opacity-60" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              data-testid={`filter-${cat.value || "all"}`}
              onClick={() => setActiveCategory(cat.value)}
              className="px-6 py-2.5 text-[10px] uppercase tracking-[0.25em] font-body border transition-all duration-300 whitespace-nowrap"
              style={{
                borderColor: activeCategory === cat.value ? GOLD : "hsl(265,20%,22%)",
                background: activeCategory === cat.value ? GOLD : "transparent",
                color: activeCategory === cat.value ? "hsl(265,30%,8%)" : "hsl(265,10%,60%)",
              }}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {!isLoading && products && (
          <p className="text-xs font-body text-muted-foreground mb-8 tracking-widest uppercase">
            {products.length} {activeCategory ? activeCategory.replace(/-/g, " ") : "items in collection"}
          </p>
        )}

        {isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-card mb-3" style={{ aspectRatio: "3/4" }} />
                <div className="h-3 bg-card w-1/2 mb-2" />
                <div className="h-4 bg-card w-3/4 mb-2" />
                <div className="h-3 bg-card w-1/3" />
              </div>
            ))}
          </div>
        )}

        {!isLoading && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-x-6 gap-y-12">
            {(products ?? []).map((product, i) => (
              <ProductCard key={product.id} product={product} delay={i * 40} />
            ))}
          </div>
        )}

        {!isLoading && !products?.length && (
          <div className="py-32 text-center">
            <p className="font-serif text-2xl text-muted-foreground mb-3">Nothing here yet</p>
            <p className="font-body text-sm text-muted-foreground">Try a different filter.</p>
          </div>
        )}
      </div>
    </div>
  );
}
