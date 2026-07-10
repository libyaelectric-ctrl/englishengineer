import { createApp } from './src/app.js';
import { createBackendConfig } from './src/config.js';

process.on('unhandledRejection', (reason, promise) => {
  console.error('[unhandled-rejection]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[uncaught-exception]', error);
  process.exit(1);
});

const config = createBackendConfig();
const app = createApp({ config });

const server = app.listen(config.port, () => {
  console.info(
    `EngineerOS backend ${config.version} listening on port ${config.port}`
  );
});

// Graceful shutdown handling
const shutdown = (signal) => {
  console.info(`Received ${signal}. Starting graceful shutdown...`);
  server.close(() => {
    console.info('Http server closed cleanly.');
    process.exit(0);
  });

  setTimeout(() => {
    console.error('Graceful shutdown timeout exceeded. Force exiting...');
    process.exit(1);
  }, 10000);
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
