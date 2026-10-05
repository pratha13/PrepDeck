import nodemailer from "nodemailer";

const { SMTP_HOST, SMTP_PORT = "587", SMTP_USER, SMTP_PASS, MAIL_FROM } = process.env;
const transport = SMTP_HOST
  ? nodemailer.createTransport({ host: SMTP_HOST, port: Number(SMTP_PORT), secure: SMTP_PORT === "465", auth: { user: SMTP_USER, pass: SMTP_PASS } })
  : null;

// Without SMTP settings (local development) the message is printed to the server console instead.
export async function sendMail(to, subject, text) {
  if (!transport) return console.log(`[mail to ${to}] ${subject}\n${text}`);
  await transport.sendMail({ from: MAIL_FROM, to, subject, text });
}
