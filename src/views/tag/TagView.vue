<template>
  <div>
    <div class="page-header">
      <h2>标签：#{{ tagName }}</h2>
    </div>
    <template v-if="articles.length">
      <ArticleCard v-for="article in articles" :key="article.id" :article="article" />
      <div class="pagination">
        <el-pagination background layout="prev, pager, next" :total="total"
          :page-size="pageSize" :current-page="page" @current-change="handlePageChange" />
      </div>
    </template>
    <el-empty v-else description="该标签下暂无文章" />
  </div>
</template>

<script setup>
import { ref } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { getArticles } from '@/api/article'
import { getTags } from '@/api/tag'

const route = useRoute()
const articles = ref([])
const tagName = ref('')
const total = ref(0)
const page = ref(1)
const pageSize = 10

// 动态 head（同步注册，数据加载后通过 ref 更新）
useHead({
  title: () => (tagName.value ? `标签：${tagName.value} - 我的博客` : '标签 - 我的博客'),
  meta: () => [
    { name: 'description', content: `标签「${tagName.value || ''}」下的文章列表` },
    { property: 'og:title', content: `标签：${tagName.value || ''} - 我的博客` },
    { property: 'og:type', content: 'website' },
  ],
})

// 预取数据（SSG 构建时执行）
try {
  const [data, tags] = await Promise.all([
    getArticles({ page: 1, page_size: pageSize, tag_id: route.params.id }),
    getTags(),
  ])
  articles.value = data.list
  total.value = data.total
  tagName.value = tags.find((t) => String(t.id) === String(route.params.id))?.name || ''
} catch (e) {
  /* ignore */
}

// 客户端分页交互
const handlePageChange = (p) => {
  page.value = p
  loadArticles()
}

const loadArticles = async () => {
  try {
    const data = await getArticles({ page: page.value, page_size: pageSize, tag_id: route.params.id })
    articles.value = data.list
    total.value = data.total
  } catch (e) {
    /* ignore */
  }
}
</script>

<style scoped>
.page-header {
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.pagination {
  display: flex;
  justify-content: center;
  margin: 24px 0;
}
</style>
