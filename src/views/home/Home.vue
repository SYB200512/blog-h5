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

    <!-- 右侧栏：与归档页一致（个人信息 / 公告 / 最新文章 / 分类 / 标签 / 归档） -->
    <BlogSidebar
      :total-articles="totalArticles"
      :total-tags="tags.length"
      :total-categories="categories.length"
      :latest-articles="latestArticles"
      :categories="categories"
      :tags="tags"
      :archive-months="archiveMonths"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHead } from '@unhead/vue'
import ArticleCard from '@/components/ArticleCard.vue'
import BlogSidebar from '@/components/BlogSidebar.vue'
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

// 侧栏统计：文章总数取归档汇总
const totalArticles = computed(() =>
  archiveMonths.value.reduce((sum, m) => sum + m.count, 0)
)

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

/* 窄屏：上下堆叠 */
@media (max-width: 900px) {
  .home-layout {
    flex-direction: column;
  }
}
</style>
