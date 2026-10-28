<template>
  <div class="archive-layout">
    <!-- 左列：时间线归档 -->
    <div class="archive-main">
      <div class="archive-header">
        <span class="header-dot"></span>
        <h2 class="header-title">全部文章 - {{ totalArticles }}</h2>
      </div>

      <!-- 按年份分组的竖向时间线 -->
      <div v-if="years.length" class="timeline">
        <template v-for="[year, articles] in years" :key="year">
          <!-- 年份节点 -->
          <div class="timeline-year">
            <span class="timeline-dot timeline-dot-year"></span>
            <h3 class="archive-year">
              {{ year }}
              <span class="year-count">{{ articles.length }} 篇</span>
            </h3>
          </div>

          <!-- 当年文章：缩略图 + 日期 + 标题 -->
          <TimelineArticle v-for="article in articles" :key="article.id" :article="article" />
        </template>
      </div>

      <el-empty v-if="!years.length" description="暂无归档" />
    </div>

    <!-- 右侧栏：个人信息 / 公告 / 最新文章 / 分类 / 标签 / 归档 -->
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
import TimelineArticle from '@/components/TimelineArticle.vue'
import { getArticles, getArchive } from '@/api/article'
import { getCategories } from '@/api/category'
import { getTags } from '@/api/tag'

const archiveData = ref({})
const latestArticles = ref([])
const categories = ref([])
const tags = ref([])

// 动态 head（同步注册）
useHead({
  title: '归档 - 我的博客',
  meta: [
    { name: 'description', content: '我的博客文章时间归档' },
    { property: 'og:title', content: '归档 - 我的博客' },
    { property: 'og:type', content: 'website' },
  ],
})

// 预取数据（SSG 构建时执行）
try {
  archiveData.value = await getArchive()
} catch (e) {
  /* ignore */
}
try {
  tags.value = await getTags()
} catch (e) {
  /* ignore */
}
try {
  categories.value = await getCategories()
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

// 归档总篇数
const totalArticles = computed(() =>
  Object.values(archiveData.value).reduce((sum, items) => sum + items.length, 0)
)

const totalTags = computed(() => tags.value.length)
const totalCategories = computed(() => categories.value.length)

// 侧栏归档：月份 + 篇数
const archiveMonths = computed(() =>
  Object.keys(archiveData.value).map((m) => ({
    month: m,
    count: archiveData.value[m].length,
  }))
)

// 按年份分组：{ '2026-03': [...], '2025-12': [...] } -> [['2026', [...]], ['2025', [...]]]
// 原数据按时间倒序插入，年份与年内文章顺序均保持倒序
const years = computed(() => {
  const map = new Map()
  for (const [month, items] of Object.entries(archiveData.value)) {
    const year = month.split('-')[0]
    if (!map.has(year)) map.set(year, [])
    map.get(year).push(...items)
  }
  return [...map.entries()]
})
</script>

<style scoped>
.archive-layout {
  display: flex;
  justify-content: center;
  gap: 24px;
  align-items: flex-start;
}

/* ===== 左列：归档时间线（与首页文章列表同宽：最多 700px） ===== */
.archive-main {
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

/* ===== 竖向时间线 ===== */
.timeline {
  position: relative;
  padding: 4px 0;
}

/* 时间线连接线：浅蓝色渐变 */
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

/* 年份节点 */
.timeline-year {
  position: relative;
  padding-left: 44px;
  margin: 24px 0 12px;
}

.timeline-year:first-child {
  margin-top: 4px;
}

.archive-year {
  margin: 0;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: baseline;
  gap: 10px;
}

.year-count {
  font-size: 12px;
  font-weight: 400;
  color: #95a5a6;
}

/* 时间线圆点 */
.timeline-dot {
  position: absolute;
  left: 15px;
  box-sizing: content-box;
  border-radius: 50%;
}

/* 年份圆点：橙红色 */
.timeline-dot-year {
  top: 9px;
  transform: translateX(-50%);
  width: 12px;
  height: 12px;
  background: #e67e22;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #e67e22;
}

/* 窄屏：侧栏下移，单列布局 */
@media (max-width: 900px) {
  .archive-layout {
    flex-direction: column;
  }

  .archive-main {
    width: 100%;
    max-width: none;
  }
}
</style>
