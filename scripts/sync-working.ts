import 'dotenv/config';
import fs from 'node:fs/promises';
import path from 'node:path';
import { Client } from '@notionhq/client';

const WORKING_DB_RAW = process.env.NOTION_WORKING_DB_ID ?? process.env.NOTION_WORKING_DB ?? null;
const WORKING_DS_RAW = process.env.NOTION_WORKING_DATA_SOURCE_ID ?? null;
const notion = new Client({ auth: process.env.NOTION_SECRET ?? process.env.NOTION_TOKEN });

const OUT_DIR = path.resolve('src/data/working');

const ID32 = /[a-f0-9]{32}/i;
const UUID = /^[a-f0-9]{8}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{4}-[a-f0-9]{12}$/i;
const mask = (s?: string | null) => (s ? `${s.slice(0, 8)}…${s.slice(-4)}` : 'none');
const plain = (rich: any[] = []) => rich.map((x: any) => x.plain_text).join('').trim();
async function ensureDir(dirPath: string) { await fs.mkdir(dirPath, { recursive: true }); }
function toHyphenated(id: string) {
  const stripped = id.replace(/-/g, '');
  return stripped.length === 32
    ? `${stripped.slice(0, 8)}-${stripped.slice(8, 12)}-${stripped.slice(12, 16)}-${stripped.slice(16, 20)}-${stripped.slice(20)}`
    : id;
}
function extractDbLikeId(input?: string | null): string | null {
  if (!input) return null;
  if (UUID.test(input)) return input;
  const hit = input.match(ID32);
  return hit ? toHyphenated(hit[0]) : null;
}
async function databasesRetrieve(database_id: string) {
  const has = (notion as any)?.databases?.retrieve && typeof (notion as any).databases.retrieve === 'function';
  return has
    ? await (notion as any).databases.retrieve({ database_id })
    : await notion.request({ path: `databases/${database_id}`, method: 'get' });
}
async function dataSourcesQueryAll(data_source_id: string) {
  const has = (notion as any)?.dataSources?.query && typeof (notion as any).dataSources.query === 'function';
  const call = async (start_cursor?: string) => has
    ? await (notion as any).dataSources.query({ data_source_id, page_size: 100, start_cursor })
    : await notion.request({ path: 'data_sources/query', method: 'post', body: { data_source_id, page_size: 100, start_cursor } });
  const results: any[] = [];
  let cursor: string | undefined;
  do {
    const response: any = await call(cursor);
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return results;
}
async function databasesQueryAll(database_id: string) {
  const has = (notion as any)?.databases?.query && typeof (notion as any).databases.query === 'function';
  const call = async (start_cursor?: string) => has
    ? await (notion as any).databases.query({ database_id, start_cursor })
    : await notion.request({ path: `databases/${database_id}/query`, method: 'post', body: { start_cursor } });
  const results: any[] = [];
  let cursor: string | undefined;
  do {
    const response: any = await call(cursor);
    results.push(...response.results);
    cursor = response.has_more ? response.next_cursor : undefined;
  } while (cursor);
  return results;
}
function readTitle(props: any) {
  const key = Object.keys(props).find((candidate) => props[candidate]?.type === 'title');
  return key ? plain(props[key].title) : '';
}
function readRichText(props: any, key: string) {
  return props[key]?.type === 'rich_text' ? plain(props[key].rich_text) : '';
}
function readTools(props: any) {
  const prop = props.Tools;
  if (!prop?.type) return [];
  if (prop.type === 'multi_select') return prop.multi_select.map((tool: any) => tool.name).filter(Boolean);
  if (prop.type === 'rich_text') {
    return plain(prop.rich_text)
      .split(/,|\n|·|•/) 
      .map((tool) => tool.trim())
      .filter(Boolean);
  }
  return [];
}

(async () => {
  if (!process.env.NOTION_SECRET && !process.env.NOTION_TOKEN) throw new Error('NOTION_SECRET/NOTION_TOKEN is missing');

  let src: { kind: 'ds' | 'db'; id: string } | null = null;
  if (WORKING_DS_RAW) {
    const dsId = extractDbLikeId(WORKING_DS_RAW);
    src = dsId ? { kind: 'ds', id: dsId } : null;
  } else {
    const dbId = extractDbLikeId(WORKING_DB_RAW);
    if (!dbId) throw new Error('Set NOTION_WORKING_DB_ID (or NOTION_WORKING_DATA_SOURCE_ID)');
    try {
      const meta: any = await databasesRetrieve(dbId);
      const ds = Array.isArray(meta?.data_sources) ? meta.data_sources[0] : undefined;
      src = ds?.id ? { kind: 'ds', id: ds.id } : { kind: 'db', id: dbId };
    } catch (error: any) {
      if (error?.code === 'invalid_request_url' || error?.status === 400) src = { kind: 'ds', id: dbId };
      else throw error;
    }
  }

  console.log('Working Source:', src ? `${src.kind.toUpperCase()} ${mask(src.id)}` : 'none');
  const pages = src?.kind === 'ds' ? await dataSourcesQueryAll(src.id) : await databasesQueryAll(src!.id);

  await ensureDir(OUT_DIR);
  const items = pages
    .filter((page: any) => page.object === 'page' && !page.archived)
    .map((page: any, index: number) => {
      const properties = page.properties ?? {};
      const skill =
        readTitle(properties) ||
        readRichText(properties, 'Skill') ||
        readRichText(properties, 'Title') ||
        'Untitled';
      const description =
        readRichText(properties, 'Description') ||
        readRichText(properties, 'Summary') ||
        undefined;
      const order = properties.Order?.type === 'number' && typeof properties.Order.number === 'number'
        ? properties.Order.number
        : index;

      return {
        skill,
        tools: readTools(properties),
        description,
        order,
      };
    })
    .sort((left, right) => left.order - right.order);

  for (const file of await fs.readdir(OUT_DIR).catch(() => [] as string[])) {
    await fs.unlink(path.join(OUT_DIR, file)).catch(() => {});
  }

  await fs.writeFile(path.join(OUT_DIR, '_ordered.json'), JSON.stringify(items, null, 2), 'utf8');
  console.log(`✓ Working: ${items.length} → ${OUT_DIR}`);
})().catch((error) => {
  console.error(error);
  process.exit(1);
});