import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { fileURLToPath, URL } from 'node:url'
import fs from 'node:fs'

// 站点域名（部署时通过环境变量传入真实域名，如 SITE_URL=https://blog.example.com）
const SITE_URL = process.env.SITE_URL || 'http://localhost:5173'
// SSG 构建时直连后端 API 获取数据
const API_BASE = process.env.SSG_API_BASE || 'http://localhost:8080/api/v1'

// 构建时收集所有将被预渲染的路由
let allRoutes = []

// 从后端获取动态路由（文章/分类/标签）
async function fetchDynamicRoutes() {
  const dynamic = []
  try {
    const [articlesRes, categoriesRes, tagsRes] = await Promise.all([
      fetch(`${API_BASE}/articles?page=1&page_size=100`),
      fetch(`${API_BASE}/categories`),
      fetch(`${API_BASE}/tags`),
    ])
    const articles = await articlesRes.json()
    const categories = await categoriesRes.json()
    const tags = await tagsRes.json()
    ;(articles?.data?.list || []).forEach((a) => dynamic.push(`/article/${a.id}`))
    ;(categories?.data || []).forEach((c) => dynamic.push(`/category/${c.id}`))
    ;(tags?.data || []).forEach((t) => dynamic.push(`/tag/${t.id}`))
    console.log(`[ssg] 获取动态路由 ${dynamic.length} 条`)
  } catch (e) {
    console.warn('[ssg] 无法获取动态路由（请确认后端已启动），仅预渲染静态路由:', e.message)
  }
  return dynamic
}

// 生成 sitemap.xml（在 vite-ssg 全部页面渲染完成后调用）
function generateSitemap() {
  if (!allRoutes.length) return
  const urls = allRoutes
    .map((p) => {
      const lastmod = new Date().toISOString().split('T')[0]
      return `  <url>\n    <loc>${SITE_URL}${p}</loc>\n    <lastmod>${lastmod}</lastmod>\n  </url>`
    })
    .join('\n')
  const xml = `<?xml version="1.0" encoding="UTF-8"?>\n<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n${urls}\n</urlset>\n`
  fs.mkdirSync('dist', { recursive: true })
  fs.writeFileSync('dist/sitemap.xml', xml, 'utf-8')
  console.log(`[sitemap] 生成 sitemap.xml，共 ${allRoutes.length} 条 URL`)
}

export default defineConfig({
  plugins: [vue()],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    // 开发环境代理到后端
    proxy: {
      '/api': {
        target: 'http://localhost:8080',
        changeOrigin: true,
      },
    },
  },
  ssgOptions: {
    script: 'async',
    // 预渲染路由列表：静态路由 + 动态路由，排除后台页与通配符路由
    async includedRoutes(paths) {
      const dynamic = await fetchDynamicRoutes()
      // 规范化路径（确保前导斜杠）并去重
      allRoutes = [...new Set(
        [...paths, ...dynamic]
          .map((p) => (p.startsWith('/') ? p : `/${p}`))
          .filter((p) => !p.startsWith('/admin') && !p.includes(':'))
      )]
      return allRoutes
    },
    // 全部页面渲染完成后生成 sitemap.xml
    onFinished: generateSitemap,
  },
})
