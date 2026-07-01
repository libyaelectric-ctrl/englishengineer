import { createApp } from './src/app.js';
import { createBackendConfig } from './src/config.js';

const config = createBackendConfig();
const app = createApp({ config });

app.listen(config.port, () => {
  console.info(
    `EngineerOS backend ${config.version} listening on port ${config.port}`
  );
});
