import { defineConfig, loadEnv } from 'vite'
import path from 'path'
import { fileURLToPath } from 'url'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

function figmaAssetResolver() {
  return {
    name: 'figma-asset-resolver',
    resolveId(id: string) {
      if (id.startsWith('figma:asset/')) {
        const filename = id.replace('figma:asset/', '')
        return path.resolve(__dirname, 'src/assets', filename)
      }
    },
  }
}

/** Load FRONTEND_PATH / BACKEND_PATH from repo root or Frontend/.env */
function resolveAppPaths(mode: string) {
  const repoRoot = path.resolve(__dirname, '..')
  const rootEnv = loadEnv(mode, repoRoot, '')
  const localEnv = loadEnv(mode, __dirname, '')

  const pick = (keys: string[]) => {
    for (const key of keys) {
      if (localEnv[key]) return localEnv[key]
      if (rootEnv[key]) return rootEnv[key]
    }
    return undefined
  }

  const backendPath =
    pick(['VITE_BACKEND_PATH', 'BACKEND_PATH', 'Backend_path', 'VITE_API_URL']) ??
    'http://localhost:3000'
  const frontendPath =
    pick(['VITE_FRONTEND_PATH', 'FRONTEND_PATH', 'frontend_path']) ??
    'http://localhost:5173'

  return { backendPath, frontendPath }
}

export default defineConfig(({ mode }) => {
  const { backendPath, frontendPath } = resolveAppPaths(mode)

  // Ensure app code can read these via import.meta.env.VITE_*
  process.env.VITE_BACKEND_PATH = backendPath
  process.env.VITE_FRONTEND_PATH = frontendPath

  return {
    plugins: [
      figmaAssetResolver(),
      react(),
      tailwindcss(),
    ],
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    assetsInclude: ['**/*.svg', '**/*.csv'],
  }
})
