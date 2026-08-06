import app from "./app.js";
import { config } from "./config/env.js";

const PORT = config.port;

app.listen(PORT, () => {
  console.log(`🚀 DevTrack Auth Server running on http://localhost:${PORT}`);
  // console.log(`🔑 Passport Auth Endpoints:`);
  console.log(`Everything is working lmao check things up!`);
  console.log(`Pray to god lmao - http://localhost:5173/`);
  // console.log(`   - Google OAuth:    GET  http://localhost:${PORT}/api/auth/google`);
  // console.log(`   - GitHub OAuth:    GET  http://localhost:${PORT}/api/auth/github`);
  // console.log(`   - User Profile:    GET  http://localhost:${PORT}/api/auth/me (Bearer Token)`);
  // console.log(`   - Logout:          POST http://localhost:${PORT}/api/auth/logout`);
});
