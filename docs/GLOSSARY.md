# Glossary

Technical terms and domain-specific vocabulary used across the EngineerOS codebase.

## Core Concepts

| Term          | Definition                                                                                                                  |
| ------------- | --------------------------------------------------------------------------------------------------------------------------- |
| **Elo**       | A rating system adapted from chess, used to measure user skill level across each English discipline (1000-5000 scale)       |
| **CEFR**      | Common European Framework of Reference for Languages — international standard for measuring language proficiency (A1 to C2) |
| **CEFR Band** | A CEFR level range mapped to an Elo score bracket (e.g., B1 = Elo 2666-2999)                                                |
| **Skill**     | One of six English disciplines: Vocabulary, Grammar, Reading, Writing, Listening, Speaking                                  |
| **Mission**   | A practice task within a skill (e.g., a reading comprehension scenario, a listening transcript exercise)                    |

## Architecture

| Term                           | Definition                                                                                                                               |
| ------------------------------ | ---------------------------------------------------------------------------------------------------------------------------------------- |
| **ADR**                        | Architecture Decision Record — documents significant architectural choices with context, decision, and consequences                      |
| **Feature-based Architecture** | Code organization pattern where each feature (vocabulary, grammar, etc.) has its own directory with components, stores, types, and tests |
| **Slice Pattern**              | Zustand state management pattern where each feature owns its own store slice                                                             |
| **Dependency Injection**       | Backend pattern where config, fetch implementation, and repositories are passed as parameters for testability                            |

## Backend

| Term                 | Definition                                                                                                    |
| -------------------- | ------------------------------------------------------------------------------------------------------------- |
| **RLS**              | Row Level Security — Supabase/PostgreSQL feature that restricts data access at the database level             |
| **Security Definer** | PostgreSQL function attribute that executes with the privileges of the function owner, not the caller         |
| **Rate Limiting**    | Technique to control the number of requests a user can make within a time window (Upstash Redis or in-memory) |

## AI System

| Term                     | Definition                                                                                                   |
| ------------------------ | ------------------------------------------------------------------------------------------------------------ |
| **AI Copilot**           | The AI-powered assistant that provides writing feedback, grammar explanations, and speaking evaluation       |
| **Provider Abstraction** | Layer that allows switching between OpenAI, Anthropic, Gemini, or mock AI backends with zero code changes    |
| **Mock Mode**            | Fallback mode where AI returns predefined responses without calling external APIs                            |
| **AI Guardrails**        | Safety constraints on AI outputs including content filtering, response length limits, and topic restrictions |

## Billing & Subscription

| Term                   | Definition                                                                                                      |
| ---------------------- | --------------------------------------------------------------------------------------------------------------- |
| **Entitlement**        | A feature access level tied to a subscription tier (Free, Pro, Project, Team, Max)                              |
| **Stripe Webhook**     | HTTP callback from Stripe that notifies the backend of payment events (subscription created, updated, canceled) |
| **Billing Repository** | Abstraction layer for storing billing data (Supabase or in-memory for development)                              |

## Testing

| Term                 | Definition                                                                                    |
| -------------------- | --------------------------------------------------------------------------------------------- |
| **Quality Gate**     | Automated pipeline that runs type checking, linting, formatting, tests, and build in sequence |
| **Unit Test**        | Test that verifies individual functions or components in isolation                            |
| **Integration Test** | Test that verifies multiple components working together                                       |
| **E2E Test**         | End-to-end test that simulates real user interactions in a browser (Playwright)               |
| **Mutation Testing** | Technique that introduces code mutations to verify test suite effectiveness (Stryker)         |

## Deployment

| Term           | Definition                                                                  |
| -------------- | --------------------------------------------------------------------------- |
| **Vercel**     | Frontend hosting platform with automatic deployments from git pushes        |
| **Railway**    | Backend hosting platform for the Express API server                         |
| **Staging**    | Pre-production environment for testing changes before production deployment |
| **Production** | Live environment serving real users                                         |
