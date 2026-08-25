import nodemailer from 'nodemailer';

interface EmailConfig {
  host: string;
  port: number;
  secure: boolean;
  user: string;
  pass: string;
}

let transporter: nodemailer.Transporter | null = null;

export function initEmailService(config: EmailConfig) {
  transporter = nodemailer.createTransport({
    host: config.host,
    port: config.port,
    secure: config.secure,
    auth: { user: config.user, pass: config.pass },
  });
}

export async function sendEmail(to: string, subject: string, html: string) {
  if (!transporter) throw new Error('Email service not initialized');
  return transporter.sendMail({ from: '"EngVox" <noreply@engvox.app>', to, subject, html });
}

export async function sendWeeklyDigest(
  to: string,
  data: { streak: number; xp: number; lessons: number }
) {
  const html = `
    <h2>Weekly Progress Report</h2>
    <p>Streak: ${data.streak} days</p>
    <p>XP earned: ${data.xp}</p>
    <p>Lessons completed: ${data.lessons}</p>
    <p><a href="https://engvox.com/dashboard">View Dashboard</a></p>
  `;
  return sendEmail(to, 'Your EngVox Weekly Digest', html);
}

export async function sendStreakBrokenAlert(to: string, streak: number) {
  const html = `
    <h2>Streak Broken!</h2>
    <p>Your ${streak}-day streak has ended.</p>
    <p><a href="https://engvox.com/learning-path">Resume Learning</a></p>
  `;
  return sendEmail(to, 'EngVox: Streak Alert', html);
}
