import nodemailer from "nodemailer";

const transporter = nodemailer.createTransport({
  host: process.env.SMTP_HOST || "smtp.gmail.com",
  port: process.env.SMTP_PORT || 465,
  secure: true,
  auth: {
    user: process.env.SMTP_USER,
    pass: process.env.SMTP_PASS,
  },
});

/**
 * ✅ Trimitere email
 * @param {string} to - destinatar
 * @param {string} subject - subiect email
 * @param {string} text - conținut text simplu
 */
export async function sendEmail(to, subject, text) {
  if (!to) throw new Error("Missing recipient email");
  try {
    await transporter.sendMail({
      from: process.env.SMTP_FROM || `"WMC TRANSPORT LTD" <no-reply@quikmove.com>`,
      to,
      subject,
      text,
    });
    console.log(`📧 Email sent to ${to}`);
  } catch (err) {
    console.error("❌ Failed to send email:", err.message);
  }
}
