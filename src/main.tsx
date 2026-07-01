import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
import { logger } from './shared/logger';
import { eventBus } from '@/core/events/event-bus';
import { IdService } from '@/core/ids/id.service';

logger.i('EngineerOS Kernel Booting...');

// Publish app.started event to Core Event Bus
try {
  const metaEnv = (import.meta as unknown as { env?: { MODE?: string } }).env;
  eventBus.publish({
    id: IdService.createId('sys'),
    type: 'app.started',
    timestamp: new Date().toISOString(),
    payload: {
      environment: metaEnv?.MODE || 'development',
      userAgent:
        typeof navigator !== 'undefined' ? navigator.userAgent : 'unknown',
      timestamp: Date.now(),
    },
  });
  logger.i('Core app.started event emitted successfully.');
} catch (err) {
  logger.e('Failed to emit app.started event', err);
}

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
