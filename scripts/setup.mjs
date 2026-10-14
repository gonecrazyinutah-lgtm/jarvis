#!/usr/bin/env node
// Advisory checks for a fresh computer. Installs nothing, changes nothing,
// never prints secrets, and always exits 0 so the instructions remain visible.
// Run after npm ci (the desktop launchers do that automatically).

import './load-env.mjs'
import { spawnSync } from 'node:child_process'
import { existsSync, readFileSync } from 'node:fs'
import { homedir } from 'node:os'
import { join } from 'node:path'

const tick = '  ok  '
const warn = ' note '
const info = '  ·   '
const line = (tag, msg) => console.log(`[${tag}] ${msg}`)

const [major, minor] = process.versions.node.split('.').map(Number)
const nodeSupported =
  (major === 20 && minor >= 19) ||
  (major === 22 && minor >= 12) ||
  major > 22

// Windows native installers expose claude.exe; npm exposes claude.cmd. Let
// cmd.exe resolve either via PATHEXT. Arguments here are fixed, not user text.
function command(name, args) {
  return spawnSync(name, args, {
    encoding: 'utf8',
    timeout: 10000,
    shell: process.platform === 'win32',
    windowsHide: true,
  })
}

console.log('\nJARVIS preflight — checking your computer (nothing is changed)')
console.log('------------------------------------------------------------')

if (nodeSupported) {
  line(tick, `Node.js ${process.versions.node} is supported.`)
} else {
  line(warn, `Node.js ${process.versions.node} is unsupported. Install Node 22.12+ (or 20.19+).`)
}

if (existsSync(new URL('../node_modules/vite/bin/vite.js', import.meta.url))) {
  line(tick, 'Project dependencies installed.')
} else {
  line(warn, 'Project dependencies missing — run npm ci in this folder (or use a Start-Jarvis launcher).')
}

const claude = command('claude', ['--version'])
if (claude.status === 0) {
  line(tick, `Claude Code found: ${claude.stdout.trim().split('\n')[0] || 'installed'}`)
  line(info, 'Make sure you have run `claude` on this computer and signed in; this check only verifies installation.')
} else {
  line(warn, 'Claude Code is not on your PATH. JARVIS needs it to answer.')
  if (process.platform === 'win32') line(info, 'In PowerShell: winget install Anthropic.ClaudeCode')
  else line(info, 'Install: https://code.claude.com/docs/en/setup')
  line(info, 'Open a new terminal, run `claude`, and sign in on this computer (subscription required).')
}

const browserNames = process.platform === 'win32'
  ? ['chrome', 'msedge']
  : ['google-chrome', 'google-chrome-stable', 'microsoft-edge', 'microsoft-edge-stable']
const browserPaths = process.platform === 'darwin'
  ? [
      '/Applications/Google Chrome.app',
      '/Applications/Microsoft Edge.app',
      join(homedir(), 'Applications/Google Chrome.app'),
      join(homedir(), 'Applications/Microsoft Edge.app'),
    ]
  : process.platform === 'win32'
    ? [process.env.PROGRAMFILES, process.env['PROGRAMFILES(X86)'], process.env.LOCALAPPDATA]
        .filter(Boolean)
        .flatMap((root) => [
          join(root, 'Google/Chrome/Application/chrome.exe'),
          join(root, 'Microsoft/Edge/Application/msedge.exe'),
        ])
    : []
const hasBrowser = browserPaths.some((path) => existsSync(path)) ||
  browserNames.some((name) => command(name, ['--version']).status === 0)
if (hasBrowser) {
  line(tick, 'Chrome or Edge found. Open JARVIS in a normal browser window, not an editor preview.')
} else {
  line(warn, 'Chrome/Edge not detected. Install one if needed; microphone and WebGL require a real browser window.')
}

const claudeJsonPath = join(homedir(), '.claude.json')
let servers = {}
try {
  const cfg = JSON.parse(readFileSync(claudeJsonPath, 'utf8'))
  servers = cfg?.mcpServers && typeof cfg.mcpServers === 'object' ? cfg.mcpServers : {}
  const count = Object.keys(servers).length
  line(info, count
    ? `${count} optional MCP server${count === 1 ? '' : 's'} configured in ~/.claude.json.`
    : 'No MCP servers in ~/.claude.json yet; normal conversation still works.')
} catch {
  line(info, 'No ~/.claude.json found; optional MCP tools may not be configured. This does not check login.')
}

if (process.env.ELEVENLABS_API_KEY?.trim() || servers.elevenlabs?.env?.ELEVENLABS_API_KEY) {
  line(tick, 'Optional ElevenLabs voice configured (key hidden).')
} else {
  line(info, 'No ElevenLabs key; browser speech is the default, which is fine.')
}

console.log('\nOn this computer:')
console.log('  1. Run `claude` once to sign in (if you have not already).')
console.log('  2. Run `npm start` in this folder, or use a Start-Jarvis launcher.')
console.log('  3. Open http://localhost:5173 in Chrome/Edge, click INITIALISE, and allow the microphone.')
console.log('  4. Say "Hey Jarvis" or hold Space to talk. Ctrl-C in the terminal stops it.')
console.log('  JARVIS starts without permission to change files or send messages.\n')
