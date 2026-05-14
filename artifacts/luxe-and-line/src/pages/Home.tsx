import { useEffect, useRef, useState } from "react";
import { Link } from "wouter";
import { ChevronDown, ChevronUp, ArrowRight } from "lucide-react";
import { useListProducts, useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

const VIDEO_SECTIONS = [
  {
    src: "/videos/video1.mp4",
    title: "ELEGANCE REDEFINED",
    subtitle: "Luxury Shalwar Kameez for the Modern Woman",
    cta: "Shop Now",
    link: "/shop?category=shalwar-kameez",
  },
  {
    src: "/videos/video2.mp4",
    title: "CRAFTED FOR YOU",
    subtitle: "Premium Embroidered Suits, Delivered to Your Door",
    cta: "Explore Collection",
    link: "/shop",
  },
  {
    src: "/videos/video3.mp4",
    title: "DENIM LUXE",
    subtitle: "Premium Jeans, Styled for the UK Streets",
    cta: "Shop Jeans",
    link: "/shop?category=jeans",
  },
];

function VideoHero() {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const [pastVideos, setPastVideos] = useState(false);
  const heroRef = useRef<HTMLDivElement>(null);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goTo = (idx: number) => {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setCurrent(idx);
    setTimeout(() => setTransitioning(false), 900);
  };

  const next = () => {
    if (current < VIDEO_SECTIONS.length - 1) goTo(current + 1);
    else setPastVideos(true);
  };

  const prev = () => {
    if (pastVideos) { setPastVideos(false); return; }
    if (current > 0) goTo(current - 1);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      if (pastVideos) return;
      e.preventDefault();
      if (e.deltaY > 40) next();
      else if (e.deltaY < -40) prev();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") next();
      if (e.key === "ArrowUp") prev();
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKey);
    };
  }, [current, pastVideos, transitioning]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === current) v.play().catch(() => {});
      else { v.pause(); v.currentTime = 0; }
    });
  }, [current]);

  if (pastVideos) return null;

  return (
    <div
      ref={heroRef}
      className="fixed inset-0 z-40 bg-black overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {VIDEO_SECTIONS.map((vid, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-all duration-900 ease-in-out"
          style={{
            opacity: current === idx ? 1 : 0,
            transform: current === idx ? "translateY(0)" : idx < current ? "translateY(-8%)" : "translateY(8%)",
            zIndex: current === idx ? 2 : 1,
            pointerEvents: current === idx ? "auto" : "none",
          }}
        >
          <video
            ref={(el) => { videoRefs.current[idx] = el; }}
            src={vid.src}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay={idx === 0}
            muted
            loop
            playsInline
          />
          {/* Dark overlay */}
          <div className="absolute inset-0 video-overlay" />

          {/* Content */}
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-primary font-body mb-4 opacity-80">
              Luxe & Line — {idx === 2 ? "Denim" : "Couture"}
            </p>
            <h1 className="font-serif text-5xl md:text-8xl text-white mb-6 tracking-wider uppercase drop-shadow-2xl leading-tight">
              {vid.title}
            </h1>
            <p className="font-body text-base md:text-xl text-white/80 mb-10 max-w-xl tracking-wide">
              {vid.subtitle}
            </p>
            <Link href={vid.link}>
              <button
                data-testid={`button-video-cta-${idx}`}
                className="group border border-white text-white px-10 py-4 uppercase tracking-[0.25em] text-xs font-body hover:bg-primary hover:border-primary transition-all duration-300 flex items-center gap-3"
              >
                {vid.cta}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      ))}

      {/* Navigation Dots */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        {VIDEO_SECTIONS.map((_, idx) => (
          <button
            key={idx}
            data-testid={`dot-video-${idx}`}
            onClick={() => goTo(idx)}
            className={`rounded-full transition-all duration-500 ${
              current === idx ? "bg-primary w-2 h-10" : "bg-white/40 hover:bg-white/70 w-2 h-2"
            }`}
          />
        ))}
      </div>

      {/* Up/Down Arrows */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-3">
        {current > 0 && (
          <button
            data-testid="button-prev-video"
            onClick={prev}
            className="text-white/60 hover:text-primary transition-colors p-2"
          >
            <ChevronUp size={28} />
          </button>
        )}
        <button
          data-testid="button-next-video"
          onClick={next}
          className="text-white/60 hover:text-primary transition-colors p-2 animate-bounce"
        >
          <ChevronDown size={28} />
        </button>
        <span className="text-white/30 text-[9px] uppercase tracking-[0.3em] font-body">
          {current < VIDEO_SECTIONS.length - 1 ? "scroll" : "discover more"}
        </span>
      </div>

      {/* Video counter */}
      <div className="absolute top-8 right-8 z-50 text-white/40 text-xs font-body tracking-widest">
        {String(current + 1).padStart(2, "0")} / {String(VIDEO_SECTIONS.length).padStart(2, "0")}
      </div>
    </div>
  );
}

function FeaturedProducts() {
  const { data: products } = useListProducts({ featured: true });
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  const handleAdd = (product: NonNullable<typeof products>[0]) => {
    addToCart.mutate(
      { data: { productId: product.id, quantity: 1, size: null } },
      {
        onSuccess: () => {
          queryClient.invalidateQueries({ queryKey: getGetCartQueryKey() });
          toast({ title: "Added to bag", description: `${product.name} added.` });
        },
      }
    );
  };

  if (!products?.length) return null;

  return (
    <section className="py-24 px-6 bg-background">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mb-4">Curated For You</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Featured Collection</h2>
          <div className="luxury-divider w-40 mx-auto" />
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {products.slice(0, 8).map((p, i) => (
            <div
              key={p.id}
              className="group fade-in-up"
              style={{ animationDelay: `${i * 0.1}s` }}
              data-testid={`card-featured-${p.id}`}
            >
              <Link href={`/product/${p.id}`}>
                <div className="relative overflow-hidden bg-card aspect-[3/4] mb-4 cursor-pointer">
                  <img
                    src={(p.images as string[])[0]}
                    alt={p.name}
                    className="w-full h-full object-cover group-hover:scale-108 transition-transform duration-700"
                    style={{ transform: "scale(1)" }}
                    onMouseEnter={e => (e.currentTarget.style.transform = "scale(1.05)")}
                    onMouseLeave={e => (e.currentTarget.style.transform = "scale(1)")}
                    onError={(e) => { (e.target as HTMLImageElement).src = "/product-images/wallets-reference.jpg"; }}
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex flex-col items-center justify-center gap-3">
                    <span className="text-white text-[10px] uppercase tracking-widest font-body border border-white px-5 py-2">View Details</span>
                  </div>
                  <div className="absolute top-3 left-3 bg-primary text-primary-foreground text-[9px] uppercase tracking-widest px-2 py-1 font-body">
                    Featured
                  </div>
                </div>
              </Link>
              <p className="text-[9px] uppercase tracking-[0.2em] text-muted-foreground font-body mb-1">
                {p.category.replace("-", " ")}
              </p>
              <h3 className="font-serif text-lg text-foreground mb-1 group-hover:text-primary transition-colors">
                {p.name}
              </h3>
              <div className="flex items-center justify-between">
                <span className="text-primary font-body font-medium text-sm">
                  £{p.price}
                  {p.deliveryIncluded && <span className="text-muted-foreground text-xs ml-1">inc. del.</span>}
                </span>
                <button
                  data-testid={`button-quick-add-${p.id}`}
                  onClick={() => handleAdd(p)}
                  className="text-[9px] uppercase tracking-widest font-body text-muted-foreground hover:text-primary transition-colors border border-transparent hover:border-primary px-2 py-1"
                >
                  + Bag
                </button>
              </div>
            </div>
          ))}
        </div>

        <div className="text-center mt-12">
          <Link href="/shop">
            <button data-testid="button-view-all" className="border border-primary text-primary px-12 py-4 uppercase tracking-[0.25em] text-xs font-body hover:bg-primary hover:text-primary-foreground transition-all duration-300 flex items-center gap-3 mx-auto">
              View All Products <ArrowRight size={14} />
            </button>
          </Link>
        </div>
      </div>
    </section>
  );
}

function BrandStory() {
  return (
    <section className="py-24 px-6 bg-card border-t border-border">
      <div className="max-w-5xl mx-auto grid grid-cols-1 md:grid-cols-2 gap-16 items-center">
        <div>
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mb-4">Our Promise</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-6 leading-tight">
            Lahore's Finest,<br />Delivered to Liverpool
          </h2>
          <p className="text-muted-foreground font-body text-sm leading-relaxed mb-6">
            We curate only the finest pieces from Pakistan's most celebrated fashion houses — Nureh, Charizma, Zeenet — and deliver them directly to your door across the UK. Every piece tells a story of craftsmanship, heritage, and artistry.
          </p>
          <div className="space-y-3 mb-8">
            {["Free UK delivery on all orders", "Authentic designs, premium quality", "Available stitched to your measurements", "WhatsApp support — fast, personal service"].map((point) => (
              <div key={point} className="flex items-center gap-3 text-sm font-body text-foreground">
                <div className="w-1 h-1 bg-primary rounded-full" />
                {point}
              </div>
            ))}
          </div>
          <Link href="/about">
            <button data-testid="button-our-story" className="text-xs uppercase tracking-widest font-body text-primary hover:text-foreground transition-colors flex items-center gap-2 border-b border-primary pb-1">
              Our Story <ArrowRight size={12} />
            </button>
          </Link>
        </div>
        <div className="grid grid-cols-2 gap-4">
          {[
            { num: "500+", label: "Happy Customers" },
            { num: "3", label: "Luxury Brands" },
            { num: "100%", label: "UK Delivery" },
            { num: "5★", label: "Customer Rating" },
          ].map((s) => (
            <div key={s.label} className="bg-background border border-border p-6 text-center float-animation" style={{ animationDelay: `${Math.random() * 2}s` }}>
              <p className="font-serif text-3xl text-primary mb-1">{s.num}</p>
              <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground">{s.label}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

function Categories() {
  const cats = [
    { label: "Shalwar Kameez", value: "shalwar-kameez", desc: "Traditional luxury, modern elegance" },
    { label: "Premium Jeans", value: "jeans", desc: "UK street style meets South Asian craft" },
    { label: "Leather Wallets", value: "wallets", desc: "Handcrafted accessories for the discerning" },
    { label: "Gourmet", value: "food", desc: "Pistachio Kunafa Bites & more" },
  ];

  return (
    <section className="py-24 px-6 bg-background border-t border-border">
      <div className="max-w-7xl mx-auto">
        <div className="text-center mb-16">
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mb-4">Explore</p>
          <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Shop by Category</h2>
          <div className="luxury-divider w-40 mx-auto" />
        </div>
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {cats.map((cat) => (
            <Link key={cat.value} href={`/shop?category=${cat.value}`}>
              <div data-testid={`link-category-${cat.value}`} className="group bg-card border border-border p-8 text-center hover:border-primary transition-all duration-300 cursor-pointer h-48 flex flex-col items-center justify-center">
                <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors mb-2">{cat.label}</h3>
                <p className="text-[10px] font-body text-muted-foreground uppercase tracking-wider">{cat.desc}</p>
                <div className="mt-4 text-[10px] uppercase tracking-widest font-body text-primary opacity-0 group-hover:opacity-100 transition-opacity flex items-center gap-1">
                  Shop Now <ArrowRight size={10} />
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}

export function Home() {
  const [videosDone, setVideosDone] = useState(false);

  useEffect(() => {
    const handleWheel = () => {};
    return () => {};
  }, []);

  return (
    <div className="w-full">
      {/* Fixed video hero — occupies full screen, blocks scroll */}
      {!videosDone && (
        <div className="fixed inset-0 z-40">
          <VideoHeroWithCallback onExit={() => setVideosDone(true)} />
        </div>
      )}

      {/* Main content — visible after videos */}
      <div className={videosDone ? "block" : "invisible"}>
        <FeaturedProducts />
        <Categories />
        <BrandStory />

        {/* Contact Strip */}
        <section className="py-16 px-6 bg-card border-t border-border text-center">
          <p className="text-[10px] uppercase tracking-[0.35em] text-primary font-body mb-3">Get in Touch</p>
          <h2 className="font-serif text-3xl text-foreground mb-6">Questions? We're here for you.</h2>
          <div className="flex flex-col sm:flex-row items-center justify-center gap-6 text-sm font-body text-muted-foreground">
            <a href="tel:+447405358689" className="hover:text-primary transition-colors flex items-center gap-2">
              +44 7405 358689
            </a>
            <span className="hidden sm:block text-border">|</span>
            <a href="mailto:hello@luxeandline.co.uk" className="hover:text-primary transition-colors">
              hello@luxeandline.co.uk
            </a>
            <span className="hidden sm:block text-border">|</span>
            <span>39 Stanley Street, Liverpool L7 0JN</span>
          </div>
          <div className="mt-8">
            <Link href="/contact">
              <button data-testid="button-contact-us" className="border border-primary text-primary px-10 py-3 uppercase tracking-[0.25em] text-xs font-body hover:bg-primary hover:text-primary-foreground transition-all duration-300">
                Contact Us
              </button>
            </Link>
          </div>
        </section>
      </div>
    </div>
  );
}

function VideoHeroWithCallback({ onExit }: { onExit: () => void }) {
  const [current, setCurrent] = useState(0);
  const [transitioning, setTransitioning] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);

  const goTo = (idx: number) => {
    if (transitioning || idx === current) return;
    setTransitioning(true);
    setCurrent(idx);
    setTimeout(() => setTransitioning(false), 900);
  };

  const next = () => {
    if (current < VIDEO_SECTIONS.length - 1) goTo(current + 1);
    else onExit();
  };

  const prev = () => {
    if (current > 0) goTo(current - 1);
  };

  useEffect(() => {
    const handleWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 40) next();
      else if (e.deltaY < -40) prev();
    };
    const handleKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown") next();
      if (e.key === "ArrowUp") prev();
    };
    window.addEventListener("wheel", handleWheel, { passive: false });
    window.addEventListener("keydown", handleKey);
    return () => {
      window.removeEventListener("wheel", handleWheel);
      window.removeEventListener("keydown", handleKey);
    };
  }, [current, transitioning]);

  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === current) v.play().catch(() => {});
      else { v.pause(); v.currentTime = 0; }
    });
  }, [current]);

  return (
    <div className="w-full h-full bg-black overflow-hidden" style={{ touchAction: "none" }}>
      {VIDEO_SECTIONS.map((vid, idx) => (
        <div
          key={idx}
          className="absolute inset-0 transition-all ease-in-out"
          style={{
            transitionDuration: "900ms",
            opacity: current === idx ? 1 : 0,
            transform: current === idx ? "translateY(0)" : idx < current ? "translateY(-6%)" : "translateY(6%)",
            zIndex: current === idx ? 2 : 1,
            pointerEvents: current === idx ? "auto" : "none",
          }}
        >
          <video
            ref={(el) => { videoRefs.current[idx] = el; }}
            src={vid.src}
            className="absolute inset-0 w-full h-full object-cover"
            autoPlay={idx === 0}
            muted
            loop
            playsInline
          />
          <div className="absolute inset-0 video-overlay" />
          <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-8 z-10">
            <p className="text-[10px] md:text-xs uppercase tracking-[0.4em] text-primary font-body mb-6 opacity-80">
              Luxe & Line — {idx === 2 ? "Denim" : "Couture"}
            </p>
            <h1 className="font-serif text-5xl md:text-8xl lg:text-9xl text-white mb-6 tracking-wider uppercase drop-shadow-2xl leading-none">
              {vid.title}
            </h1>
            <p className="font-body text-sm md:text-lg text-white/80 mb-10 max-w-xl tracking-wide">
              {vid.subtitle}
            </p>
            <Link href={vid.link}>
              <button
                data-testid={`button-video-cta-${idx}`}
                className="group border border-white/70 text-white px-10 py-4 uppercase tracking-[0.25em] text-xs font-body hover:bg-primary hover:border-primary transition-all duration-300 flex items-center gap-3"
              >
                {vid.cta}
                <ArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
              </button>
            </Link>
          </div>
        </div>
      ))}

      {/* Dots */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 flex flex-col gap-4 z-50">
        {VIDEO_SECTIONS.map((_, idx) => (
          <button
            key={idx}
            data-testid={`dot-video-${idx}`}
            onClick={() => goTo(idx)}
            className="rounded-full transition-all duration-500"
            style={{
              width: "8px",
              height: current === idx ? "40px" : "8px",
              backgroundColor: current === idx ? "hsl(43 65% 50%)" : "rgba(255,255,255,0.4)",
            }}
          />
        ))}
      </div>

      {/* Nav arrows */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-50 flex flex-col items-center gap-2">
        {current > 0 && (
          <button data-testid="button-prev-video" onClick={prev} className="text-white/50 hover:text-primary transition-colors p-2">
            <ChevronUp size={28} />
          </button>
        )}
        <button data-testid="button-next-video" onClick={next} className="text-white/50 hover:text-primary transition-colors p-2 animate-bounce">
          <ChevronDown size={28} />
        </button>
        <span className="text-white/25 text-[9px] uppercase tracking-[0.3em] font-body">
          {current < VIDEO_SECTIONS.length - 1 ? "scroll or click" : "enter site"}
        </span>
      </div>

      {/* Counter */}
      <div className="absolute top-8 right-16 z-50 text-white/30 text-xs font-body tracking-widest">
        {String(current + 1).padStart(2, "0")} / {String(VIDEO_SECTIONS.length).padStart(2, "0")}
      </div>

      {/* Brand name */}
      <div className="absolute top-8 left-8 z-50">
        <span className="font-serif text-xl tracking-[0.3em] text-white/80">LUXE & LINE</span>
      </div>
    </div>
  );
}
