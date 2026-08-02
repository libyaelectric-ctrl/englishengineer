# EnglishEngineer (EngVox)

> İnşaat mühendisleri için İngilizce eğitim platformu

## 🚀 Quick Start

### Prerequisites
- Node.js 20+
- npm 10+
- Docker (opsiyonel)

### Installation

```bash
# Clone
git clone https://github.com/libyaelectric-ctrl/englishengineer.git
cd englishengineer

# Install dependencies
npm install
npm run backend:install

# Environment setup
cp .env.example .env
cp backend/.env.example backend/.env
# .env dosyalarını kendi credential'larınla düzenle

# Seed veri indirme ve yükleme
npm run download:seed
npm run import:grammar
npm run import:vocabulary
```

### Development

```bash
# Frontend + backend birlikte
npm run dev:all

# Ya da ayrı ayrı
npm run dev                    # Frontend (port 3000)
npm --prefix backend run dev   # Backend (port 8787)
```

### Testing

```bash
npm run test              # Unit test
npm run test:integration  # Integration test
npm run e2e:browser       # E2E test (Playwright)
npm run test:coverage     # Coverage raporu
npm run backend:test      # Backend testleri
```

### Production Build

```bash
npm run build
npm run verify:release
```

### Docker

```bash
docker compose up --build
```

## 📁 Proje Yapısı

```
src/
├── features/       # Domain modülleri (auth, billing, vocabulary, speaking, grammar, ...)
├── core/           # Paylaşılan çekirdek (errors, events, ids, learning)
├── providers/      # React context provider'ları
├── shared/         # Paylaşılan bileşenler & yardımcılar
└── config/         # Uygulama konfigürasyonu

backend/
├── src/            # Express API rotaları & servisleri
└── test/           # Backend testleri
```

## 🧪 Tech Stack

- **Frontend:** React 19, TypeScript, Vite, Tailwind CSS v4, Zustand, TanStack Query
- **Backend:** Express, TypeScript (ESM), Supabase, Stripe, BullMQ
- **Testing:** Vitest, Playwright, Storybook
- **DevOps:** GitHub Actions, Docker, Sentry, Lighthouse CI

## 📄 Lisans

MIT — bkz. [LICENSE](LICENSE)
