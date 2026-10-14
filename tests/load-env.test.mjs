import assert from 'node:assert/strict'
import { mkdtemp, rm, writeFile } from 'node:fs/promises'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { test } from 'node:test'
import { loadLocalEnv } from '../scripts/load-env.mjs'

test('local config loads bridge settings without overriding shell variables', async () => {
  const dir = await mkdtemp(join(tmpdir(), 'jarvis-config-'))
  const name = 'JARVIS_TEST_LOCAL_VALUE'
  const existing = 'JARVIS_TEST_SHELL_VALUE'
  const original = process.env[existing]
  try {
    const path = join(dir, '.env.local')
    await writeFile(path, `${name}="from file"\n${existing}=from-file\n`)
    delete process.env[name]
    process.env[existing] = 'from-shell'
    loadLocalEnv(path)
    assert.equal(process.env[name], 'from file')
    assert.equal(process.env[existing], 'from-shell')
  } finally {
    delete process.env[name]
    if (original === undefined) delete process.env[existing]
    else process.env[existing] = original
    await rm(dir, { recursive: true, force: true })
  }
})
