import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    // Honour PORT so a second instance can run alongside the first. The bridge
    // trusts localhost:5173-5199 by default; scripts/start.mjs also adds an
    // explicit PORT to its origin allowlist.
    port: Number(process.env.PORT) || 5173,
    // An explicitly chosen port is also passed to the bridge's origin gate.
    // If it is busy, fail loudly instead of silently moving to a refused port.
    strictPort: Boolean(process.env.PORT),
  },
  optimizeDeps: {
    // kokoro-js pulls in `phonemizer`, which carries espeak-ng as inline WASM.
    // Vite's dependency pre-bundler rewrites that initialisation and the
    // language table ends up empty — the symptom is
    // `Invalid language identifier: "en". Should be one of: .` at generate()
    // time, long after the model has loaded successfully. Serving these
    // untouched fixes it.
    exclude: ['kokoro-js', 'phonemizer', '@huggingface/transformers'],
  },
})
