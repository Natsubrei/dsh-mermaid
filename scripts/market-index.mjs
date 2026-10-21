/**
 * Write `index.json`, the format 1 plugin market index that lists this package.
 *
 * DSH's Discover tab reads indexes from URLs the user configures; this script
 * keeps the one this repository publishes in step with `package.json` and with
 * the commit whose files a reader would install. The index pins that commit, so
 * run it after the commit that carries the built client artifacts — `npm run
 * market` on a clean tree, then commit `index.json` on its own.
 *
 * The commit and timestamp can be supplied for a release where the index is
 * generated before the commit exists: `MARKET_COMMIT=<sha> MARKET_TIMESTAMP=<unix>`.
 */
import { execFileSync } from 'node:child_process'
import { readFile, writeFile } from 'node:fs/promises'

const REPOSITORY = 'https://github.com/Natsubrei/dsh-mermaid'
const TITLE = { en: 'Mermaid diagrams', zh: 'Mermaid 图表' }
const DESCRIPTION = {
  en: 'A right-Sidebar page that renders a conversation\u2019s Mermaid diagrams, with zoom and pan in every card.',
  zh: '在右侧栏渲染当前对话中的 Mermaid 图表，每张图都能在卡片内缩放与拖动。',
}

const root = new URL('..', import.meta.url)
const pkg = JSON.parse(await readFile(new URL('package.json', root), 'utf8'))

const commit = process.env.MARKET_COMMIT
  ?? execFileSync('git', ['rev-parse', 'HEAD'], { cwd: root, encoding: 'utf8' }).trim()
const publishTimestamp = Number(process.env.MARKET_TIMESTAMP ?? Math.floor(Date.now() / 1000))

const index = {
  format: 1,
  title: { en: 'Natsubrei\u2019s DSH plugins', zh: 'Natsubrei 的 DSH 插件' },
  description: { en: 'Plugin market published from github.com/Natsubrei.', zh: '由 github.com/Natsubrei 发布的插件市场。' },
  plugins: [
    {
      name: pkg.name,
      title: TITLE,
      description: DESCRIPTION,
      icon: 'icon.svg',
      author: pkg.author,
      homepage: pkg.homepage,
      repository: { url: REPOSITORY },
      metadata: { keywords: pkg.keywords },
      'dist-tags': { latest: pkg.version },
      versions: [
        {
          version: pkg.version,
          publishTimestamp,
          source: { type: 'git', url: REPOSITORY, commit },
          engines: { dsh: pkg.engines.dsh },
        },
      ],
    },
  ],
}

await writeFile(new URL('index.json', root), `${JSON.stringify(index, null, 2)}\n`)
console.log(`index.json: ${pkg.name}@${pkg.version} from ${commit.slice(0, 7)}`)
