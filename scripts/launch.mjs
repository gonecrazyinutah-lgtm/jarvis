#!/usr/bin/env node
// Shared first-run entry point for the Windows/macOS/Linux desktop launchers.
// Dependencies are installed on THIS machine (node_modules from another OS
// cannot be copied); credentials are never bundled or copied by the launcher.
import { spawn, spawnSync } from 'node:child_process'
import { existsSync } from 'node:fs'
import { fileURLToPath } from 'node:url'

const root = fileURLToPath(new URL('../', import.meta.url))
const [major, minor] = process.versions.node.split('.').map(Number)
const supported = (major === 20 && minor >= 19) ||
  (major === 22 && minor >= 12) || major > 22

if (!supported) {
  console.error(`JARVIS needs Node.js 22.12+ (or 20.19+); found ${process.versions.node}.`)
  console.error('Install the current Node.js LTS from https://nodejs.org and try again.')
  process.exit(1)
}

// The agent SDK uses the login belonging to the Claude CLI on this computer.
// Without the CLI the face can load, but no conversation could ever complete.
const win = process.platform === 'win32'
const claude = spawnSync(win ? 'claude.cmd' : 'claude', ['--version'], {
  cwd: root,
  encoding: 'utf8',
  timeout: 10000,
  shell: win,
  windowsHide: true,
})
if (claude.status !== 0) {
  console.error('Claude Code is not installed or is not on your PATH.')
  console.error('Install it: npm install -g @anthropic-ai/claude-code')
  console.error('Then run `claude` once on this computer and complete login before starting JARVIS.')
  process.exit(1)
}

process.chdir(root)
const ready = [
  'node_modules/vite/bin/vite.js',
  'node_modules/dotenv/package.json',
  'node_modules/@anthropic-ai/claude-agent-sdk/package.json',
].every((path) => existsSync(new URL(`../${path}`, import.meta.url)))
if (!ready) {
  console.log('First run: installing JARVIS dependencies on this computer. This can take a few minutes.\n')
  const npm = spawnSync(win ? 'npm.cmd' : 'npm', ['ci', '--no-audit', '--no-fund'], {
    cwd: root,
    stdio: 'inherit',
    shell: win,
  })
  if (npm.error || npm.status !== 0) {
    console.error(`\nDependency install failed${npm.error ? `: ${npm.error.message}` : ''}.`)
    console.error('Check your internet connection, then run `npm ci` in this folder and try again.')
    process.exit(1)
  }
}

const preflight = spawnSync(process.execPath, ['scripts/setup.mjs'], { cwd: root, stdio: 'inherit' })
if (preflight.error || preflight.status !== 0) {
  console.error('Preflight failed. Try `npm ci` in this folder and then `npm run setup`.')
  process.exit(1)
}
console.log('Starting JARVIS. Keep this terminal open while using it.\n')
const child = spawn(process.execPath, ['scripts/start.mjs'], { cwd: root, stdio: 'inherit' })
child.on('error', (err) => {
  console.error(`Could not start JARVIS: ${err.message}`)
  process.exitCode = 1
})
child.on('close', (code) => { process.exitCode = code ?? 1 })
for (const signal of ['SIGINT', 'SIGTERM']) {
  process.on(signal, () => { if (child.exitCode === null) child.kill('SIGTERM') })
}
