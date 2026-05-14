import { useEffect, useRef } from "react";

function FloatingShapes() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;
    const resize = () => { canvas.width = window.innerWidth; canvas.height = window.innerHeight; };
    resize();
    window.addEventListener("resize", resize);
    const items: Array<{x:number;y:number;vy:number;size:number;opacity:number}> = Array.from({length:30},()=>({
      x: Math.random()*window.innerWidth,
      y: Math.random()*window.innerHeight,
      vy: -(Math.random()*0.4+0.1),
      size: Math.random()*4+1,
      opacity: Math.random()*0.15+0.03,
    }));
    let animId: number;
    const draw = () => {
      ctx.clearRect(0,0,canvas.width,canvas.height);
      for(const p of items){
        p.y+=p.vy;
        if(p.y<-10) p.y=canvas.height+10;
        ctx.beginPath();
        ctx.arc(p.x,p.y,p.size,0,Math.PI*2);
        ctx.fillStyle=`rgba(201,168,76,${p.opacity})`;
        ctx.fill();
      }
      animId=requestAnimationFrame(draw);
    };
    draw();
    return ()=>{cancelAnimationFrame(animId);window.removeEventListener("resize",resize);};
  },[]);
  return <canvas ref={canvasRef} className="fixed inset-0 pointer-events-none z-0"/>;
}

export function Policy() {
  return (
    <div className="relative min-h-screen bg-background">
      <FloatingShapes />
      <div className="relative z-10 max-w-3xl mx-auto px-6 py-20">
        <div className="text-center mb-12">
          <p className="text-xs uppercase tracking-[0.3em] text-primary font-body mb-4">Legal</p>
          <h1 className="font-serif text-4xl md:text-5xl text-foreground mb-4">Privacy Policy</h1>
          <div className="luxury-divider w-32 mx-auto" />
          <p className="text-xs font-body text-muted-foreground mt-4">Last updated: May 2026</p>
        </div>

        <div className="bg-card/80 backdrop-blur-sm border border-border p-8 space-y-8 font-body text-sm text-muted-foreground leading-relaxed">
          {[
            {
              title: "1. Information We Collect",
              body: "When you place an order with Luxe & Line, we collect personal information including your name, email address, phone number, and delivery address. We may also collect information about your browsing behaviour on our website to improve your shopping experience."
            },
            {
              title: "2. How We Use Your Information",
              body: "Your information is used solely to process and fulfil your orders, communicate with you about your order status, and improve our services. We do not sell, rent, or share your personal information with third parties for marketing purposes."
            },
            {
              title: "3. Data Storage & Security",
              body: "All personal data is stored securely and encrypted where applicable. We retain your data for a period of 2 years from your last order to comply with UK legal requirements. You may request deletion of your data at any time by contacting us."
            },
            {
              title: "4. Cookies",
              body: "Our website uses essential cookies to maintain your shopping cart and session. We do not use tracking or advertising cookies. You can disable cookies in your browser settings, though this may affect the functionality of our cart."
            },
            {
              title: "5. Your Rights (UK GDPR)",
              body: "Under UK GDPR, you have the right to access, rectify, or erase your personal data. You also have the right to restrict or object to processing, and the right to data portability. To exercise any of these rights, contact us at hello@luxeandline.co.uk."
            },
            {
              title: "6. Third-Party Services",
              body: "We may use trusted third-party services for payment processing and email delivery. These services are bound by their own privacy policies and are only provided with the minimum information necessary to perform their functions."
            },
            {
              title: "7. Contact",
              body: "For any privacy-related queries, contact: Atif Shah, hello@luxeandline.co.uk, 39 Stanley Street, L7 0JN, Liverpool, UK."
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
