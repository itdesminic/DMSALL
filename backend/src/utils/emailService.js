import nodemailer from 'nodemailer';
import dotenv from 'dotenv';
dotenv.config();

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST,
  port: process.env.SMTP_PORT ? parseInt(process.env.SMTP_PORT) : undefined,
  auth: process.env.SMTP_USER ? { user: process.env.SMTP_USER, pass: process.env.SMTP_PASS } : undefined,
});

export async function sendMail({ to, subject, html, text }){
  const from = process.env.SMTP_FROM || `crm@localhost`;
  const info = await transporter.sendMail({ from, to, subject, html, text });
  return info;
}
