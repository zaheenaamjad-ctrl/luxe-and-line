import { useState } from "react";
import { Link, useSearch } from "wouter";
import { useListProducts } from "@workspace/api-client-react";
import { ShoppingBag, Filter } from "lucide-react";

const CATEGORIES = [
  { value: "", label: "All Products" },
  { value: "shalwar-kameez", label: "Shalwar Kameez" },
  { value: "jeans", label: "Jeans" },
  { value: "wallets", label: "Wallets" },
  { value: "food", label: "Gourmet" },
];

export function Shop() {
  const search = useSearch();
  const params = new URLSearchParams(search);
  const initialCat = params.get("category") ?? "";
  const [activeCategory, setActiveCategory] = useState(initialCat);

  const { data: products, isLoading } = useListProducts(
    activeCategory ? { category: activeCategory } : {}
  );

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Banner */}
      <div className="relative h-64 bg-gradient-to-r from-background via-card to-background flex items-center justify-center overflow-hidden">
        <div className="absolute inset-0 opacity-10" style={{
          backgroundImage: "repeating-linear-gradient(45deg, transparent, transparent 40px, rgba(201,168,76,0.1) 40px, rgba(201,168,76,0.1) 41px)"
        }} />
        <div className="text-center relative z-10">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-3">Our Collection</p>
          <h1 className="text-5xl md:text-6xl font-serif gold-shimmer mb-4">The Edit</h1>
          <div className="luxury-divider w-40 mx-auto">
            <span className="text-xs text-primary tracking-[0.2em] font-body">LUXE & LINE</span>
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-6 py-12">
        {/* Category Filter */}
        <div className="flex items-center gap-2 mb-10 overflow-x-auto pb-2">
          <Filter size={14} className="text-primary shrink-0" />
          {CATEGORIES.map((cat) => (
            <button
              key={cat.value}
              data-testid={`filter-${cat.value || "all"}`}
              onClick={() => setActiveCategory(cat.value)}
              className={`px-5 py-2 text-xs uppercase tracking-widest font-body border transition-all duration-300 whitespace-nowrap ${
                activeCategory === cat.value
                  ? "bg-primary text-primary-foreground border-primary"
                  : "border-border text-muted-foreground hover:border-primary hover:text-primary"
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Products Grid */}
        {isLoading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {Array.from({ length: 8 }).map((_, i) => (
              <div key={i} className="animate-pulse">
                <div className="bg-card h-80 mb-4" />
                <div className="h-4 bg-card w-3/4 mb-2" />
                <div className="h-4 bg-card w-1/2" />
              </div>
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-8">
            {(products ?? []).map((product) => (
              <Link key={product.id} href={`/product/${product.id}`} data-testid={`card-product-${product.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden bg-card aspect-[3/4] mb-4">
                    <img
                      src={(product.images as string[])[0]}
                      alt={product.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-700"
                      onError={(e) => {
                        (e.target as HTMLImageElement).src = "/product-images/wallets-reference.jpg";
                      }}
                    />
                    {product.featured && (
                      <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[10px] uppercase tracking-widest px-3 py-1 font-body">
                        Featured
                      </div>
                    )}
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-xs uppercase tracking-widest font-body border border-white px-6 py-3">View Details</span>
                    </div>
                  </div>
                  <div>
                    <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-1">
                      {product.category.replace("-", " ")}
                    </p>
                    <h3 className="font-serif text-lg text-foreground mb-1 group-hover:text-primary transition-colors">{product.name}</h3>
                    <p className="text-primary font-body font-medium">
                      £{product.price}
                      {product.deliveryIncluded && <span className="text-muted-foreground text-xs ml-1">inc. delivery</span>}
                    </p>
                  </div>
                </div>
              </Link>
            ))}
          </div>
        )}

        {products?.length === 0 && (
          <div className="text-center py-24">
            <ShoppingBag size={48} className="mx-auto text-muted-foreground mb-4" />
            <p className="text-muted-foreground font-body">No products found in this category.</p>
          </div>
        )}
      </div>
    </div>
  );
}
