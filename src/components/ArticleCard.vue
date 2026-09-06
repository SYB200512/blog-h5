<template>
  <article class="article-card" :class="{ compact }">
    <router-link :to="`/article/${article.id}`" class="card-cover">
      <img :src="coverUrl" :alt="article.title" loading="lazy" />
    </router-link>
    <div class="card-body">
      <router-link :to="`/article/${article.id}`" class="card-title">
        {{ article.title }}
      </router-link>
      <div class="card-meta">
        <span class="meta-item">
          <el-icon><Calendar /></el-icon>
          {{ formatDate(article.created_at) }}
        </span>
        <router-link v-if="article.category" :to="`/category/${article.category.id}`" class="meta-item">
          <el-icon><Folder /></el-icon>
          {{ article.category.name }}
        </router-link>
      </div>
      <p v-if="!compact" class="card-excerpt">{{ excerpt }}</p>
    </div>
  </article>
</template>

<script setup>
import { computed } from 'vue'
import { formatDate } from '@/utils/format'

const props = defineProps({
  article: {
    type: Object,
    required: true,
  },
  // 紧凑模式：用于侧栏等小尺寸场景
  compact: {
    type: Boolean,
    default: false,
  },
})

// 文章无封面时使用的兜底封面图
const FALLBACK_COVER =
  'https://trae-api-cn.mchost.guru/api/ide/v1/text_to_image?prompt=' +
  encodeURIComponent('minimalist blog cover illustration, soft gradient light, mountains and sun, clean composition') +
  '&image_size=landscape_4_3'

const coverUrl = computed(() => props.article.cover || FALLBACK_COVER)

// 摘要：优先用后台填写的 summary，否则从正文中提取纯文本并截断
const excerpt = computed(() => {
  if (props.article.summary) return props.article.summary
  const plain = props.article.content
    ? props.article.content
        .replace(/```[\s\S]*?```/g, ' ')
        .replace(/!\[[^\]]*\]\([^)]*\)/g, ' ')
        .replace(/\[([^\]]*)\]\([^)]*\)/g, '$1')
        .replace(/[#>*`~\-|]/g, ' ')
        .replace(/\s+/g, ' ')
        .trim()
    : ''
  return plain.length > 120 ? plain.slice(0, 120) + '…' : plain
})
</script>

<style scoped>
.article-card {
  display: flex;
  gap: 20px;
  background: #fff;
  border-radius: 10px;
  padding: 20px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.article-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
}

.card-cover {
  flex-shrink: 0;
  width: 220px;
  height: 140px;
  border-radius: 8px;
  overflow: hidden;
}

.card-cover img {
  width: 100%;
  height: 100%;
  object-fit: cover;
  display: block;
  transition: transform 0.3s;
}

.card-cover:hover img {
  transform: scale(1.05);
}

.card-body {
  flex: 1;
  min-width: 0;
  display: flex;
  flex-direction: column;
}

.card-title {
  font-size: 20px;
  font-weight: 600;
  color: #333;
  line-height: 1.4;
}

.card-title:hover {
  color: #409eff;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #999;
  font-size: 13px;
  margin: 8px 0;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.card-excerpt {
  color: #666;
  font-size: 14px;
  line-height: 1.6;
  margin: 0;
  display: -webkit-box;
  -webkit-line-clamp: 3;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

/* 紧凑模式（侧栏最新文章） */
.article-card.compact {
  background: none;
  box-shadow: none;
  border-radius: 0;
  padding: 10px 0;
  margin-bottom: 0;
  gap: 12px;
  border-bottom: 1px dashed #eee;
}

.article-card.compact:last-child {
  border-bottom: none;
}

.compact .card-cover {
  width: 84px;
  height: 64px;
  border-radius: 6px;
}

.compact .card-title {
  font-size: 15px;
  font-weight: 600;
  line-height: 1.3;
}

.compact .card-meta {
  font-size: 12px;
  margin: 4px 0;
  gap: 10px;
}

@media (max-width: 768px) {
  .article-card {
    flex-direction: column;
  }

  .card-cover {
    width: 100%;
    height: auto;
    aspect-ratio: 16 / 9;
  }
}
</style>
