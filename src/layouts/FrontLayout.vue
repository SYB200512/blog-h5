<template>
  <div class="front-layout">
    <!-- 全屏 Hero 头部 -->
    <header class="header" :class="{ 'header-compact': isCompactPage }">
      <div
        class="header-nav"
        :class="{ 'header-nav-scrolled': isScrolled, 'header-nav-hidden': !navVisible }"
      >
        <!-- Sunvyn 作为后台入口：后台为独立 SPA，新窗口打开；开发指向 5174，部署指向 /admin/ -->
        <a :href="adminUrl" target="_blank" rel="noopener" class="logo" title="后台管理">
          <el-icon :size="24"><Reading /></el-icon>
          <span>Sunvyn</span>
        </a>
        <div class="header-right">
          <nav class="nav">
            <router-link to="/" class="nav-item">首页</router-link>
            <router-link to="/archive" class="nav-item">归档</router-link>
            <router-link to="/categories" class="nav-item">分类</router-link>
            <router-link to="/photos" class="nav-item">图片</router-link>
          </nav>
          <!-- 背景音乐：点击播放/暂停，悬停显示音量调节 -->
          <div
            class="music-player"
            @mouseenter="showVolume = true"
            @mouseleave="showVolume = false"
          >
            <button
              type="button"
              class="music-btn"
              :class="{ 'is-playing': isPlaying }"
              :title="isPlaying ? '暂停背景音乐' : '播放背景音乐'"
              @click="togglePlay"
            >
              <el-icon :size="20">
                <VideoPause v-if="isPlaying" />
                <Headset v-else />
              </el-icon>
            </button>
            <div class="volume-panel" :class="{ open: showVolume }">
              <el-icon :size="14" class="vol-icon"><Mute /></el-icon>
              <input
                v-model.number="volume"
                type="range"
                class="volume-slider"
                min="0"
                max="1"
                step="0.01"
                @input="setVolume"
              />
              <span class="vol-percent">{{ Math.round(volume * 100) }}%</span>
            </div>
            <audio
              ref="audioRef"
              :src="musicUrl"
              loop
              preload="auto"
              @play="isPlaying = true"
              @pause="isPlaying = false"
            />
          </div>
        </div>
      </div>
      <!-- Hero 文案：归档/分类页固定显示页面标题，无副标题；其他页保持打字机 -->
      <div class="hero">
        <h1 v-if="isCompactPage" class="hero-title">{{ heroTitle }}</h1>
        <template v-else>
          <h1 class="hero-title">
            {{ displayTitle }}
            <span v-if="titleCursor" class="cursor">|</span>
          </h1>
          <p class="hero-subtitle">
            {{ displaySubtitle }}
            <span v-if="subtitleCursor" class="cursor">|</span>
          </p>
        </template>
      </div>
    </header>

    <!-- 内容区：归档页与分类页强制撑满容器（容器上限仍沿用 1200px） -->
    <main class="container main" :class="{ 'container-wide': isWidePage }">
      <router-view />
    </main>

    <!-- 底部 -->
    <footer class="footer">
      <div class="container">
        <p class="footer-text">
          © {{ currentYear }} Sunvyn
          <span class="footer-heart">❤️</span>
          <a href="https://beian.miit.gov.cn/" target="_blank" rel="noopener" class="footer-beian">
            豫ICP备2026044888号-1
          </a>
        </p>
      </div>
    </footer>
  </div>
</template>

<script setup>
import { ref, computed, onMounted, onBeforeUnmount } from 'vue'
import { useRoute } from 'vue-router'

const route = useRoute()
const currentYear = new Date().getFullYear()

// 归档、分类、图片页面：Hero 压缩，正文块随之上移
const isCompactPage = computed(
  () =>
    route.path === '/archive' ||
    route.path === '/categories' ||
    route.path === '/photos' ||
    route.path.startsWith('/category/')
)

// 压缩页 Hero 标题：复用路由 meta（归档 / 分类）
const heroTitle = computed(() => (isCompactPage.value ? route.meta.title : ''))

// 带侧栏的宽版页面：归档 / 分类列表 / 图片墙（撑满容器宽度）
const isWidePage = computed(
  () =>
    route.path === '/archive' ||
    route.path === '/categories' ||
    route.path === '/photos' ||
    route.path.startsWith('/category/')
)

// 后台管理地址：开发环境为独立 dev server(5174)，生产为 /admin/ 路径
const adminUrl = import.meta.env.DEV ? 'http://localhost:5174/' : '/admin/'

// ===== 背景音乐 =====
const audioRef = ref(null)
const isPlaying = ref(false)
const volume = ref(0.7)
const showVolume = ref(false)
// 本地音乐文件：位于 frontend/public/music/background-music.ogg
const musicUrl = '/music/background-music.ogg'

const togglePlay = () => {
  const audio = audioRef.value
  if (!audio) return
  if (audio.paused) {
    audio.play().catch(() => {
      isPlaying.value = false
    })
  } else {
    audio.pause()
  }
}

const setVolume = () => {
  const audio = audioRef.value
  if (audio) audio.volume = volume.value
}

// ===== 标题：打字一次后固定保留，不参与循环消失 =====
const fullTitle = 'Sunvyn'
const fullSubtitle = 'The palest ink is better than the best memory'

const titleText = ref('')
const titleCursor = ref(false)
// 副标题：独立循环打字机
const subtitleText = ref('')
const subtitleCursor = ref(false)
// 动画开始前（含 SSR 预渲染阶段）显示完整文字，保证 SEO 与首屏可读
const started = ref(false)
const displayTitle = computed(() => (started.value ? titleText.value : fullTitle))
const displaySubtitle = computed(() => (started.value ? subtitleText.value : fullSubtitle))

// header-nav 滚动状态：滚动后显示毛玻璃背景
const isScrolled = ref(false)
// nav 是否可见：顶部/上滑时显示，下滑时隐藏
const navVisible = ref(true)

let timers = []
let cancelled = false

const sleep = (ms) =>
  new Promise((resolve) => {
    if (cancelled) return resolve()
    timers.push(setTimeout(resolve, ms))
  })

// 标题：逐字打出一次后永久保留
const runTitleOnce = async () => {
  titleText.value = ''
  titleCursor.value = true
  await sleep(300)
  for (let i = 1; i <= fullTitle.length && !cancelled; i++) {
    titleText.value = fullTitle.slice(0, i)
    await sleep(90)
  }
  titleCursor.value = false
}

// 副标题：打字 -> 停留 -> 打字机快速删除 -> 重新打字，无限循环
const runSubtitle = async () => {
  while (!cancelled) {
    subtitleText.value = ''
    subtitleCursor.value = true
    await sleep(300)
    // 出现：逐字打出（较慢）
    for (let i = 1; i <= fullSubtitle.length && !cancelled; i++) {
      subtitleText.value = fullSubtitle.slice(0, i)
      await sleep(70)
    }
    // 完整显示后停留
    await sleep(2500)
    if (cancelled) return
    // 消失：打字机样式逐字删除（速度比出现快）
    for (let i = fullSubtitle.length; i > 0 && !cancelled; i--) {
      subtitleText.value = fullSubtitle.slice(0, i - 1)
      await sleep(35)
    }
    subtitleCursor.value = false
    await sleep(300)
  }
}

let lastScrollY = 0

// 滚动方向控制：顶部显示；下滑隐藏；非顶端的非上述情况（上滑）时出现
const handleScroll = () => {
  const current = window.scrollY
  if (current <= 0) {
    // 回到顶部：显示导航，透明
    isScrolled.value = false
    navVisible.value = true
  } else if (current < lastScrollY) {
    // 上滑（非顶端）：出现毛玻璃，显示导航
    isScrolled.value = true
    navVisible.value = true
  } else if (current > lastScrollY) {
    // 下滑：恢复透明，隐藏导航
    isScrolled.value = false
    navVisible.value = false
  }
  lastScrollY = current
}

onMounted(() => {
  started.value = true
  runTitleOnce()
  runSubtitle()
  handleScroll()
  if (audioRef.value) audioRef.value.volume = volume.value
  window.addEventListener('scroll', handleScroll, { passive: true })
})

onBeforeUnmount(() => {
  cancelled = true
  timers.forEach(clearTimeout)
  timers = []
  window.removeEventListener('scroll', handleScroll)
})
</script>

<style scoped>
.front-layout {
  min-height: 100vh;
  display: flex;
  flex-direction: column;
}

.header {
  position: relative;
  height: 100vh;
  min-height: 560px;
  display: flex;
  flex-direction: column;
  color: #fff;
  background-image: url('/images/blog-picture.png');
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
  /* 背景图固定不动：滚动时 hero 内容向上滚走，页面内容覆盖上来 */
  background-attachment: fixed;
  /* 归档页切换时高度平滑过渡 */
  transition: height 0.4s ease, min-height 0.4s ease;
}

/* 归档页：Hero 压缩到视口 30%，正文块随之上升到页面 30% 位置 */
.header.header-compact {
  height: 30vh;
  min-height: 220px;
}

/* 压缩后 Hero 文案适当缩小，避免溢出 */
.header-compact .hero-title {
  font-size: 40px;
  letter-spacing: 3px;
}

.header-compact .hero-subtitle {
  margin-top: 10px;
  font-size: 18px;
}

.header::before {
  content: '';
  position: absolute;
  inset: 0;
  /* 半透明遮罩，保证导航与文案可读性 */
  background: rgba(0, 0, 0, 0.35);
}

.header-nav {
  /* 固定在视口顶部，始终可见 */
  position: fixed;
  top: 0;
  left: 50%;
  transform: translateX(-50%);
  z-index: 20;
  display: flex;
  align-items: center;
  justify-content: space-between;
  /* 与 div.hero 宽度保持一致：贯穿视口，左右各留 16px */
  width: 100%;
  padding: 0 16px;
  height: 60px;
  border-radius: 0 0 14px 14px;
  /* 滚动后毛玻璃背景平滑过渡 */
  transition: transform 0.3s ease, background-color 0.3s ease,
    box-shadow 0.3s ease;
}

/* 下滑隐藏导航：向上滑出视口 */
.header-nav-hidden {
  transform: translateX(-50%) translateY(-100%);
}

/* 离开顶部后：浅透明毛玻璃背景（上滑时一直保持出现） */
.header-nav-scrolled {
  background-color: rgba(255, 255, 255, 0.12);
  backdrop-filter: blur(12px);
  -webkit-backdrop-filter: blur(12px);
  box-shadow: 0 2px 12px rgba(0, 0, 0, 0.15);
}

.logo {
  display: flex;
  align-items: center;
  gap: 8px;
  font-size: 20px;
  font-weight: 700;
  color: #fff;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
}

.header-right {
  display: flex;
  align-items: center;
  gap: 20px;
}

/* 背景音乐播放按钮 */
.music-player {
  position: relative;
  display: flex;
  align-items: center;
}

.music-btn {
  display: flex;
  align-items: center;
  justify-content: center;
  width: 36px;
  height: 36px;
  border: none;
  border-radius: 50%;
  color: #fff;
  background-color: rgba(255, 255, 255, 0.16);
  cursor: pointer;
  transition: background-color 0.2s, transform 0.2s;
}

.music-btn:hover {
  background-color: rgba(255, 255, 255, 0.32);
  transform: scale(1.08);
}

/* 音量调节面板：默认隐藏，悬停淡入 */
.volume-panel {
  position: absolute;
  top: calc(100% + 10px);
  right: 0;
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 8px 12px;
  border-radius: 12px;
  background-color: rgba(0, 0, 0, 0.55);
  backdrop-filter: blur(8px);
  -webkit-backdrop-filter: blur(8px);
  box-shadow: 0 4px 16px rgba(0, 0, 0, 0.25);
  opacity: 0;
  visibility: hidden;
  transform: translateY(-6px);
  transition: opacity 0.2s, transform 0.2s, visibility 0.2s;
  white-space: nowrap;
}

.volume-panel.open {
  opacity: 1;
  visibility: visible;
  transform: translateY(0);
}

.vol-icon {
  color: #fff;
  flex-shrink: 0;
}

.vol-percent {
  color: #fff;
  font-size: 12px;
  min-width: 34px;
  text-align: right;
}

/* 音量滑动条 */
.volume-slider {
  -webkit-appearance: none;
  appearance: none;
  width: 90px;
  height: 4px;
  border-radius: 2px;
  background: rgba(255, 255, 255, 0.35);
  outline: none;
  cursor: pointer;
}

.volume-slider::-webkit-slider-thumb {
  -webkit-appearance: none;
  appearance: none;
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  border: none;
}

.volume-slider::-moz-range-thumb {
  width: 12px;
  height: 12px;
  border-radius: 50%;
  background: #fff;
  border: none;
}

.nav {
  display: flex;
  gap: 24px;
}

.nav-item {
  color: #fff;
  font-size: 15px;
  padding: 4px 0;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.4);
  transition: opacity 0.2s;
}

.nav-item:hover,
.nav-item.router-link-exact-active {
  opacity: 0.8;
  border-bottom: 2px solid #fff;
}

/* Hero 文案：垂直居中 */
.hero {
  position: relative;
  z-index: 1;
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  text-align: center;
  padding: 0 16px;
}

.hero-title {
  font-size: 52px;
  font-weight: 700;
  text-shadow: 0 2px 8px rgba(0, 0, 0, 0.5);
  letter-spacing: 4px;
}

.hero-subtitle {
  margin-top: 16px;
  font-size: 22px;
  letter-spacing: 2px;
  max-width: 90%;
  text-shadow: 0 1px 4px rgba(0, 0, 0, 0.5);
  opacity: 0.92;
  /* 占位高度：打字机删除到空时保持一行高度，标题不晃动 */
  min-height: 1.6em;
}

/* 打字机光标 */
.cursor {
  display: inline-block;
  margin-left: 2px;
  font-weight: 400;
  animation: blink 0.8s step-end infinite;
}

@keyframes blink {
  0%,
  100% {
    opacity: 1;
  }
  50% {
    opacity: 0;
  }
}

.main {
  flex: 1;
  padding: 24px 16px;
}

/* 归档页：撑满容器宽度；上限仍由 .container 的 1200px 控制 */
.container-wide {
  width: 100%;
}

.footer {
  background: #fff;
  border-top: 1px solid #eee;
  padding: 20px 0;
  text-align: center;
  color: #999;
  font-size: 14px;
}

/* 底部文案：© 年份 Sunvyn ❤ 备案号 */
.footer-text {
  margin: 0;
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 14px;
  flex-wrap: wrap;
  letter-spacing: 0.5px;
}

.footer-heart {
  font-size: 16px;
  line-height: 1;
}

.footer-beian {
  color: #999;
  transition: color 0.2s;
}

.footer-beian:hover {
  color: #409eff;
}

@media (max-width: 768px) {
  .nav {
    gap: 12px;
  }
  .header-right {
    gap: 10px;
  }
  .volume-slider {
    width: 60px;
  }
  .hero-title {
    font-size: 36px;
    letter-spacing: 2px;
  }
  .hero-subtitle {
    font-size: 16px;
    letter-spacing: 1px;
  }
}
</style>
