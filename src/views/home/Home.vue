<template>
  <div class="home-layout">
    <!-- 文章列表（左列，收窄宽度） -->
    <div class="article-list">
      <template v-if="articles.length">
        <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
        <div class="pagination">
          <el-pagination background layout="prev, pager, next" :total="total"
            :page-size="pageSize" :current-page="page" @current-change="handlePageChange" />
        </div>
      </template>
      <el-empty v-else description="暂无文章" />
    </div>

    <!-- 右侧栏：最新文章 / 分类 / 标签 / 归档 -->
    <aside class="sidebar">
      <div class="widget">
        <h3 class="widget-title">最新文章</h3>
        <ArticleCard v-for="a in latestArticles" :key="a.id" :article="a" compact />
      </div>

      <div class="widget">
        <h3 class="widget-title">分类</h3>
        <ul class="widget-list">
          <li v-for="cat in categories" :key="cat.id">
            <router-link :to="`/category/${cat.id}`" class="widget-link">
              <span>{{ cat.name }}</span>
              <span class="count">{{ cat.article_count }}</span>
            </router-link>
          </li>
        </ul>
      </div>

      <div class="widget">
        <h3 class="widget-title">标签</h3>
        <div class="tag-cloud">
          <router-link v-for="tag in tags" :key="tag.id" :to="`/tag/${tag.id}`" class="tag-item">
            {{ tag.name }}
          </router-link>
        </div>
      </div>

      <div class="widget">
        <h3 class="widget-title">归档</h3>
        <ul class="widget-list">
          <li v-for="m in archiveMonths" :key="m.month">
            <router-link to="/archive" class="widget-link">
              <span>{{ m.month }}</span>
              <span class="count">{{ m.count }} 篇</span>
            </router-link>
          </li>
        </ul>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { getArticles, getArchive } from '@/api/article'
import { getCategories } from '@/api/category'
import { getTags } from '@/api/tag'

const articles = ref([])
const categories = ref([])
const tags = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10

// 侧栏数据
const latestArticles = ref([])
const archiveMonths = ref([])

// 动态 head 信息（同步注册，避免 async setup 中丢失上下文）
useHead({
  title: '首页 - 我的博客',
  meta: [
    { name: 'description', content: '个人博客，记录技术、生活与思考' },
    { name: 'keywords', content: '博客,技术,Vue,Go,MySQL' },
    { property: 'og:title', content: '我的博客' },
    { property: 'og:description', content: '个人博客，记录技术、生活与思考' },
    { property: 'og:type', content: 'website' },
  ],
})

// 预取数据（SSG 构建时也会执行，保证预渲染 HTML 包含文章内容）
try {
  const data = await getArticles({ page: 1, page_size: pageSize })
  articles.value = data.list
  total.value = data.total
} catch (e) {
  /* 后端不可用时忽略，客户端重新加载 */
}
try {
  categories.value = await getCategories()
  tags.value = await getTags()
} catch (e) {
  /* ignore */
}
// 最新文章（侧栏，独立于当前分页）
try {
  const latest = await getArticles({ page: 1, page_size: 5 })
  latestArticles.value = latest.list
} catch (e) {
  /* ignore */
}
// 归档（侧栏：月份 + 篇数）
try {
  const archive = await getArchive()
  archiveMonths.value = Object.keys(archive).map((m) => ({
    month: m,
    count: archive[m].length,
  }))
} catch (e) {
  /* ignore */
}

// 分页（客户端交互）
const handlePageChange = (p) => {
  page.value = p
  loadArticles()
}

const loadArticles = async () => {
  try {
    const data = await getArticles({
      page: page.value,
      page_size: pageSize,
    })
    articles.value = data.list
    total.value = data.total
  } catch (e) {
    /* ignore */
  }
}
</script>

<style scoped>
.home-layout {
  display: flex;
  gap: 24px;
  align-items: flex-start;
}

/* 左列：文章列表（收窄宽度，右侧留出侧栏） */
.article-list {
  flex: 1;
  min-width: 0;
  max-width: 700px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

/* 右侧栏：固定宽度，四块自上而下排列 */
.sidebar {
  width: 280px;
  flex-shrink: 0;
  display: flex;
  flex-direction: column;
  gap: 16px;
}

.widget {
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.widget-title {
  font-size: 16px;
  margin-bottom: 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.widget-list {
  list-style: none;
}

.widget-list li {
  padding: 8px 0;
  border-bottom: 1px dashed #eee;
}

.widget-list li:last-child {
  border-bottom: none;
}

.widget-link {
  display: flex;
  justify-content: space-between;
  color: #555;
  font-size: 14px;
}

.widget-link:hover {
  color: #409eff;
}

.count {
  color: #999;
  font-size: 12px;
}

/* 标签云 */
.tag-cloud {
  display: flex;
  flex-wrap: wrap;
  gap: 8px;
}

.tag-item {
  background: #f0f2f5;
  color: #555;
  padding: 4px 12px;
  border-radius: 20px;
  font-size: 13px;
  transition: all 0.2s;
}

.tag-item:hover {
  background: #409eff;
  color: #fff;
}

/* 窄屏：上下堆叠 */
@media (max-width: 900px) {
  .home-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
