import { serve } from 'https://deno.land/std@0.168.0/http/server.ts';

// Secret is read from the Supabase Edge Function environment — set it with:
//   supabase secrets set RESEND_API_KEY=re_xxx
// Never hardcode it here; this file is committed to the repo.
const RESEND_API_KEY = Deno.env.get('RESEND_API_KEY');

function renderEmail(otp: string) {
  return `
    <!DOCTYPE html>
    <html>
    <body style="background:#0d0d0d;font-family:sans-serif;padding:40px;text-align:center;">
      <div style="max-width:480px;margin:0 auto;">
        <h1 style="color:#58cc02;font-size:32px;margin-bottom:8px;">Stacked</h1>
        <p style="color:#cccccc;font-size:16px;margin-bottom:32px;">
          Your verification code is:
        </p>
        <div style="background:#1a1a1a;border:2px solid #58cc02;border-radius:16px;padding:32px;margin-bottom:32px;">
          <span style="color:#58cc02;font-size:48px;font-weight:900;letter-spacing:12px;">
            ${otp}
          </span>
        </div>
        <p style="color:#555555;font-size:13px;">
          This code expires in 10 minutes.<br/>
          If you didn't request this, you can safely ignore this email.
        </p>
      </div>
    </body>
    </html>
  `;
}

serve(async (req) => {
  if (!RESEND_API_KEY) {
    return new Response(JSON.stringify({ error: 'RESEND_API_KEY is not configured' }), {
      status: 500,
      headers: { 'Content-Type': 'application/json' },
    });
  }

  const { email, otp } = await req.json();

  const res = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'Stacked <hello@yourdomain.com>',
      to: [email],
      subject: 'Your Stacked verification code',
      html: renderEmail(otp ?? ''),
    }),
  });

  const data = await res.json();
  return new Response(JSON.stringify(data), {
    headers: { 'Content-Type': 'application/json' },
  });
});
