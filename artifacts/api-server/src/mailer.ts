import { Resend } from "resend";

const resend = process.env.RESEND_API_KEY ? new Resend(process.env.RESEND_API_KEY) : null;
const FROM = process.env.RESEND_FROM ?? "Luxe & Line <onboarding@resend.dev>";
export const ADMIN_NOTIFICATION_EMAILS = ["syedimad348@gmail.com", "zaheenaamjad@gmail.com", "luxeline26@gmail.com"];

interface OrderEmailData {
  orderId: number;
  customerName: string;
  customerEmail: string;
  address: string;
  city?: string | null;
  postCode?: string | null;
  paymentMethod: string;
  items: Array<{ name: string; quantity: number; price: number }>;
  total: number;
}

export async function sendOrderConfirmationEmail(data: OrderEmailData): Promise<void> {
  if (!resend) return;

  const itemsHtml = data.items
    .map(
      (item) =>
        `<tr>
          <td style="padding:8px 0;border-bottom:1px solid #2a1f3d;color:#c8b8e8;font-size:13px;">${item.name} × ${item.quantity}</td>
          <td style="padding:8px 0;border-bottom:1px solid #2a1f3d;color:#c8b8e8;font-size:13px;text-align:right;">£${(item.price * item.quantity).toFixed(2)}</td>
        </tr>`
    )
    .join("");

  const addressLines = [data.address, data.city, data.postCode].filter(Boolean).join(", ");
  const paymentText =
    data.paymentMethod === "bank-transfer"
      ? "Bank Transfer — we will email you our bank details. Please transfer within 48 hours."
      : "Cash on Delivery — pay when your order arrives.";

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#13101f;border:1px solid #2a1f3d;max-width:560px;">
        <tr>
          <td style="padding:32px 40px;border-bottom:1px solid #2a1f3d;text-align:center;">
            <p style="margin:0 0 4px;color:#a78bfa;font-size:10px;letter-spacing:4px;text-transform:uppercase;">Order Confirmed</p>
            <h1 style="margin:0;color:#f5f0ff;font-size:28px;font-weight:300;letter-spacing:1px;">LUXE &amp; LINE</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="color:#c8b8e8;font-size:15px;margin:0 0 8px;">Dear <strong style="color:#f5f0ff;">${data.customerName}</strong>,</p>
            <p style="color:#9080b0;font-size:13px;line-height:1.7;margin:0 0 24px;">
              Thank you for your order. We have received it and will process it shortly.
              Your order will be dispatched once payment is confirmed — estimated delivery is <strong style="color:#f5f0ff;">4–5 business days</strong>.
            </p>
            <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom:24px;">
              <tr><td style="color:#a78bfa;font-size:10px;letter-spacing:3px;text-transform:uppercase;padding-bottom:12px;">Order #${data.orderId}</td></tr>
              ${itemsHtml}
              <tr>
                <td style="padding:12px 0 0;color:#f5f0ff;font-size:16px;font-weight:600;">Total</td>
                <td style="padding:12px 0 0;color:#a78bfa;font-size:16px;font-weight:600;text-align:right;">£${data.total.toFixed(2)}</td>
              </tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:16px;margin-bottom:24px;">
              <tr><td style="color:#a78bfa;font-size:10px;letter-spacing:3px;text-transform:uppercase;padding-bottom:10px;">Delivery Address</td></tr>
              <tr><td style="color:#c8b8e8;font-size:13px;">${addressLines || data.address}</td></tr>
            </table>
            <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;padding:16px;margin-bottom:24px;">
              <tr><td style="color:#a78bfa;font-size:10px;letter-spacing:3px;text-transform:uppercase;padding-bottom:10px;">Payment</td></tr>
              <tr><td style="color:#c8b8e8;font-size:13px;">${paymentText}</td></tr>
            </table>
            <p style="color:#9080b0;font-size:12px;line-height:1.7;margin:0 0 8px;">For any queries, please contact us:</p>
            <p style="color:#c8b8e8;font-size:13px;margin:0 0 4px;">📞 +44 7449 507661</p>
            <p style="color:#c8b8e8;font-size:13px;margin:0 0 4px;">✉️ luxeline26@gmail.com</p>
            <p style="color:#c8b8e8;font-size:13px;">📍 39 Stanley Street, L7 0JN, Liverpool, UK</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2a1f3d;text-align:center;">
            <p style="margin:0;color:#6040a0;font-size:11px;">© Luxe &amp; Line · Liverpool, United Kingdom</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: data.customerEmail,
      subject: `Your Luxe & Line order #${data.orderId} is confirmed`,
      html,
    });
    const adminHtml = `<p style="font-family:Arial,sans-serif;color:#333;">
      New order <strong>#${data.orderId}</strong> from <strong>${data.customerName}</strong> (${data.customerEmail})<br/>
      Total: <strong>£${data.total.toFixed(2)}</strong> via ${data.paymentMethod}<br/>
      Address: ${addressLines || data.address}
    </p>`;
    await resend.emails.send({
      from: FROM,
      to: ADMIN_NOTIFICATION_EMAILS,
      subject: `🛍️ New Order #${data.orderId} — £${data.total.toFixed(2)}`,
      html: adminHtml,
    });
  } catch {
    // silently fail — email should never crash checkout
  }
}

export async function sendWelcomeEmail(name: string, email: string): Promise<void> {
  if (!resend) return;

  const html = `<!DOCTYPE html>
<html>
<head><meta charset="utf-8" /></head>
<body style="margin:0;padding:0;background:#0d1117;font-family:'Helvetica Neue',Arial,sans-serif;">
  <table width="100%" cellpadding="0" cellspacing="0" style="background:#0d1117;">
    <tr><td align="center" style="padding:40px 20px;">
      <table width="560" cellpadding="0" cellspacing="0" style="background:#13101f;border:1px solid #2a1f3d;max-width:560px;">
        <tr>
          <td style="padding:32px 40px;border-bottom:1px solid #2a1f3d;text-align:center;">
            <p style="margin:0 0 4px;color:#a78bfa;font-size:10px;letter-spacing:4px;text-transform:uppercase;">Welcome</p>
            <h1 style="margin:0;color:#f5f0ff;font-size:28px;font-weight:300;letter-spacing:1px;">LUXE &amp; LINE</h1>
          </td>
        </tr>
        <tr>
          <td style="padding:32px 40px;">
            <p style="color:#c8b8e8;font-size:15px;margin:0 0 16px;">Welcome to Luxe &amp; Line, <strong style="color:#f5f0ff;">${name}</strong>! 💜</p>
            <p style="color:#9080b0;font-size:13px;line-height:1.7;margin:0 0 24px;">
              Your account has been created successfully. You can now browse our exclusive collections of premium Pakistani fashion,
              leather accessories and artisan confectionery — with free UK delivery included on every item.
            </p>
            <p style="color:#9080b0;font-size:12px;margin:0 0 8px;">Questions? We're always here:</p>
            <p style="color:#c8b8e8;font-size:13px;margin:0 0 4px;">📞 +44 7449 507661</p>
            <p style="color:#c8b8e8;font-size:13px;margin:0 0 4px;">✉️ luxeline26@gmail.com</p>
            <p style="color:#c8b8e8;font-size:13px;">🌐 www.luxeandline.co.uk</p>
          </td>
        </tr>
        <tr>
          <td style="padding:20px 40px;border-top:1px solid #2a1f3d;text-align:center;">
            <p style="margin:0;color:#6040a0;font-size:11px;">© Luxe &amp; Line · Liverpool, United Kingdom</p>
          </td>
        </tr>
      </table>
    </td></tr>
  </table>
</body>
</html>`;

  try {
    await resend.emails.send({
      from: FROM,
      to: email,
      subject: "Welcome to Luxe & Line 💜",
      html,
    });
    const adminHtml = `<p style="font-family:Arial,sans-serif;color:#333;">
      New customer registration: <strong>${name}</strong> (${email})
    </p>`;
    await resend.emails.send({
      from: FROM,
      to: ADMIN_NOTIFICATION_EMAILS,
      subject: `👤 New Customer: ${name}`,
      html: adminHtml,
    });
  } catch {
    // silently fail
  }
}
