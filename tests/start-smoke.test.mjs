import assert from 'node:assert/strict'
import { spawn } from 'node:child_process'
import { once } from 'node:events'
import { createServer } from 'node:net'
import { test } from 'node:test'
import { fileURLToPath } from 'node:url'

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

test('one-command start serves the face and the local bridge together', { timeout: 30000 }, async (t) => {
  const webPort = await unusedPort()
  const bridgePort = await unusedPort()
  const child = spawn(process.execPath, ['scripts/start.mjs'], {
    cwd: root,
    env: {
      ...process.env,
      PORT: String(webPort),
      JARVIS_BRIDGE_PORT: String(bridgePort),
      VITE_BRIDGE_URL: `ws://localhost:${bridgePort}`,
      VITE_BACKEND: 'bridge',
      JARVIS_ALLOW_WRITES: '0',
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
    const timer = setTimeout(() => reject(new Error(`JARVIS startup timed out:\n${output}`)), 20000)
    child.once('error', (err) => { clearTimeout(timer); reject(err) })
    child.once('exit', (code) => {
      clearTimeout(timer)
      reject(new Error(`JARVIS exited (${code}):\n${output}`))
    })
    const read = (chunk) => {
      output += chunk.toString()
      if (output.includes('bridge listening') && output.includes('writes disabled') && output.includes('Local:')) {
        clearTimeout(timer)
        resolve()
      }
    }
    child.stdout.on('data', read)
  })

  assert.match(output, /writes disabled/)
  const face = await fetch(`http://localhost:${webPort}/`)
  assert.equal(face.status, 200)
  assert.match(await face.text(), /<title>J\.A\.R\.V\.I\.S\.<\/title>/)
  const app = await fetch(`http://localhost:${webPort}/src/App.tsx`)
  assert.equal(app.status, 200)
  const health = await fetch(`http://127.0.0.1:${bridgePort}/health`, {
    headers: { Origin: `http://localhost:${webPort}` },
  })
  assert.equal(health.status, 200)
  assert.equal((await health.json()).ok, true)
})
