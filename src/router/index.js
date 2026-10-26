// 路由配置表（供 vite-ssg 使用）
// 注意：这里只导出 routes，router 实例由 vite-ssg 创建

import FrontLayout from '@/layouts/FrontLayout.vue'

export const routes = [
  {
    path: '/',
    component: FrontLayout,
    children: [
      { path: '', name: 'home', component: () => import('@/views/home/Home.vue'), meta: { title: '首页' } },
      { path: 'article/:id', name: 'articleDetail', component: () => import('@/views/article/ArticleDetail.vue'), meta: { title: '文章详情' } },
      { path: 'category/:id', name: 'category', component: () => import('@/views/category/CategoryView.vue'), meta: { title: '分类' } },
      { path: 'tag/:id', name: 'tag', component: () => import('@/views/tag/TagView.vue'), meta: { title: '标签' } },
      { path: 'archive', name: 'archive', component: () => import('@/views/archive/ArchiveView.vue'), meta: { title: '归档' } },
      { path: 'categories', name: 'categories', component: () => import('@/views/category/CategoryListView.vue'), meta: { title: '分类' } },
      { path: 'about', name: 'about', component: () => import('@/views/about/AboutView.vue'), meta: { title: '关于' } },
    ],
  },
  // 404
  { path: '/:pathMatch(.*)*', redirect: '/' },
]
