import { NextResponse } from 'next/server';
import nodemailer from 'nodemailer';
import { join } from 'path';
import * as fs from 'fs';

export async function POST(request: Request) {
  try {
    const { fileUrl, fileName, recipient, message } = await request.json();

    if (!fileUrl || !fileName || !recipient || !message) {
      return NextResponse.json(
        { success: false, error: 'Faltan parámetros requeridos (fileUrl, fileName, recipient, message)' },
        { status: 400 }
      );
    }

    // Construir la ruta absoluta del archivo bajo /public
    const normalizedUrl = fileUrl.startsWith('/') ? fileUrl : `/${fileUrl}`;
    const filePath = join(process.cwd(), 'public', normalizedUrl);

    if (!fs.existsSync(filePath)) {
      return NextResponse.json(
        { success: false, error: `El archivo a adjuntar no existe: ${normalizedUrl}` },
        { status: 404 }
      );
    }

    const fileContent = fs.readFileSync(filePath);

    // Validar variables de entorno mínimas
    const { EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM, REPORT_RECIPIENT_EMAIL } = process.env;
    if (!EMAIL_USER || !EMAIL_PASSWORD || !EMAIL_FROM) {
      return NextResponse.json(
        { success: false, error: 'Faltan variables de entorno de email (EMAIL_USER, EMAIL_PASSWORD, EMAIL_FROM)' },
        { status: 500 }
      );
    }

    // Configurar el transporte de correo (ejemplo: Gmail)
    const transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: EMAIL_USER,
        pass: EMAIL_PASSWORD,
      },
    });

    // Opciones del correo
    const mailOptions = {
      from: EMAIL_FROM,
      to: recipient, // Usar el destinatario de la solicitud
      subject: `Reporte de Requisiciones - ${new Date().toLocaleDateString('es-CO')}`,
      text: message, // Usar el mensaje de la solicitud
      attachments: [
        {
          filename: fileName,
          content: fileContent,
        },
      ],
    } as nodemailer.SendMailOptions;

    // Enviar el correo
    await transporter.sendMail(mailOptions);

    return NextResponse.json({ success: true, message: 'Reporte enviado exitosamente' });
  } catch (error) {
    console.error('Error al enviar el correo:', error);
    return NextResponse.json(
      {
        success: false,
        error: error instanceof Error ? error.message : 'Error desconocido al enviar el correo',
      },
      { status: 500 }
    );
  }
}
