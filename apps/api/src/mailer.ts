import nodemailer from 'nodemailer';
import { Resend } from 'resend';

interface SendVerificationCodeParams {
  to: string;
  code: string;
  userName?: string;
}

export async function sendResetCodeEmail({ to, code, userName }: SendVerificationCodeParams): Promise<boolean> {
  const resendApiKey = process.env.RESEND_API_KEY;
  const smtpHost = process.env.SMTP_HOST;
  const smtpPort = Number(process.env.SMTP_PORT) || 587;
  const smtpUser = process.env.SMTP_USER?.trim();
  const smtpPass = process.env.SMTP_PASS ? process.env.SMTP_PASS.replace(/\s+/g, '') : undefined;
  const emailFrom = process.env.SMTP_FROM || process.env.EMAIL_FROM || '"Eddam Overlay Studio" <onboarding@resend.dev>';

  // Banner en consola para desarrollo y logs de Render
  console.log('\n======================================================');
  console.log(`🔑 [AUTH] CÓDIGO DE RECUPERACIÓN GENERADO`);
  console.log(`📧 Destinatario: ${to}`);
  console.log(`⚡ CÓDIGO DE 6 DÍGITOS: ${code}`);
  console.log(`⏳ Válido por: 15 minutos`);
  console.log('======================================================\n');

  const htmlContent = `
  <!DOCTYPE html>
  <html lang="es">
  <head>
    <meta charset="UTF-8">
    <title>Recuperación de Contraseña - Eddam Overlay Studio</title>
    <style>
      body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Helvetica, Arial, sans-serif; background-color: #0b0b0e; color: #f4f4f5; margin: 0; padding: 40px 20px; }
      .container { max-width: 520px; margin: 0 auto; background: #121217; border: 1px solid rgba(255,255,255,0.08); border-radius: 16px; padding: 36px 28px; box-shadow: 0 20px 40px rgba(0,0,0,0.5); }
      .logo-badge { display: inline-flex; align-items: center; gap: 8px; background: rgba(99,102,241,0.15); border: 1px solid rgba(99,102,241,0.3); color: #818cf8; padding: 6px 14px; border-radius: 9999px; font-size: 13px; font-weight: 600; margin-bottom: 24px; }
      h1 { font-size: 24px; font-weight: 700; margin: 0 0 12px 0; color: #ffffff; letter-spacing: -0.5px; }
      p { color: #a1a1aa; font-size: 14px; line-height: 1.6; margin: 0 0 24px 0; }
      .code-box { background: #1a1a24; border: 2px dashed #6366f1; border-radius: 12px; padding: 20px; text-align: center; margin: 28px 0; }
      .code-title { font-size: 12px; font-weight: 700; color: #818cf8; text-transform: uppercase; letter-spacing: 1.5px; margin-bottom: 8px; }
      .code-number { font-size: 38px; font-weight: 800; letter-spacing: 10px; color: #ffffff; font-family: 'Courier New', Courier, monospace; margin: 0; }
      .footer { font-size: 12px; color: #71717a; line-height: 1.5; border-top: 1px solid rgba(255,255,255,0.06); padding-top: 20px; margin-top: 30px; text-align: center; }
    </style>
  </head>
  <body>
    <div class="container">
      <div class="logo-badge">✦ Eddam Overlay Studio</div>
      <h1>Recuperación de Contraseña</h1>
      <p>Hola${userName ? ` <strong>${userName}</strong>` : ''}, hemos recibido una solicitud para restablecer la contraseña de tu cuenta en Eddam Overlay Studio.</p>
      <p>Utiliza el siguiente código de verificación en el formulario para crear una nueva contraseña:</p>
      
      <div class="code-box">
        <div class="code-title">Código de Verificación</div>
        <div class="code-number">${code}</div>
      </div>

      <p style="font-size: 13px; color: #a1a1aa; text-align: center;">
        ⏱️ Este código expirará en <strong>15 minutos</strong>.
      </p>

      <div class="footer">
        Si no solicitaste este restablecimiento, puedes ignorar este mensaje con total seguridad. Tu contraseña actual no cambiará.<br><br>
        © ${new Date().getFullYear()} Eddam Overlay Studio • Control de Overlays en Vivo para OBS Studio
      </div>
    </div>
  </body>
  </html>
  `;

  // 1. MÉTODO PRIORITARIO PARA NUBE (Render, etc.): RESEND vía HTTPS (Puerto 443, nunca bloqueado)
  if (resendApiKey) {
    try {
      const resend = new Resend(resendApiKey);
      const { data, error } = await resend.emails.send({
        from: emailFrom,
        to: [to],
        subject: `🔑 ${code} es tu código de recuperación - Eddam Overlay Studio`,
        text: `Tu código de recuperación es: ${code}. Válido por 15 minutos.`,
        html: htmlContent,
      });

      if (error) {
        console.error('❌ [Resend Error]:', error);
        return false;
      }

      console.log(`✅ [Resend] Correo enviado exitosamente a ${to}. ID:`, data?.id);
      return true;
    } catch (err) {
      console.error('❌ [Resend Exception]:', err);
      return false;
    }
  }

  // 2. MÉTODO SMTP (Gmail u otros) con TIMEOUT CORTO para evitar cuelgues
  if (!smtpHost || !smtpUser || !smtpPass) {
    console.log('ℹ️ [Mailer] Sin proveedor de correo configurado. El código se muestra en consola.');
    return true;
  }

  try {
    const transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: process.env.SMTP_SECURE === 'true' || smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
      connectionTimeout: 4000, // 4 segundos máximo para evitar colgar la petición
      greetingTimeout: 4000,
      socketTimeout: 4000,
    });

    await transporter.sendMail({
      from: emailFrom,
      to,
      subject: `🔑 ${code} es tu código de recuperación - Eddam Overlay Studio`,
      text: `Tu código de recuperación es: ${code}. Válido por 15 minutos. Si no solicitaste este cambio, ignora este mensaje.`,
      html: htmlContent,
    });

    console.log(`✅ [Mailer SMTP] Correo enviado exitosamente a ${to}`);
    return true;
  } catch (error: any) {
    console.error('❌ [Mailer SMTP] Error al enviar correo:', error?.message || error);
    return false;
  }
}
