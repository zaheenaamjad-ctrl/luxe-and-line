import { useEffect, useRef } from "react";

function GridAnimation() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    let time = 0;
    let animId: number;
    const draw = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);
      const spacing = 60;
      const cols = Math.ceil(canvas.width / spacing) + 1;
      const rows = Math.ceil(canvas.height / spacing) + 1;
      for (let i = 0; i < cols; i++) {
        for (let j = 0; j < rows; j++) {
          const x = i * spacing;
          const y = j * spacing;
          const dist = Math.sqrt((x - canvas.width/2)**2 + (y - canvas.height/2)**2);
          const pulse = Math.sin(dist * 0.01 - time * 0.5) * 0.5 + 0.5;
          const opacity = pulse * 0.06;
          ctx.beginPath();
          ctx.arc(x, y, 1.5, 0, Math.PI * 2);
          ctx.fillStyle = `rgba(201,168,76,${opacity})`;
          ctx.fill();
        }
      }
      time += 0.05;
      animId = requestAnimationFrame(draw);
    };
    draw();
    return () => { cancelAnimationFrame(animId); window.removeEventListener("resize", resize); };
  }, []);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0" />;
}

export function Terms() {
  return (
    <div className="relative min-h-screen bg-background">
      <GridAnimation />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Terms & Conditions</h1>
          <div className="luxury-divider w-32 mx-auto" />
          <p className="text-xs font-body text-muted-foreground mt-4">Last updated: May 2026</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border p-8 space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
          {[
            {
              title: "1. Acceptance of Terms",
              body: "By using the Luxe & Line website and placing an order, you agree to these Terms & Conditions in full. If you do not agree, please refrain from using our services."
            },
            {
              title: "2. Products & Pricing",
              body: "All prices are shown in British Pounds (GBP) and include UK delivery unless otherwise stated. Product colours may vary slightly from screen representations. For stitched garments, measurements provided by the customer are the customer's responsibility."
            },
            {
              title: "3. Order Confirmation",
              body: "An order is confirmed only upon receipt of payment (for bank transfer orders) or acceptance by Luxe & Line (for cash on delivery orders). We reserve the right to cancel any order in cases of pricing errors, product unavailability, or suspected fraud."
            },
            {
              title: "4. Payment",
              body: "We accept bank transfer and cash on delivery (UK only). For bank transfers, payment must be received within 48 hours of placing your order, otherwise the order may be cancelled. We will provide bank details via email or WhatsApp upon order placement."
            },
            {
              title: "5. Delivery",
              body: "We deliver within the UK only. Delivery typically takes 3-7 business days from the date of payment confirmation. Luxe & Line is not liable for delays caused by postal services or customs. Tracking information will be provided where available."
            },
            {
              title: "6. Returns & Refunds",
              body: "For hygiene and custom-stitch reasons, we do not accept returns on stitched garments unless they arrive damaged or defective. Unstitched fabric returns are accepted within 7 days of delivery if unopened and in original condition. Contact us at hello@luxeandline.co.uk within 48 hours of delivery to initiate a return."
            },
            {
              title: "7. Food Products",
              body: "Our Pistachio Kunafa Bites and any food products are sold as-is with full ingredient and allergen information provided on packaging. Luxe & Line is not responsible for adverse reactions. Please check allergen information before purchase."
            },
            {
              title: "8. Intellectual Property",
              body: "All content on this website, including images, text, and designs, is the property of Luxe & Line or its respective brand partners. Reproduction without written consent is prohibited."
            },
            {
              title: "9. Governing Law",
              body: "These terms are governed by the laws of England and Wales. Any disputes shall be subject to the exclusive jurisdiction of the courts of England and Wales."
            },
            {
              title: "10. Contact",
              body: "For any queries regarding these terms: hello@luxeandline.co.uk | +44 7405 358689 | 39 Stanley Street, L7 0JN, Liverpool, UK."
            },
          ].map(({ title, body }) => (
            <div key={title}>
              <h2 className="font-serif text-lg text-foreground mb-3">{title}</h2>
              <p>{body}</p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
