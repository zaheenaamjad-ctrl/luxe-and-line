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

/* ─── Video Hero — 2-stage scroll (video → text → exit) ── */
// stage 0 = video playing (no text overlay)
// stage 1 = text visible over video; scroll again to exit hero
const VIDEOS = [
  {
    src: "/videos/swan.mp4",
    label: "New Arrival 2026",
    title: ["LUXE", "& LINE"],
    sub: "Summer 2026 · Premium Fashion · Free UK Delivery",
    cta: "Explore Collection",
    link: "/shop",
  },
];

function VideoHero({ onExit }: { onExit: () => void }) {
  // 2 stages: 0 = video playing (no text), 1 = text overlay → scroll exits hero
  const [stage, setStage] = useState(0);
  const [locked, setLocked] = useState(false);
  const videoRefs = useRef<(HTMLVideoElement | null)[]>([]);
  const lastScrollTime = useRef(0);

  const videoIdx = 0;                        // always video 0
  const showText = stage === 1;

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
    if (stage < 1) {
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
          {/* Mobile: static poster — no video download on slow connections */}
          <img
            src="/videos/swan-poster.webp"
            alt=""
            width="1920"
            height="1080"
            fetchPriority="high"
            className="absolute inset-0 w-full h-full object-cover block md:hidden"
          />
          {/* Desktop: autoplay video */}
          <video
            ref={(el) => { videoRefs.current[idx] = el; }}
            src={vid.src}
            poster="/videos/swan-poster.webp"
            className="absolute inset-0 w-full h-full object-contain sm:object-cover hidden md:block"
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
            background: "linear-gradient(90deg, transparent, hsl(270,80%,65%), transparent)",
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
      <div className="absolute right-8 top-1/2 -translate-y-1/2 z-20 flex flex-col gap-4" role="group" aria-label="Collection navigation">
        {VIDEOS.map((_, i) => (
          <button
            key={i}
            data-testid={`dot-${i}`}
            aria-label={`View collection ${i + 1}`}
            aria-current={videoIdx === i ? "true" : undefined}
            onClick={() => { if (!locked) setStage(i * 2); }}
            className="transition-all duration-500 rounded-full focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-1"
            style={{
              width: 6,
              height: videoIdx === i ? 42 : 6,
              backgroundColor: videoIdx === i ? "hsl(270,80%,65%)" : "rgba(255,255,255,0.3)",
            }}
          />
        ))}
      </div>

      {/* Scroll indicator — always visible, changes label */}
      <div className="absolute bottom-10 left-1/2 -translate-x-1/2 z-20 flex flex-col items-center gap-3 pointer-events-auto">
        <button
          aria-label={showText ? "Proceed to next section" : "Scroll to reveal content"}
          className="scroll-indicator cursor-pointer bg-transparent border-0 p-0 focus:outline-none focus:ring-2 focus:ring-primary"
          onClick={advance}
        >
          <div className="scroll-line" />
        </button>
        <span className="text-[9px] uppercase tracking-[0.4em] font-body text-white/35" aria-hidden="true">
          {stage === 5 ? "Enter" : showText ? "Next" : "Scroll"}
        </span>
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
            "linear-gradient(90deg, transparent, hsl(270,80%,65%), transparent)",
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
  showSale = false,
  originalPrice,
  suitNumber,
}: {
  name: string;
  price: number;
  img: string;
  href: string;
  delay?: number;
  code?: string;
  showSale?: boolean;
  originalPrice?: number;
  suitNumber?: string;
}) {
  return (
    <RevealSection delay={delay}>
      <Link href={href}>
        <div className="group cursor-pointer">
          <div className="relative overflow-hidden bg-card aspect-[3/4] mb-3">
            <img
              src={img}
              alt={name}
              loading="lazy"
              className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-[1.06]"
            />
            {/* Code badge */}
            {code && (
              <div className="absolute top-2 left-2 bg-black/70 text-white text-[8px] uppercase tracking-widest px-2 py-0.5 font-body">
                {code}
              </div>
            )}
            {/* SALE badge */}
            {showSale && (
              <div className="absolute top-2 right-2 bg-red-600 text-white text-[9px] uppercase tracking-widest px-2 py-1 font-body font-bold shadow-lg">
                SALE
              </div>
            )}
            {/* Suit number */}
            {suitNumber && (
              <div className="absolute bottom-2 right-2 bg-primary/90 text-white text-[8px] uppercase tracking-widest px-2 py-0.5 font-body">
                #{suitNumber}
              </div>
            )}
            <div className="absolute inset-0 bg-black/50 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
              <span className="text-white text-[10px] uppercase tracking-[0.25em] font-body border border-white/70 px-5 py-2.5">
                View Details
              </span>
            </div>
          </div>
          <p className="font-serif text-sm text-foreground group-hover:text-primary transition-colors leading-tight mb-1">
            {name}
          </p>
          <div className="flex items-baseline gap-2 mt-1">
            <p className="text-base font-body text-white font-bold price-glow">£{price}</p>
            {originalPrice && (
              <p className="text-sm font-body text-red-500 line-through font-medium">£{originalPrice}</p>
            )}
            <span className="text-muted-foreground text-[10px] font-body font-normal">incl. delivery</span>
          </div>
        </div>
      </Link>
    </RevealSection>
  );
}

/* ─── Nureh Gardenia section ─────────────────────────────── */
const NUREH_ITEMS = [
  { code: "NSG-215", img: "/product-images/nureh-gardenia/nsg-215.webp", name: "Gardenia NSG-215", price: 65, id: 1 },
  { code: "NSG-216", img: "/product-images/nureh-gardenia/nsg-216.webp", name: "Gardenia NSG-216", price: 65, id: 9 },
  { code: "NSG-217", img: "/product-images/nureh-gardenia/nsg-217.webp", name: "Gardenia NSG-217", price: 65, id: 10 },
  { code: "NSG-218", img: "/product-images/nureh-gardenia/nsg-218.webp", name: "Gardenia NSG-218", price: 65, id: 11 },
  { code: "NSG-219", img: "/product-images/nureh-gardenia/nsg-219.webp", name: "Gardenia NSG-219", price: 65, id: 12 },
  { code: "NSG-220", img: "/product-images/nureh-gardenia/nsg-220.webp", name: "Gardenia NSG-220", price: 65, id: 13 },
  { code: "NSG-221", img: "/product-images/nureh-gardenia/nsg-221.webp", name: "Gardenia NSG-221", price: 65, id: 14 },
  { code: "NSG-222", img: "/product-images/nureh-gardenia/nsg-222.webp", name: "Gardenia NSG-222", price: 65, id: 15 },
  { code: "NSG-223", img: "/product-images/nureh-gardenia/nsg-223.webp", name: "Gardenia NSG-223", price: 65, id: 22 },
  { code: "NSG-224", img: "/product-images/nureh-gardenia/nsg-224.webp", name: "Gardenia NSG-224", price: 65, id: 16 },
];

function NurehGardeniaSection() {
  return (
    <section className="py-28 px-6 bg-background border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        <RevealSection className="text-center mb-10">
          <h2 className="font-serif text-xl text-muted-foreground tracking-widest">Shop Our Latest Products</h2>
        </RevealSection>
        {/* Portrait model video */}
        <RevealSection className="mb-16 flex justify-center">
          <div className="relative overflow-hidden" style={{ width: 340, aspectRatio: "9/16", maxHeight: "75vh" }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              className="w-full h-full object-cover"
            >
              <source src="/videos/model-gardenia.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-1">Gardenia by Nurèh</p>
              <p className="font-serif text-2xl text-white leading-tight">Summer 2026</p>
              <p className="font-body text-xs text-white/70 mt-1">10 Piece Set · Embroidered Lawn</p>
            </div>
          </div>
        </RevealSection>

        <CatalogHeading
          eyebrow="Gardenia by Nurèh · Summer 2026 New Arrival"
          title="Nureh Collection"
          italic="Fully Stitched Luxury Suits"
          desc="Embroidered and printed lawn collection with embroidered chiffon dupatta — by Riaz Arts. 10 piece set. Fully stitched and ready to wear. Available in sizes S, M, L, XL, XXL. UK delivery included."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-14">
          {NUREH_ITEMS.map((item, i) => (
            <CatalogCard
              key={item.code}
              code={item.code}
              name={item.name}
              price={item.price}
              originalPrice={100}
              showSale={true}
              suitNumber={item.code.replace("NSG-", "")}
              img={item.img}
              href={`/product/${item.id}`}
              delay={i * 50}
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

/* ─── Luxury Pret section ────────────────────────────────── */
const ZEENET_ITEMS = [
  { code: "ZPSP-01", img: "/product-images/zeenat/zpsp-01.webp", name: "Luxury Pret ZPSP-01", price: 45, id: 17 },
  { code: "ZPSP-02", img: "/product-images/zeenat/zpsp-02.webp", name: "Luxury Pret ZPSP-02", price: 45, id: 18 },
  { code: "ZPSP-03", img: "/product-images/zeenat/zpsp-03.webp", name: "Luxury Pret ZPSP-03", price: 45, id: 19 },
  { code: "ZPSP-04", img: "/product-images/zeenat/zpsp-04.webp", name: "Luxury Pret ZPSP-04", price: 45, id: 20 },
  { code: "ZPSP-05", img: "/product-images/zeenat/zpsp-05.webp", name: "Luxury Pret ZPSP-05", price: 45, id: 21 },
  { code: "ZPSP-06", img: "/product-images/zeenat/zpsp-06.webp", name: "Luxury Pret ZPSP-06", price: 45, id: 31 },
  { code: "ZPSP-07", img: "/product-images/zeenat/zpsp-07.webp", name: "Luxury Pret ZPSP-07", price: 45, id: 32 },
  { code: "ZPSP-08", img: "/product-images/zeenat/zpsp-08.webp", name: "Luxury Pret ZPSP-08", price: 45, id: 33 },
  { code: "ZPSP-09", img: "/product-images/zeenat/zpsp-09.webp", name: "Luxury Pret ZPSP-09", price: 45, id: 34 },
  { code: "ZPSP-10", img: "/product-images/zeenat/zpsp-10.webp", name: "Luxury Pret ZPSP-10", price: 45, id: 35 },
];

function ZeenatSection() {
  return (
    <section
      className="py-28 px-6 border-t border-border/30"
      style={{ background: "linear-gradient(180deg, hsl(265,28%,7%) 0%, hsl(265,25%,9%) 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        {/* Portrait model video */}
        <RevealSection className="mb-16 flex justify-center">
          <div className="relative overflow-hidden" style={{ width: 340, aspectRatio: "9/16", maxHeight: "75vh" }}>
            <video autoPlay muted loop playsInline preload="none" className="w-full h-full object-cover">
              <source src="/videos/model-zeenat.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-1">Luxury Pret Collection</p>
              <p className="font-serif text-2xl text-white leading-tight">Luxury Pret Vol-1</p>
              <p className="font-body text-xs text-white/70 mt-1">Embroidered Lawn · Fancy Chiffon Dupatta</p>
            </div>
          </div>
        </RevealSection>

        <CatalogHeading
          eyebrow="Luxury Pret Collection · Summer 2026 New Arrival"
          title="Luxury Pret Collection"
          italic="Ready to Wear Elegance"
          desc="Luxury Pret Stitched Cotton Lawn Vol-1 — Embroidered lawn with fancy chiffon dupatta. 10 designs · Fully stitched and ready to wear · Sizes S, M, L, XL, XXL · UK delivery included."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-14">
          {ZEENET_ITEMS.map((item, i) => (
            <CatalogCard
              key={item.code}
              code={item.code}
              name={item.name}
              price={item.price}
              originalPrice={60}
              showSale={true}
              suitNumber={item.code.replace("ZPSP-", "")}
              img={item.img}
              href={`/product/${item.id}`}
              delay={i * 50}
            />
          ))}
        </div>

        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=shalwar-kameez" dark testId="btn-pret-shop">
            Shop Luxury Pret Collection
          </LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Charizma Sunshine section ───────────────────────────── */
const CHARIZMA_ITEMS = [
  { code: "CSS-01", img: "/product-images/charizma/css-01.webp", name: "Sun Shine CSS-01", price: 85, id: 2 },
  { code: "CSS-02", img: "/product-images/charizma/css-02.webp", name: "Sun Shine CSS-02", price: 85, id: 23 },
  { code: "CSS-03", img: "/product-images/charizma/css-03.webp", name: "Sun Shine CSS-03", price: 85, id: 24 },
  { code: "CSS-04", img: "/product-images/charizma/css-04.webp", name: "Sun Shine CSS-04", price: 85, id: 25 },
  { code: "CSS-05", img: "/product-images/charizma/css-05.webp", name: "Sun Shine CSS-05", price: 85, id: 26 },
  { code: "CSS-06", img: "/product-images/charizma/css-06.webp", name: "Sun Shine CSS-06", price: 85, id: 27 },
  { code: "CSS-07", img: "/product-images/charizma/css-07.webp", name: "Sun Shine CSS-07", price: 85, id: 28 },
  { code: "CSS-08", img: "/product-images/charizma/css-08.webp", name: "Sun Shine CSS-08", price: 85, id: 29 },
  { code: "CSS-09", img: "/product-images/charizma/css-09.webp", name: "Sun Shine CSS-09", price: 85, id: 30 },
];

function CharizmaSection() {
  return (
    <section className="py-28 px-6 bg-background border-t border-border/30">
      <div className="max-w-7xl mx-auto">
        {/* Portrait model video */}
        <RevealSection className="mb-16 flex justify-center">
          <div className="relative overflow-hidden" style={{ width: 340, aspectRatio: "9/16", maxHeight: "75vh" }}>
            <video
              autoPlay
              muted
              loop
              playsInline
              preload="none"
              className="w-full h-full object-cover"
            >
              <source src="/videos/model-charizma.mp4" type="video/mp4" />
            </video>
            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-transparent to-transparent" />
            <div className="absolute bottom-6 left-6 right-6">
              <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-1">Charizma</p>
              <p className="font-serif text-2xl text-white leading-tight">Sun Shine Vol. 01</p>
              <p className="font-body text-xs text-white/70 mt-1">Stitched Embroidered Lawn · 3-Piece</p>
            </div>
          </div>
        </RevealSection>

        <CatalogHeading
          eyebrow="Charizma · Summer 2026 New Arrival"
          title="Charizma Collection"
          italic="Premium Designer Suits"
          desc="Charizma Sun Shine Stitched Embroidered Lawn Suit Collection with Embroidered Chiffon Dupatta Vol.01. 3-piece stitched suit — ready to wear. UK delivery included."
        />

        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-5 mb-14">
          {CHARIZMA_ITEMS.map((item, i) => (
            <CatalogCard
              key={item.code}
              code={item.code}
              name={item.name}
              price={item.price}
              originalPrice={115}
              showSale={true}
              suitNumber={item.code.replace("CSS-", "")}
              img={item.img}
              href={`/product/${item.id}`}
              delay={i * 50}
            />
          ))}
        </div>

        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=shalwar-kameez" dark testId="btn-charizma-shop">
            Shop Charizma Sun Shine
          </LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Jeans section ──────────────────────────────────────── */
const JEANS_ITEMS = [
  { code: "J-01", img: "/product-images/jeans/j-women-lightblue.webp", name: "Levi's Women's Wide Leg — Light Blue",   desc: "Levi's wide-leg silhouette in washed light blue denim. High-waisted comfort fit with a clean finish.", price: 38, id: 4 },
  { code: "J-02", img: "/product-images/jeans/j-men-lightblue.webp",   name: "Levi's Men's Straight Cut — Light Blue", desc: "Levi's classic straight-leg cut in light blue wash. Relaxed waist, tapered ankle. Everyday essential.", price: 38, id: 5 },
  { code: "J-03", img: "/product-images/jeans/j-women-dark.webp",      name: "Levi's Women's Wide Leg — Charcoal",     desc: "Levi's wide-leg cut in deep charcoal wash. Versatile styling for formal and casual occasions.", price: 38, id: 4 },
  { code: "J-04", img: "/product-images/jeans/j-men-dark.webp",        name: "Levi's Men's Straight Cut — Charcoal",   desc: "Levi's straight-leg charcoal denim. Sharp, minimal, and hardwearing for daily wear.", price: 38, id: 5 },
  { code: "J-05", img: "/product-images/jeans/j-women-blue.webp",      name: "Levi's Women's Wide Leg — Mid Blue",     desc: "Levi's wide-leg silhouette in mid-blue wash. Clean lines for a polished, effortless look.", price: 38, id: 4 },
  { code: "J-06", img: "/product-images/jeans/j-men-blue.webp",        name: "Levi's Men's Straight Cut — Mid Blue",   desc: "Levi's mid-blue straight-leg cut. Timeless colour and classic proportions. Sizes available on order.", price: 38, id: 5 },
];

function JeansSection() {
  return (
    <section
      className="py-28 px-6 border-t border-border/30"
      style={{ background: "linear-gradient(180deg, hsl(265,25%,6%) 0%, hsl(265,28%,8%) 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <CatalogHeading
          eyebrow="Levi's Premium Denim · Men & Women"
          title="Levi's Jeans"
          italic="Collection"
          desc="Authentic Levi's wide-leg and straight-cut silhouettes for men and women. Available in light blue, mid blue and charcoal washes. Custom waist × length sizing — just let us know your measurements. UK delivery included."
        />
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-14">
          {JEANS_ITEMS.map((item, i) => (
            <RevealSection key={item.code} delay={i * 40}>
              <Link href={`/product/${item.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden bg-card aspect-[2/3] mb-3">
                    <img src={item.img} alt={item.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105 object-top" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-[9px] uppercase tracking-[0.2em] font-body border border-white/60 px-3 py-1.5">View</span>
                    </div>
                    <div className="absolute bottom-0 left-0 right-0 bg-gradient-to-t from-black/60 to-transparent px-3 py-2">
                      <p className="text-white text-[10px] font-body uppercase tracking-widest truncate">{item.code}</p>
                    </div>
                  </div>
                  <p className="font-body text-xs text-foreground/80 group-hover:text-primary transition-colors leading-snug mb-0.5">{item.name}</p>
                  <p className="font-body text-[10px] text-muted-foreground leading-snug mb-1 line-clamp-2">{item.desc}</p>
                  <p className="text-xs font-body text-primary font-medium mt-0.5 price-glow">£{item.price}</p>
                </div>
              </Link>
            </RevealSection>
          ))}
        </div>
        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=jeans" dark testId="btn-jeans-shop">Shop Jeans</LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Wallets section ─────────────────────────────────────── */
const WALLET_ITEMS = [
  { img: "/product-images/wallets/w-accordion-brown.webp", name: "Atrix Leather Accordion Wallet", desc: "Zip-around accordion design, 8+ card slots. Compact carry for everyday essentials.", price: 12, id: 6 },
  { img: "/product-images/wallets/w-embossed-brown.webp",  name: "Embossed Button Wallet",         desc: "Embossed geometric detail with snap button closure. Slim profile, multiple card slots.", price: 12, id: 7 },
  { img: "/product-images/wallets/w-snap-beige.webp",      name: "Snap Button Wallet — Beige",     desc: "Clean minimalist design in premium beige leather. Snap closure, card organiser inside.", price: 12, id: 7 },
];

function WalletsSection() {
  return (
    <section
      className="py-28 px-6 border-t border-border/30"
      style={{ background: "linear-gradient(180deg, hsl(265,28%,8%) 0%, hsl(265,25%,6%) 100%)" }}
    >
      <div className="max-w-7xl mx-auto">
        <CatalogHeading
          eyebrow="Atrix Leather · Handcrafted"
          title="Leather Wallets"
          italic="by Atrix"
          desc="Genuine leather accordion card wallets. Zip-around and snap-button styles. Available in brown and beige. Each wallet holds 8+ cards. Premium everyday carry — £12 each."
        />
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-14">
          {WALLET_ITEMS.map((item, i) => (
            <RevealSection key={item.name} delay={i * 80}>
              <Link href={`/product/${item.id}`}>
                <div className="group cursor-pointer">
                  <div className="relative overflow-hidden bg-card aspect-square mb-4">
                    <img src={item.img} alt={item.name} loading="lazy"
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-105" />
                    <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center">
                      <span className="text-white text-[9px] uppercase tracking-[0.2em] font-body border border-white/60 px-4 py-2">View</span>
                    </div>
                  </div>
                  <h3 className="font-serif text-lg text-foreground group-hover:text-primary transition-colors mb-1">{item.name}</h3>
                  <p className="text-xs font-body text-muted-foreground leading-relaxed mb-2">{item.desc}</p>
                  <p className="font-serif text-xl text-primary price-glow">£{item.price}</p>
                </div>
              </Link>
            </RevealSection>
          ))}
        </div>
        <RevealSection className="text-center">
          <LuxuryButton href="/shop?category=wallets" dark testId="btn-wallets-shop">Shop Wallets</LuxuryButton>
        </RevealSection>
      </div>
    </section>
  );
}

/* ─── Kunafa Chocolates section ──────────────────────────── */
const KUNAFA_IMGS = [
  { src: "/product-images/kunafa/k-jar-branded.webp", alt: "B.C.C. Kunafa Chocolates gift jar UK — premium pistachio filled chocolates" },
  { src: "/product-images/kunafa/k-jar-open.webp", alt: "Kunafa Chocolates UK open jar showing pistachio filling" },
  { src: "/product-images/kunafa/k-loose-pieces.webp", alt: "Luxury Kunafa Chocolate pieces with authentic pistachio filling UK" },
  { src: "/product-images/kunafa/k-single-wrap.webp", alt: "Individually wrapped Kunafa Chocolate UK — artisan confectionery gift" },
];

function KunafaSection() {
  return (
    <section
      className="py-28 px-6 border-t border-border/30"
      style={{ background: "linear-gradient(180deg, hsl(265,25%,6%) 0%, hsl(265,28%,7%) 100%)" }}
    >
      <div className="max-w-5xl mx-auto">
        <CatalogHeading
          eyebrow="B.C.C. · Premium Confectionery"
          title="Kunafa Chocolates"
          italic="by B.C.C."
          desc="Artisan Kunafa Chocolates — rich pistachio filling encased in crispy pastry, crafted with premium chocolate and authentic flavours. Individually wrapped — perfect as a gift or indulgence. UK delivery included."
        />
        <RevealSection>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-10 max-w-3xl mx-auto">
            {KUNAFA_IMGS.map((item, i) => (
              <Link href="/product/8" key={i}>
                <div className="aspect-square overflow-hidden bg-card group cursor-pointer">
                  <img src={item.src} alt={item.alt} loading="lazy"
                    className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110" />
                </div>
              </Link>
            ))}
          </div>
          <div className="text-center">
            <p className="font-body text-xs uppercase tracking-widest text-muted-foreground mb-3">
              B.C.C. Kunafa Chocolates · Premium Gift Box
            </p>
            <p className="font-serif text-5xl text-primary price-glow mb-1">£22</p>
            <p className="text-xs font-body text-muted-foreground mb-8">per box · UK delivery included</p>
            <LuxuryButton href="/product/8" dark testId="btn-kunafa-order">Order Kunafa Chocolates</LuxuryButton>
          </div>
        </RevealSection>
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
            Why Choose Luxe &amp; Line
          </h2>
          <p className="font-body text-sm text-muted-foreground max-w-2xl mx-auto leading-relaxed mb-10">
            Every piece we curate is hand-selected from the finest fashion
            houses. All prices include free UK delivery. WhatsApp us on{" "}
            <a href="tel:+447449507661" className="text-primary hover:underline">
              +44 7449 507661
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
      style={{ background: "hsl(265,28%,5%)" }}
    >
      <RevealSection>
        <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-3">
          Liverpool, UK
        </p>
        <h2 className="font-serif text-3xl text-foreground mb-6">
          Questions? We&apos;re here for you.
        </h2>
        <div className="flex flex-col sm:flex-row items-center justify-center gap-5 text-sm font-body text-muted-foreground mb-8">
          <a href="tel:+447449507661" className="hover:text-primary transition-colors">
            +44 7449 507661
          </a>
          <span className="hidden sm:block text-border">·</span>
          <a href="mailto:luxeline26@gmail.com" className="hover:text-primary transition-colors">
            luxeline26@gmail.com
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

/* ─── Homepage mini reviews + FAQ ──────────────────────── */
const MINI_REVIEWS = [
  {
    name: "Ayesha Rahman",
    location: "Manchester",
    rating: 5,
    text: "Absolutely stunning quality! I ordered the Nureh Gardenia suit and it arrived beautifully packaged within 4 days. The fabric is exactly as described — luxurious and lightweight.",
    product: "Nureh Gardenia",
    avatar: "https://i.pravatar.cc/80?img=47",
  },
  {
    name: "Fatima Malik",
    location: "London",
    rating: 5,
    text: "The Kunafa Chocolates were a massive hit at our family gathering! Everyone was asking where I bought them. The packaging is gorgeous and delivery was super fast.",
    product: "Kunafa Chocolates",
    avatar: "https://i.pravatar.cc/80?img=32",
  },
  {
    name: "Nadia Hussain",
    location: "Leeds",
    rating: 5,
    text: "I've ordered three times and every time the quality is perfect. The Atrix leather wallets make brilliant gifts — bought them for my brothers and they absolutely loved them.",
    product: "Atrix Leather Wallet",
    avatar: "https://i.pravatar.cc/80?img=15",
  },
];

const MINI_FAQS = [
  {
    q: "How long does delivery take?",
    a: "All orders are delivered within 4–5 business days after payment. Free UK delivery is included on every item — no hidden charges.",
  },
  {
    q: "Are the suits ready to wear?",
    a: "Yes! All shalwar kameez suits are fully stitched and ready to wear immediately. They are available in sizes S, M, L, XL and XXL. For Levi's jeans, we offer custom waist × length sizing — just WhatsApp us on +44 7449 507661.",
  },
  {
    q: "What payment methods do you accept?",
    a: "We accept Bank Transfer and Cash on Delivery (COD). Payment details are shown at checkout after you place your order.",
  },
];

function HomepageReviews() {
  const [openFaq, setOpenFaq] = useState<number | null>(null);
  return (
    <section className="py-20 px-6 border-t border-border/30" style={{ background: "hsl(265,28%,5%)" }}>
      <RevealSection>
        <p className="text-[10px] uppercase tracking-[0.45em] text-primary font-body mb-3 text-center">Customer Love</p>
        <h2 className="font-serif text-4xl md:text-5xl text-foreground mb-3 text-center">What Our Customers Say</h2>
        <p className="font-body text-sm text-muted-foreground text-center mb-12 max-w-lg mx-auto">
          Real reviews from real customers across the UK.
        </p>
      </RevealSection>

      {/* Review cards */}
      <div className="max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6 mb-16">
        {MINI_REVIEWS.map((r, i) => (
          <RevealSection key={r.name} delay={i * 80}>
            <div
              className="flex flex-col p-6 h-full"
              style={{
                background: "hsl(265,25%,8%)",
                border: "1px solid hsl(265,20%,16%)",
                borderRadius: 4,
              }}
            >
              <div className="flex items-center gap-3 mb-3">
                <img
                  src={r.avatar}
                  alt={r.name}
                  className="w-10 h-10 rounded-full object-cover shrink-0"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src = `https://ui-avatars.com/api/?name=${encodeURIComponent(r.name)}&background=6b21a8&color=fff&size=80`;
                  }}
                />
                <div>
                  <p className="font-body text-sm font-semibold text-foreground">{r.name}</p>
                  <p className="font-body text-[10px] text-muted-foreground">{r.location}, UK</p>
                </div>
              </div>
              <div className="flex gap-0.5 mb-3">
                {[1,2,3,4,5].map((s) => (
                  <svg key={s} width="13" height="13" viewBox="0 0 24 24" fill="hsl(48,96%,53%)" stroke="none">
                    <polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/>
                  </svg>
                ))}
              </div>
              <p className="font-body text-sm text-muted-foreground leading-relaxed flex-1">"{r.text}"</p>
              <p className="mt-3 text-[9px] font-body text-primary uppercase tracking-widest">{r.product}</p>
            </div>
          </RevealSection>
        ))}
      </div>

      {/* Mini FAQ */}
      <RevealSection>
        <div className="max-w-2xl mx-auto mb-10">
          <p className="text-[10px] uppercase tracking-[0.45em] text-primary font-body mb-6 text-center">Common Questions</p>
          {MINI_FAQS.map((faq, i) => (
            <div key={i} className="border-b border-border/30">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full flex items-center justify-between py-4 text-left group"
              >
                <p className="font-serif text-base text-foreground group-hover:text-primary transition-colors pr-4">
                  {faq.q}
                </p>
                <span className="text-primary shrink-0 text-lg leading-none">{openFaq === i ? "−" : "+"}</span>
              </button>
              {openFaq === i && (
                <p className="pb-4 text-sm font-body text-muted-foreground leading-relaxed">{faq.a}</p>
              )}
            </div>
          ))}
        </div>
      </RevealSection>

      <RevealSection>
        <div className="text-center flex flex-col sm:flex-row gap-3 justify-center">
          <Link
            href="/reviews"
            className="inline-block text-[11px] uppercase tracking-[0.3em] font-body font-medium text-primary border border-primary/50 px-8 py-3 hover:bg-primary/10 transition-colors"
          >
            Read All Reviews
          </Link>
          <a
            href="https://wa.me/447449507661"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center justify-center gap-2 text-[11px] uppercase tracking-[0.3em] font-body font-medium text-white px-8 py-3 transition-all hover:opacity-90"
            style={{ background: "linear-gradient(135deg, #25D366, #1DA851)" }}
          >
            <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor">
              <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L.057 24l6.305-1.654a11.882 11.882 0 005.683 1.448h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
            </svg>
            WhatsApp Us
          </a>
        </div>
      </RevealSection>
    </section>
  );
}

/* ─── Home root ─────────────────────────────────────────── */
export function Home() {
  const scrollToNureh = useRef(false);
  const [videoDone, setVideoDone] = useState(() => {
    try {
      if (sessionStorage.getItem("luxe_from_shop") === "1") {
        scrollToNureh.current = true;
        return true;
      }
      return sessionStorage.getItem("luxe_hero_done") === "1";
    } catch { return false; }
  });
  useRevealOnScroll();

  const handleVideoExit = useCallback(() => {
    try { sessionStorage.setItem("luxe_hero_done", "1"); } catch {}
    setVideoDone(true);
  }, []);

  useEffect(() => {
    if (videoDone && scrollToNureh.current) {
      scrollToNureh.current = false;
      try { sessionStorage.removeItem("luxe_from_shop"); } catch {}
      setTimeout(() => {
        document.getElementById("nureh-section")?.scrollIntoView({ behavior: "smooth" });
      }, 150);
    }
  }, [videoDone]);

  return (
    <div className="w-full">
      {!videoDone && <VideoHero onExit={handleVideoExit} />}
      {/* Main content — only visible after video hero is dismissed */}
      <div
        style={{
          visibility: videoDone ? "visible" : "hidden",
          transition: "opacity 0.6s ease",
          opacity: videoDone ? 1 : 0,
        }}
      >
        {/* SEO intro section — visible text for Google indexing */}
        <section className="py-20 px-6 border-b border-border/30" style={{ background: "linear-gradient(180deg, hsl(265,30%,5%) 0%, hsl(265,28%,7%) 100%)" }}>
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-[10px] uppercase tracking-[0.5em] text-primary font-body mb-5">Luxury Fashion UK</p>
            <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-6 leading-tight">
              Luxury Fashion UK — Stitched Suits,<br className="hidden md:block" />
              <em className="text-primary not-italic"> Levi's Jeans &amp; Designer Accessories</em>
            </h1>
            <div className="mx-auto mb-8" style={{ width: 100, height: 1, background: "linear-gradient(90deg, transparent, hsl(270,80%,65%), transparent)" }} />
            <p className="font-body text-base text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
              Welcome to Luxe &amp; Line — your destination for premium luxury fashion in the UK. We offer fully stitched suits from the Nureh Gardenia and Charizma Sunshine collections, authentic Levi's jeans for women, genuine Atrix leather wallets, and handcrafted Kunafa chocolates. All suits are fully stitched and ready to wear. Fast UK delivery available on every order. Order via WhatsApp for personalised service.
            </p>
            <p className="font-body text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-6">
              Our Nureh Gardenia Summer 2026 collection features 10 stunning embroidered lawn suits with chiffon dupattas — each piece beautifully crafted and ready to wear. The Luxury Pret Vol-1 range offers elegant embroidered cotton lawn at an exceptional price point, while our Charizma Sunshine collection brings vibrant summer prints to your wardrobe. Every suit is available in sizes S, M, L, XL and XXL, with UK delivery included in the price.
            </p>
            <p className="font-body text-sm text-muted-foreground max-w-3xl mx-auto leading-relaxed mb-8">
              Beyond clothing, Luxe &amp; Line curates a selection of premium Atrix genuine leather wallets — available in accordion and snap-button styles in brown and beige — and our exclusive Kunafa chocolates by B.C.C, filled with rich pistachio in premium chocolate. Whether you are looking for a gift, a treat, or a statement outfit, Luxe &amp; Line delivers quality and luxury to your door across the UK. Free delivery is included on everything we sell.
            </p>
            <div className="flex flex-wrap gap-3 justify-center">
              <a href="/shop?category=shalwar-kameez" className="text-[10px] uppercase tracking-widest font-body text-primary border border-primary/40 px-5 py-2.5 hover:bg-primary/10 transition-colors">Shop Stitched Suits</a>
              <a href="/shop?category=jeans" className="text-[10px] uppercase tracking-widest font-body text-primary border border-primary/40 px-5 py-2.5 hover:bg-primary/10 transition-colors">Shop Levi's Jeans</a>
              <a href="/shop?category=wallets" className="text-[10px] uppercase tracking-widest font-body text-primary border border-primary/40 px-5 py-2.5 hover:bg-primary/10 transition-colors">Shop Wallets</a>
              <a href="/shop" className="text-[10px] uppercase tracking-widest font-body text-white px-5 py-2.5 transition-all hover:opacity-90" style={{ background: "linear-gradient(135deg, hsl(270,80%,65%), hsl(270,60%,48%))" }}>View All Collections</a>
            </div>
          </div>
        </section>

        <div id="nureh-section"><NurehGardeniaSection /></div>
        <ZeenatSection />
        <CharizmaSection />
        <JeansSection />
        <WalletsSection />
        <KunafaSection />
        <BrandBanner />
        <HomepageReviews />
        <ContactStrip />
      </div>
    </div>
  );
}
