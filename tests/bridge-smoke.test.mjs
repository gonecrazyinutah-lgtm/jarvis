import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { createServer } from 'node:net'
import { once } from 'node:events'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'
import WebSocket from 'ws'

const root = fileURLToPath(new URL('../', import.meta.url))

async function unusedPort() {
  const server = createServer()
  server.listen(0, '127.0.0.1')
  await once(server, 'listening')
  const port = server.address().port
  server.close()
  await once(server, 'close')
  return port
}

async function refusedSocket(url, origin) {
  return new Promise((resolve, reject) => {
    const socket = new WebSocket(url, { origin })
    socket.once('open', () => {
      socket.close()
      reject(new Error(`untrusted origin ${origin} opened the agent socket`))
    })
    socket.once('unexpected-response', (_request, response) => {
      response.resume()
      resolve(response.statusCode)
    })
    socket.once('error', reject)
  })
}

test('local bridge starts read-only, serves health and refuses untrusted origins', { timeout: 20000 }, async (t) => {
  const port = await unusedPort()
  const child = spawn(process.execPath, ['bridge/server.mjs'], {
    cwd: root,
    env: {
      ...process.env,
      JARVIS_BRIDGE_PORT: String(port),
      JARVIS_ALLOW_WRITES: '0',
      JARVIS_ALLOWED_ORIGINS: '',
      JARVIS_ALLOW_NO_ORIGIN: '0',
    },
    stdio: ['ignore', 'pipe', 'pipe'],
  })
  let output = ''
  child.stderr.on('data', (chunk) => { output += chunk.toString() })
  t.after(async () => {
    if (child.exitCode === null && child.signalCode === null) {
      child.kill('SIGTERM')
      await once(child, 'exit')
    }
  })

  await new Promise((resolve, reject) => {
    const timeout = setTimeout(() => reject(new Error(`Bridge startup timed out:\n${output}`)), 12000)
    child.once('error', (err) => { clearTimeout(timeout); reject(err) })
    child.once('exit', (code) => {
      clearTimeout(timeout)
      reject(new Error(`Bridge exited (${code}):\n${output}`))
    })
    child.stdout.on('data', (chunk) => {
      output += chunk.toString()
      if (output.includes('[jarvis] accepting local dev origins')) {
        clearTimeout(timeout)
        resolve()
      }
    })
  })

  assert.match(output, /writes disabled/)
  const url = `http://localhost:${port}/health`
  const allowed = await fetch(url, { headers: { Origin: 'http://localhost:5173' } })
  assert.equal(allowed.status, 200)
  assert.equal(allowed.headers.get('access-control-allow-origin'), 'http://localhost:5173')
  assert.deepEqual(Object.keys(await allowed.json()).sort(), ['ok', 'stt', 'tts'])

  const blocked = await fetch(url, { headers: { Origin: 'https://untrusted.example' } })
  assert.equal(blocked.status, 403)
  assert.equal(await refusedSocket(`ws://localhost:${port}`, 'https://untrusted.example'), 403)
})
