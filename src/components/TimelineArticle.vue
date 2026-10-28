<template>
  <div class="timeline-item">
    <span class="timeline-dot timeline-dot-article"></span>
    <router-link :to="`/article/${article.id}`" class="archive-card">
      <img :src="coverUrl(article)" :alt="article.title" class="archive-thumb" loading="lazy" />
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

<script setup>
import { formatDate } from '@/utils/format'

defineProps({
  article: { type: Object, required: true },
})

// 文章无封面时使用的兜底封面图
const FALLBACK_COVER =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
  encodeURIComponent('minimalist blog cover illustration, soft gradient light, mountains and sun, clean composition') +
  '&image_size=landscape_4_3'

const coverUrl = (article) => article.cover || FALLBACK_COVER
</script>

<style scoped>
.timeline-item {
  position: relative;
  padding-left: 44px;
  margin-bottom: 14px;
}

.timeline-dot {
  position: absolute;
  left: 15px;
  box-sizing: content-box;
  border-radius: 50%;
}

.timeline-dot-article {
  top: 50%;
  transform: translate(-50%, -50%);
  width: 8px;
  height: 8px;
  background: #4a9fd4;
  border: 3px solid #fff;
  box-shadow: 0 0 0 2px #4a9fd4;
}

.archive-card {
  display: flex;
  align-items: center;
  gap: 18px;
  background: #fff;
  border-radius: 10px;
  padding: 16px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s, transform 0.2s;
}

.archive-card:hover {
  box-shadow: 0 6px 16px rgba(74, 159, 212, 0.16);
  transform: translateY(-1px);
}

.archive-thumb {
  flex-shrink: 0;
  width: 96px;
  height: 72px;
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
</style>
