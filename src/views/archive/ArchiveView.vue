<template>
  <div class="page-header">
    <h2>文章归档</h2>
  </div>
  <div v-for="(items, month) in archiveData" :key="month" class="archive-group">
    <h3 class="archive-month">
      <el-icon><Calendar /></el-icon>
      {{ month }}（{{ items.length }} 篇）
    </h3>
    <div class="archive-list">
      <ArticleCard v-for="article in items" :key="article.id" :article="article" />
    </div>
  </div>
  <el-empty v-if="!Object.keys(archiveData).length" description="暂无归档" />
</template>

<script setup>
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import ArticleCard from '@/components/ArticleCard.vue'
import { getArchive } from '@/api/article'

const archiveData = ref({})

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
</script>

<style scoped>
.page-header {
  background: #fff;
  border-radius: 10px;
  padding: 20px 24px;
  margin-bottom: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.archive-group {
  margin-bottom: 28px;
}

.archive-month {
  font-size: 18px;
  margin: 20px 0 14px;
  display: flex;
  align-items: center;
  gap: 8px;
  color: #409eff;
}
</style>
