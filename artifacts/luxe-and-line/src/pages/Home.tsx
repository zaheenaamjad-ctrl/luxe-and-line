import { useEffect, useRef, useState, useCallback } from "react";
import { Link } from "wouter";
import { ArrowDown, ArrowRight } from "lucide-react";
import { useAddToCart, getGetCartQueryKey } from "@workspace/api-client-react";
import { useQueryClient } from "@tanstack/react-query";
import { useToast } from "@/hooks/use-toast";

/* ─── Typography animation hook ─────────────────────────── */
function useRevealOnScroll() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((e) => {
          if (e.isIntersecting) {
            e.target.classList.add("revealed");
          }
        });
      },
      { threshold: 0.15, rootMargin: "0px 0px -60px 0px" }
    );
    const els = document.querySelectorAll(".reveal");
    els.forEach((el) => observer.observe(el));
    return () => observer.disconnect();
  });
}

/* ─── Luxury animated button ─────────────────────────────── */
function LuxuryButton({
  href,
  children,
  dark = false,
  testId,
}: {
  href: string;
  children: React.ReactNode;
  dark?: boolean;
  testId?: string;
}) {
  return (
    <Link href={href}>
      <button
        data-testid={testId}
        className={`luxury-btn group relative overflow-hidden inline-flex items-center gap-3 px-10 py-4 uppercase tracking-[0.25em] text-xs font-body font-medium transition-all duration-500 ${
          dark
            ? "bg-primary text-primary-foreground"
            : "border border-white/60 text-white hover:border-primary"
        }`}
      >
        <span className="relative z-10 flex items-center gap-3">
          {children}
          <ArrowRight
            size={13}
            className="group-hover:translate-x-1 transition-transform duration-300"
          />
        </span>
        {/* Shimmer sweep */}
        <span className="luxury-btn-shine" />
      </button>
    </Link>
  );
}

/* ─── Video Hero — 6-stage scroll (video → text → video → …) ── */
// stage 0,2,4 = video playing (no text overlay)
// stage 1,3,5 = text visible over that video
// Each scroll increments stage by 1; after stage 5 user exits hero.
const VIDEOS = [
  {
    src: "/videos/video1.mp4",
    label: "The Collection",
    title: ["ELEGANCE", "REDEFINED"],
    sub: "Luxury Unstitched Lawn · Delivered Across the UK",
    cta: "Shop Collection",
    link: "/shop?category=shalwar-kameez",
  },
  {
    src: "/videos/video2.mp4",
    label: "Heritage",
    title: ["CRAFTED", "FOR YOU"],
    sub: "Premium Embroidery Pret · Pakistani Heritage in Every Stitch",
    cta: "Explore Now",
    link: "/shop",
  },
  {
    src: "/videos/video3.mp4",
    label: "Denim",
    title: ["PREMIUM", "DENIM"],
    sub: "Signature Jeans · Cut for UK Streets · Exclusive Fits",
    cta: "Shop Jeans",
    link: "/shop?category=jeans",
  },
];

function VideoHero({ onExit }: { onExit: () => void }) {
  // 6 stages: 0 = video1 no text, 1 = video1 text, 2 = video2 no text,
  //           3 = video2 text, 4 = video3 no text, 5 = video3 text
  const [stage, setStage] = useState(0);
  const [locked, setLocked] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastScrollTime = useRef(0);

  const videoIdx = Math.floor(stage / 2);   // 0, 1, 2
  const showText = stage % 2 === 1;          // true for stages 1, 3, 5

  // Play active video
  useEffect(() => {
    videoRefs.current.forEach((v, i) => {
      if (!v) return;
      if (i === videoIdx) {
        v.currentTime = 0;
        v.play().catch(() => {});
      } else {
        v.pause();
      }
    });
  }, [videoIdx]);

  const advance = useCallback(() => {
    if (locked) return;
    const now = Date.now();
    if (now - lastScrollTime.current < 700) return;
    lastScrollTime.current = now;
    setLocked(true);
    if (stage < 5) {
      setStage((s) => s + 1);
    } else {
      onExit();
    }
    setTimeout(() => setLocked(false), 750);
  }, [stage, locked, onExit]);

  const retreat = useCallback(() => {
    if (locked || stage === 0) return;
    const now = Date.now();
    if (now - lastScrollTime.current < 700) return;
    lastScrollTime.current = now;
    setLocked(true);
    setStage((s) => s - 1);
    setTimeout(() => setLocked(false), 750);
  }, [stage, locked]);

  useEffect(() => {
    const onWheel = (e: WheelEvent) => {
      e.preventDefault();
      if (e.deltaY > 20) advance();
      else if (e.deltaY < -20) retreat();
    };
    let touchStartY = 0;
    const onTouchStart = (e: TouchEvent) => { touchStartY = e.touches[0].clientY; };
    const onTouchEnd = (e: TouchEvent) => {
      const dy = touchStartY - e.changedTouches[0].clientY;
      if (Math.abs(dy) > 40) dy > 0 ? advance() : retreat();
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "ArrowDown" || e.key === " ") { e.preventDefault(); advance(); }
      if (e.key === "ArrowUp") { e.preventDefault(); retreat(); }
    };
    window.addEventListener("wheel", onWheel, { passive: false });
    window.addEventListener("touchstart", onTouchStart, { passive: true });
    window.addEventListener("touchend", onTouchEnd, { passive: true });
    window.addEventListener("keydown", onKey);
    return () => {
      window.removeEventListener("wheel", onWheel);
      window.removeEventListener("touchstart", onTouchStart);
      window.removeEventListener("touchend", onTouchEnd);
      window.removeEventListener("keydown", onKey);
    };
  }, [advance, retreat]);

  return (
    <div
      className="fixed inset-0 z-50 bg-black overflow-hidden"
      style={{ touchAction: "none" }}
    >
      {/* Videos */}
      {VIDEOS.map((vid, idx) => (
        <div
          key={idx}
          className="absolute inset-0"
          style={{
            transition: "opacity 1.1s ease, transform 1.1s ease",
            opacity: videoIdx === idx ? 1 : 0,
            transform:
              videoIdx === idx
                ? "scale(1)"
                : idx < videoIdx
                ? "scale(1.05) translateY(-3%)"
                : "scale(1.05) translateY(3%)",
            zIndex: videoIdx === idx ? 2 : 1,
          }}
        >
          <video
            ref={(el) => { videoRefs.current[idx] = el; }}
            src={vid.src}
            className="absolute inset-0 w-full h-full object-cover"
            muted
            loop
            playsInline
            preload="auto"
          />
          <div
            className="absolute inset-0"
            style={{
              background: showText
                ? "linear-gradient(to bottom, rgba(0,0,0,0.35) 0%, rgba(0,0,0,0.1) 30%, rgba(0,0,0,0.1) 60%, rgba(0,0,0,0.75) 100%)"
                : "linear-gradient(to bottom, rgba(0,0,0,0.15) 0%, transparent 40%, rgba(0,0,0,0.3) 100%)",
              transition: "background 1s ease",
            }}
          />
          <div
            className="absolute inset-0"
            style={{ background: "radial-gradient(ellipse at center, transparent 55%, rgba(0,0,0,0.45) 100%)" }}
          />
        </div>
      ))}

      {/* Text overlay — only visible on odd stages */}
      <div
        className="absolute inset-0 z-10 flex flex-col items-center justify-center text-center px-6 pointer-events-none"
        style={{
          transition: "opacity 0.8s ease, transform 0.8s ease",
          opacity: showText ? 1 : 0,
          transform: showText ? "translateY(0)" : "translateY(30px)",
        }}
      >
        <p
          className="text-[10px] md:text-xs uppercase tracking-[0.5em] text-primary font-body mb-6 opacity-90"
          style={{ transition: "opacity 0.7s ease 0.1s", opacity: showText ? 0.9 : 0 }}
        >
          Luxe &amp; Line — {VIDEOS[videoIdx].label}
        </p>

        <div className="mb-6">
          {VIDEOS[videoIdx].title.map((line, i) => (
            <div key={`${videoIdx}-${i}`} className="overflow-hidden">
              <h1
                className="font-serif leading-[0.88] text-white tracking-tight uppercase"
                style={{
                  fontSize: "clamp(3.5rem, 12vw, 10rem)",
                  transition: `opacity 0.7s ease ${0.15 + i * 0.12}s, transform 0.7s ease ${0.15 + i * 0.12}s`,
                  opacity: showText ? 1 : 0,
                  transform: showText ? "translateY(0)" : "translateY(50px)",
                  textShadow: "0 4px 50px rgba(0,0,0,0.5)",
                  fontStyle: i === 1 ? "italic" : "normal",
                }}
              >
                {i === 1 ? <span className="text-primary">{line}</span> : line}
              </h1>
            </div>
          ))}
        </div>

        {/* Gold divider */}
        <div
          className="mx-auto mb-6"
          style={{
            width: showText ? "140px" : "0px",
            height: "1px",
            background: "linear-gradient(90deg, transparent, hsl(43,65%,50%), transparent)",
            transition: "width 1.1s ease 0.45s",
          }}
        />

        <p
          className="font-body text-sm md:text-base text-white/70 mb-10 tracking-[0.15em]"
          style={{
            transition: "opacity 0.7s ease 0.55s, transform 0.7s ease 0.55s",
            opacity: showText ? 1 : 0,
            transform: showText ? "translateY(0)" : "translateY(20px)",
          }}
        >
          {VIDEOS[videoIdx].sub}
        </p>

        <div
          className="pointer-events-auto"
          style={{
            transition: "opacity 0.7s ease 0.7s, transform 0.7s ease 0.7s",
            opacity: showText ? 1 : 0,
            transform: showText ? "translateY(0)" : "translateY(20px)",
          }}
        >
          <LuxuryButton href={VIDEOS[videoIdx].link} testId={`cta-video-${videoIdx}`}>
            {VIDEOS[videoIdx].cta}
          </LuxuryButton>
        </div>
      </div>

      {/* Progress dots — one per VIDEO (3 dots), active when that video is showing */}
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            data-testid={`dot-${i}`}
            onClick={() => { if (!locked) setStage(i * 2); }}
            className="transition-all duration-500 rounded-full"
            style={{
              width: 6,
              height: videoIdx === i ? 42 : 6,
              backgroundColor: videoIdx === i ? "hsl(43,65%,50%)" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      {/* Scroll indicator — always visible, changes label */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-auto">
        <div className="scroll-indicator cursor-pointer" onClick={advance}>
          <div className="scroll-line" />
        </div>
        <span className="text-[9px] uppercase tracking-[0.4em] font-body text-white/35">
          {stage === 5 ? "Enter" : showText ? "Next" : "Scroll"}
        </span>
      </div>

      {/* Video counter */}
      <div className="absolute top-6 right-20 z-20 font-body text-xs text-white/25 tracking-widest">
        {String(videoIdx + 1).padStart(2, "0")} / {String(VIDEOS.length).padStart(2, "0")}
      </div>
    </div>
  );
}

/* ─── Section reveal wrapper ─────────────────────────────── */
function RevealSection({
  children,
  className = "",
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  const ref = useRef<HTMLDivElement>(null);
  const [vis, setVis] = useState(false);

  useEffect(() => {
    const el = ref.current;
    if (!el) return;
    const obs = new IntersectionObserver(
      ([e]) => { if (e.isIntersecting) { setVis(true); obs.disconnect(); } },
      { threshold: 0.1, rootMargin: "0px 0px -40px 0px" }
    );
    obs.observe(el);
    return () => obs.disconnect();
  }, []);

  return (
    <div
      ref={ref}
      className={className}
      style={{
        transition: `opacity 0.9s ease ${delay}ms, transform 0.9s ease ${delay}ms`,
        opacity: vis ? 1 : 0,
        transform: vis ? "translateY(0)" : "translateY(36px)",
      }}
    >
      {children}
    </div>
  );
}

/* ─── Catalog section heading ────────────────────────────── */
function CatalogHeading({
  eyebrow,
  title,
  italic,
  desc,
}: {
  eyebrow: string;
  title: string;
  italic?: string;
  desc: string;
}) {
  return (
    <RevealSection className="text-center mb-16">
      <p className="text-[10px] uppercase tracking-[0.45em] text-primary font-body mb-5">
        {eyebrow}
      </p>
      <h2 className="font-serif text-5xl md:text-6xl text-foreground mb-3 leading-tight">
        {title}
        {italic && <> <em className="text-primary">{italic}</em></>}
      </h2>
      <div
        className="mx-auto my-5"
        style={{
          width: 80,
          height: 1,
          background:
            "linear-gradient(90deg, transparent, hsl(43,65%,50%), transparent)",
        }}
      />
      <p className="text-sm font-body text-muted-foreground max-w-xl mx-auto leading-relaxed">
        {desc}
      </p>
    </RevealSection>
  );
}

/* ─── Single product card ────────────────────────────────── */
function CatalogCard({
  name,
  price,
  img,
  href,
  delay = 0,
  code,
}: {
  name: string;
  price: number;
  img: string;
  href: string;
  delay?: number;
  code?: string;
}) {
  const addToCart = useAddToCart();
  const queryClient = useQueryClient();
  const { toast } = useToast();

  return (
    <RevealSection delay={delay}>
      <Link href={href}>
        <div className="group cursor-pointer">
          <div className="relative overflow-hidden bg-card aspect-[3/4] mb-4">
            <img
              src={img}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700"
              style={{ transform: "scale(1)" }}
              onMouseEnter={(e) =>
                ((e.target as HTMLElement).style.transform = "scale(1.06)")
              }
              onMouseLeave={(e) =>
                ((e.target as HTMLElement).style.transform = "scale(1)")
              }
            />
            {code && (
              <div className="absolute top-3 left-3 bg-black/60 text-white text-[9px] uppercase tracking-widest px-2 py-1 font-body">
                {code}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-[10px] uppercase tracking-[0.25em] font-body border border-white/70 px-6 py-3">
                View Details
              </span>
            </div>
          </div>
          <p className="font-serif text-base text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
            {name}
          </p>
          <p className="text-sm font-body text-primary font-medium">
            £{price}{" "}
            <span className="text-muted-foreground text-xs font-normal">
              inc. delivery
            </span>
          </p>
        </div>
      </Link>
    </RevealSection>
  );
}

/* ─── Nureh Gardenia section ─────────────────────────────── */
const NUREH_ITEMS = [
  { code: "NSG-215", img: "/product-images/nureh-gardenia/nsg-215.jpg", name: "Gardenia NSG-215", price: 75 },
  { code: "NSG-216", img: "/product-images/nureh-gardenia/nsg-216.jpg", name: "Gardenia NSG-216", price: 75 },
  { code: "NSG-217", img: "/product-images/nureh-gardenia/nsg-217.jpg", name: "Gardenia NSG-217", price: 75 },
  { code: "NSG-218", img: "/product-images/nureh-gardenia/nsg-218.jpg", name: "Gardenia NSG-218", price: 75 },
  { code: "NSG-219", img: "/product-images/nureh-gardenia/nsg-219.jpg", name: "Gardenia NSG-219", price: 75 },
  { code: "NSG-220", img: "/product-images/nureh-gardenia/nsg-220.jpg", name: "Gardenia NSG-220", price: 75 },
  { code: "NSG-221", img: "/product-images/nureh-gardenia/nsg-221.jpg", name: "Gardenia NSG-221", price: 75 },
  { code: "NSG-222", img: "/product-images/nureh-gardenia/nsg-222.jpg", name: "Gardenia NSG-222", price: 75 },
];

function NurehGardeniaSection() {
  return (
    <section className="py-28 px-6 bg-background border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        {/* Featured image strip */}
        <RevealSection className="mb-20">
          <div className="grid grid-cols-3 gap-3 h-[65vh]">
            <div className="col-span-2 overflow-hidden">
              <img
                src="/product-images/nureh-gardenia/nsg-main.jpg"
                alt="Nureh Gardenia"
                className="w-full h-full object-cover object-top"
              />
            </div>
            <div className="flex flex-col gap-3">
              <div className="flex-1 overflow-hidden">
                <img
                  src="/product-images/nureh-gardenia/nsg-hero.jpg"
                  alt="Nureh Gardenia"
                  className="w-full h-full object-cover"
                />
              </div>
              <div className="flex-1 overflow-hidden">
                <img
                  src="/product-images/nureh-gardenia/nsg-215b.jpg"
                  alt="Nureh Gardenia"
                  className="w-full h-full object-cover object-top"
                />
              </div>
            </div>
          </div>
        </RevealSection>

        <CatalogHeading
          eyebrow="Nureh · Summer 2025"
          title="Gardenia"
          italic="Collection"
          desc="Prints that express freedom like a whisper — adorned with botanical patterns on lawn that dance on the edge of serene style. Classic weave in embroidered & printed tales of love & joy."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mb-14">
          {NUREH_ITEMS.map((item, i) => (
            <CatalogCard
              key={item.code}
              code={item.code}
              name={item.name}
              price={item.price}
              img={item.img}
              href={`/shop?category=shalwar-kameez`}
              delay={i * 60}
            />
          ))}
        </div>

        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=shalwar-kameez" dark testId="btn-nureh-shop">
            Shop Full Gardenia Range
          </LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Luxury Embroidery Pret section ─────────────────────── */
const PRET_ITEMS = [
  { img: "/product-images/embroidery-pret/zamira.jpg", name: "Zamira 3pc", price: 89, desc: "Ivory embroidered pret" },
  { img: "/product-images/embroidery-pret/nayel.jpg", name: "Nayel 3pc", price: 95, desc: "Black silver threadwork" },
  { img: "/product-images/embroidery-pret/alaya.jpg", name: "Alaya 3pc", price: 85, desc: "Rich plum with goldwork" },
  { img: "/product-images/embroidery-pret/zaraya.jpg", name: "Zaraya 3pc", price: 92, desc: "Lavender organza dupatta" },
  { img: "/product-images/embroidery-pret/elia.jpg", name: "Elia 3pc", price: 88, desc: "Mint sage zardozi" },
];

function EmbroideryPretSection() {
  return (
    <section
      className="py-28 px-6 border-t border-border/30"
      style={{
        background: "linear-gradient(180deg, hsl(220,20%,7%) 0%, hsl(220,20%,10%) 100%)",
      }}
    >
      <div className="max-w-7xl mx-auto">
        <CatalogHeading
          eyebrow="Luxury Pret · Embroidered"
          title="Luxury Embroidery"
          italic="Pret"
          desc="Ready-to-wear luxury — intricate hand-embroidered 3-piece suits crafted for the modern British-Pakistani woman. Stitched, delivered, and ready to wear."
        />

        {/* Featured hero layout for Pret */}
        <RevealSection className="mb-16">
          <div className="grid grid-cols-2 gap-6 mb-6">
            <div className="overflow-hidden aspect-[4/5]">
              <img
                src="/product-images/embroidery-pret/nayel.jpg"
                alt="Nayel"
                className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
              />
            </div>
            <div className="flex flex-col gap-6">
              <div className="overflow-hidden" style={{ flex: 1 }}>
                <img
                  src="/product-images/embroidery-pret/alaya.jpg"
                  alt="Alaya"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
              <div className="overflow-hidden" style={{ flex: 1 }}>
                <img
                  src="/product-images/embroidery-pret/zaraya.jpg"
                  alt="Zaraya"
                  className="w-full h-full object-cover hover:scale-105 transition-transform duration-700"
                />
              </div>
            </div>
          </div>
        </RevealSection>

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-5 mb-14">
          {PRET_ITEMS.map((item, i) => (
            <RevealSection key={item.name} delay={i * 70}>
              <Link href="/shop?category=shalwar-kameez">
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden bg-card aspect-[3/4] mb-3">
                    <img
                      src={item.img}
                      alt={item.name}
                      loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                    />
                    <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-[9px] uppercase tracking-[0.2em] font-body border border-white/70 px-4 py-2">
                        View
                      </span>
                    </div>
                  </div>
                  <p className="font-serif text-base text-foreground group-hover:text-primary transition-colors mb-1">
                    {item.name}
                  </p>
                  <p className="text-[10px] font-body text-muted-foreground mb-1">{item.desc}</p>
                  <p className="text-sm font-body text-primary font-medium">
                    £{item.price} <span className="text-muted-foreground text-xs">inc. delivery</span>
                  </p>
                </div>
              </Link>
            </RevealSection>
          ))}
        </div>

        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=shalwar-kameez" dark testId="btn-pret-shop">
            Shop Luxury Pret
          </LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Charizma Sunshine placeholder section ────────────────── */
function CharizmaSection() {
  return (
    <section className="py-28 px-6 bg-background border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <CatalogHeading
          eyebrow="Charizma · Summer 2025"
          title="Sunshine"
          italic="Collection"
          desc="The Sun Shone collection by Charizma captures the warmth of golden sunlight in every thread. Hand-embroidered with intricate threadwork on luxurious fabric."
        />

        {/* 3-column layout using existing images */}
        <div className="grid grid-cols-3 gap-5 mb-16">
          {[
            { img: "/product-images/nureh-gardenia/nsg-218.jpg", name: "Sunshine — Ivory Bloom", price: 85 },
            { img: "/product-images/nureh-gardenia/nsg-222.jpg", name: "Sunshine — Lavender Dream", price: 85 },
            { img: "/product-images/nureh-gardenia/nsg-221.jpg", name: "Sunshine — Teal Splendour", price: 85 },
          ].map((item, i) => (
            <RevealSection key={item.name} delay={i * 80} className="group cursor-pointer">
              <Link href="/shop?category=shalwar-kameez">
                <div className="relative overflow-hidden aspect-[3/4] mb-4">
                  <img
                    src={item.img}
                    alt={item.name}
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                  />
                  <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                    <span className="text-white text-[10px] uppercase tracking-widest font-body border border-white/70 px-6 py-3">
                      View Details
                    </span>
                  </div>
                </div>
                <p className="font-serif text-lg text-foreground hover:text-primary transition-colors mb-1">{item.name}</p>
                <p className="font-body text-sm text-primary">£{item.price} <span className="text-xs text-muted-foreground">inc. delivery</span></p>
              </Link>
            </RevealSection>
          ))}
        </div>

        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=shalwar-kameez" dark testId="btn-charizma-shop">
            Shop Charizma Sunshine
          </LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Accessories & Gourmet strip ────────────────────────── */
function AccessoriesStrip() {
  return (
    <section
      className="py-24 px-6 border-t border-border/30"
      style={{ background: "hsl(220,20%,6%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              label: "Premium Jeans",
              desc: "Slim fit & straight cut denim crafted for the modern silhouette.",
              link: "/shop?category=jeans",
              cta: "Shop Jeans",
              bg: "hsl(220,20%,11%)",
            },
            {
              label: "Leather Wallets",
              desc: "Handcrafted genuine leather — bifold wallets & card holders.",
              link: "/shop?category=wallets",
              cta: "Shop Wallets",
              bg: "hsl(220,20%,11%)",
            },
            {
              label: "Pistachio Kunafa Bites",
              desc: "1kg jar of premium dark chocolate kunafa bites with real pistachio filling.",
              link: "/shop?category=food",
              cta: "Order Now",
              bg: "hsl(220,20%,11%)",
              img: "/product-images/kunafa-front.jpg",
            },
          ].map((item, i) => (
            <RevealSection key={item.label} delay={i * 100}>
              <div
                className="border border-border/40 p-8 h-full flex flex-col hover:border-primary/40 transition-colors duration-500"
                style={{ background: item.bg }}
              >
                {item.img && (
                  <div className="h-40 overflow-hidden mb-5">
                    <img src={item.img} alt={item.label} className="w-full h-full object-cover" />
                  </div>
                )}
                <h3 className="font-serif text-2xl text-foreground mb-3">{item.label}</h3>
                <p className="font-body text-sm text-muted-foreground leading-relaxed mb-6 flex-1">
                  {item.desc}
                </p>
                <Link href={item.link}>
                  <button className="text-xs uppercase tracking-[0.25em] font-body text-primary hover:text-foreground transition-colors flex items-center gap-2 border-b border-primary pb-1 w-fit">
                    {item.cta} <ArrowRight size={11} />
                  </button>
                </Link>
              </div>
            </RevealSection>
          ))}
        </div>
      </div>
    </section>
  );
}

/* ─── Brand promise banner ───────────────────────────────── */
function BrandBanner() {
  return (
    <section className="py-24 px-6 bg-background border-t border-border/30">
      <div className="max-w-5xl mx-auto text-center">
        <RevealSection>
          <p className="text-[10px] uppercase tracking-[0.45em] text-primary font-body mb-5">
            Our Promise
          </p>
          <h2 className="font-serif text-4xl md:text-6xl text-foreground mb-6 leading-tight">
            Lahore&apos;s Finest,
            <br />
            <em className="text-primary">Delivered to Liverpool</em>
          </h2>
          <p className="font-body text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Every piece we curate is hand-selected from Pakistan&apos;s most celebrated fashion
            houses. All prices include free UK delivery. WhatsApp us on{" "}
            <a href="tel:+447405358689" className="text-primary hover:underline">
              +44 7405 358689
            </a>{" "}
            for custom orders.
          </p>
          <div className="flex flex-wrap gap-3 justify-center mb-10">
            {[
              "Free UK Delivery",
              "Authentic Designs",
              "Custom Stitching Available",
              "WhatsApp Support",
              "Secure Checkout",
            ].map((tag) => (
              <span
                key={tag}
                className="border border-primary/30 text-primary text-[10px] uppercase tracking-widest font-body px-4 py-2"
              >
                {tag}
              </span>
            ))}
          </div>
          <LuxuryButton href="/shop" dark testId="btn-banner-shop">
            Explore All Products
          </LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Contact footer strip ──────────────────────────────── */
function ContactStrip() {
  return (
    <section
      className="py-16 px-6 border-t border-border/30 text-center"
      style={{ background: "hsl(220,20%,6%)" }}
    >
      <RevealSection>
        <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-3">
          Liverpool, UK
        </p>
        <h2 className="font-serif text-3xl text-foreground mb-6">
          Questions? We&apos;re here for you.
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 text-sm font-body text-muted-foreground mb-8">
          <a href="tel:+447405358689" className="hover:text-primary transition-colors">
            +44 7405 358689
          </a>
          <span className="hidden sm:block text-border">·</span>
          <a href="mailto:hello@luxeandline.co.uk" className="hover:text-primary transition-colors">
            hello@luxeandline.co.uk
          </a>
          <span className="hidden sm:block text-border">·</span>
          <span>39 Stanley Street, Liverpool L7 0JN</span>
        </div>
        <LuxuryButton href="/contact" testId="btn-contact">
          Contact Us
        </LuxuryButton>
      </RevealSection>
    </section>
  );
}

/* ─── Home root ─────────────────────────────────────────── */
export function Home() {
  const [videoDone, setVideoDone] = useState(false);
  useRevealOnScroll();

  return (
    <div className="w-full">
      {!videoDone && <VideoHero onExit={() => setVideoDone(true)} />}
      {/* Main content — only visible after video hero is dismissed */}
      <div
        style={{
          visibility: videoDone ? "visible" : "hidden",
          transition: "opacity 0.6s ease",
          opacity: videoDone ? 1 : 0,
        }}
      >
        <NurehGardeniaSection />
        <EmbroideryPretSection />
        <CharizmaSection />
        <AccessoriesStrip />
        <BrandBanner />
        <ContactStrip />
      </div>
    </div>
  );
}
