<template>
  <div class="photo-page">
    <!-- 瀑布流图片墙：CSS multi-column -->
    <div class="masonry">
      <figure
        v-for="(photo, i) in photos"
        :key="photo.id"
        class="masonry-item"
        @click="openLightbox(i)"
      >
        <img :src="photo.src" :alt="photo.title" loading="lazy" class="photo" />
        <figcaption class="overlay">
          <span class="overlay-title">{{ photo.title }}</span>
        </figcaption>
      </figure>
    </div>

    <!-- 灯箱预览 -->
    <Teleport to="body">
      <div v-if="lightboxOpen" class="lightbox" @click.self="closeLightbox">
        <button class="lightbox-close" aria-label="关闭" @click="closeLightbox">×</button>
        <button class="lightbox-nav prev" aria-label="上一张" @click.stop="step(-1)">‹</button>
        <figure class="lightbox-figure">
          <img :src="current.src" :alt="current.title" class="lightbox-img" />
          <figcaption class="lightbox-caption">
            {{ current.title }}
            <span class="lightbox-index">{{ lightboxIndex + 1 }} / {{ photos.length }}</span>
          </figcaption>
        </figure>
        <button class="lightbox-nav next" aria-label="下一张" @click.stop="step(1)">›</button>
      </div>
    </Teleport>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from 'vue'
import { useHead } from '@unhead/vue'
import { getPhotos } from '@/api/photo'

// 兜底图片（接口无数据或请求失败时展示本地资源）
const FALLBACK_PHOTOS = [
  { id: 1, title: '晨雾山谷', src: '/images/photos/p1.jpg' },
  { id: 2, title: '雨夜街头', src: '/images/photos/p2.jpg' },
  { id: 3, title: '沙丘光影', src: '/images/photos/p3.jpg' },
  { id: 4, title: '窗边咖啡', src: '/images/photos/p4.jpg' },
  { id: 5, title: '雪山日出', src: '/images/photos/p5.jpg' },
  { id: 6, title: '旧书店', src: '/images/photos/p6.jpg' },
  { id: 7, title: '林间光斑', src: '/images/photos/p7.jpg' },
  { id: 8, title: '几何光影', src: '/images/photos/p8.jpg' },
  { id: 9, title: '银河营地', src: '/images/photos/p9.jpg' },
]

// 图片墙数据：来自后台「图片管理」中分类为「图片墙」的上传图
const photos = ref(FALLBACK_PHOTOS)

const loadPhotos = async () => {
  try {
    const list = await getPhotos()
    if (Array.isArray(list) && list.length) {
      photos.value = list.map((item) => ({
        id: item.id,
        title: (item.name || '').replace(/\.[^.]+$/, ''),
        src: item.url,
      }))
    }
  } catch {
    // 接口异常时保留兜底图，不打断页面渲染
  }
}

// 灯箱
const lightboxIndex = ref(0)
const lightboxOpen = ref(false)
const current = computed(() => photos.value[lightboxIndex.value] || photos.value[0])

const openLightbox = (i) => {
  lightboxIndex.value = i
  lightboxOpen.value = true
}

const closeLightbox = () => {
  lightboxOpen.value = false
}

const step = (delta) => {
  const total = photos.value.length
  lightboxIndex.value = (lightboxIndex.value + delta + total) % total
}

const onKeydown = (e) => {
  if (!lightboxOpen.value) return
  if (e.key === 'Escape') closeLightbox()
  if (e.key === 'ArrowLeft') step(-1)
  if (e.key === 'ArrowRight') step(1)
}

onMounted(() => {
  window.addEventListener('keydown', onKeydown)
  loadPhotos()
})
onUnmounted(() => window.removeEventListener('keydown', onKeydown))

useHead({
  title: '图片 - 我的博客',
  meta: [
    { name: 'description', content: '我的摄影图片墙' },
    { property: 'og:title', content: '图片 - 我的博客' },
    { property: 'og:type', content: 'website' },
  ],
})
</script>

<style scoped>
/* 瀑布流：多列布局 */
.masonry {
  columns: 4;
  column-gap: 16px;
}

.masonry-item {
  position: relative;
  margin: 0 0 16px;
  border-radius: 10px;
  overflow: hidden;
  break-inside: avoid;
  cursor: zoom-in;
  box-shadow: 0 1px 4px rgba(0, 0, 0, 0.06);
}

.photo {
  display: block;
  width: 100%;
  transition: transform 0.4s ease;
}

.masonry-item:hover .photo {
  transform: scale(1.04);
}

/* 悬停遮罩：标题 */
.overlay {
  position: absolute;
  inset: 0;
  display: flex;
  align-items: flex-end;
  padding: 14px;
  color: #fff;
  background: linear-gradient(180deg, rgba(0, 0, 0, 0) 45%, rgba(0, 0, 0, 0.62));
  opacity: 0;
  transition: opacity 0.25s;
}

.masonry-item:hover .overlay {
  opacity: 1;
}

.overlay-title {
  font-size: 15px;
  font-weight: 600;
}

/* 灯箱 */
.lightbox {
  position: fixed;
  inset: 0;
  z-index: 2000;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
  padding: 40px;
  background: rgba(12, 18, 26, 0.9);
  backdrop-filter: blur(4px);
}

.lightbox-figure {
  margin: 0;
  max-width: min(1100px, 88vw);
  text-align: center;
}

.lightbox-img {
  max-width: 100%;
  max-height: 80vh;
  border-radius: 8px;
  box-shadow: 0 12px 40px rgba(0, 0, 0, 0.45);
}

.lightbox-caption {
  margin-top: 14px;
  color: #e8eef4;
  font-size: 14px;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12px;
}

.lightbox-index {
  color: #95a5a6;
  font-size: 12px;
}

.lightbox-close {
  position: absolute;
  top: 20px;
  right: 24px;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 22px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s;
}

.lightbox-close:hover {
  background: rgba(255, 255, 255, 0.24);
}

.lightbox-nav {
  width: 44px;
  height: 44px;
  flex-shrink: 0;
  border: none;
  border-radius: 50%;
  background: rgba(255, 255, 255, 0.12);
  color: #fff;
  font-size: 26px;
  line-height: 1;
  cursor: pointer;
  transition: background-color 0.2s;
}

.lightbox-nav:hover {
  background: rgba(255, 255, 255, 0.24);
}

/* 响应式列数 */
@media (max-width: 1200px) {
  .masonry {
    columns: 3;
  }
}

@media (max-width: 900px) {
  .masonry {
    columns: 2;
  }
}

@media (max-width: 560px) {
  .masonry {
    columns: 1;
  }
}
</style>
