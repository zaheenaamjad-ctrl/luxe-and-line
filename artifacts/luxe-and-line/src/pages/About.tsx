import { useEffect, useRef } from "react";

function ParticleBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const resize = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resize();
    window.addEventListener("resize", resize);

    interface Particle {
      x: number; y: number; vx: number; vy: number;
      size: number; opacity: number; hue: number; rotation: number; rotSpeed: number;
    }
    const particles: Particle[] = Array.from({ length: 60 }, () => ({
      x: Math.random() * window.innerWidth,
      y: Math.random() * window.innerHeight,
      vx: (Math.random() - 0.5) * 0.4,
      vy: (Math.random() - 0.5) * 0.4,
      size: Math.random() * 8 + 2,
      opacity: Math.random() * 0.3 + 0.05,
      hue: Math.random() * 30 + 35,
      rotation: Math.random() * Math.PI * 2,
      rotSpeed: (Math.random() - 0.5) * 0.02,
    }));

    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      for (const p of particles) {
        p.x += p.vx;
        p.y += p.vy;
        p.rotation += p.rotSpeed;
        if (p.x < -20) p.x = canvas.width + 20;
        if (p.x > canvas.width + 20) p.x = -20;
        if (p.y < -20) p.y = canvas.height + 20;
        if (p.y > canvas.height + 20) p.y = -20;

        ctx.save();
        ctx.translate(p.x, p.y);
        ctx.rotate(p.rotation);
        ctx.globalAlpha = p.opacity;
        ctx.strokeStyle = `hsl(${p.hue}, 65%, 55%)`;
        ctx.lineWidth = 1;
        // Draw diamond
        const s = p.size;
        ctx.beginPath();
        ctx.moveTo(0, -s); ctx.lineTo(s, 0); ctx.lineTo(0, s); ctx.lineTo(-s, 0);
        ctx.closePath();
        ctx.stroke();
        ctx.restore();
      }
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);

  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0 opacity-40" />;
}

export function About() {
  return (
    <div className="relative min-h-screen bg-background">
      <ParticleBackground />
      <div className="relative z-10 max-w-4xl mx-auto px-6 py-20">
        <div className="text-center mb-16">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Our Story</p>
          <h1 className="font-serif text-5xl md:text-6xl gold-shimmer mb-6">About Luxe & Line</h1>
          <div className="luxury-divider w-40 mx-auto" />
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-6">Our Heritage</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              Luxe & Line was born from a simple belief: that the exquisite craftsmanship of South Asian fashion should be accessible to every British Pakistani family, without the need to travel thousands of miles to find it.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              Founded in Liverpool, we bridge the gap between the vibrant fashion houses of Lahore and the doorsteps of the UK — bringing authentic luxury, one beautifully wrapped parcel at a time.
            </p>
          </div>
          <div>
            <h2 className="font-serif text-2xl text-foreground mb-6">Our Promise</h2>
            <p className="text-muted-foreground font-body text-sm leading-relaxed mb-4">
              Every piece we curate is hand-selected for its quality, authenticity, and craftsmanship. We work directly with some of Pakistan's most respected fashion houses — Nureh, Charizma, Zeenet — to ensure you receive only the finest.
            </p>
            <p className="text-muted-foreground font-body text-sm leading-relaxed">
              All prices include UK delivery. All suits are available stitched to your measurements. We believe luxury should be effortless.
            </p>
          </div>
        </div>

        <div className="grid grid-cols-2 md:grid-cols-4 gap-6 mb-16">
          {[
            { num: "500+", label: "Happy Customers" },
            { num: "3", label: "Premium Brands" },
            { num: "100%", label: "UK Delivery" },
            { num: "5★", label: "Average Rating" },
          ].map((stat) => (
            <div key={stat.label} className="bg-card border border-border p-6 text-center">
              <p className="font-serif text-3xl text-primary mb-2">{stat.num}</p>
              <p className="text-xs uppercase tracking-widest font-body text-muted-foreground">{stat.label}</p>
            </div>
          ))}
        </div>

        <div className="bg-card border border-primary/30 p-8 text-center">
          <h2 className="font-serif text-2xl text-foreground mb-4">Meet the Team</h2>
          <div className="w-16 h-16 bg-primary/20 rounded-full flex items-center justify-center mx-auto mb-4">
            <span className="font-serif text-2xl text-primary">A</span>
          </div>
          <h3 className="font-serif text-xl text-foreground mb-1">Atif Shah</h3>
          <p className="text-xs uppercase tracking-widest font-body text-primary mb-3">Founder & Curator</p>
          <p className="text-sm font-body text-muted-foreground max-w-md mx-auto">
            Based in Liverpool's Fairfield neighbourhood, Atif curates every piece with passion for Pakistani fashion and a deep understanding of what the British market truly desires.
          </p>
        </div>
      </div>
    </div>
  );
}
