import { assertRuntimeImports, HOST_CLIENT_MODULES } from '@xiehaibin18/dsh-plugin-dev/build'
import { execFileSync } from 'node:child_process'
import { copyFile, cp, mkdir, mkdtemp, readFile, rename, rm, writeFile } from 'node:fs/promises'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import sourceManifest from '../package.json' with { type: 'json' }
import './check-toolchain.js'

const root = fileURLToPath(new URL('../', import.meta.url))
const staging = await mkdtemp(join(root, '.build-'))
const output = join(staging, 'dist')
const dist = join(root, 'dist')
const { name, version, type, description, license, engines } = sourceManifest
const manifest = {
  name,
  version,
  type,
  description,
  license,
  exports: {
    '.': './index.js',
    './client': './client.js',
    './locale/*.json': './locale/*.json',
  },
  engines: { node: engines.node, dsh: engines.dsh },
  dsh: {
    bundle: { patch: './cordis.patch.yml' },
    client: {
      platform: 'web',
      immediately: true,
      inject: ['@deepseek-ai/dsh-client-locale', '@deepseek-ai/dsh-client-ui-settings'],
    },
  },
}

async function bundle(target: 'server' | 'client') {
  const client = target === 'client'
  const bundled = join(staging, `${target}.js`)
  const metafile = join(staging, `${target}.json`)
  execFileSync(process.execPath, [
    '--no-env-file',
    'build',
    client ? 'src/client/index.tsx' : 'src/server/index.ts',
    '--packages=bundle',
    '--reject-unresolved',
    '--sourcemap=none',
    `--target=${client ? 'browser' : 'node'}`,
    `--format=${client ? 'cjs' : 'esm'}`,
    `--outfile=${bundled}`,
    `--metafile=${metafile}`,
    ...(client ? ['--production', ...HOST_CLIENT_MODULES.map((module) => `--external=${module}`)] : []),
  ], { cwd: root, stdio: 'inherit' })

  const metadata: { inputs: Record<string, unknown>; outputs: Record<string, unknown> } =
    JSON.parse(await readFile(metafile, 'utf8'))
  if (Object.keys(metadata.outputs).length !== 1) throw new Error(`Expected one ${target} bundle`)

  for (const input of Object.keys(metadata.inputs)) {
    if (/(?:^|\/)preview\/|dsh-plugin-dev\//.test(input)) {
      throw new Error(`Development source entered the ${target} bundle: ${input}`)
    }
    if (client && /node_modules\/(?:react|react-dom)\//.test(input)) {
      throw new Error(`Client must use host React: ${input}`)
    }
  }

  const source = await readFile(bundled, 'utf8')
  assertRuntimeImports(source, target)
  return source
}

try {
  await mkdir(output)
  const server = await bundle('server')
  const client = await bundle('client')
  const classicClient = `window.__ModuleLoader__.load({
  id: ${JSON.stringify(name)},
  factory(require) {
    const module = { exports: {} };
    const exports = module.exports;
${client}
    return module.exports;
  },
});
`
  await writeFile(join(output, 'index.js'), server)
  await writeFile(join(output, 'client.js'), classicClient)
  await writeFile(join(output, 'package.json'), `${JSON.stringify(manifest, null, 2)}\n`)
  await writeFile(join(output, 'cordis.patch.yml'), `- insert:\n    - id: ${JSON.stringify(name)}\n      name: ${JSON.stringify(name)}\n`)
  await cp(join(root, 'assets/locale'), join(output, 'locale'), { recursive: true })
  for (const file of ['README.md', 'LICENSE', 'LICENSES.client']) {
    await copyFile(join(root, file), join(output, file))
  }

  await rm(dist, { force: true, recursive: true })
  await rename(output, dist)
  console.info('Built DSH plugin in dist/')
} finally {
  await rm(staging, { force: true, recursive: true })
}
