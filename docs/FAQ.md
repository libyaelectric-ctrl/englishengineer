# Frequently Asked Questions (FAQ)

## General

### Q1: What is EngineerOS?

**A:** EngineerOS is an offline-first Engineering English learning platform with AI coaching. It helps engineers practice the English they actually use at work: technical reports, site coordination, consultant responses, meetings, and more.

### Q2: Who is EngineerOS for?

**A:** Professional engineers working in international project environments who need to write reports, attend meetings, and solve technical problems in English.

### Q3: Is EngineerOS free?

**A:** EngineerOS has a **Free** tier with basic features. **Pro** ($20/month) unlocks AI coaching and advanced analytics. **Team** ($50/user/month) adds workspace management and admin controls.

### Q4: Can I use EngineerOS offline?

**A:** Yes! EngineerOS is built offline-first. Vocabulary, grammar, and reading exercises work without internet. AI coaching requires connection but queues requests when offline.

## Technical

### Q5: What tech stack does EngineerOS use?

**A:** React 19, Vite 6, TypeScript 5.9, Tailwind CSS v4, Zustand 5, Express 5, Supabase, and multiple AI providers (Claude, OpenAI, Gemini).

### Q6: Is the code open source?

**A:** Yes! EngineerOS is MIT licensed. Contributions welcome — see [CONTRIBUTING.md](../CONTRIBUTING.md).

### Q7: How do I set up the development environment?

**A:** See [docs/ONBOARDING.md](ONBOARDING.md) for a 30-minute quick start guide.

### Q8: What are the system requirements?

**A:** Modern browser (Chrome 120+, Firefox 120+, Safari 17+). Node.js 22+ for development.

## AI & Privacy

### Q9: Which AI providers does EngineerOS use?

**A:** Anthropic Claude, OpenAI GPT, and Google Gemini. You can switch providers in settings.

### Q10: Is my data private?

**A:** Yes. All data is stored in your browser (IndexedDB) by default. Cloud sync uses Supabase with row-level security. We never sell data.

### Q11: Are AI conversations stored?

**A:** AI coaching conversations are stored locally. Optional cloud sync encrypts data at rest.

### Q12: Can I use my own AI API key?

**A:** Not yet, but this is on the roadmap (see [ROADMAP.md](ROADMAP.md)).

## Features

### Q13: What skills does EngineerOS cover?

**A:** Reading, Writing, Listening, Speaking, Vocabulary, and Grammar — all tailored for engineering contexts.

### Q14: How does the assessment work?

**A:** The assessment engine evaluates 17 dimensions across CEFR levels (A1-C2) with ELO scoring. It adapts difficulty based on your performance.

### Q15: What are the 12 AI coaching modes?

**A:** Technical Report, Email, Meeting, Code Review, Presentation, Debugging, Architecture, Incident Response, Standup, Interview, Documentation, and Client Call.

### Q16: Can my company buy team licenses?

**A:** Yes! Team tier includes workspace management, progress tracking, and admin controls. Contact us at libyaelectric@gmail.com.

## Troubleshooting

### Q17: The app won't load offline.

**A:** Clear browser cache and reload. Ensure service worker is registered (check DevTools → Application → Service Workers).

### Q18: AI responses are slow.

**A:** Check your internet connection. AI requests timeout after 30 seconds. Try switching AI providers in Settings.

### Q19: How do I report a bug?

**A:** Open a GitHub Issue using our [bug report template](../.github/ISSUE_TEMPLATE/bug_report.md).

### Q20: How can I contribute?

**A:** See [CONTRIBUTING.md](../CONTRIBUTING.md). We welcome code, docs, translations, and feature requests!

## Last Updated

- **Date:** 2026-07-27
- **Version:** 4.0.1
