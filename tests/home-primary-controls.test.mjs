import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import test from 'node:test';
import { fileURLToPath } from 'node:url';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const read = (rel) => fs.readFileSync(path.join(root, rel), 'utf8');

test('homepage project cards do not render a type badge', () => {
  const home = read('src/pages/index.astro');
  assert.equal(home.includes('normalizeProjectType'), false);
  assert.equal(home.includes('projectType'), false);
  assert.match(home, /p\.data\.tags/);
  assert.match(home, /btn-primary/);
});

test('projects page still groups work by category', () => {
  const projects = read('src/pages/projects.astro');
  assert.match(projects, /Products/);
  assert.match(projects, /Experiments/);
  assert.match(projects, /Community/);
});

test('primary controls share one dark-mode treatment', () => {
  const css = read('src/styles/global.css');
  assert.match(css, /html\.dark \.btn-primary/);
  assert.match(css, /--dark-media-restore/);
  for (const file of [
    'src/pages/index.astro',
    'src/pages/about.astro',
    'src/components/MailingListSubscribe.astro',
  ]) {
    assert.match(read(file), /btn-primary/);
  }
});
