// Bridge settings and optional secrets live next to the Vite settings in
// .env.local. Vite reads VITE_* itself; Node doesn't, so load the same file
// before either the launcher or the bridge reads process.env. A real shell
// environment wins over the file (dotenv's default), and the file is gitignored.
import { config } from 'dotenv'
import { fileURLToPath } from 'node:url'

export function loadLocalEnv(path = fileURLToPath(new URL('../.env.local', import.meta.url))) {
  return config({ path })
}

loadLocalEnv()
