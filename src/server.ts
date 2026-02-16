/**
 * @module server
 * HTTP server entry point. Starts the Express app on the configured port.
 */
import { app } from "./app.js";
import { config } from "./config/index.js";

app.listen(config.PORT, () => {
  console.log(`Server running on port ${config.PORT}`);
});
