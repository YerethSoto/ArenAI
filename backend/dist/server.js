import { appConfig } from './config/env.js';
import { createApp } from './app.js';
const app = createApp();
app.listen(appConfig.port, () => {
    console.log(`API listening on port ${appConfig.port}`);
});
