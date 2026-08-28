<template>
  <div class="about-page">
    <div class="about-card">
      <el-avatar :size="80" class="avatar">
        <el-icon :size="40"><User /></el-icon>
      </el-avatar>
      <h1 class="name">你好，我是站长</h1>
      <p class="bio">
        欢迎来到我的个人博客！这里记录我在技术路上的思考、学习笔记与生活随笔。
      </p>
      <div class="skills">
        <h3>技术栈</h3>
        <div class="skill-tags">
          <span v-for="s in skills" :key="s" class="skill-tag">{{ s }}</span>
        </div>
      </div>
      <div class="contact">
        <h3>联系方式</h3>
        <p>邮箱：<a href="mailto:admin@example.com">admin@example.com</a></p>
      </div>
    </div>
  </div>
</template>

<script setup>
import { useHead } from '@unhead/vue'

const skills = ['Vue 3', 'Go', 'MySQL', 'Docker', 'Nginx']

// 动态 head 信息
useHead({
  title: '关于 - 我的博客',
  meta: [
    { name: 'description', content: '关于我的个人博客，技术栈与联系方式' },
    { property: 'og:title', content: '关于 - 我的博客' },
    { property: 'og:type', content: 'profile' },
  ],
})
</script>

<style scoped>
.about-card {
  background: #fff;
  border-radius: 10px;
  padding: 48px 32px;
  text-align: center;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.avatar {
  background: #409eff;
}

.name {
  margin-top: 16px;
  font-size: 24px;
}

.bio {
  color: #666;
  margin-top: 12px;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.skills,
.contact {
  margin-top: 28px;
  text-align: left;
  max-width: 560px;
  margin-left: auto;
  margin-right: auto;
}

.skills h3,
.contact h3 {
  font-size: 16px;
  margin-bottom: 12px;
  padding-bottom: 8px;
  border-bottom: 2px solid #409eff;
  display: inline-block;
}

.skill-tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10px;
}

.skill-tag {
  background: #ecf5ff;
  color: #409eff;
  padding: 6px 16px;
  border-radius: 20px;
  font-size: 14px;
}

.contact a {
  color: #409eff;
}
</style>
