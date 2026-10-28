<template>
  <div class="category-layout">
    <!-- 左列：分类列表 -->
    <div class="category-main">
      <div class="page-header">
        <h2>分类</h2>
        <span class="header-count">共 {{ categories.length }} 个分类</span>
      </div>

      <div class="category-panel">
        <ul v-if="categories.length" class="category-list">
          <li v-for="cat in categories" :key="cat.id">
            <router-link :to="`/category/${cat.id}`" class="category-item">
              <span class="cat-dot"></span>
              <span class="cat-name">{{ cat.name }}</span>
              <span class="cat-count">({{ cat.article_count }})</span>
            </router-link>
          </li>
        </ul>
        <el-empty v-else description="暂无分类" />
      </div>
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
import { useHead } from '@unhead/vue'
import BlogSidebar from '@/components/BlogSidebar.vue'
import { getArticles, getArchive } from '@/api/article'
import { getCategories } from '@/api/category'
import { getTags } from '@/api/tag'

const categories = ref([])
const tags = ref([])
const archiveData = ref({})
const latestArticles = ref([])

// 动态 head（同步注册）
useHead({
  title: '分类 - 我的博客',
  meta: [
    { name: 'description', content: '我的博客文章分类列表' },
    { property: 'og:title', content: '分类 - 我的博客' },
    { property: 'og:type', content: 'website' },
  ],
})

// 预取数据（SSG 构建时执行）
try {
  categories.value = await getCategories()
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

.page-header {
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  display: flex;
  align-items: baseline;
  gap: 12px;
}

.page-header h2 {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
}

.header-count {
  color: #999;
  font-size: 13px;
}

.category-panel {
  background: #fff;
  border-radius: 10px;
  padding: 8px 24px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.category-list {
  list-style: none;
}

.category-list li {
  border-bottom: 1px dashed #eee;
}

.category-list li:last-child {
  border-bottom: none;
}

/* 每项：圆点 + 分类名 + 计数，模仿图片中的分类菜单样式 */
.category-item {
  display: flex;
  align-items: center;
  gap: 12px;
  padding: 14px 8px;
  border-radius: 6px;
  font-size: 15px;
  color: #2c3e50;
  transition: background-color 0.15s;
}

.category-item:hover {
  background: #f0f6ff;
}

/* 圆点：默认空心蓝色，悬停填充橙色（模仿图片激活样式） */
.cat-dot {
  flex-shrink: 0;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  border: 2px solid #5d9def;
  box-sizing: border-box;
  transition: background-color 0.15s, border-color 0.15s;
}

.category-item:hover .cat-dot {
  background: #e67e22;
  border-color: #e67e22;
}

.cat-name {
  flex: 1;
  min-width: 0;
}

.cat-count {
  color: #95a5a6;
  font-size: 13px;
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
