# EngineerOS Core Architecture (Sprint 2 - Core Layer)

Welcome to the **EngineerOS Core Architecture**. This document provides detailed, high-level documentation of the reusable core engine built in **Sprint 2**. Future modules must import from and extend these primitives to ensure structural safety, type-safe execution, and a unified in-memory event-driven workflow.

---

## 1. Core Principles

The Core Layer is built with three main goals in mind:

- **Resilience**: Enforce deterministic error handling via the **Result Pattern** instead of uncontrolled runtime throwing.
- **Event-Driven Coupling**: Facilitate cross-module interactions and state coordination through a fully typed, in-memory **Event Bus**.
- **Domain Alignment**: Align models and databases using standardized **Entity models**, **ID services**, and modular **Base Classes**.

---

## 2. Directory Structure

All core primitives reside inside the `src/core/` folder. Every sub-directory exports its api via an `index.ts` file, and a master exports file is provided at `src/core/index.ts` for simple, unified imports.

```text
src/core/
├── result/               # Result Pattern primitives (ok, fail, Result<T, E>)
├── errors/               # Domain AppError class & ErrorCode definitions
├── events/               # Strongly-typed EventBus and EventStore history
├── services/             # BaseService class with safe execute hooks
├── repositories/         # BaseRepository for durable/local-first persistence
├── entities/             # Base, Auditable, and SoftDeletable entity schemas
├── ids/                  # Unique cryptographic identifier (UUID) generator
├── time/                 # Clock abstractions & relative human timing utils
├── validation/           # Declarative field validator functions
└── index.ts              # Unified entry point exporting all systems
```

---

## 3. Core Modules Deep-Dive

### 3.1. Result Pattern (`src/core/result/`)

Avoid throwing exceptions for anticipated operations (e.g. invalid inputs, missing file keys, resource not found). Instead, return a `Result<T, E>` union indicating explicit success or failure.

#### Signature

```typescript
type Result<T, E = Error> = OkResult<T> | FailResult<E>;
```

#### Code Example

```typescript
import { Result, ok, fail, isOk, mapResult } from '@/core/result';

function divide(a: number, b: number): Result<number, string> {
  if (b === 0) {
    return fail('Division by zero');
  }
  return ok(a / b);
}

const result = divide(10, 2);
if (isOk(result)) {
  console.log(`Success: ${result.value}`); // Type safely unwrapped
}
```

---

### 3.2. Unified App Error System (`src/core/errors/`)

The custom `AppError` class extends the native `Error` object, enriching it with domain telemetry such as severe ratings, cause tracking, metadata logs, and JSON serialization.

#### Error Severity Categories

- `info`: Diagnostic telemetry
- `warning`: Mild issues (e.g., validation fail, key warning)
- `error`: Standard functional failure
- `critical`: Fatal kernel failures or crash risks

#### Error Code Categories

- `unknown`: Catch-all unclassified error
- `validation`: Field or schema validation mismatch
- `storage`: DB read, write, update, or local storage fail
- `network`: API proxy or socket failures
- `auth`: Missing token, signature mismatch, permission denied
- `ai`: LLM proxy or generation limit reached
- `learning`: Topic progress or curriculum system error
- `analytics`: Metric generation or telemetry query failure
- `sync`: Cloud synchronizer or offline sync fail

---

### 3.3. Event Bus & Store (`src/core/events/`)

An in-memory, highly responsive publish-subscribe engine allowing decoupling of modules. Events are recorded chronologically in an `EventStore` up to a bounded cap of 1,000 entries.

#### Strong Typed App Events

- `app.started`: Triggered on main entry point loading
- `app.error`: Automatic telemetry on service or repo failures
- `route.changed`: User navigation tracking
- `user.action`: User interface telemetry events
- `learning.started`: Triggers module path activation
- `learning.completed`: Logs scores, durations, and metadata
- `xp.earned`: Game mechanics tracking
- `badge.unlocked`: Achievement notifications

#### Subscription Example

```typescript
import { eventBus } from '@/core/events';

// Subscribe to specific event types
const token = eventBus.subscribe('xp.earned', (event) => {
  console.log(
    `Congratulations! You earned ${event.payload.amount} XP for ${event.payload.reason}`
  );
});

// Clean up when component unmounts
token.unsubscribe();
```

---

### 3.4. Base Service (`src/core/services/`)

The abstract `BaseService` provides built-in instrumentation: logging wrapper, event publishing pipelines, error generator tools, and a secure execution barrier.

#### Class Implementation

Use `safeExecute` to automatically handle unhandled exceptions, trace performance/failures, and emit corresponding telemetry error events.

```typescript
import { BaseService } from '@/core/services';
import { Result } from '@/core/result';

export class EngineService extends BaseService {
  protected readonly serviceName = 'EngineService';

  public async processTask(data: string): Promise<Result<string, Error>> {
    return this.safeExecute('processTask', async () => {
      if (!data) {
        throw this.createError(ErrorCode.VALIDATION, 'Data cannot be empty');
      }
      return `Processed: ${data}`;
    });
  }
}
```

---

### 3.5. Base Repository (`src/core/repositories/`)

An abstract, local-first backing store implementing typical CRUD operations: `getById`, `list`, `create`, `update`, and `delete`. This provides instant fallback persistence and offline-ready architectures.

```typescript
import { BaseRepository, BaseEntity } from '@/core';

interface UserPreferences extends BaseEntity {
  theme: string;
}

export class PreferencesRepository extends BaseRepository<UserPreferences> {
  protected readonly entityName = 'UserPreferences';
}
```

---

### 3.6. Entity Definitions & ID Service (`src/core/entities/` & `src/core/ids/`)

Provides normalized database models:

- **BaseEntity**: Minimal entity layout wrapping a unique string `id`.
- **AuditableEntity**: Standard fields for creation and update dates, alongside actor records.
- **SoftDeletableEntity**: Safe deletion layout keeping database records intact for synchronization needs.

The cryptographically secure `IdService` resolves `crypto.randomUUID` where available, and falls back gracefully in custom runtimes or non-web contexts.

---

### 3.7. Declarative Field Validation (`src/core/validation/`)

Provides reusable field checks (`required`, `minLength`, `isEmail`) that yield structured, immutable `ValidationError` and compound `ValidationResult` objects.

```typescript
import { validationHelpers, combineValidations } from '@/core/validation';

const errors = [
  validationHelpers.required(email, 'email'),
  validationHelpers.isEmail(email),
];

const validation = combineValidations(errors);
if (!validation.isValid) {
  console.error(validation.errors);
}
```

---

## 4. Architectural Guidelines for Future Modules

As we scale the platform with new capabilities in the future:

1. **Never Throw directly inside services**: Always wrap business workflows inside `this.safeExecute`.
2. **Promote loosely coupled communication**: Emit domain events (such as `learning.completed`) rather than tightly coupling cross-service function calls.
3. **Use IDs derived through `IdService`**: Prefix identifiers consistently to enable easier logging analysis (e.g. `usr_...`, `ana_...`).
4. **Leverage standard entity structures**: Retain database schema cleanliness by strictly adhering to `AuditableEntity` or `SoftDeletableEntity`.
