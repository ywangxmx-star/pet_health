<template>
  <!-- #ifdef H5 -->
  <view class="web-side-nav" aria-label="主导航">
    <view class="nav-brand">
      <image class="nav-logo" src="/static/logo.png" mode="aspectFill" style="width:40px;height:40px" />
      <text class="nav-title">爪爪</text>
    </view>
    <view
      v-for="item in items"
      :key="item.path"
      class="nav-item"
      :class="{ on: current === item.path }"
      role="button"
      tabindex="0"
      @click="go(item.path)"
    >
      <image class="nav-ico" :src="current === item.path ? item.active : item.icon" mode="aspectFit" />
      <text>{{ item.text }}</text>
    </view>
    <view class="nav-foot muted">陪伴 · 守护 · 安心</view>
  </view>
  <!-- #endif -->
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'

const items = [
  { path: '/pages/index/index', text: '首页', icon: '/static/tab/home.png', active: '/static/tab/home-active.png' },
  { path: '/pages/pet/list', text: '宠物', icon: '/static/tab/pet.png', active: '/static/tab/pet-active.png' },
  { path: '/pages/discover/index', text: '百科', icon: '/static/tab/book.png', active: '/static/tab/book-active.png' },
  { path: '/pages/mine/index', text: '我的', icon: '/static/tab/me.png', active: '/static/tab/me-active.png' }
]

const current = ref('')

function sync() {
  // #ifdef H5
  try {
    const hash = (typeof location !== 'undefined' && location.hash) || ''
    const raw = hash.replace(/^#/, '').split('?')[0]
    if (raw) {
      current.value = raw.startsWith('/') ? raw : '/' + raw
      return
    }
  } catch (e) {}
  // #endif
  const pages = getCurrentPages()
  const cur = pages[pages.length - 1]
  const route = cur && (cur.route || '')
  current.value = route ? '/' + String(route).replace(/^\//, '') : ''
}

onShow(sync)
onMounted(() => {
  sync()
  // #ifdef H5
  if (typeof window !== 'undefined') window.addEventListener('hashchange', sync)
  // #endif
})
onUnmounted(() => {
  // #ifdef H5
  if (typeof window !== 'undefined') window.removeEventListener('hashchange', sync)
  // #endif
})

function go(path) {
  if (current.value === path) return
  uni.switchTab({ url: path })
}
</script>

<style scoped>
.web-side-nav {
  display: none;
}
/* #ifdef H5 */
@media (min-width: 900px) {
  .web-side-nav {
    display: flex;
    flex-direction: column;
    position: fixed;
    left: 0;
    top: 0;
    bottom: 0;
    width: 220px;
    z-index: 1000;
    padding: 20px 16px 24px;
    box-sizing: border-box;
    background: #ffffff;
    border-right: 1px solid #fce7f3;
    box-shadow: 4px 0 24px rgba(244, 114, 182, 0.06);
  }
  .nav-brand {
    display: flex;
    flex-direction: row;
    align-items: center;
    gap: 10px;
    padding: 8px 10px 24px;
    box-sizing: border-box;
    width: 100%;
  }
  .nav-logo {
    width: 40px !important;
    height: 40px !important;
    flex: 0 0 40px !important;
    border-radius: 12px;
    display: block;
  }
  .nav-title {
    font-family: 'Varela Round', 'Nunito Sans', sans-serif;
    font-size: 20px;
    font-weight: 700;
    color: #f472b6;
    line-height: 1.2;
    white-space: nowrap;
    flex: 1;
    overflow: hidden;
    text-overflow: ellipsis;
  }
  .nav-item {
    display: flex;
    align-items: center;
    gap: 12px;
    padding: 12px 14px;
    margin-bottom: 6px;
    border-radius: 14px;
    color: #64748b;
    font-size: 15px;
    font-weight: 600;
    cursor: pointer;
    transition: background 160ms ease, color 160ms ease, transform 160ms ease;
    min-height: 48px;
  }
  .nav-item:hover {
    background: #fdf2f8;
    color: #9d174d;
  }
  .nav-item.on {
    background: #fce7f3;
    color: #f472b6;
  }
  .nav-item:active {
    transform: scale(0.98);
  }
  .nav-ico {
    width: 22px;
    height: 22px;
  }
  .nav-foot {
    margin-top: auto;
    padding: 16px 12px 0;
    font-size: 12px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .nav-item { transition: none; }
}
/* #endif */
</style>
