import type { SkillName } from '@/features/profile';

export interface ReportData {
  generatedAt: string;
  userName: string;
  overallLevel: string;
  overallProgress: number;
  totalStudyMinutes: number;
  totalXp: number;
  currentStreak: number;
  skillBreakdown: SkillBreakdown[];
  vocabularyStats: VocabularyStats;
  recentActivity: ActivityEntry[];
  strengths: string[];
  weaknesses: string[];
  recommendations: string[];
}

export interface SkillBreakdown {
  skill: SkillName;
  level: string;
  score: number;
  sessionsCompleted: number;
  minutesSpent: number;
  trend: 'up' | 'down' | 'stable';
}

export interface VocabularyStats {
  totalWords: number;
  mastered: number;
  learning: number;
  dueToday: number;
  retentionRate: number;
}

export interface ActivityEntry {
  date: string;
  skill: string;
  score: number;
  durationMinutes: number;
}

function generateHTML(report: ReportData): string {
  const skillRows = report.skillBreakdown
    .map(
      (s) => `
      <tr>
        <td style="padding:8px;border-bottom:1px solid #eee;font-weight:600">${s.skill}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${s.level}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${s.score}%</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${s.sessionsCompleted}</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${s.minutesSpent}m</td>
        <td style="padding:8px;border-bottom:1px solid #eee;text-align:center">${
          s.trend === 'up' ? '↑' : s.trend === 'down' ? '↓' : '→'
        }</td>
      </tr>`
    )
    .join('');

  const activityRows = report.recentActivity
    .slice(0, 10)
    .map(
      (a) => `
      <tr>
        <td style="padding:6px;border-bottom:1px solid #eee">${a.date}</td>
        <td style="padding:6px;border-bottom:1px solid #eee">${a.skill}</td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${a.score}%</td>
        <td style="padding:6px;border-bottom:1px solid #eee;text-align:center">${a.durationMinutes}m</td>
      </tr>`
    )
    .join('');

  const strengthItems = report.strengths.map((s) => `<li style="margin:4px 0">${s}</li>`).join('');
  const weaknessItems = report.weaknesses.map((w) => `<li style="margin:4px 0;color:#b45309">${w}</li>`).join('');
  const recommendationItems = report.recommendations.map((r) => `<li style="margin:4px 0">${r}</li>`).join('');

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8">
  <title>EngineerOS Learning Report - ${report.userName}</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; max-width: 800px; margin: 0 auto; padding: 40px; color: #1a1a1a; line-height: 1.6; }
    h1 { color: #1a1a1a; border-bottom: 2px solid #2563eb; padding-bottom: 8px; }
    h2 { color: #374151; margin-top: 32px; }
    .stat-grid { display: grid; grid-template-columns: repeat(4, 1fr); gap: 16px; margin: 20px 0; }
    .stat-card { background: #f8fafc; border: 1px solid #e2e8f0; border-radius: 8px; padding: 16px; text-align: center; }
    .stat-value { font-size: 24px; font-weight: 700; color: #2563eb; }
    .stat-label { font-size: 12px; color: #64748b; margin-top: 4px; }
    table { width: 100%; border-collapse: collapse; margin: 16px 0; }
    th { background: #f1f5f9; padding: 8px; text-align: left; font-size: 12px; text-transform: uppercase; color: #64748b; }
    ul { padding-left: 20px; }
    .footer { margin-top: 40px; padding-top: 16px; border-top: 1px solid #e2e8f0; font-size: 11px; color: #94a3b8; text-align: center; }
    @media print { body { padding: 20px; } }
  </style>
</head>
<body>
  <h1>EngineerOS Learning Report</h1>
  <p><strong>Student:</strong> ${report.userName} | <strong>Generated:</strong> ${new Date(report.generatedAt).toLocaleDateString()} | <strong>Level:</strong> ${report.overallLevel}</p>

  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-value">${report.overallProgress}%</div>
      <div class="stat-label">Overall Progress</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.totalStudyMinutes}</div>
      <div class="stat-label">Study Minutes</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.totalXp}</div>
      <div class="stat-label">Total XP</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.currentStreak}</div>
      <div class="stat-label">Day Streak</div>
    </div>
  </div>

  <h2>Skill Breakdown</h2>
  <table>
    <thead>
      <tr>
        <th>Skill</th><th>Level</th><th>Score</th><th>Sessions</th><th>Minutes</th><th>Trend</th>
      </tr>
    </thead>
    <tbody>${skillRows}</tbody>
  </table>

  <h2>Vocabulary Statistics</h2>
  <div class="stat-grid">
    <div class="stat-card">
      <div class="stat-value">${report.vocabularyStats.totalWords}</div>
      <div class="stat-label">Total Words</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.vocabularyStats.mastered}</div>
      <div class="stat-label">Mastered</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.vocabularyStats.learning}</div>
      <div class="stat-label">Learning</div>
    </div>
    <div class="stat-card">
      <div class="stat-value">${report.vocabularyStats.retentionRate}%</div>
      <div class="stat-label">Retention Rate</div>
    </div>
  </div>

  <h2>Strengths</h2>
  <ul>${strengthItems}</ul>

  <h2>Areas for Improvement</h2>
  <ul>${weaknessItems}</ul>

  <h2>Recommendations</h2>
  <ul>${recommendationItems}</ul>

  <h2>Recent Activity</h2>
  <table>
    <thead>
      <tr><th>Date</th><th>Skill</th><th>Score</th><th>Duration</th></tr>
    </thead>
    <tbody>${activityRows}</tbody>
  </table>

  <div class="footer">
    Generated by EngineerOS — Your Engineering Voice<br>
    ${report.generatedAt}
  </div>
</body>
</html>`;
}

export const LearningReportGenerator = {
  generateReport(data: ReportData): string {
    return generateHTML(data);
  },

  openInNewWindow(data: ReportData): void {
    const html = generateHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    window.open(url, '_blank');
  },

  downloadAsHTML(data: ReportData, filename = 'learning-report.html'): void {
    const html = generateHTML(data);
    const blob = new Blob([html], { type: 'text/html' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = filename;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  },
};
