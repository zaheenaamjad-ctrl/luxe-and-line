import { useEffect, useRef } from "react";
import { Link } from "wouter";
import { MapPin, Phone, Mail, Shield, Truck, Star, Clock } from "lucide-react";

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    interface Particle { x: number; y: number; vx: number; vy: number; size: number; opacity: number; rotation: number; rotSpeed: number; }
    const particles: Particle[] = Array.from({ length: 50 }, () => ({
      x: Math.random() * window.innerWidth, y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.3, vy: (Math.random() - 0.5) * 0.3,
      size: Math.random() * 6 + 2, opacity: Math.random() * 0.2 + 0.03,
      rotation: Math.random() * Math.PI * 2, rotSpeed: (Math.random() - 0.5) * 0.015,
    }));
    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx; p.y += p.vy; p.rotation += p.rotSpeed;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;
        ctx.save(); ctx.translate(p.x, p.y); ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity; ctx.strokeStyle = "hsl(270,70%,60%)"; ctx.lineWidth = 0.8;
        const s = p.size;
        ctx.beginPath(); ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0); ctx.closePath(); ctx.stroke();
        ctx.restore();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-30" />;
}

export function About() {
  return (
    <div className="relative min-h-screen bg-background">
      <ParticleBackground />

      {/* Hero */}
      <div className="relative z-10 border-b border-border/30" style={{ background: "linear-gradient(180deg, hsl(265,30%,5%) 0%, hsl(265,28%,7%) 100%)" }}>
        <div className="max-w-4xl mx-auto px-6 py-28 text-center">
          <p className="text-[10px] uppercase tracking-[0.5em] text-primary font-body mb-5">Est. United Kingdom</p>
          <h1 className="font-serif text-5xl md:text-7xl text-foreground mb-6 leading-tight">
            Curated for the<br />
            <span className="gold-shimmer">Modern UK</span> Wardrobe
          </h1>
          <div className="luxury-divider w-32 mx-auto mb-8" />
          <p className="font-body text-base text-muted-foreground max-w-xl mx-auto leading-relaxed">
            Luxe & Line brings the finest fashion, accessories and artisan goods directly to doorsteps across the United Kingdom — without compromise on quality, authenticity or service.
          </p>
        </div>
      </div>

      {/* Brand Story */}
      <div className="relative z-10 max-w-6xl mx-auto px-6 py-24">
        <div className="grid grid-cols-1 md:grid-cols-2 gap-16 mb-24">
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-4">Our Heritage</p>
            <h2 className="font-serif text-3xl text-foreground mb-6 leading-snug">Our Story</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              Luxe & Line was founded with one clear purpose: to make the exquisite craftsmanship of luxury fashion accessible to every family across the UK — bringing the finest collections directly to your door.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              We bridge the gap between the world's finest fashion houses and the doorsteps of the UK — bringing authentic luxury, one beautifully wrapped parcel at a time.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Every collection is hand-selected for its craftsmanship, fabric quality and design. We never compromise on what arrives at your door.
            </p>
          </div>
          <div>
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-4">Our Commitment</p>
            <h2 className="font-serif text-3xl text-foreground mb-6 leading-snug">Our Mission</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              We work directly with the most respected fashion houses — Nureh, Charizma, Luxury Pret Collection — ensuring you receive only the finest embroidered lawns, printed chiffons and luxury pret.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              All prices include UK delivery. No hidden charges. No surprises. Just the garments you love, delivered safely and swiftly.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              We also curate premium accessories — handcrafted leather wallets, Levi's denim — and artisan Kunafa Chocolates to bring a little more joy to every order.
            </p>
          </div>
        </div>

        {/* Stats */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-px bg-border/30 border border-border/30 mb-24">
          {[
            { num: "500+", label: "Orders Fulfilled" },
            { num: "4", label: "Premium Brands" },
            { num: "100%", label: "UK Delivery Included" },
            { num: "4–5", label: "Day Delivery" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card px-8 py-10 text-center">
              <p className="font-serif text-4xl text-primary mb-2 price-glow">{stat.num}</p>
              <p className="text-[10px] uppercase tracking-widest font-body text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        {/* Values */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-3">Why Choose Us</p>
            <h2 className="font-serif text-4xl text-foreground">Why Choose Luxe &amp; Line</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {[
              { icon: Shield, title: "Authenticity Guaranteed", desc: "Every item is sourced directly from the world's leading fashion houses. No replicas, no compromises." },
              { icon: Truck, title: "UK Delivery Included", desc: "All prices include nationwide UK delivery. What you see is what you pay — always." },
              { icon: Star, title: "Curated Selection", desc: "We select only the finest seasonal collections, laser-focused on quality and contemporary style." },
              { icon: Clock, title: "Prompt & Personal", desc: "Orders dispatched swiftly. Every customer is treated as a valued guest, not a transaction." },
            ].map(({ icon: Icon, title, desc }) => (
              <div key={title} className="bg-card border border-border/50 p-6 hover:border-primary/40 transition-colors duration-500">
                <div className="w-10 h-10 border border-primary/40 flex items-center justify-center mb-4">
                  <Icon size={18} className="text-primary" />
                </div>
                <h3 className="font-serif text-lg text-foreground mb-2">{title}</h3>
                <p className="text-xs font-body text-muted-foreground leading-relaxed">{desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Brands We Carry */}
        <div className="mb-24 border border-border/30 p-10" style={{ background: "hsl(265,28%,6%)" }}>
          <div className="text-center mb-10">
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-3">Our Brands</p>
            <h2 className="font-serif text-3xl text-foreground">Curated from the finest fashion houses</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-8 text-center">
            {[
              { name: "Nureh Gardenia", desc: "Premium embroidered lawn — Eid & formal collections" },
              { name: "Charizma Sun Shine", desc: "Contemporary printed lawn for every season" },
              { name: "Luxury Pret Collection", desc: "Ready-to-wear fully stitched embroidered lawn with chiffon dupatta" },
              { name: "B.C.C. Confectionery", desc: "Artisan Kunafa Chocolates — premium gifting" },
            ].map((b) => (
              <div key={b.name} className="py-4 border-b border-border/30 md:border-b-0 md:border-r last:border-r-0 last:border-b-0 px-4">
                <p className="font-serif text-lg text-foreground mb-1">{b.name}</p>
                <p className="text-[10px] font-body text-muted-foreground leading-relaxed">{b.desc}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Product Gallery */}
        <div className="mb-24">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-3">Our Collections</p>
            <h2 className="font-serif text-4xl text-foreground">What we bring to your door</h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {[
              { src: "/product-images/nureh-gardenia/nsg-215.png", label: "Nureh Gardenia", alt: "Nureh Gardenia luxury stitched suit UK — embroidered lawn collection" },
              { src: "/product-images/charizma/css-01.png", label: "Charizma Sun Shine", alt: "Charizma Sun Shine designer stitched suit UK — premium embroidered collection" },
              { src: "/product-images/zeenat/zpsp-01.png", label: "Luxury Pret Collection", alt: "Luxury Pret fully stitched suit UK — ready to wear embroidered lawn" },
              { src: "/product-images/kunafa/k-jar-branded.png", label: "Kunafa Chocolates", alt: "B.C.C. Kunafa Chocolates UK — artisan pistachio filled gift box" },
            ].map((item) => (
              <div key={item.label} className="relative overflow-hidden group" style={{ aspectRatio: "3/4" }}>
                <img
                  src={item.src}
                  alt={item.alt}
                  className="absolute inset-0 w-full h-full object-cover transition-transform duration-700 group-hover:scale-105"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/70 via-transparent to-transparent" />
                <p className="absolute bottom-4 left-4 font-serif text-white text-sm">{item.label}</p>
              </div>
            ))}
          </div>
        </div>

        {/* Founders */}
        <div className="mb-20">
          <div className="text-center mb-12">
            <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-3">Meet the Founders</p>
            <h2 className="font-serif text-4xl text-foreground">The people behind the brand</h2>
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 max-w-2xl mx-auto mb-10">
            <div className="text-center bg-card border border-border/50 p-8">
              <div className="w-16 h-16 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-2xl text-primary">AK</span>
              </div>
              <h3 className="font-serif text-xl text-foreground mb-1">Amjad Khan</h3>
              <p className="text-[10px] uppercase tracking-widest font-body text-primary mb-3">Owner · Luxe &amp; Line UK</p>
              <div className="luxury-divider w-12 mx-auto mb-4" />
              <p className="text-xs font-body text-muted-foreground leading-relaxed">
                Visionary founder with a deep passion for craftsmanship and luxury fashion. Amjad established Luxe &amp; Line to bring the finest collections directly to UK homes.
              </p>
            </div>
            <div className="text-center bg-card border border-border/50 p-8">
              <div className="w-16 h-16 bg-primary/15 border border-primary/30 rounded-full flex items-center justify-center mx-auto mb-4">
                <span className="font-serif text-2xl text-primary">ZK</span>
              </div>
              <h3 className="font-serif text-xl text-foreground mb-1">Zaheena Khan</h3>
              <p className="text-[10px] uppercase tracking-widest font-body text-primary mb-3">Co-Founder · Luxe &amp; Line UK</p>
              <div className="luxury-divider w-12 mx-auto mb-4" />
              <p className="text-xs font-body text-muted-foreground leading-relaxed">
                Co-founder and curator of every collection. Zaheena brings an expert eye for quality, ensuring only the finest seasonal pieces make it to your door.
              </p>
            </div>
          </div>
          <div className="max-w-lg mx-auto text-center">
            <div className="space-y-2 text-xs font-body">
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <MapPin size={12} className="text-primary shrink-0" /> 39 Stanley Street, L7 0JN, Liverpool, UK
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Phone size={12} className="text-primary shrink-0" /> +44 7449 507661
              </div>
              <div className="flex items-center justify-center gap-2 text-muted-foreground">
                <Mail size={12} className="text-primary shrink-0" /> luxeline26@gmail.com
              </div>
            </div>
          </div>
        </div>

        {/* CTA */}
        <div className="text-center border-t border-border/30 pt-16">
          <p className="text-[10px] uppercase tracking-[0.4em] text-primary font-body mb-4">Ready to Shop?</p>
          <h2 className="font-serif text-4xl text-foreground mb-6">Explore the collection</h2>
          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Link href="/shop">
              <button className="bg-primary text-primary-foreground px-10 py-4 font-body uppercase tracking-widest text-xs hover:bg-primary/90 transition-colors">
                Shop Now
              </button>
            </Link>
            <Link href="/contact">
              <button className="border border-border text-foreground px-10 py-4 font-body uppercase tracking-widest text-xs hover:border-primary hover:text-primary transition-colors">
                Get in Touch
              </button>
            </Link>
          </div>
        </div>
      </div>
    </div>
  );
}
