// Shared bits for the Notion sync scripts: skip when there is no token, and
// publish a finished tree with a rename so a failed run cannot empty a live directory.
import fs from 'node:fs/promises';
import path from 'node:path';

const TMP_ROOT = path.resolve('.sync-tmp');

let seq = 0;

function uniqueName(name: string): string {
  seq += 1;
  return `${name}-${process.pid}-${seq}`;
}

function isEnoent(error: unknown): boolean {
  return (
    !!error &&
    typeof error === 'object' &&
    'code' in error &&
    (error as { code?: string }).code === 'ENOENT'
  );
}

export function skipIfNotionUnconfigured(label: string): boolean {
  const token = (process.env.NOTION_SECRET ?? process.env.NOTION_TOKEN ?? '').trim();
  if (token) return false;
  console.warn(
    `[${label}] NOTION_SECRET/NOTION_TOKEN is not set. Skipping Notion sync and keeping the committed content.`
  );
  return true;
}

export async function stageDir(name: string): Promise<string> {
  const dir = path.join(TMP_ROOT, 'stage', uniqueName(name));
  await fs.rm(dir, { recursive: true, force: true });
  await fs.mkdir(dir, { recursive: true });
  return dir;
}

/** Remove staging leftovers. Live content dirs sit outside `.sync-tmp`, so this does not touch them. */
export async function cleanupSyncTmp(): Promise<void> {
  await fs.rm(TMP_ROOT, { recursive: true, force: true });
}

/**
 * Keep files the sync does not regenerate (non-markdown, plus protected markdown)
 * when the whole directory is swapped.
 */
export function keepUnlessReplacedMarkdown(protectedNames: ReadonlySet<string>) {
  return (name: string) => {
    const lower = name.toLowerCase();
    const isMarkdown = lower.endsWith('.md') || lower.endsWith('.mdx');
    return !isMarkdown || protectedNames.has(name);
  };
}

export async function copyPreserved(
  fromDir: string,
  toDir: string,
  shouldPreserve: (name: string) => boolean
): Promise<void> {
  let names: string[];
  try {
    names = await fs.readdir(fromDir);
  } catch (error) {
    if (isEnoent(error)) return;
    throw error;
  }

  for (const name of names) {
    if (!shouldPreserve(name)) continue;
    const dest = path.join(toDir, name);
    try {
      await fs.lstat(dest);
      continue;
    } catch (error) {
      if (!isEnoent(error)) throw error;
    }
    await fs.cp(path.join(fromDir, name), dest, { recursive: true });
  }
}

/**
 * Replace each live directory with its staged directory.
 * Renames are on the same filesystem. If a later swap fails, earlier swaps are restored.
 * Each staged directory is consumed on success.
 */
export async function commitStagedDirs(
  pairs: Array<{ targetDir: string; stagedDir: string }>
): Promise<void> {
  const backups: Array<{ targetDir: string; backupDir: string }> = [];

  try {
    for (const pair of pairs) {
      const backupDir = await swapOne(pair.targetDir, pair.stagedDir);
      if (backupDir) backups.push({ targetDir: pair.targetDir, backupDir });
    }
  } catch (error) {
    try {
      for (const { targetDir, backupDir } of [...backups].reverse()) {
        await fs.rm(targetDir, { recursive: true, force: true });
        await fs.rename(backupDir, targetDir);
      }
    } catch (rollbackError) {
      console.error('Failed to restore content after a sync error.', rollbackError);
    }
    throw error;
  }

  for (const { backupDir } of backups) {
    await fs.rm(backupDir, { recursive: true, force: true });
  }
}

async function swapOne(targetDir: string, stagedDir: string): Promise<string | null> {
  await fs.mkdir(path.dirname(targetDir), { recursive: true });
  const backupDir = path.join(TMP_ROOT, 'backup', uniqueName(path.basename(targetDir)));
  await fs.mkdir(path.dirname(backupDir), { recursive: true });

  let parked = false;
  try {
    await fs.rename(targetDir, backupDir);
    parked = true;
  } catch (error) {
    if (!isEnoent(error)) throw error;
  }

  try {
    await fs.rename(stagedDir, targetDir);
  } catch (error) {
    if (parked) await fs.rename(backupDir, targetDir);
    throw error;
  }

  return parked ? backupDir : null;
}
