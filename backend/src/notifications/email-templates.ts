/**
 * Email notification templates for EngVox.
 *
 * These are used by the notification service to build HTML emails.
 * In production, swap the SMTP transport for SendGrid/Resend.
 */

interface WelcomeEmailData {
  displayName: string;
  loginUrl: string;
  dashboardUrl: string;
}

interface StreakReminderData {
  displayName: string;
  streak: number;
  dashboardUrl: string;
}

interface WeeklyReportData {
  displayName: string;
  xp: number;
  streak: number;
  level: number;
  missionsCompleted: number;
  topSkill: string;
  weakSkill: string;
  dashboardUrl: string;
}

const BASE_STYLE = `
  font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif;
  max-width: 600px;
  margin: 0 auto;
  padding: 32px 24px;
  background: #fafafa;
  color: #1a1a2e;
`;

const CARD_STYLE = `
  background: white;
  border-radius: 12px;
  border: 1px solid #e5e7eb;
  padding: 24px;
  margin-bottom: 16px;
`;

const BUTTON_STYLE = `
  display: inline-block;
  background: #6366f1;
  color: white;
  text-decoration: none;
  padding: 12px 24px;
  border-radius: 8px;
  font-weight: 700;
  font-size: 14px;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const emailTemplates = {
  welcome: (data: WelcomeEmailData) => ({
    subject: `Welcome to EngVox, ${data.displayName}! 🚀`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    <h1 style="font-size: 24px; margin: 0 0 16px;">Welcome to EngVox! 🎉</h1>
    <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
      Hi ${data.displayName},<br><br>
      Your engineering English training platform is ready. Here's what you can do:
    </p>
    <ul style="font-size: 14px; line-height: 2; color: #4b5563; padding-left: 20px;">
      <li>📚 <strong>Vocabulary</strong> — 1000+ engineering terms</li>
      <li>📖 <strong>Reading</strong> — Technical documentation comprehension</li>
      <li>✍️ <strong>Writing</strong> — Report & RFI drafting</li>
      <li>🎧 <strong>Listening</strong> — Site meeting transcripts</li>
      <li>🗣️ <strong>Speaking</strong> — Voice practice & pronunciation</li>
    </ul>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${data.dashboardUrl}" style="${BUTTON_STYLE}">Start Learning →</a>
    </div>
  </div>
  <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 24px;">
    EngVox — Engineering English Training Platform
  </p>
</body>
</html>`,
  }),

  streakReminder: (data: StreakReminderData) => ({
    subject: `🔥 Don't lose your ${data.streak}-day streak!`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    <h1 style="font-size: 22px; margin: 0 0 16px;">Your streak is at risk! 🔥</h1>
    <p style="font-size: 15px; line-height: 1.6; color: #4b5563;">
      Hi ${data.displayName},<br><br>
      You've maintained a <strong>${data.streak}-day learning streak</strong>. 
      Just 10 minutes of practice today keeps it alive!
    </p>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${data.dashboardUrl}" style="${BUTTON_STYLE}">Keep My Streak →</a>
    </div>
  </div>
  <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 24px;">
    EngVox — Engineering English Training Platform
  </p>
</body>
</html>`,
  }),

  weeklyReport: (data: WeeklyReportData) => ({
    subject: `📊 Your Weekly Learning Report — ${data.xp} XP earned`,
    html: `<!DOCTYPE html>
<html>
<head><meta charset="utf-8"></head>
<body style="${BASE_STYLE}">
  <div style="${CARD_STYLE}">
    <h1 style="font-size: 22px; margin: 0 0 16px;">Weekly Progress Report 📊</h1>
    <p style="font-size: 15px; color: #4b5563;">
      Hi ${data.displayName}, here's your week in numbers:
    </p>
    <table style="width: 100%; font-size: 14px; margin: 16px 0;">
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">XP Earned</td>
        <td style="padding: 8px 0; font-weight: 700; text-align: right;">${data.xp} XP</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Current Streak</td>
        <td style="padding: 8px 0; font-weight: 700; text-align: right;">🔥 ${data.streak} days</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Level</td>
        <td style="padding: 8px 0; font-weight: 700; text-align: right;">Level ${data.level}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Missions Completed</td>
        <td style="padding: 8px 0; font-weight: 700; text-align: right;">${data.missionsCompleted}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Strongest Skill</td>
        <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #10b981;">${data.topSkill}</td>
      </tr>
      <tr>
        <td style="padding: 8px 0; color: #6b7280;">Needs Practice</td>
        <td style="padding: 8px 0; font-weight: 700; text-align: right; color: #f59e0b;">${data.weakSkill}</td>
      </tr>
    </table>
    <div style="text-align: center; margin-top: 24px;">
      <a href="${data.dashboardUrl}" style="${BUTTON_STYLE}">View Dashboard →</a>
    </div>
  </div>
  <p style="font-size: 11px; color: #9ca3af; text-align: center; margin-top: 24px;">
    EngVox — Engineering English Training Platform
  </p>
</body>
</html>`,
  }),
};
