/**
 * Generates Prisma Client. On Windows / restrictive TLS, pre-downloads engines via curl.exe.
 */
import { copyFileSync, existsSync, readFileSync } from "node:fs";
import { spawnSync } from "node:child_process";
import path from "node:path";
import { fileURLToPath } from "node:url";

import { ensurePrismaEnginesDownloaded } from "./download-prisma-engines-curl.js";

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const clientEnginePath = path.join(
  backendRoot,
  "node_modules",
  ".prisma",
  "client",
  "query_engine-windows.dll.node",
);

function isPrismaClientGenerated(): boolean {
  const clientIndex = path.join(backendRoot, "node_modules", ".prisma", "client", "index.js");
  try {
    const source = readFileSync(clientIndex, "utf8");
    return !source.includes("did not initialize yet");
  } catch {
    return false;
  }
}

function shouldUseCurlDownload(): boolean {
  if (process.env.PRISMA_USE_CURL_DOWNLOAD === "1") {
    return true;
  }
  return process.platform === "win32";
}

function copyQueryEngineToClient(queryEnginePath: string): void {
  if (!existsSync(queryEnginePath)) {
    return;
  }
  copyFileSync(queryEnginePath, clientEnginePath);
  console.log("Copied query engine to node_modules/.prisma/client");
}

async function main(): Promise<void> {
  const env: NodeJS.ProcessEnv = { ...process.env };
  let cachedQueryEngine: string | undefined;

  if (shouldUseCurlDownload()) {
    try {
      const engines = await ensurePrismaEnginesDownloaded();
      cachedQueryEngine = engines.queryEngine;
      env.PRISMA_QUERY_ENGINE_LIBRARY = engines.queryEngine;
      env.PRISMA_SCHEMA_ENGINE_BINARY = engines.schemaEngine;
      console.log("Using Prisma engines from prisma/engines-cache (curl download).");
    } catch (err) {
      console.warn(
        "curl engine download failed; falling back to default prisma generate.",
        err instanceof Error ? err.message : err,
      );
    }
  }

  if (isPrismaClientGenerated() && existsSync(clientEnginePath)) {
    console.log("Prisma Client already generated — skipping.");
    return;
  }

  if (isPrismaClientGenerated() && cachedQueryEngine) {
    copyQueryEngineToClient(cachedQueryEngine);
    return;
  }

  const prismaBin = path.join(backendRoot, "node_modules", ".bin", "prisma.cmd");
  const result = spawnSync(prismaBin, ["generate"], {
    cwd: backendRoot,
    env,
    stdio: "inherit",
    shell: true,
  });

  if (result.status !== 0) {
    console.error(
      "\nPrisma generate failed.\n" +
        "Windows (corporate TLS): run from apps/backend:\n" +
        "  npm run db:generate\n" +
        "Or manually:\n" +
        "  npx tsx scripts/download-prisma-engines-curl.ts\n" +
        "  set PRISMA_QUERY_ENGINE_LIBRARY=prisma\\engines-cache\\...\\query_engine.dll.node\n" +
        "  npx prisma generate\n",
    );
    process.exit(result.status ?? 1);
  }

  if (cachedQueryEngine && !existsSync(clientEnginePath)) {
    copyQueryEngineToClient(cachedQueryEngine);
  }
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
