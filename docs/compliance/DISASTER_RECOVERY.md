# Disaster Recovery Plan (DRP)

## 1. Overview

The purpose of this Disaster Recovery Plan is to ensure that EngineerOS can rapidly recover its critical infrastructure and services in the event of an unexpected outage or disaster (e.g., Vercel regional failure, Supabase cluster loss, accidental data deletion).

## 2. Recovery Objectives

- **Recovery Time Objective (RTO):** 2 Hours. The maximum tolerable length of time that a computer, system, network, or application can be down after a failure.
- **Recovery Point Objective (RPO):** 24 Hours (Point-in-Time recovery). The maximum targeted period in which data might be lost from an IT service due to a major incident.

## 3. Disaster Scenarios and Action Plans

### 3.1. Frontend / Vercel Outage

_Description:_ Vercel's global CDN or edge network experiences a severe downtime affecting application routing.
_Action:_

1. Vercel utilizes an automated global edge network. Wait for automated DNS failover.
2. In case of total Vercel failure, redirect DNS via Cloudflare to a fallback static bucket or notify users via our status page (status.englishengineer.app).
3. If necessary, build and deploy the Dockerized container to an alternative PaaS (e.g., Railway, Render).

### 3.2. Database / Supabase Data Loss

_Description:_ Accidental DROP TABLE or complete primary database corruption.
_Action:_

1. Access the Supabase Dashboard -> Database -> Backups.
2. Select the most recent Point-in-Time Recovery (PITR) snapshot.
3. Initiate recovery to a staging branch, verify data integrity, and swap production connection strings.

### 3.3. External API Failure (OpenAI, Stripe)

_Description:_ OpenAI API goes down, causing AI teacher components to fail.
_Action:_

1. The backend is equipped with an `aiProvider` abstraction.
2. Update the environment variable `VITE_AI_PROVIDER=mock` or fallback to an alternative model (e.g., Anthropic) in the `.env` settings to maintain app availability (graceful degradation).

## 4. Communication Plan

- During an outage, the engineering lead will post updates every 30 minutes on the internal Slack channel #incidents.
- End-users will be notified via email for any data loss incidents exceeding the RPO.
