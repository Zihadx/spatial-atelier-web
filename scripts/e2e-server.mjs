// Builds (unless E2E_SKIP_BUILD=1) and starts the production server for Playwright on port 3000.
import { spawn, spawnSync } from "node:child_process";

const env = { ...process.env, NEXT_PUBLIC_SITE_URL: process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000" };
if (!process.env.E2E_SKIP_BUILD) {
  const build = spawnSync("npx", ["next", "build"], { stdio: "inherit", env, shell: true });
  if (build.status !== 0) process.exit(build.status ?? 1);
}
const server = spawn("npx", ["next", "start", "-p", "3000"], { stdio: "inherit", env, shell: true });
for (const sig of ["SIGINT", "SIGTERM"]) process.on(sig, () => server.kill(sig));
server.on("exit", (code) => process.exit(code ?? 0));
