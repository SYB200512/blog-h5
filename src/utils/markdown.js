import MarkdownIt from 'markdown-it'
import hljs from 'highlight.js'
import 'highlight.js/styles/github.css'

// 配置 markdown-it，开启代码高亮
// 生成标题锚点 id（保留中文）
function slugify(text) {
  let slug = text
    .trim()
    .toLowerCase()
    .replace(/<[^>]*>/g, '')
    .replace(/[^\w\u4e00-\u9fa5]+/g, '-')
    .replace(/^-+|-+$/g, '')
  return slug || 'section'
}

const md = new MarkdownIt({
  html: true,
  linkify: true,
  breaks: true,
  highlight(code, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        return `<pre><code class="hljs language-${lang}">${hljs.highlight(code, { language: lang }).value}</code></pre>`
      } catch (e) {
        /* ignore */
      }
    }
    return `<pre><code class="hljs">${md.utils.escapeHtml(code)}</code></pre>`
  },
})

// 为 h1-h6 标题注入锚点 id，用于右侧目录定位
const defaultHeadingOpen =
  md.renderer.rules.heading_open ||
  ((tokens, idx, options, env, self) => self.renderToken(tokens, idx, options))
const slugMap = {}
md.renderer.rules.heading_open = function (tokens, idx, options, env, self) {
  const token = tokens[idx]
  const inline = tokens[idx + 1]
  const text = inline ? inline.content : ''
  const base = slugify(text)
  // 重名标题追加序号，保证 id 唯一
  slugMap[base] = slugMap[base] ? slugMap[base] + 1 : 1
  const id = slugMap[base] > 1 ? `${base}-${slugMap[base]}` : base
  token.attrSet('id', id)
  // 记录到 env，供提取目录使用
  if (!env.headings) env.headings = []
  env.headings.push({ level: Number(token.tag[1]), id, text })
  return defaultHeadingOpen(tokens, idx, options, env, self)
}

// 渲染 markdown 为 HTML
export function renderMarkdown(content) {
  const env = {}
  const html = md.render(content || '', env)
  return { html, headings: env.headings || [] }
}

// 兼容直接取字符串的调用
export function renderMarkdownHtml(content) {
  return renderMarkdown(content).html
}
