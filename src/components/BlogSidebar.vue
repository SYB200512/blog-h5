<template>
  <aside class="sidebar">
    <div v-if="showProfile" class="widget profile-card">
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

    <div class="widget">
      <h3 class="widget-heading">最新文章</h3>
      <ArticleCard v-for="a in latestArticles" :key="a.id" :article="a" compact />
    </div>

    <div class="widget">
      <h3 class="widget-heading">分类</h3>
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
      <h3 class="widget-heading">标签</h3>
      <div class="tag-cloud">
        <router-link v-for="tag in tags" :key="tag.id" :to="`/tag/${tag.id}`" class="tag-item">
          {{ tag.name }}
        </router-link>
      </div>
    </div>

    <div class="widget">
      <h3 class="widget-heading">归档</h3>
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
</template>

<script setup>
import ArticleCard from '@/components/ArticleCard.vue'

defineProps({
  // 是否显示个人信息卡片（图片页等页面可关闭）
  showProfile: { type: Boolean, default: true },
  totalArticles: { type: Number, default: 0 },
  totalTags: { type: Number, default: 0 },
  totalCategories: { type: Number, default: 0 },
  latestArticles: { type: Array, default: () => [] },
  categories: { type: Array, default: () => [] },
  tags: { type: Array, default: () => [] },
  archiveMonths: { type: Array, default: () => [] },
})

// TODO: 替换为你的 GitHub 主页地址
const GITHUB_URL = 'https://github.com/'
const avatarUrl = '/images/head-sculpture.jpg'
</script>

<style scoped>
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

.profile-card {
  text-align: center;
  padding: 24px 20px;
}

.profile-avatar {
  background: #4a9fd4;
  animation: avatar-spin 8s linear infinite;
}

/* 头像：持续缓慢旋转 */
@keyframes avatar-spin {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
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

/* 公告铃铛：每 2 秒抖动一次 */
.announcement-card :deep(.widget-title .el-icon) {
  transform-origin: 50% 0;
  animation: bell-shake 2s ease-in-out infinite;
}

@keyframes bell-shake {
  0%,
  62%,
  100% {
    transform: rotate(0);
  }
  66% {
    transform: rotate(14deg);
  }
  72% {
    transform: rotate(-12deg);
  }
  78% {
    transform: rotate(8deg);
  }
  84% {
    transform: rotate(-6deg);
  }
  90% {
    transform: rotate(3deg);
  }
}

.widget-heading {
  margin: 0 0 14px;
  padding-bottom: 10px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
  font-size: 16px;
  font-weight: 600;
  color: #2c3e50;
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

@media (max-width: 900px) {
  .sidebar {
    width: 100%;
  }
}
</style>
