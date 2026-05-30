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

const sections = [
  {
    title: "1. Acceptance of Terms",
    body: "By accessing the Luxe & Line website and/or placing an order, you agree to be bound by these Terms & Conditions in full. If you do not agree to these terms, please do not use our website or services. We reserve the right to update these terms at any time, with changes taking effect upon posting."
  },
  {
    title: "2. About Us",
    body: "Luxe & Line is a UK-based luxury fashion and lifestyle boutique operating from Liverpool, Merseyside, United Kingdom. We curate and sell premium fashion garments, accessories, and artisan food products. Contact: hello@luxeandline.uk | +44 7449 507661 | 39 Stanley Street, L7 0JN, Liverpool, UK."
  },
  {
    title: "3. Products & Pricing",
    body: "All prices displayed on our website are in British Pounds Sterling (GBP) and include UK delivery unless explicitly stated otherwise. Product colours may vary slightly from on-screen representations due to monitor calibration differences. Product images are for illustrative purposes and the actual item may vary slightly. We reserve the right to correct pricing errors at any time, and will always notify you before processing payment."
  },
  {
    title: "4. Order Placement & Confirmation",
    body: "An order is confirmed only upon: (a) receipt of full payment for bank transfer orders; or (b) written acceptance by Luxe & Line for cash on delivery orders. You will receive an order confirmation via email. We reserve the right to cancel any order in cases of pricing errors, stock unavailability, suspected fraud, or incomplete delivery information. If we cancel your order, you will receive a full refund within 5–7 business days."
  },
  {
    title: "5. Payment",
    body: "We accept two payment methods: (a) Bank Transfer — bank details will be provided via email or WhatsApp upon order placement. Payment must be received within 48 hours; otherwise the order may be cancelled. (b) Cash on Delivery — available across the UK; subject to acceptance by Luxe & Line at our discretion. We do not store or process any card details."
  },
  {
    title: "6. Delivery",
    body: "We deliver within the United Kingdom only. Standard delivery takes 4–5 business days from the date of payment confirmation. During peak periods (e.g. Eid season), delivery may take up to 7 business days. Luxe & Line is not liable for delays caused by Royal Mail, courier services, or any circumstances beyond our control. Tracking information will be provided where available."
  },
  {
    title: "7. Returns & Refunds",
    body: "We want you to be completely satisfied with your purchase. Returns are accepted under the following conditions: (a) Items must be returned within 7 days of delivery; (b) Items must be in their original, unused, unwashed condition with all tags intact; (c) For hygiene reasons, stitched-to-order garments cannot be returned unless they are faulty or damaged on arrival. To initiate a return, contact us at hello@luxeandline.uk within 48 hours of receiving your order. Refunds will be processed within 5–7 business days."
  },
  {
    title: "8. Food Products",
    body: "Our Kunafa Chocolates and any other food products are sold with full ingredient and allergen information provided on packaging. Luxe & Line is not responsible for adverse reactions to food products. Please review all allergen information carefully before purchasing. Food products are non-refundable once dispatched unless they arrive damaged or in an unsatisfactory condition."
  },
  {
    title: "9. Customer Responsibilities",
    body: "You are responsible for: (a) providing accurate delivery information at checkout; (b) ensuring someone is available to receive the delivery; (c) reviewing product descriptions and allergen information before purchase; (d) ensuring measurements provided for custom or stitched garments are accurate. Luxe & Line cannot be held responsible for errors arising from inaccurate information provided by the customer."
  },
  {
    title: "10. Intellectual Property",
    body: "All content on the Luxe & Line website — including but not limited to images, text, logos, designs, and product descriptions — is the intellectual property of Luxe & Line or its respective brand partners. Reproduction, distribution, or commercial use of any content without prior written consent from Luxe & Line is strictly prohibited."
  },
  {
    title: "11. Limitation of Liability",
    body: "Luxe & Line's liability is limited to the value of the goods purchased. We are not liable for any indirect, incidental, or consequential losses arising from the use of our products or services. We do not guarantee uninterrupted access to our website and accept no responsibility for website downtime or technical errors."
  },
  {
    title: "12. Governing Law",
    body: "These Terms & Conditions are governed by and construed in accordance with the laws of England and Wales. Any disputes arising from these terms or your use of our services shall be subject to the exclusive jurisdiction of the courts of England and Wales."
  },
  {
    title: "13. Contact",
    body: "For any queries regarding these terms, please contact us: Email: hello@luxeandline.uk | Phone: +44 7405 358689 | Address: 39 Stanley Street, L7 0JN, Liverpool, Merseyside, UK."
  },
];

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
          <p className="text-foreground/70 text-sm leading-relaxed border-l-2 border-primary pl-4">
            Please read these Terms & Conditions carefully before using our website or placing an order. These terms apply to all customers who purchase or browse Luxe & Line products and services.
          </p>
          {sections.map(({ title, body }) => (
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
