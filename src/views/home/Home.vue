<template>
  <div>
    <!-- 搜索栏 -->
    <div class="toolbar">
      <el-input v-model="keyword" placeholder="搜索文章..." clearable class="search-input"
        @keyup.enter="handleSearch" @clear="handleSearch">
        <template #prefix>
          <el-icon><Search /></el-icon>
        </template>
      </el-input>
      <el-button type="primary" @click="handleSearch">搜索</el-button>
    </div>

    <!-- 文章列表 -->
    <template v-if="articles.length">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="total"
          :page-size="pageSize" :current-page="page" @current-change="handlePageChange" />
      </div>
    </template>
    <el-empty v-else description="暂无文章" />

    <!-- 侧边栏信息 -->
    <aside class="sidebar">
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
        <h3 class="widget-title">热门标签</h3>
        <div class="tag-cloud">
          <router-link v-for="tag in tags" :key="tag.id" :to="`/tag/${tag.id}`" class="tag-item">
            {{ tag.name }}
          </router-link>
        </div>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { getArticles } from '@/api/article'
import { getCategories } from '@/api/category'
import { getTags } from '@/api/tag'

const articles = ref([])
const categories = ref([])
const tags = ref([])
const total = ref(0)
const page = ref(1)
const pageSize = 10
const keyword = ref('')

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

// 搜索与分页（客户端交互）
const handleSearch = () => {
  page.value = 1
  loadArticles()
}

const handlePageChange = (p) => {
  page.value = p
  loadArticles()
}

const loadArticles = async () => {
  try {
    const data = await getArticles({
      page: page.value,
      page_size: pageSize,
      keyword: keyword.value || undefined,
    })
    articles.value = data.list
    total.value = data.total
  } catch (e) {
    /* ignore */
  }
}
</script>

<style scoped>
.toolbar {
  display: flex;
  gap: 12px;
  margin-bottom: 20px;
}

.search-input {
  max-width: 320px;
}

.pagination {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}

.sidebar {
  margin-top: 24px;
  display: grid;
  grid-template-columns: repeat(auto-fit, minmax(300px, 1fr));
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
</style>
