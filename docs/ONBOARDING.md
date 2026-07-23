# Onboarding Guide

Bu belge, EngineerOS projesine yeni katılan geliştiriciler için hızlı başlangıç rehberidir.

## 1. Zihinsel Harita

### Frontend Mimari

```
src/
├── features/          # Her feature kendi modülüdür
│   └── <feature>/
│       ├── components/    # UI bileşenleri
│       ├── data/          # Seed data, sabit değerler
│       ├── hooks/         # Custom React hook'ları
│       ├── services/      # API çağrıları, iş mantığı
│       ├── store/         # Zustand state yönetimi
│       ├── types/         # TypeScript tipleri
│       └── index.ts       # Public exports
├── core/              # Domain-agnostic modüller
│   ├── events/        # Event bus sistemi
│   ├── ids/           # UUID üretim
│   ├── observability/ # Sentry monitoring
│   └── result/        # Result/Error tipleri
├── contracts/backend  # Frontend-Backend sözleşme tanımı
├── shared/            # Tüm feature'larda kullanılan bileşenler
├── pages/             # Route seviyesi sayfa bileşenleri
└── routes/            # React Router konfigürasyonu
```

### Backend Mimari

```
backend/src/
├── app.ts             # Express app factory
├── auth.ts            # JWT/Supabase auth middleware
├── billing-*.ts       # Stripe entegrasyonu
├── ai*.ts             # AI provider adapters
├── config*.ts         # Environment config
├── validation.ts      # Zod schema tanımları
└── vocabulary*.ts     # Vocabulary servisi
```

### Sözleşme Katmanı

Frontend-Backend arası iletişim `src/contracts/backend/` klasöründe tanımlı. Yeni API endpoint eklerken sözleşme dosyasını güncelleyin.

## 2. İlk 30 Dakika

### Kurulum

```bash
# 1. Repoyu klonlayın
git clone <repo-url>
cd englishengineer

# 2. Bağımlılıkları kurun
npm install

# 3. Backend bağımlılıklarını kurun
npm --prefix backend ci

# 4. Environment dosyasını kopyalayın
cp .env.example .env.local
cp backend/.env.example backend/.env
```

### Mock Modda Çalıştırma

`.env.local` içinde şu değişkenleri ayarlayın:

```
VITE_AI_PROVIDER=mock
VITE_ENABLE_MOCK_BILLING=true
```

### Geliştirme Sunucusunu Başlatma

```bash
npm run dev:all
```

Bu komut frontend (port 3000) ve backend (port 8787) sunucularını aynı anda başlatır.

## 3. Değişiklik Yapmadan Önce

### Kalite Kontrol Komutları

```bash
# TypeScript hata kontrolü
npm run typecheck

# Lint kontrolü
npm run lint

# Testleri çalıştır
npm test

# Tüm kalite kontrollerini çalıştır
npm run quality:gate
```

### Commit Mesajı Formatı

Proje [Conventional Commits](https://www.conventionalcommits.org/) kullanır:

```
<type>(<scope>): <description>
```

Geçerli type'lar: `feat`, `fix`, `refactor`, `docs`, `test`, `chore`, `style`, `perf`, `ci`, `build`, `revert`

Örnekler:

- `feat(vocabulary): add spaced repetition algorithm`
- `fix(auth): resolve JWT token refresh race condition`

## 4. Kritik Alanlar

Bu alanlarda değişiklik yaparken dikkatli olun:

### Billing (Stripe)

- `backend/src/billing-webhook-handlers.ts` — Webhook işleme mantığı
- `backend/src/billing-routes.ts` — API endpoint'leri
- Test: `backend/src/billing-webhook-handlers.test.ts`
- Stripe webhook imza doğrulaması zorunlu

### Auth

- `backend/src/auth.ts` — JWT ve Supabase auth
- `backend/src/auth.test.ts` — Auth testleri
- Development modda `allowInsecureDevAuth: true` ile bypass edilebilir

### Supabase RLS Migration'ları

- `supabase/migrations/` klasörü
- Her migration geri alınabilir olmalı
- RLS politikaları test edilmeli

## 5. Dokümantasyon Haritası

| Dosya                      | Amaç                            |
| -------------------------- | ------------------------------- |
| `README.md`                | Proje genel bakış, kurulum      |
| `CONTRIBUTING.md`          | Katkı rehberi, kod standartları |
| `docs/ONBOARDING.md`       | Bu belge                        |
| `docs/RISK_REGISTER.md`    | Risk listesi ve mitigasyonlar   |
| `docs/TECH_DEBT.md`        | Teknik borç takibi              |
| `docs/DESIGN_SYSTEM.md`    | Görsel tasarım sistemi          |
| `docs/PRODUCT.md`          | Ürün bilgileri, pricing         |
| `docs/DATA_MODEL.md`       | Veritabanı şeması               |
| `docs/DEPLOYMENT.md`       | Deploy rehberi                  |
| `docs/TESTING_STRATEGY.md` | Test stratejisi                 |
| `docs/adr/`                | Mimari Karar Kayıtları          |

### Sıkça Sorulan Sorular

- **"Yeni feature nerede tanımlanır?"** → `src/features/<feature>/`
- **"API endpoint'i nerede?"** → `backend/src/` + `src/contracts/backend/`
- **"Test nerede yazılır?"** → `src/**/*.test.ts(x)` veya `backend/src/*.test.ts`
- **"State yönetimi nasıl?"** → `src/features/<feature>/store/` (Zustand)
