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
          <div v-for="article in articles" :key="article.id" class="timeline-item">
            <span class="timeline-dot timeline-dot-article"></span>
            <router-link :to="`/article/${article.id}`" class="archive-card">
              <img
                :src="coverUrl(article)"
                :alt="article.title"
                class="archive-thumb"
                loading="lazy"
              />
              <div class="archive-info">
                <span class="archive-date">
                  <el-icon :size="12"><Calendar /></el-icon>
                  {{ formatDate(article.created_at) }}
                </span>
                <h4 class="archive-title">{{ article.title }}</h4>
              </div>
            </router-link>
          </div>
        </template>
      </div>

      <el-empty v-if="!years.length" description="暂无归档" />
    </div>

    <!-- 右侧栏：个人信息 / 公告 -->
    <aside class="sidebar">
      <div class="widget profile-card">
        <el-avatar :size="72" :src="avatarUrl" class="profile-avatar" />
        <h3 class="profile-name">Sunvyn</h3>
        <p class="profile-bio">Backend Developer · Go Enthusiast · Gamer 🎮</p>
        <div class="profile-stats">
          <div class="stat-item">
            <span class="stat-num">{{ totalArticles }}</span>
            <span class="stat-label">文章</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ totalTags }}</span>
            <span class="stat-label">标签</span>
          </div>
          <div class="stat-item">
            <span class="stat-num">{{ totalCategories }}</span>
            <span class="stat-label">分类</span>
          </div>
        </div>
        <a :href="GITHUB_URL" target="_blank" rel="noopener" class="follow-btn">
          <el-icon :size="16"><Link /></el-icon>
          Follow Me
        </a>
      </div>

      <div class="widget announcement-card">
        <h3 class="widget-title">
          <el-icon :size="16"><Bell /></el-icon>
          公告
        </h3>
        <p class="announcement-text">即使再小的帆也能远航 ⛵</p>
      </div>
    </aside>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useHead } from '@unhead/vue'
import { getArchive } from '@/api/article'
import { getCategories } from '@/api/category'
import { getTags } from '@/api/tag'
import { formatDate } from '@/utils/format'

// 文章无封面时使用的兜底封面图
const FALLBACK_COVER =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
  encodeURIComponent('minimalist blog cover illustration, soft gradient light, mountains and sun, clean composition') +
  '&image_size=landscape_4_3'

const coverUrl = (article) => article.cover || FALLBACK_COVER

// TODO: 替换为你的 GitHub 主页地址
const GITHUB_URL = 'https://github.com/'
const avatarUrl = '/images/head-sculpture.jpg'

const archiveData = ref({})
const totalTags = ref(0)
const totalCategories = ref(0)

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
  totalTags.value = (await getTags()).length
} catch (e) {
  /* ignore */
}
try {
  totalCategories.value = (await getCategories()).length
} catch (e) {
  /* ignore */
}

// 归档总篇数
const totalArticles = computed(() =>
  Object.values(archiveData.value).reduce((sum, items) => sum + items.length, 0)
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
  gap: 24px;
  align-items: flex-start;
}

/* ===== 左列：归档时间线 ===== */
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

/* 文章条目 */
.timeline-item {
  position: relative;
  padding-left: 44px;
  margin-bottom: 12px;
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

/* 文章圆点：天蓝色 */
.timeline-dot-article {
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #4a9fd4;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #4a9fd4;
}

/* 文章卡片：缩略图 + 日期 + 标题 */
.archive-card {
  display: flex;
  align-items: center;
  gap: 14px;
  background: #fff;
  border-radius: 10px;
  padding: 10px 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s, transform 0.2s;
}

.archive-card:hover {
  box-shadow: 0 6px 16px rgba(74, 159, 212, 0.16);
  transform: translateY(-1px);
}

.archive-thumb {
  flex-shrink: 0;
  width: 80px;
  height: 60px;
  border-radius: 8px;
  object-fit: cover;
  display: block;
}

.archive-info {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
  gap: 4px;
}

.archive-date {
  display: inline-flex;
  align-items: center;
  gap: 4px;
  font-size: 12px;
  color: #95a5a6;
}

.archive-title {
  margin: 0;
  font-size: 15px;
  font-weight: 500;
  color: #2c3e50;
  line-height: 1.4;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}

.archive-card:hover .archive-title {
  color: #4a9fd4;
}

/* ===== 右侧栏 ===== */
.sidebar {
  width: 300px;
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

/* 个人信息卡片 */
.profile-card {
  text-align: center;
  padding: 24px 20px;
}

.profile-avatar {
  background: #4a9fd4;
}

.profile-name {
  margin: 12px 0 4px;
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.profile-bio {
  margin: 0;
  font-size: 13px;
  color: #95a5a6;
}

.profile-stats {
  display: flex;
  justify-content: space-around;
  margin: 16px 0;
  padding: 12px 0;
  border-top: 1px solid #eef1f5;
  border-bottom: 1px solid #eef1f5;
}

.stat-item {
  display: flex;
  flex-direction: column;
  gap: 2px;
}

.stat-num {
  font-size: 18px;
  font-weight: 600;
  color: #2c3e50;
}

.stat-label {
  font-size: 12px;
  color: #95a5a6;
}

.follow-btn {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  gap: 6px;
  width: 100%;
  padding: 8px 0;
  border-radius: 8px;
  color: #fff;
  font-size: 14px;
  background: linear-gradient(90deg, #5dade2, #3498db);
  transition: opacity 0.2s, transform 0.2s;
}

.follow-btn:hover {
  opacity: 0.9;
  transform: translateY(-1px);
}

/* 公告卡片 */
.widget-title {
  margin: 0 0 10px;
  font-size: 15px;
  font-weight: 600;
  color: #2c3e50;
  display: flex;
  align-items: center;
  gap: 6px;
}

.announcement-text {
  margin: 0;
  font-size: 14px;
  color: #555;
  line-height: 1.7;
}

/* 窄屏：侧栏下移，单列布局 */
@media (max-width: 900px) {
  .archive-layout {
    flex-direction: column;
  }

  .sidebar {
    width: 100%;
  }
}
</style>
