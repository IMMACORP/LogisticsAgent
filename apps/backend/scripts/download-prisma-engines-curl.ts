/**
 * Downloads Prisma engine binaries via curl.exe (Windows SSL / revocation workarounds).
 * Node fetch often fails with "unsafe legacy renegotiation disabled" on corporate networks.
 */
import { spawnSync } from "node:child_process";
import {
  createReadStream,
  createWriteStream,
  existsSync,
  mkdirSync,
  readFileSync,
} from "node:fs";
import path from "node:path";
import { pipeline } from "node:stream/promises";
import { fileURLToPath } from "node:url";
import { createGunzip } from "node:zlib";

const backendRoot = path.join(path.dirname(fileURLToPath(import.meta.url)), "..");
const enginesVersionPkg = JSON.parse(
  readFileSync(
    path.join(backendRoot, "node_modules", "@prisma", "engines-version", "package.json"),
    "utf8",
  ),
) as { prisma: { enginesVersion: string } };
const enginesVersion = enginesVersionPkg.prisma.enginesVersion;
const platform = process.platform === "win32" ? "windows" : process.platform;
const binariesDir = path.join(backendRoot, "prisma", "engines-cache", enginesVersion, platform);

const ENGINE_FILES = ["query_engine.dll.node", "schema-engine.exe"] as const;

const CDN_BASE = `https://binaries.prisma.sh/all_commits/${enginesVersion}/${platform}`;

function curlDownload(url: string, dest: string): void {
  const args = ["--ssl-no-revoke", "-fsSL", "-o", dest, url];
  const result = spawnSync("curl.exe", args, { stdio: "inherit" });
  if (result.status !== 0) {
    throw new Error(`curl failed (${result.status}) for ${url}`);
  }
}

async function decompressGzip(gzPath: string, outPath: string): Promise<void> {
  await pipeline(createReadStream(gzPath), createGunzip(), createWriteStream(outPath));
}

export async function ensurePrismaEnginesDownloaded(): Promise<{
  queryEngine: string;
  schemaEngine: string;
}> {
  mkdirSync(binariesDir, { recursive: true });

  const paths: Record<(typeof ENGINE_FILES)[number], string> = {
    "query_engine.dll.node": "",
    "schema-engine.exe": "",
  };

  for (const file of ENGINE_FILES) {
    const outPath = path.join(binariesDir, file);
    paths[file] = outPath;

    if (existsSync(outPath)) {
      continue;
    }

    const gzPath = `${outPath}.gz`;
    const url = `${CDN_BASE}/${file}.gz`;
    console.log(`Downloading Prisma engine: ${file}`);
    curlDownload(url, gzPath);
    await decompressGzip(gzPath, outPath);
  }

  return {
    queryEngine: paths["query_engine.dll.node"],
    schemaEngine: paths["schema-engine.exe"],
  };
}

