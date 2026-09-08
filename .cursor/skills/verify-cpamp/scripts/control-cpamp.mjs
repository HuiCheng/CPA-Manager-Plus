#!/usr/bin/env node
import { spawn } from 'node:child_process';
import fs from 'node:fs';
import os from 'node:os';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import process from 'node:process';
import puppeteer from 'puppeteer-core';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const REPO_ROOT = path.resolve(__dirname, '../../../..');
const SKILL_ROOT = path.resolve(__dirname, '..');
const DEFAULT_PORT = 4173;
const DEFAULT_BASE = `http://127.0.0.1:${DEFAULT_PORT}`;
const DEMO_ENTRY = '/#/demo';

function env(name, fallback = '') {
  const value = process.env[name];
  return value == null || value === '' ? fallback : value;
}

function runRoot() {
  return env('CPAMP_VERIFY_ROOT', path.join(os.tmpdir(), 'cpamp-verify'));
}

function runId() {
  return env('CPAMP_VERIFY_RUN_ID', 'default');
}

function stateDir() {
  return path.join(runRoot(), runId());
}

function statePath() {
  return path.join(stateDir(), 'state.json');
}

function artifactsDir() {
  return env(
    'CPAMP_VERIFY_ARTIFACTS',
    path.join(SKILL_ROOT, 'artifacts', runId())
  );
}

function readState() {
  const file = statePath();
  if (!fs.existsSync(file)) {
    throw new Error(`Missing state at ${file}. Run launch first.`);
  }
  return JSON.parse(fs.readFileSync(file, 'utf8'));
}

function writeState(state) {
  fs.mkdirSync(stateDir(), { recursive: true });
  fs.writeFileSync(statePath(), `${JSON.stringify(state, null, 2)}\n`);
}

function chromePath() {
  return (
    env('CPAMP_VERIFY_CHROME') ||
    [
      '/usr/local/bin/google-chrome',
      '/usr/bin/google-chrome',
      '/usr/bin/chromium',
      '/usr/bin/chromium-browser',
    ].find((candidate) => fs.existsSync(candidate)) ||
    'google-chrome'
  );
}

async function waitForUrl(url, timeoutMs = 60000) {
  const start = Date.now();
  let lastError = '';
  while (Date.now() - start < timeoutMs) {
    try {
      const response = await fetch(url, { redirect: 'manual' });
      if (response.status > 0 && response.status < 500) return;
      lastError = `HTTP ${response.status}`;
    } catch (error) {
      lastError = error instanceof Error ? error.message : String(error);
    }
    await new Promise((resolve) => setTimeout(resolve, 400));
  }
  throw new Error(`Timed out waiting for ${url}: ${lastError}`);
}

function parseArgs(argv) {
  const args = [...argv];
  const command = args.shift();
  const flags = {};
  const positionals = [];
  while (args.length) {
    const token = args.shift();
    if (!token) break;
    if (token.startsWith('--')) {
      const key = token.slice(2);
      const next = args[0];
      if (!next || next.startsWith('--')) {
        flags[key] = true;
      } else {
        flags[key] = args.shift();
      }
    } else {
      positionals.push(token);
    }
  }
  return { command, flags, positionals };
}

function resolveHash(target) {
  if (!target) return DEMO_ENTRY;
  if (target.startsWith('http://') || target.startsWith('https://')) return target;
  if (target.startsWith('/#/')) return target;
  if (target.startsWith('#/')) return `/${target}`;
  if (target.startsWith('/demo')) return `/#${target}`;
  if (target.startsWith('demo/')) return `/#/${target}`;
  if (target.startsWith('/')) return `/#/demo${target === '/' ? '' : target}`;
  return `/#/demo/${target.replace(/^\/+/, '')}`;
}

function absoluteUrl(state, target) {
  const base = state.baseUrl.replace(/\/$/, '');
  const hashPath = resolveHash(target);
  if (hashPath.startsWith('http://') || hashPath.startsWith('https://')) return hashPath;
  return `${base}${hashPath}`;
}

async function withBrowser(state, fn) {
  const browser = await puppeteer.connect({
    browserURL: `http://127.0.0.1:${state.chromeDebugPort}`,
    defaultViewport: null,
  });
  try {
    const pages = await browser.pages();
    const page = pages[0] || (await browser.newPage());
    return await fn(page, browser);
  } finally {
    await browser.disconnect();
  }
}

function axName(node) {
  const name = node?.name?.value ?? node?.name ?? '';
  return String(name).trim();
}

function axRole(node) {
  return String(node?.role?.value ?? node?.role ?? '').trim();
}

function flattenAx(node, out = []) {
  if (!node) return out;
  out.push(node);
  for (const child of node.children || []) flattenAx(child, out);
  return out;
}

async function findAx(page, { role, name, exact = false }) {
  const snapshot = await page.accessibility.snapshot({ interestingOnly: false });
  const nodes = flattenAx(snapshot);
  const wantedName = String(name || '').trim();
  const wantedRole = String(role || '').trim().toLowerCase();
  const match = nodes.find((node) => {
    const nodeName = axName(node);
    const nodeRole = axRole(node).toLowerCase();
    if (wantedRole && nodeRole !== wantedRole) return false;
    if (!wantedName) return true;
    if (exact) return nodeName === wantedName;
    return nodeName === wantedName || nodeName.includes(wantedName);
  });
  if (!match) {
    const sample = nodes
      .filter((node) => axName(node))
      .slice(0, 40)
      .map((node) => `${axRole(node)}:${axName(node)}`)
      .join(' | ');
    throw new Error(
      `No AX node role=${wantedRole || '*'} name=${wantedName || '*'} sample=${sample}`
    );
  }
  return match;
}

async function clickAx(page, options) {
  const role = String(options.role || 'button');
  const name = String(options.name || '');
  const exact = Boolean(options.exact);
  const result = await page.evaluate(
    ({ role, name, exact }) => {
      const normalize = (value) => String(value || '').replace(/\s+/g, ' ').trim();
      const wanted = normalize(name);
      const roleSelectors = {
        link: 'a[href], [role="link"]',
        button: 'button, [role="button"], input[type="button"], input[type="submit"]',
        tab: '[role="tab"]',
        textbox: 'input, textarea, [role="textbox"]',
        searchbox: 'input[type="search"], [role="searchbox"]',
      };
      const selector = roleSelectors[role] || `[role="${role}"], ${role}`;
      const nodes = Array.from(document.querySelectorAll(selector));
      const match = nodes.find((node) => {
        const label = normalize(
          node.getAttribute('aria-label') ||
            node.getAttribute('title') ||
            node.textContent ||
            node.value ||
            ''
        );
        if (!wanted) return true;
        return exact ? label === wanted : label === wanted || label.includes(wanted);
      });
      if (!match) {
        return {
          ok: false,
          sample: nodes
            .slice(0, 20)
            .map((node) =>
              normalize(
                node.getAttribute('aria-label') ||
                  node.getAttribute('title') ||
                  node.textContent ||
                  ''
              )
            )
            .filter(Boolean),
        };
      }
      match.click();
      return { ok: true };
    },
    { role, name, exact }
  );
  if (!result.ok) {
    throw new Error(
      `No element role=${role} name=${name} sample=${(result.sample || []).join(' | ')}`
    );
  }
}

async function fillAx(page, options, value) {
  const role = String(options.role || 'textbox');
  const name = String(options.name || '');
  const exact = Boolean(options.exact);
  const result = await page.evaluate(
    ({ role, name, exact, value }) => {
      const normalize = (text) => String(text || '').replace(/\s+/g, ' ').trim();
      const wanted = normalize(name);
      const nodes = Array.from(
        document.querySelectorAll('input, textarea, [role="textbox"], [contenteditable="true"]')
      );
      const match = nodes.find((node) => {
        const label = normalize(
          node.getAttribute('aria-label') ||
            node.getAttribute('placeholder') ||
            node.getAttribute('name') ||
            node.id ||
            ''
        );
        const labelledBy = node.getAttribute('aria-labelledby');
        const labelledText = labelledBy
          ? normalize(document.getElementById(labelledBy)?.textContent || '')
          : '';
        const combined = labelledText || label;
        if (!wanted) return role === 'textbox' || role === 'searchbox';
        return exact ? combined === wanted : combined === wanted || combined.includes(wanted);
      });
      if (!match) return { ok: false };
      match.focus();
      if ('value' in match) {
        match.value = '';
        match.dispatchEvent(new Event('input', { bubbles: true }));
        match.value = value;
        match.dispatchEvent(new Event('input', { bubbles: true }));
        match.dispatchEvent(new Event('change', { bubbles: true }));
      } else {
        match.textContent = value;
        match.dispatchEvent(new Event('input', { bubbles: true }));
      }
      return { ok: true };
    },
    { role, name, exact, value: String(value) }
  );
  if (!result.ok) {
    throw new Error(`No fillable element role=${role} name=${name}`);
  }
}

function renderAx(node, depth = 0, lines = []) {
  if (!node) return lines;
  const role = axRole(node) || 'generic';
  const name = axName(node);
  const indent = '  '.repeat(depth);
  lines.push(name ? `${indent}${role}: ${name}` : `${indent}${role}`);
  for (const child of node.children || []) renderAx(child, depth + 1, lines);
  return lines;
}

async function cmdLaunch(flags) {
  const port = Number(flags.port || env('CPAMP_VERIFY_PORT', String(DEFAULT_PORT)));
  const baseUrl = env('CPAMP_VERIFY_BASE_URL', `http://127.0.0.1:${port}`);
  const chromeDebugPort = Number(flags['chrome-port'] || env('CPAMP_VERIFY_CHROME_PORT', '9222'));
  const profileDir = path.join(stateDir(), 'chrome-profile');
  const logPath = path.join(stateDir(), 'vite.log');
  const chromeLogPath = path.join(stateDir(), 'chrome.log');

  fs.mkdirSync(stateDir(), { recursive: true });
  fs.mkdirSync(profileDir, { recursive: true });
  fs.mkdirSync(artifactsDir(), { recursive: true });

  if (fs.existsSync(statePath())) {
    const existing = readState();
    if (existing.vitePid && existing.chromePid) {
      try {
        process.kill(existing.vitePid, 0);
        process.kill(existing.chromePid, 0);
        await waitForUrl(baseUrl, 5000);
        console.log(
          JSON.stringify({
            ok: true,
            reused: true,
            baseUrl: existing.baseUrl,
            state: statePath(),
            artifacts: artifactsDir(),
          })
        );
        return;
      } catch {
        // Fall through and relaunch.
      }
    }
  }

  const viteLog = fs.openSync(logPath, 'w');
  const webRoot = path.join(REPO_ROOT, 'apps', 'web');
  const viteBin = path.join(REPO_ROOT, 'node_modules', 'vite', 'bin', 'vite.js');
  const vite = spawn(
    process.execPath,
    [
      viteBin,
      '--mode',
      'demo',
      '--host',
      '127.0.0.1',
      '--port',
      String(port),
      '--strictPort',
    ],
    {
      cwd: webRoot,
      env: { ...process.env, BROWSER: 'none' },
      stdio: ['ignore', viteLog, viteLog],
      detached: true,
    }
  );
  vite.unref();

  await waitForUrl(baseUrl, 90000);

  const chromeLog = fs.openSync(chromeLogPath, 'w');
  const chrome = spawn(
    chromePath(),
    [
      `--remote-debugging-port=${chromeDebugPort}`,
      `--user-data-dir=${profileDir}`,
      '--no-first-run',
      '--no-default-browser-check',
      '--disable-gpu',
      '--disable-dev-shm-usage',
      '--window-size=1440,1100',
      `${baseUrl}${DEMO_ENTRY}`,
    ],
    {
      stdio: ['ignore', chromeLog, chromeLog],
      detached: true,
    }
  );
  chrome.unref();

  await waitForUrl(`http://127.0.0.1:${chromeDebugPort}/json/version`, 30000);

  const state = {
    runId: runId(),
    baseUrl,
    port,
    vitePid: vite.pid,
    chromePid: chrome.pid,
    chromeDebugPort,
    profileDir,
    logPath,
    chromeLogPath,
    artifactsDir: artifactsDir(),
    startedAt: new Date().toISOString(),
  };
  writeState(state);

  await withBrowser(state, async (page) => {
    await page.goto(`${baseUrl}${DEMO_ENTRY}`, { waitUntil: 'networkidle0', timeout: 60000 });
    await page.waitForFunction(
      () => document.body && document.body.innerText.includes('Dashboard'),
      { timeout: 60000 }
    );
  });

  console.log(
    JSON.stringify({
      ok: true,
      reused: false,
      baseUrl,
      state: statePath(),
      artifacts: artifactsDir(),
      vitePid: vite.pid,
      chromePid: chrome.pid,
    })
  );
}

async function cmdDoctor() {
  const state = readState();
  const checks = [];

  const push = (name, ok, detail) => checks.push({ name, ok, detail });

  try {
    process.kill(state.vitePid, 0);
    push('vite_process', true, `pid=${state.vitePid}`);
  } catch (error) {
    push('vite_process', false, error instanceof Error ? error.message : String(error));
  }

  try {
    process.kill(state.chromePid, 0);
    push('chrome_process', true, `pid=${state.chromePid}`);
  } catch (error) {
    push('chrome_process', false, error instanceof Error ? error.message : String(error));
  }

  try {
    const response = await fetch(state.baseUrl);
    push('http_ready', response.ok, `status=${response.status} url=${state.baseUrl}`);
  } catch (error) {
    push('http_ready', false, error instanceof Error ? error.message : String(error));
  }

  try {
    const version = await fetch(`http://127.0.0.1:${state.chromeDebugPort}/json/version`);
    const body = await version.json();
    push(
      'chrome_debug',
      Boolean(body.webSocketDebuggerUrl),
      `browser=${body.Browser || 'unknown'}`
    );
  } catch (error) {
    push('chrome_debug', false, error instanceof Error ? error.message : String(error));
  }

  let pageText = '';
  try {
    pageText = await withBrowser(state, async (page) => {
      const text = await page.evaluate(() => document.body?.innerText || '');
      return text;
    });
    push('demo_shell', /Dashboard|Credential Management|Request Monitor/.test(pageText), 'body text');
  } catch (error) {
    push('demo_shell', false, error instanceof Error ? error.message : String(error));
  }

  const ok = checks.every((item) => item.ok);
  console.log(
    JSON.stringify(
      {
        ok,
        baseUrl: state.baseUrl,
        artifacts: state.artifactsDir,
        checks,
      },
      null,
      2
    )
  );
  if (!ok) process.exitCode = 2;
}

async function cmdGoto(flags, positionals) {
  const state = readState();
  const target = flags.hash || flags.url || positionals[0] || DEMO_ENTRY;
  const url = absoluteUrl(state, target);
  await withBrowser(state, async (page) => {
    const nextUrl = new URL(url);
    const hash = nextUrl.hash || '#/demo';
    const hrefCandidates = [hash, hash.replace(/^#/, '')].filter(Boolean);

    const navigated = await page.evaluate((candidates) => {
      const links = Array.from(document.querySelectorAll('a[href]'));
      for (const candidate of candidates) {
        const match = links.find((link) => link.getAttribute('href') === candidate);
        if (match) {
          match.click();
          return 'click';
        }
      }
      const hashValue = candidates.find((value) => value.startsWith('#')) || candidates[0];
      if (hashValue) {
        const next = hashValue.startsWith('#') ? hashValue : `#${hashValue}`;
        if (window.location.hash === next) {
          window.location.reload();
          return 'reload';
        }
        window.location.hash = next;
        window.location.reload();
        return 'hash-reload';
      }
      return 'none';
    }, hrefCandidates);

    if (navigated === 'reload' || navigated === 'hash-reload') {
      await page.waitForNavigation({ waitUntil: 'networkidle0', timeout: 60000 }).catch(() => undefined);
    } else if (navigated === 'none') {
      await page.goto(url, { waitUntil: 'networkidle0', timeout: 60000 });
    } else {
      await new Promise((resolve) => setTimeout(resolve, 800));
    }
  });
  console.log(JSON.stringify({ ok: true, url }));
}

async function cmdClick(flags) {
  const state = readState();
  await withBrowser(state, async (page) => {
    await clickAx(page, {
      role: flags.role,
      name: flags.name,
      exact: Boolean(flags.exact),
    });
    await new Promise((resolve) => setTimeout(resolve, 400));
  });
  console.log(JSON.stringify({ ok: true, role: flags.role || null, name: flags.name }));
}

async function cmdFill(flags) {
  const state = readState();
  await withBrowser(state, async (page) => {
    await fillAx(
      page,
      {
        role: flags.role || 'textbox',
        name: flags.name,
        exact: Boolean(flags.exact),
      },
      flags.value ?? ''
    );
  });
  console.log(JSON.stringify({ ok: true, name: flags.name, value: flags.value ?? '' }));
}

async function cmdWait(flags) {
  const state = readState();
  const text = flags.text || '';
  const timeout = Number(flags.timeout || 30000);
  await withBrowser(state, async (page) => {
    await page.waitForFunction(
      (needle) => (document.body?.innerText || '').includes(needle),
      { timeout },
      text
    );
  });
  console.log(JSON.stringify({ ok: true, text }));
}

async function cmdSnapshot(flags) {
  const state = readState();
  const out = flags.path
    ? path.resolve(String(flags.path))
    : path.join(artifactsDir(), 'snapshot.aria.txt');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  const lines = await withBrowser(state, async (page) => {
    const snapshot = await page.accessibility.snapshot({ interestingOnly: true });
    return renderAx(snapshot);
  });
  fs.writeFileSync(out, `${lines.join('\n')}\n`);
  console.log(JSON.stringify({ ok: true, path: out, lines: lines.length }));
}

async function cmdScreenshot(flags) {
  const state = readState();
  const out = flags.path
    ? path.resolve(String(flags.path))
    : path.join(artifactsDir(), 'screenshot.png');
  fs.mkdirSync(path.dirname(out), { recursive: true });
  await withBrowser(state, async (page) => {
    await page.screenshot({ path: out, fullPage: Boolean(flags.full) });
  });
  console.log(JSON.stringify({ ok: true, path: out }));
}

async function cmdText() {
  const state = readState();
  const text = await withBrowser(state, async (page) =>
    page.evaluate(() => document.body?.innerText || '')
  );
  process.stdout.write(text.endsWith('\n') ? text : `${text}\n`);
}

async function killPid(pid) {
  if (!pid) return;
  try {
    process.kill(pid, 'SIGTERM');
  } catch {
    return;
  }
  const start = Date.now();
  while (Date.now() - start < 5000) {
    try {
      process.kill(pid, 0);
      await new Promise((resolve) => setTimeout(resolve, 100));
    } catch {
      return;
    }
  }
  try {
    process.kill(pid, 'SIGKILL');
  } catch {
    // already gone
  }
}

async function cmdCleanup(flags) {
  let state = null;
  try {
    state = readState();
  } catch {
    console.log(JSON.stringify({ ok: true, cleaned: false, reason: 'no-state' }));
    return;
  }

  await killPid(state.chromePid);
  await killPid(state.vitePid);

  if (flags['remove-profile'] || flags.all) {
    fs.rmSync(state.profileDir, { recursive: true, force: true });
  }

  // Keep evidence. Only remove the state file when asked.
  if (flags['remove-state'] || flags.all) {
    fs.rmSync(statePath(), { force: true });
  }

  console.log(
    JSON.stringify({
      ok: true,
      cleaned: true,
      artifacts: state.artifactsDir,
      artifactsKept: fs.existsSync(state.artifactsDir),
    })
  );
}

function usage() {
  console.log(`control-cpamp <command> [flags]

Commands:
  launch [--port 4173] [--chrome-port 9222]
  doctor
  goto [--hash #/demo/monitoring] | <hash-or-path>
  click --name <accessible name> [--role link|button|tab] [--exact]
  fill --name <accessible name> --value <text> [--role textbox]
  wait --text <substring> [--timeout 30000]
  snapshot [--path artifacts/foo.aria.txt]
  screenshot [--path artifacts/foo.png] [--full]
  text
  cleanup [--remove-profile] [--remove-state] [--all]

Environment:
  CPAMP_VERIFY_RUN_ID
  CPAMP_VERIFY_ROOT
  CPAMP_VERIFY_PORT
  CPAMP_VERIFY_BASE_URL
  CPAMP_VERIFY_ARTIFACTS
  CPAMP_VERIFY_CHROME
  CPAMP_VERIFY_CHROME_PORT
`);
}

async function main() {
  const { command, flags, positionals } = parseArgs(process.argv.slice(2));
  if (!command || command === 'help' || flags.help) {
    usage();
    return;
  }

  switch (command) {
    case 'launch':
      await cmdLaunch(flags);
      break;
    case 'doctor':
      await cmdDoctor();
      break;
    case 'goto':
      await cmdGoto(flags, positionals);
      break;
    case 'click':
      await cmdClick(flags);
      break;
    case 'fill':
      await cmdFill(flags);
      break;
    case 'wait':
      await cmdWait(flags);
      break;
    case 'snapshot':
      await cmdSnapshot(flags);
      break;
    case 'screenshot':
      await cmdScreenshot(flags);
      break;
    case 'text':
      await cmdText();
      break;
    case 'cleanup':
      await cmdCleanup(flags);
      break;
    default:
      usage();
      throw new Error(`Unknown command: ${command}`);
  }
}

main().catch((error) => {
  console.error(error instanceof Error ? error.stack || error.message : String(error));
  process.exitCode = 1;
});
