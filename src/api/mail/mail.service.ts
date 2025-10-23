import nodemailer from "nodemailer";
import type { Transporter } from "nodemailer";
import { env } from "@/common/utils/envConfig"; // your zod-parsed env schema

interface SendMailOptions {
  to: string;
  subject: string;
  text?: string;
  html?: string;
  from?: string;
  cc?: string | string[]; // 👈 added
  bcc?: string | string[];
}

export class MailService {
  private transporter: Transporter;

  constructor() {
    this.transporter = nodemailer.createTransport({
      host: env.MAIL_HOST,
      port: env.MAIL_PORT,
      secure: env.MAIL_ENCRYPTION === "ssl", // true for 465, false for 587 or local dev
      auth:
        env.MAIL_USERNAME && env.MAIL_PASSWORD
          ? {
              user: env.MAIL_USERNAME,
              pass: env.MAIL_PASSWORD,
            }
          : undefined,
    });
  }

  /**
   * Send a basic email
   */
  async sendMail(options: SendMailOptions): Promise<void> {
    const { to, subject, text, html, from } = options;

    await this.transporter.sendMail({
      from: from || env.MAIL_FROM_ADDRESS,
      to,
      subject,
      text,
      html,
    });
  }

  /**
   * Send a templated email (example: welcome message)
   */
  async sendWelcomeEmail(to: string, name: string) {
    const subject = "Welcome to our Encounter service";
    const html = `
      <h1>Welcome, ${name}!</h1>
      <p>We’re excited to have you onboard 🎉</p>
    `;
    await this.sendMail({ to, subject, html });
  }
}

export const mailService = new MailService();
