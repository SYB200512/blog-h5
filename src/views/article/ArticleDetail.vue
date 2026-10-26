<template>
  <div>
    <div v-if="article" class="article-detail">
      <!-- 文章正文区 -->
      <div class="article-main">
      <!-- 文章头部 -->
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span><el-icon><Calendar /></el-icon> {{ formatDate(article.created_at) }}</span>
          <router-link v-if="article.category" :to="`/category/${article.category.id}`" class="meta-link">
            <el-icon><Folder /></el-icon> {{ article.category.name }}
          </router-link>
          <span><el-icon><View /></el-icon> {{ article.views }} 阅读</span>
          <span v-if="article.tags?.length">
            <el-icon><PriceTag /></el-icon>
            <router-link v-for="tag in article.tags" :key="tag.id" :to="`/tag/${tag.id}`" class="meta-link">
              {{ tag.name }}
            </router-link>
          </span>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="article-content">
        <div class="markdown-body" v-html="htmlContent"></div>
      </div>

      <!-- 评论区域 -->
      <div class="comments">
        <h3 class="comments-title">
          <el-icon><ChatDotRound /></el-icon>
          评论（{{ comments.length }}）
        </h3>
        <!-- 发表评论 -->
        <div class="comment-form">
          <el-input v-model="commentContent" type="textarea" :rows="3" placeholder="说点什么吧..." />
          <div class="comment-form-footer">
            <el-button type="primary" :loading="submitting" @click="submitComment">发表评论</el-button>
          </div>
        </div>
        <!-- 评论列表 -->
        <ul class="comment-list">
          <li v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-body">
              <span class="comment-author">{{ comment.nickname || comment.user?.nickname || comment.user?.username || '匿名' }}</span>
              <span class="comment-time">{{ formatDateTime(comment.created_at) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </li>
        </ul>
        <el-empty v-if="!comments.length" description="暂无评论，快来抢沙发" :image-size="80" />
      </div>
      </div>

      <!-- 右侧目录 -->
      <aside v-if="visibleToc.length" class="article-toc" aria-label="文章目录">
        <div class="article-toc-title">目录</div>
        <ul class="article-toc-list">
          <li
            v-for="item in visibleToc"
            :key="item.id"
            class="article-toc-item"
            :class="[`toc-level-${item.depth}`]"
          >
            <a
              :href="`#${item.id}`"
              :class="{ active: activeId === item.id }"
              @click.prevent="toggleItem(item)"
            >
              <span v-if="item.isSection" class="toc-caret">
                {{ expandedSectionId === item.id ? '▾' : '▸' }}
              </span>
              <span class="toc-text">{{ item.text }}</span>
            </a>
          </li>
        </ul>
      </aside>
    </div>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount, nextTick } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { ElMessage } from 'element-plus'
import { getArticle } from '@/api/article'
import { getComments, createComment } from '@/api/comment'
import { renderMarkdown } from '@/utils/markdown'
import { formatDate, formatDateTime } from '@/utils/format'

const route = useRoute()
const article = ref(null)
const comments = ref([])
const commentContent = ref('')
const submitting = ref(false)

// 动态 head 信息（同步注册，数据加载完成后通过 ref 响应式更新）
const headTitle = ref('文章详情 - 我的博客')
const headDescription = ref('')
const headKeywords = ref('')
const headOgTitle = ref('我的博客')
const headOgImage = ref('')

useHead({
  title: () => headTitle.value,
  meta: () => [
    { name: 'description', content: headDescription.value },
    { name: 'keywords', content: headKeywords.value },
    { property: 'og:title', content: headOgTitle.value },
    { property: 'og:description', content: headDescription.value },
    { property: 'og:type', content: 'article' },
    ...(headOgImage.value ? [{ property: 'og:image', content: headOgImage.value }] : []),
  ],
})

// 预取数据（SSG 构建时执行，预渲染 HTML 包含文章正文）
try {
  article.value = await getArticle(route.params.id)
  if (article.value) {
    headTitle.value = `${article.value.title} - 我的博客`
    headDescription.value = article.value.summary || article.value.title || ''
    headKeywords.value = article.value.tags?.map((t) => t.name).join(',') || '博客'
    headOgTitle.value = article.value.title
    headOgImage.value = article.value.cover || ''
  }
} catch (e) {
  /* 文章不存在或后端不可用，忽略 */
}
try {
  comments.value = await getComments(route.params.id)
} catch (e) {
  /* ignore */
}

const rendered = computed(() => renderMarkdown(article.value?.content || ''))
// 渲染后的 HTML
const htmlContent = computed(() => rendered.value.html)

// 目录：构建多级树。首个出现的标题等级视作“一级标题”（根节点）
const tocTree = computed(() => {
  const roots = []
  const stack = []
  for (const h of rendered.value.headings) {
    const node = { ...h, children: [] }
    while (stack.length && stack[stack.length - 1].level >= h.level) stack.pop()
    if (stack.length) stack[stack.length - 1].children.push(node)
    else roots.push(node)
    stack.push(node)
  }
  return roots
})

// 打平的目录条目：isSection 表示“二级标题”（始终显示），并携带所属二级标题 id 与缩进深度
const tocItems = computed(() => {
  const items = []
  const walk = (node, sectionId, depth) => {
    const isSection = node.level <= 2
    const sid = isSection ? node.id : sectionId
    items.push({ ...node, sectionId: sid, isSection, depth })
    node.children.forEach((c) => walk(c, sid, depth + 1))
  }
  tocTree.value.forEach((n) => walk(n, null, 0))
  return items
})

// 只展示二级标题；滚动进入某个二级标题区间时，才展开其下的三级及以下标题
const visibleToc = computed(() =>
  tocItems.value.filter(
    (it) => it.isSection || expandedSectionId.value === it.sectionId
  )
)

const expandedSectionId = ref('')
// 滚动高亮当前标题
const activeId = ref('')
let tocEls = []

const scrollToHeading = (id) => {
  const el = document.getElementById(id)
  if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
}

// 点击目录项：滚动到目标；二级标题可手动折叠 / 展开
const toggleItem = (item) => {
  scrollToHeading(item.id)
  if (item.isSection) {
    expandedSectionId.value = expandedSectionId.value === item.id ? '' : item.id
  }
}

const updateActive = () => {
  const triggerTop = 92
  let current = tocEls[0]?.id || ''
  for (const el of tocEls) {
    if (el.getBoundingClientRect().top <= triggerTop) current = el.id
    else break
  }
  activeId.value = current
  // 滚动到某个二级标题区间内时，自动展开该节点下的三级及以下标题
  const item = tocItems.value.find((it) => it.id === current)
  if (item && item.sectionId) expandedSectionId.value = item.sectionId
}

const onScroll = () => updateActive()

onMounted(async () => {
  await nextTick()
  tocEls = Array.from(
    document.querySelectorAll('.markdown-body h1,h2,h3,h4,h5,h6[id]')
  )
  updateActive()
  window.addEventListener('scroll', onScroll, { passive: true })
})

onBeforeUnmount(() => {
  window.removeEventListener('scroll', onScroll)
})

// 发表评论（客户端交互）
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  submitting.value = true
  try {
    await createComment(route.params.id, { content: commentContent.value.trim() })
    ElMessage.success('评论成功')
    commentContent.value = ''
    comments.value = await getComments(route.params.id)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.article-detail {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 正文区占满剩余宽度 */
.article-main {
  flex: 1;
  min-width: 0;
}

/* 右侧目录：位于内容区内的悬浮栏，随页面滚动吸顶 */
.article-toc {
  position: sticky;
  top: 92px;
  flex-shrink: 0;
  width: 240px;
  max-height: calc(100vh - 120px);
  overflow-y: auto;
  background: #fff;
  border-radius: 10px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  padding: 16px 14px;
}

.article-toc-title {
  font-size: 15px;
  font-weight: 700;
  color: #333;
  padding-bottom: 10px;
  margin-bottom: 8px;
  border-bottom: 1px solid #f0f0f0;
}

.article-toc-list {
  list-style: none;
  font-size: 13px;
  line-height: 1.5;
}

.article-toc-item a {
  display: flex;
  align-items: flex-start;
  gap: 6px;
  padding: 5px 8px;
  border-radius: 6px;
  color: #666;
  border-left: 2px solid transparent;
  transition: color 0.2s, background-color 0.2s;
}

.article-toc-item .toc-text {
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
}

.toc-caret {
  flex-shrink: 0;
  font-size: 10px;
  line-height: 1.7;
  color: #999;
  transition: color 0.2s;
}

.article-toc-item a:hover {
  color: #409eff;
  background: #f5f7fa;
}

.article-toc-item a.active {
  color: #409eff;
  font-weight: 600;
  border-left-color: #409eff;
  background: #ecf5ff;
}

/* 标题层级缩进（depth 从 0 开始） */
.toc-level-0 { padding-left: 0; }
.toc-level-1 { padding-left: 16px; }
.toc-level-2 { padding-left: 32px; }
.toc-level-3 { padding-left: 48px; }
.toc-level-4 { padding-left: 64px; }
.toc-level-5 { padding-left: 80px; }

/* 窄屏（< 1024px）：目录改为垂直堆叠，并隐藏，避免挤占正文 */
@media (max-width: 1023px) {
  .article-detail {
    flex-direction: column;
  }
  .article-toc {
    display: none;
  }
}

.article-header {
  background: #fff;
  border-radius: 10px;
  padding: 32px 28px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.article-title {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 14px;
  color: #999;
  font-size: 13px;
  align-items: center;
}

.article-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-link {
  color: #409eff;
  margin-left: 4px;
}

.article-content {
  background: #fff;
  border-radius: 10px;
  padding: 32px 28px;
  margin-top: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.comments {
  background: #fff;
  border-radius: 10px;
  padding: 24px 28px;
  margin-top: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.comments-title {
  font-size: 17px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.comment-form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comment-list {
  list-style: none;
  margin-top: 20px;
}

.comment-item {
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-body {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-author {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.comment-time {
  color: #bbb;
  font-size: 12px;
}

.comment-content {
  margin-top: 8px;
  color: #444;
  font-size: 14px;
}
</style>
