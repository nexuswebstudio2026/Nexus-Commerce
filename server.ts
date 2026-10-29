import express from 'express';
import { createServer as createViteServer } from 'vite';
import nodemailer from 'nodemailer';
import dotenv from 'dotenv';

dotenv.config();

async function startServer() {
  const app = express();
  const PORT = process.env.PORT || 3000;

  app.use(express.json());

  // In-memory OTP store
  interface OTPRecord {
    code: string;
    expiresAt: number;
    email: string;
  }
  const otpMap: Record<string, OTPRecord> = {};

  // In-memory SMTP Configuration state
  let smtpConfig = {
    host: process.env.SMTP_HOST || 'smtp.gmail.com',
    port: parseInt(process.env.SMTP_PORT || '587', 10),
    secure: process.env.SMTP_SECURE === 'true',
    user: process.env.SMTP_USER || 'nexuswebstudio2026@gmail.com',
    pass: process.env.SMTP_PASS || '',
    fromName: process.env.SMTP_FROM_NAME || 'Nexus Prime Verification',
    fromEmail: process.env.SMTP_FROM_EMAIL || 'nexuswebstudio2026@gmail.com',
  };

  // GET SMTP config
  app.get('/api/smtp/config', (_req, res) => {
    res.json({
      host: smtpConfig.host,
      port: smtpConfig.port,
      secure: smtpConfig.secure,
      user: smtpConfig.user,
      passSet: Boolean(smtpConfig.pass),
      fromName: smtpConfig.fromName,
      fromEmail: smtpConfig.fromEmail,
    });
  });

  // POST update SMTP config
  app.post('/api/smtp/config', (req, res) => {
    const { host, port, secure, user, pass, fromName, fromEmail } = req.body;
    if (host) smtpConfig.host = host;
    if (port) smtpConfig.port = parseInt(port, 10);
    smtpConfig.secure = Boolean(secure);
    if (user) smtpConfig.user = user;
    if (pass !== undefined) smtpConfig.pass = pass;
    if (fromName) smtpConfig.fromName = fromName;
    if (fromEmail) smtpConfig.fromEmail = fromEmail;

    res.json({ success: true, message: 'Configuración SMTP actualizada exitosamente' });
  });

  // POST Test SMTP Connection
  app.post('/api/smtp/test-connection', async (req, res) => {
    try {
      const { host, port, secure, user, pass } = req.body;
      if (!host || !port || !user || !pass) {
        return res.status(400).json({
          success: false,
          error: 'Todos los campos (Host, Puerto, Usuario y Contraseña) son requeridos para probar la conexión SMTP.'
        });
      }

      const numPort = parseInt(port, 10);
      if (isNaN(numPort) || numPort <= 0 || numPort > 65535) {
        return res.status(400).json({
          success: false,
          error: 'El puerto especificado no es un número de puerto válido (1 - 65535).'
        });
      }

      const transporter = nodemailer.createTransport({
        host,
        port: numPort,
        secure: Boolean(secure),
        auth: {
          user,
          pass,
        },
        tls: {
          rejectUnauthorized: false,
        },
      });

      await transporter.verify();

      return res.json({
        success: true,
        message: '¡Conexión SMTP verificada con éxito! El servidor de correo y las credenciales responden correctamente.',
      });
    } catch (error: any) {
      console.warn('Error en test-connection SMTP:', error?.message || error);
      return res.status(400).json({
        success: false,
        error: error?.message || 'Error al conectar con el servidor SMTP. Verifica la red, credenciales, host y puerto.',
      });
    }
  });

  // POST Send Verification Code
  app.post('/api/auth/send-verification-code', async (req, res) => {
    try {
      const { email, userName, businessName } = req.body;
      if (!email) {
        return res.status(400).json({ error: 'El correo electrónico es requerido.' });
      }

      const cleanEmail = email.toLowerCase().trim();
      // Generate 6-digit numeric OTP code
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = Date.now() + 10 * 60 * 1000; // 10 minutes

      otpMap[cleanEmail] = { code, expiresAt, email: cleanEmail };

      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: (smtpConfig.user && smtpConfig.pass) ? {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        } : undefined,
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail || smtpConfig.user}>`,
        to: cleanEmail,
        subject: `Código de Verificación Nexus Prime: ${code}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #f59e0b; margin: 0; font-size: 22px; font-weight: bold;">Nexus Prime Multi-Tenant Platform</h1>
              <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 13px;">Portal de Verificación de Seguridad en 2 Pasos</p>
            </div>
            <div style="padding: 24px; color: #334155;">
              <p style="font-size: 15px;">Hola <strong>${userName || 'Usuario'}</strong>,</p>
              <p style="font-size: 14px; line-height: 1.5;">Has solicitado iniciar sesión en el portal de negocio <strong>${businessName || 'Nexus Prime'}</strong>.</p>
              <div style="background-color: #f8fafc; border: 2px dashed #cbd5e1; border-radius: 10px; padding: 18px; text-align: center; margin: 20px 0;">
                <span style="font-size: 12px; color: #64748b; text-transform: uppercase; letter-spacing: 1px; font-weight: bold; display: block; margin-bottom: 8px;">Tu Código de Verificación OTP:</span>
                <span style="font-size: 32px; font-weight: bold; color: #d97706; letter-spacing: 6px; font-family: monospace;">${code}</span>
              </div>
              <p style="font-size: 12px; color: #64748b;">Este código expira en 10 minutos. Si tú no solicitaste esta verificación, puedes ignorar este mensaje.</p>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; background-color: #f8fafc;">
              &copy; 2026 Nexus Prime Enterprise Platform. Todos los derechos reservados.
            </div>
          </div>
        `,
      };

      let emailSentSuccessfully = false;
      let smtpErrorDetails: string | null = null;

      if (smtpConfig.pass) {
        try {
          await transporter.sendMail(mailOptions);
          emailSentSuccessfully = true;
        } catch (err: any) {
          console.warn('Error al enviar correo SMTP:', err.message);
          smtpErrorDetails = err.message;
        }
      } else {
        smtpErrorDetails = 'Contraseña SMTP no configurada aún en el panel de superadmin.';
      }

      return res.json({
        success: true,
        message: emailSentSuccessfully
          ? `Código enviado con éxito a ${cleanEmail} vía SMTP.`
          : `Código de verificación generado para ${cleanEmail}. (${smtpErrorDetails || 'Modo demostración activo'})`,
        emailSentSuccessfully,
        smtpErrorDetails,
        codeForDemo: code,
        expiresAt,
      });
    } catch (error: any) {
      console.error('Error en send-verification-code:', error);
      return res.status(500).json({ error: error.message || 'Error al procesar el código de verificación.' });
    }
  });

  // POST Verify Code
  app.post('/api/auth/verify-code', (req, res) => {
    const { email, code } = req.body;
    if (!email || !code) {
      return res.status(400).json({ error: 'Faltan parámetros requeridos (email, code).' });
    }

    const cleanEmail = email.toLowerCase().trim();
    const record = otpMap[cleanEmail];

    if (!record) {
      return res.status(400).json({ verified: false, error: 'No se encontró un código pendiente para este correo. Solicita uno nuevo.' });
    }

    if (Date.now() > record.expiresAt) {
      delete otpMap[cleanEmail];
      return res.status(400).json({ verified: false, error: 'El código ha expirado. Por favor solicita un nuevo código.' });
    }

    if (record.code.trim() !== code.toString().trim()) {
      return res.status(400).json({ verified: false, error: 'El código de verificación de 6 dígitos es incorrecto.' });
    }

    delete otpMap[cleanEmail];
    return res.json({ success: true, verified: true, message: 'Código verificado con éxito.' });
  });

  // POST Contact Form Submission via SMTP
  app.post('/api/contact', async (req, res) => {
    try {
      const { name, email, subject, message } = req.body;
      if (!name || !email || !message) {
        return res.status(400).json({ error: 'Nombre, correo electrónico y mensaje son requeridos.' });
      }

      const targetEmail = 'nexuswebstudio2026@gmail.com';

      const transporter = nodemailer.createTransport({
        host: smtpConfig.host,
        port: smtpConfig.port,
        secure: smtpConfig.secure,
        auth: (smtpConfig.user && smtpConfig.pass) ? {
          user: smtpConfig.user,
          pass: smtpConfig.pass,
        } : undefined,
        tls: {
          rejectUnauthorized: false,
        },
      });

      const mailOptions = {
        from: `"${smtpConfig.fromName}" <${smtpConfig.fromEmail || smtpConfig.user}>`,
        to: targetEmail,
        replyTo: email,
        subject: `[Mensaje de Contacto Nexus Web Studio] ${subject || 'Consulta desde Sitio Web'}`,
        html: `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; border-radius: 12px; background-color: #ffffff;">
            <div style="background-color: #0f172a; padding: 20px; text-align: center; border-radius: 8px 8px 0 0;">
              <h1 style="color: #f59e0b; margin: 0; font-size: 20px; font-weight: bold;">Nuevo Mensaje para Nexus Web Studio</h1>
              <p style="color: #94a3b8; margin: 5px 0 0 0; font-size: 13px;">Formulario de Contacto Web</p>
            </div>
            <div style="padding: 24px; color: #334155; font-size: 14px; line-height: 1.6;">
              <p><strong>Nombre:</strong> ${name}</p>
              <p><strong>Correo:</strong> <a href="mailto:${email}" style="color: #d97706;">${email}</a></p>
              <p><strong>Asunto:</strong> ${subject || 'Sin asunto'}</p>
              <div style="margin-top: 15px; padding: 15px; background-color: #f8fafc; border-left: 4px solid #f59e0b; border-radius: 4px;">
                <p style="margin: 0; white-space: pre-wrap;">${message}</p>
              </div>
            </div>
            <div style="border-top: 1px solid #e2e8f0; padding: 12px; text-align: center; font-size: 11px; color: #94a3b8; background-color: #f8fafc;">
              &copy; 2026 Nexus Web Studio. Mensaje recibido desde la plataforma Nexus Prime.
            </div>
          </div>
        `,
      };

      let emailSentSuccessfully = false;
      let smtpErrorDetails: string | null = null;

      if (smtpConfig.pass) {
        try {
          await transporter.sendMail(mailOptions);
          emailSentSuccessfully = true;
        } catch (err: any) {
          console.warn('Error al enviar correo de contacto SMTP:', err.message);
          smtpErrorDetails = err.message;
        }
      } else {
        smtpErrorDetails = 'Credenciales SMTP pendientes de contraseña en el servidor.';
      }

      return res.json({
        success: true,
        message: emailSentSuccessfully
          ? `¡Mensaje enviado con éxito a ${targetEmail}!`
          : `Mensaje registrado correctamente. (${smtpErrorDetails || 'Enviado correctamente'})`,
        emailSentSuccessfully,
      });
    } catch (error: any) {
      console.error('Error en /api/contact:', error);
      return res.status(500).json({ error: error.message || 'Error al procesar el envío del mensaje.' });
    }
  });

  // ==========================================
  // GOOGLE SHEETS BIDIRECTIONAL SYNC BACKEND SERVICE
  // ==========================================

  // POST /api/sheets/sync-to-sheet
  // Pushes a table's 2D rows array to a Google Sheet tab
  app.post('/api/sheets/sync-to-sheet', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de acceso de Google Workspace (Bearer) es requerido.' });
      }

      const token = authHeader.split(' ')[1];
      const { spreadsheetId, sheetTitle, rows } = req.body;

      if (!spreadsheetId || !sheetTitle || !Array.isArray(rows)) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos: spreadsheetId, sheetTitle, rows.' });
      }

      // Format clean range string: e.g. 'Usuarios'!A1
      const rangeStr = `'${sheetTitle.replace(/'/g, "''")}'!A1`;
      const encodedRange = encodeURIComponent(rangeStr);

      // 1. Clear existing sheet contents first to avoid stale trailing rows
      await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}:clear`,
        {
          method: 'POST',
          headers: { Authorization: `Bearer ${token}` },
        }
      ).catch(() => {});

      // 2. Put new rows starting at A1
      const updateRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueInputOption=USER_ENTERED`,
        {
          method: 'PUT',
          headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            range: rangeStr,
            majorDimension: 'ROWS',
            values: rows,
          }),
        }
      );

      if (!updateRes.ok) {
        const errData = await updateRes.json().catch(() => ({}));
        const errMsg = errData?.error?.message || updateRes.statusText;
        return res.status(400).json({
          success: false,
          error: `Error al actualizar hoja "${sheetTitle}" en Google Sheets: ${errMsg}`
        });
      }

      const result = await updateRes.json();
      return res.json({
        success: true,
        message: `Hoja "${sheetTitle}" sincronizada exitosamente con Google Sheets.`,
        updatedRows: result.updatedRows || rows.length,
        updatedCells: result.updatedCells || 0,
      });
    } catch (error: any) {
      console.error('Error en /api/sheets/sync-to-sheet:', error);
      return res.status(500).json({ error: error.message || 'Error en el servicio de sincronización hacia Google Sheets.' });
    }
  });

  // POST /api/sheets/sync-from-sheet
  // Pulls a sheet tab's contents from Google Sheets and returns formatted rows
  app.post('/api/sheets/sync-from-sheet', async (req, res) => {
    try {
      const authHeader = req.headers.authorization;
      if (!authHeader || !authHeader.startsWith('Bearer ')) {
        return res.status(401).json({ error: 'Token de acceso de Google Workspace (Bearer) es requerido.' });
      }

      const token = authHeader.split(' ')[1];
      const { spreadsheetId, sheetTitle } = req.body;

      if (!spreadsheetId || !sheetTitle) {
        return res.status(400).json({ error: 'Faltan parámetros requeridos: spreadsheetId, sheetTitle.' });
      }

      // Format clean A1 range with range bounds: 'Usuarios'!A1:Z1000
      const rangeStr = `'${sheetTitle.replace(/'/g, "''")}'!A1:Z1000`;
      const encodedRange = encodeURIComponent(rangeStr);

      const fetchRes = await fetch(
        `https://sheets.googleapis.com/v4/spreadsheets/${spreadsheetId}/values/${encodedRange}?valueRenderOption=FORMATTED_VALUE`,
        {
          headers: { Authorization: `Bearer ${token}` },
        }
      );

      if (!fetchRes.ok) {
        const errData = await fetchRes.json().catch(() => ({}));
        if (fetchRes.status === 400 || (errData?.error?.message && errData.error.message.includes('Unable to parse range'))) {
          // Range does not exist yet or is empty
          return res.json({ success: true, sheetTitle, rows: [], count: 0 });
        }
        return res.status(400).json({
          success: false,
          error: `Error al leer hoja "${sheetTitle}" desde Google Sheets: ${errData?.error?.message || fetchRes.statusText}`
        });
      }

      const data = await fetchRes.json();
      const rows: string[][] = data.values || [];

      return res.json({
        success: true,
        sheetTitle,
        rows,
        count: rows.length > 0 ? rows.length - 1 : 0,
      });
    } catch (error: any) {
      console.error('Error en /api/sheets/sync-from-sheet:', error);
      return res.status(500).json({ error: error.message || 'Error en el servicio de sincronización desde Google Sheets.' });
    }
  });

  // Mount Vite dev server middleware
  if (process.env.NODE_ENV !== 'production') {
    const vite = await createViteServer({
      server: { middlewareMode: true },
      appType: 'spa',
    });
    app.use(vite.middlewares);
  } else {
    app.use(express.static('dist'));
  }

  app.listen(PORT, () => {
    console.log(`Server running on http://localhost:${PORT}`);
  });
}

startServer();
