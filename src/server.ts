import { app } from "./app.js";
import { env } from "./config/env.js";
import "dotenv/config";

/*
  This file is the entry point of the application. It starts the Express server and listens on the specified port.
*/
app.listen(env.PORT, () => {
  console.log(`Auth API running on http://localhost:${env.PORT}`);
});
