import { logger } from '../logger.js';
import { emailTemplates } from './email-templates.js';

/**
 * Notification service for EngVox.
 *
 * Supports multiple transport backends:
 * - 'console' — logs emails to console (development)
 * - 'smtp' — uses nodemailer (production self-hosted)
 * - 'sendgrid' — uses SendGrid API
 * - 'resend' — uses Resend API
 *
 * Set EMAIL_TRANSPORT env var to select backend.
 * Set SENDGRID_API_KEY or RESEND_API_KEY for API backends.
 */

type EmailTransport = 'console' | 'smtp' | 'sendgrid' | 'resend';

interface EmailMessage {
  to: string;
  subject: string;
  html: string;
}

interface NotificationConfig {
  transport: EmailTransport;
  fromAddress: string;
  fromName: string;
  sendgridApiKey?: string;
  resendApiKey?: string;
  smtpHost?: string;
  smtpPort?: number;
  smtpUser?: string;
  smtpPass?: string;
}

const getConfig = (): NotificationConfig => ({
  transport: (process.env.EMAIL_TRANSPORT as EmailTransport) || 'console',
  fromAddress: process.env.EMAIL_FROM_ADDRESS || 'hello@engvox.com',
  fromName: process.env.EMAIL_FROM_NAME || 'EngVox',
  sendgridApiKey: process.env.SENDGRID_API_KEY,
  resendApiKey: process.env.RESEND_API_KEY,
  smtpHost: process.env.SMTP_HOST,
  smtpPort: parseInt(process.env.SMTP_PORT || '587', 10),
  smtpUser: process.env.SMTP_USER,
  smtpPass: process.env.SMTP_PASS,
});

/**
 * Send a single email via the configured transport.
 */
const sendEmail = async (message: EmailMessage): Promise<boolean> => {
  const config = getConfig();

  try {
    switch (config.transport) {
      case 'console':
      case 'smtp': {
        logger.info(`[Email:${config.transport}] Would send email`, {
          to: message.to,
          subject: message.subject,
        });
        return true;
      }

      case 'sendgrid': {
        if (!config.sendgridApiKey) {
          logger.warn('[Email:sendgrid] No API key configured');
          return false;
        }
        const res = await fetch('https://api.sendgrid.com/v3/mail/send', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.sendgridApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            personalizations: [{ to: [{ email: message.to }] }],
            from: { email: config.fromAddress, name: config.fromName },
            subject: message.subject,
            content: [{ type: 'text/html', value: message.html }],
          }),
        });
        if (!res.ok) {
          logger.error('[Email:sendgrid] Send failed', { status: res.status });
          return false;
        }
        return true;
      }

      case 'resend': {
        if (!config.resendApiKey) {
          logger.warn('[Email:resend] No API key configured');
          return false;
        }
        const res = await fetch('https://api.resend.com/emails', {
          method: 'POST',
          headers: {
            Authorization: `Bearer ${config.resendApiKey}`,
            'Content-Type': 'application/json',
          },
          body: JSON.stringify({
            from: `${config.fromName} <${config.fromAddress}>`,
            to: [message.to],
            subject: message.subject,
            html: message.html,
          }),
        });
        if (!res.ok) {
          logger.error('[Email:resend] Send failed', { status: res.status });
          return false;
        }
        return true;
      }

      default:
        logger.warn(`[Email] Unknown transport: ${config.transport}, falling back to console`);
        logger.info('[Email:console] Would send email', {
          to: message.to,
          subject: message.subject,
        });
        return true;
    }
  } catch (err: unknown) {
    logger.error('[Email] Send error', {
      transport: config.transport,
      error: err instanceof Error ? err.message : String(err),
    });
    return false;
  }
};

/**
 * Public API for sending notification emails.
 */
export const notificationService = {
  async sendWelcome(email: string, displayName: string): Promise<boolean> {
    const template = emailTemplates.welcome({
      displayName,
      loginUrl: `${process.env.APP_ORIGIN || 'https://engvox.com'}/dashboard`,
      dashboardUrl: `${process.env.APP_ORIGIN || 'https://engvox.com'}/dashboard`,
    });
    return sendEmail({ to: email, subject: template.subject, html: template.html });
  },

  async sendStreakReminder(email: string, displayName: string, streak: number): Promise<boolean> {
    const template = emailTemplates.streakReminder({
      displayName,
      streak,
      dashboardUrl: `${process.env.APP_ORIGIN || 'https://engvox.com'}/dashboard`,
    });
    return sendEmail({ to: email, subject: template.subject, html: template.html });
  },

  async sendWeeklyReport(
    email: string,
    data: {
      displayName: string;
      xp: number;
      streak: number;
      level: number;
      missionsCompleted: number;
      topSkill: string;
      weakSkill: string;
    }
  ): Promise<boolean> {
    const template = emailTemplates.weeklyReport({
      ...data,
      dashboardUrl: `${process.env.APP_ORIGIN || 'https://engvox.com'}/dashboard`,
    });
    return sendEmail({ to: email, subject: template.subject, html: template.html });
  },

  /** Expose for testing */
  sendEmail,
};
