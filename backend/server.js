import { createApp } from './src/app.js';
import { createBackendConfig } from './src/config.js';

process.on('unhandledRejection', (reason, _promise) => {
  console.error('[unhandled-rejection]', reason);
});

process.on('uncaughtException', (error) => {
  console.error('[uncaught-exception]', error);
  process.exit(1);
});

const config = createBackendConfig();
const app = createApp({ config });

let isShuttingDown = false;

const server = app.listen(config.port, () => {
  console.info(
    `EngineerOS backend ${config.version} listening on port ${config.port}`
  );
});

// Track active connections for graceful drain
let activeConnections = 0;
server.on('connection', (conn) => {
  activeConnections++;
  conn.on('close', () => activeConnections--);
});

const shutdown = (signal) => {
  if (isShuttingDown) return;
  isShuttingDown = true;

  console.info(`Received ${signal}. Starting graceful shutdown...`);
  console.info(`Active connections: ${activeConnections}`);

  // Stop accepting new connections
  server.close(() => {
    console.info('Http server closed. No active connections remaining.');
    process.exit(0);
  });

  // Force exit after timeout
  const forceExit = setTimeout(() => {
    console.error(`Graceful shutdown timeout (10s) exceeded. ${activeConnections} connections still active. Force exiting...`);
    process.exit(1);
  }, 10000);

  // Allow clean exit if no connections
  if (activeConnections === 0) {
    clearTimeout(forceExit);
    process.exit(0);
  }
};

process.on('SIGTERM', () => shutdown('SIGTERM'));
process.on('SIGINT', () => shutdown('SIGINT'));
