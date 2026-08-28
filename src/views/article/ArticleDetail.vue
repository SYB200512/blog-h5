<template>
  <div>
    <div v-if="article">
      <!-- 文章头部 -->
      <div class="article-header">
        <h1 class="article-title">{{ article.title }}</h1>
        <div class="article-meta">
          <span><el-icon><Calendar /></el-icon> {{ formatDate(article.created_at) }}</span>
          <router-link v-if="article.category" :to="`/category/${article.category.id}`" class="meta-link">
            <el-icon><Folder /></el-icon> {{ article.category.name }}
          </router-link>
          <span><el-icon><View /></el-icon> {{ article.views }} 阅读</span>
          <span v-if="article.tags?.length">
            <el-icon><PriceTag /></el-icon>
            <router-link v-for="tag in article.tags" :key="tag.id" :to="`/tag/${tag.id}`" class="meta-link">
              {{ tag.name }}
            </router-link>
          </span>
        </div>
      </div>

      <!-- 文章内容 -->
      <div class="article-content">
        <div class="markdown-body" v-html="htmlContent"></div>
      </div>

      <!-- 评论区域 -->
      <div class="comments">
        <h3 class="comments-title">
          <el-icon><ChatDotRound /></el-icon>
          评论（{{ comments.length }}）
        </h3>
        <!-- 发表评论 -->
        <div class="comment-form">
          <el-input v-model="commentContent" type="textarea" :rows="3" placeholder="说点什么吧..." />
          <div class="comment-form-footer">
            <el-button type="primary" :loading="submitting" @click="submitComment">发表评论</el-button>
          </div>
        </div>
        <!-- 评论列表 -->
        <ul class="comment-list">
          <li v-for="comment in comments" :key="comment.id" class="comment-item">
            <div class="comment-body">
              <span class="comment-author">{{ comment.nickname || comment.user?.nickname || comment.user?.username || '匿名' }}</span>
              <span class="comment-time">{{ formatDateTime(comment.created_at) }}</span>
            </div>
            <p class="comment-content">{{ comment.content }}</p>
          </li>
        </ul>
        <el-empty v-if="!comments.length" description="暂无评论，快来抢沙发" :image-size="80" />
      </div>
    </div>
  </div>
</template>

<script setup>
import { ref, computed } from 'vue'
import { useRoute } from 'vue-router'
import { useHead } from '@unhead/vue'
import { ElMessage } from 'element-plus'
import { getArticle } from '@/api/article'
import { getComments, createComment } from '@/api/comment'
import { renderMarkdown } from '@/utils/markdown'
import { formatDate, formatDateTime } from '@/utils/format'

const route = useRoute()
const article = ref(null)
const comments = ref([])
const commentContent = ref('')
const submitting = ref(false)

// 动态 head 信息（同步注册，数据加载完成后通过 ref 响应式更新）
const headTitle = ref('文章详情 - 我的博客')
const headDescription = ref('')
const headKeywords = ref('')
const headOgTitle = ref('我的博客')
const headOgImage = ref('')

useHead({
  title: () => headTitle.value,
  meta: () => [
    { name: 'description', content: headDescription.value },
    { name: 'keywords', content: headKeywords.value },
    { property: 'og:title', content: headOgTitle.value },
    { property: 'og:description', content: headDescription.value },
    { property: 'og:type', content: 'article' },
    ...(headOgImage.value ? [{ property: 'og:image', content: headOgImage.value }] : []),
  ],
})

// 预取数据（SSG 构建时执行，预渲染 HTML 包含文章正文）
try {
  article.value = await getArticle(route.params.id)
  if (article.value) {
    headTitle.value = `${article.value.title} - 我的博客`
    headDescription.value = article.value.summary || article.value.title || ''
    headKeywords.value = article.value.tags?.map((t) => t.name).join(',') || '博客'
    headOgTitle.value = article.value.title
    headOgImage.value = article.value.cover || ''
  }
} catch (e) {
  /* 文章不存在或后端不可用，忽略 */
}
try {
  comments.value = await getComments(route.params.id)
} catch (e) {
  /* ignore */
}

const htmlContent = computed(() => renderMarkdown(article.value?.content || ''))

// 发表评论（客户端交互）
const submitComment = async () => {
  if (!commentContent.value.trim()) {
    ElMessage.warning('评论内容不能为空')
    return
  }
  submitting.value = true
  try {
    await createComment(route.params.id, { content: commentContent.value.trim() })
    ElMessage.success('评论成功')
    commentContent.value = ''
    comments.value = await getComments(route.params.id)
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.article-header {
  background: #fff;
  border-radius: 10px;
  padding: 32px 28px 20px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.article-title {
  font-size: 26px;
  font-weight: 700;
  line-height: 1.4;
}

.article-meta {
  display: flex;
  flex-wrap: wrap;
  gap: 18px;
  margin-top: 14px;
  color: #999;
  font-size: 13px;
  align-items: center;
}

.article-meta span {
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.meta-link {
  color: #409eff;
  margin-left: 4px;
}

.article-content {
  background: #fff;
  border-radius: 10px;
  padding: 32px 28px;
  margin-top: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.comments {
  background: #fff;
  border-radius: 10px;
  padding: 24px 28px;
  margin-top: 16px;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.comments-title {
  font-size: 17px;
  margin-bottom: 16px;
  display: flex;
  align-items: center;
  gap: 6px;
}

.comment-form-footer {
  display: flex;
  justify-content: flex-end;
  margin-top: 10px;
}

.comment-list {
  list-style: none;
  margin-top: 20px;
}

.comment-item {
  padding: 14px 0;
  border-bottom: 1px solid #f0f0f0;
}

.comment-item:last-child {
  border-bottom: none;
}

.comment-body {
  display: flex;
  align-items: center;
  gap: 12px;
}

.comment-author {
  font-weight: 600;
  color: #409eff;
  font-size: 14px;
}

.comment-time {
  color: #bbb;
  font-size: 12px;
}

.comment-content {
  margin-top: 8px;
  color: #444;
  font-size: 14px;
}
</style>
