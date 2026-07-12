# Container Diagram (C4 Level 2)

## Overview

This diagram shows the high-level technical building blocks of EngineerOS.

## Mermaid Diagram

```mermaid
graph TB
    subgraph "Frontend Container"
        React["React 19 App"]
        Vite["Vite Build"]
        Tailwind["Tailwind CSS"]
        ReactRouter["React Router"]
        Zustand["Zustand Store"]
    end

    subgraph "Backend Container"
        Express["Express 5 Server"]
        AuthMiddleware["Auth Middleware"]
        RBACMiddleware["RBAC Middleware"]
        AIService["AI Service"]
        BillingService["Billing Service"]
        VocabService["Vocabulary Service"]
        WorkspaceService["Workspace Service"]
    end

    subgraph "Data Stores"
        SupabaseDB[("Supabase PostgreSQL")]
        SupabaseAuth["Supabase Auth"]
        UpstashRedis[("Upstash Redis")]
    end

    subgraph "External Services"
        StripeAPI["Stripe API"]
        AnthropicAPI["Anthropic API"]
    end

    subgraph "Infrastructure"
        VercelDeploy["Vercel<br/>(Frontend Deploy)"]
        RailwayDeploy["Railway<br/>(Backend Deploy)"]
    end

    React --> ReactRouter
    React --> Zustand
    React --> Tailwind

    React -->|HTTP| Express
    Express --> AuthMiddleware
    Express --> RBACMiddleware
    Express --> AIService
    Express --> BillingService
    Express --> VocabService
    Express --> WorkspaceService

    AuthMiddleware --> SupabaseAuth
    RBACMiddleware --> SupabaseAuth

    AIService --> AnthropicAPI
    BillingService --> StripeAPI
    VocabService --> SupabaseDB
    WorkspaceService --> SupabaseDB

    Express --> UpstashRedis

    VercelDeploy --> React
    RailwayDeploy --> Express
```

## Container Details

### Frontend (React App)

| Component | Technology | Purpose |
|-----------|------------|---------|
| UI Framework | React 19 | Component rendering |
| Routing | React Router 7 | Navigation |
| State | Zustand | Client-side state |
| Styling | Tailwind CSS 4 | Responsive design |
| Build | Vite 6 | Fast bundling |

### Backend (Express Server)

| Component | Technology | Purpose |
|-----------|------------|---------|
| HTTP Server | Express 5 | REST API |
| Auth | Supabase Auth | User authentication |
| AI | Anthropic Claude | AI coaching |
| Billing | Stripe | Subscription management |
| Validation | Zod | Input validation |
| Security | Helmet | HTTP headers |

### Data Stores

| Store | Technology | Purpose |
|-------|------------|---------|
| Primary DB | Supabase PostgreSQL | User data, subscriptions |
| Auth | Supabase Auth | Authentication, JWTs |
| Cache | Upstash Redis | Rate limiting, caching |

## Communication Protocols

| Path | Protocol | Port |
|------|----------|------|
| User → Frontend | HTTPS | 443 |
| Frontend → Backend | HTTPS | 443 |
| Backend → Supabase | HTTPS | 443 |
| Backend → Stripe | HTTPS | 443 |
| Backend → Anthropic | HTTPS | 443 |
| Backend → Upstash | HTTPS | 443 |

## Deployment

```mermaid
graph LR
    subgraph "Development"
        Dev["Local Dev"]
    end

    subgraph "CI/CD"
        GitHub["GitHub Actions"]
    end

    subgraph "Production"
        VercelProd["Vercel<br/>(Frontend)"]
        RailwayProd["Railway<br/>(Backend)"]
    end

    Dev -->|Push| GitHub
    GitHub -->|Deploy| VercelProd
    GitHub -->|Deploy| RailwayProd
```
