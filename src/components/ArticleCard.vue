<template>
  <article class="article-card">
    <router-link :to="`/article/${article.id}`" class="card-title">
      {{ article.title }}
    </router-link>
    <p v-if="article.summary" class="card-summary">{{ article.summary }}</p>
    <div class="card-meta">
      <span class="meta-item">
        <el-icon><Calendar /></el-icon>
        {{ formatDate(article.created_at) }}
      </span>
      <router-link v-if="article.category" :to="`/category/${article.category.id}`" class="meta-item">
        <el-icon><Folder /></el-icon>
        {{ article.category.name }}
      </router-link>
      <span v-if="article.tags?.length" class="meta-item">
        <el-icon><PriceTag /></el-icon>
        <router-link v-for="tag in article.tags" :key="tag.id" :to="`/tag/${tag.id}`" class="tag-link">
          {{ tag.name }}
        </router-link>
      </span>
      <span class="meta-item">
        <el-icon><View /></el-icon>
        {{ article.views }} 阅读
      </span>
      <span v-if="article.comment_num > 0" class="meta-item">
        <el-icon><ChatDotRound /></el-icon>
        {{ article.comment_num }} 评论
      </span>
    </div>
  </article>
</template>

<script setup>
import { formatDate } from '@/utils/format'

defineProps({
  article: {
    type: Object,
    required: true,
  },
})
</script>

<style scoped>
.article-card {
  background: #fff;
  border-radius: 10px;
  padding: 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
  transition: box-shadow 0.2s;
}

.article-card:hover {
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
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

.card-summary {
  color: #666;
  font-size: 14px;
  margin: 10px 0;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
}

.card-meta {
  display: flex;
  align-items: center;
  gap: 16px;
  color: #999;
  font-size: 13px;
  flex-wrap: wrap;
}

.meta-item {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.tag-link {
  color: #409eff;
  margin-right: 6px;
}

.tag-link:hover {
  text-decoration: underline;
}
</style>
