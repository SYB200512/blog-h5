<template>
  <!-- 不包 <Suspense>：路由组件是异步 chunk，Suspense 会让整个布局在 chunk 加载期间
       一起消失（整页白屏再突然出现）。移除后只有内容区短暂留白，布局保持不动 -->
  <router-view />
</template>
