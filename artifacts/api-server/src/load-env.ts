import { existsSync } from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { config as loadDotenv } from "dotenv";

const currentDir = path.dirname(fileURLToPath(import.meta.url));
const repoRoot = path.resolve(currentDir, "../../../../");

const candidates = [
  path.resolve(process.cwd(), ".env.local"),
  path.resolve(process.cwd(), ".env"),
  path.resolve(repoRoot, ".env.local"),
  path.resolve(repoRoot, ".env"),
];

for (const envPath of [...new Set(candidates)]) {
  if (existsSync(envPath)) {
    loadDotenv({ path: envPath, override: false });
  }
}
