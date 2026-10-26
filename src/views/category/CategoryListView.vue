<template>
  <div class="category-page">
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
</template>

<script setup>
import { ref } from 'vue'
import { useHead } from '@unhead/vue'
import { getCategories } from '@/api/category'

const categories = ref([])

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
</script>

<style scoped>
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
</style>

<style>
/* 非 scoped：仅在本页面存在时把外层容器加宽（模仿模板的宽容器布局），不影响其他页面 */
.container.main:has(.category-page) {
  width: min(100% - 48px, 1440px);
  max-width: min(100% - 48px, 1440px);
  padding-left: 24px;
  padding-right: 24px;
}
</style>
