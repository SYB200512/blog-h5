<template>
  <div class="category-layout">
    <!-- 左列：分类下的文章时间线 -->
    <div class="category-main">
      <div class="archive-header">
        <span class="header-dot"></span>
        <h2 class="header-title">分类：{{ category?.name || '加载中...' }} - {{ total }} 篇</h2>
      </div>

      <template v-if="articles.length">
        <div class="timeline">
          <TimelineArticle v-for="article in articles" :key="article.id" :article="article" />
        </div>
        <div class="pagination">
          <el-pagination background layout="prev, pager, next" :total="total"
            :page-size="pageSize" :current-page="page" @current-change="handlePageChange" />
        </div>
      </template>
      <el-empty v-else description="该分类下暂无文章" />
    </div>

    <!-- 右侧栏：与归档页一致 -->
    <BlogSidebar
      :total-articles="totalArticles"
      :total-tags="totalTags"
      :total-categories="totalCategories"
      :latest-articles="latestArticles"
      :categories="categories"
      :tags="tags"
      :archive-months="archiveMonths"
    />
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import BlogSidebar from '@/components/BlogSidebar.vue'
import TimelineArticle from '@/components/TimelineArticle.vue'
import { getArticles, getArchive } from '@/api/article'
import { getCategories } from '@/api/category'
import { getTags } from '@/api/tag'

const route = useRoute()
const articles = ref([])
const category = ref(null)
const total = ref(0)
const page = ref(1)
const pageSize = 10

const latestArticles = ref([])
const categories = ref([])
const tags = ref([])
const archiveData = ref({})

// 动态 head（同步注册，数据加载后通过 ref 更新）
useHead({
  title: () => (category.value ? `${category.value.name} - 我的博客` : '分类 - 我的博客'),
  meta: () => [
    { name: 'description', content: `分类「${category.value?.name || ''}」下的文章列表` },
    { property: 'og:title', content: `${category.value?.name || '分类'} - 我的博客` },
    { property: 'og:type', content: 'website' },
  ],
})

// 预取数据（SSG 构建时执行）
try {
  const [data, cats] = await Promise.all([
    getArticles({ page: 1, page_size: pageSize, category_id: route.params.id }),
    getCategories(),
  ])
  articles.value = data.list
  total.value = data.total
  category.value = cats.find((c) => String(c.id) === String(route.params.id))
  categories.value = cats
} catch (e) {
  /* ignore */
}
try {
  tags.value = await getTags()
} catch (e) {
  /* ignore */
}
try {
  archiveData.value = await getArchive()
} catch (e) {
  /* ignore */
}
// 侧栏最新文章
try {
  const latest = await getArticles({ page: 1, page_size: 5 })
  latestArticles.value = latest.list
} catch (e) {
  /* ignore */
}

// 侧栏统计
const totalArticles = computed(() =>
  Object.values(archiveData.value).reduce((sum, items) => sum + items.length, 0)
)
const totalTags = computed(() => tags.value.length)
const totalCategories = computed(() => categories.value.length)
const archiveMonths = computed(() =>
  Object.keys(archiveData.value).map((m) => ({
    month: m,
    count: archiveData.value[m].length,
  }))
)

// 客户端分页交互
const handlePageChange = (p) => {
  page.value = p
  loadArticles()
}

const loadArticles = async () => {
  try {
    const data = await getArticles({ page: page.value, page_size: pageSize, category_id: route.params.id })
    articles.value = data.list
    total.value = data.total
  } catch (e) {
    /* ignore */
  }
}
</script>

<style scoped>
.category-layout {
  display: flex;
  justify-content: center;
  gap: 24px;
  align-items: flex-start;
}

/* 左列：与归档页同宽（最多 700px） */
.category-main {
  flex: 1;
  min-width: 0;
  max-width: 700px;
}

/* 统计头部 */
.archive-header {
  display: flex;
  align-items: center;
  gap: 10px;
  background: #fff;
  border-radius: 10px;
  padding: 18px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.header-dot {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #4a9fd4;
  border: 3px solid #d6ecf9;
  box-sizing: content-box;
}

.header-title {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

/* 竖向时间线（与归档页一致） */
.timeline {
  position: relative;
  padding: 4px 0;
}

.timeline::before {
  content: '';
  position: absolute;
  top: 14px;
  bottom: 8px;
  left: 14px;
  width: 2px;
  border-radius: 2px;
  background: linear-gradient(180deg, #87ceeb, rgba(135, 206, 235, 0.25));
}

.pagination {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

/* 窄屏：侧栏下移，单列布局 */
@media (max-width: 900px) {
  .category-layout {
    flex-direction: column;
  }

  .category-main {
    width: 100%;
    max-width: none;
  }
}
</style>
