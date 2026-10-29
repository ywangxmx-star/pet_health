<template>
  <view class="page">
    <web-side-nav />
    <view v-if="!loggedIn" class="card">
      <view class="empty">
        <image class="empty-img" src="/static/illus/empty-pet.png" mode="aspectFit" />
        <view class="empty-title">登录后管理宠物</view>
        <view class="muted">登录后可管理档案与提醒</view>
      </view>
      <view class="btn-primary" @click="goLogin">去登录</view>
    </view>

    <template v-else>
      <view class="page-intro">
        <view class="page-intro-text">
          <view class="page-title">我的宠物</view>
          <view class="page-sub">{{ list.length ? `共 ${list.length} 位家庭成员` : '为每一位毛孩子建立档案' }}</view>
        </view>
        <view class="btn-primary" @click="goEdit()">添加</view>
      </view>

      <view v-if="loading && !list.length" class="card muted">加载中…</view>
      <view v-else-if="!loading && !list.length" class="card">
        <view class="empty">
          <image class="empty-img" src="/static/illus/empty-pet.png" mode="aspectFit" />
          <view class="empty-title">还没有宠物</view>
          <view class="muted">添加第一只，开始健康管理</view>
        </view>
      </view>

      <view class="pet-grid">
        <view v-for="p in list" :key="p.id" class="card card-tap pet-card" @click="goDetail(p.id)">
          <image class="avatar" :src="petAvatar(p.species)" mode="aspectFill" />
          <view class="pet-info">
            <view class="pet-name">{{ p.name }}</view>
            <view class="pet-meta">{{ p.species }} · {{ p.breed || '未填品种' }}</view>
          </view>
          <view v-if="p.weight" class="pet-weight">{{ p.weight }}<text class="unit"> kg</text></view>
          <view class="chevron">›</view>
        </view>
      </view>
      <view v-if="list.length" class="more muted" :class="endClass">{{ moreText }}</view>
    </template>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { api, ensureFamily } from '../../api/request.js'
import { petAvatar } from '../../utils/media.js'
import { isLoggedIn, requireLogin } from '../../utils/auth.js'
import { usePager } from '../../utils/pager.js'

const pager = usePager((page) => api.pets(page))
const list = pager.list
const loading = pager.loading
const moreText = pager.moreText
const endClass = pager.endClass
const loggedIn = ref(false)

async function reload() {
  try {
    await ensureFamily()
    await pager.load(true)
  } catch (e) {
    list.value = []
  }
}

onShow(async () => {
  loggedIn.value = isLoggedIn()
  if (!loggedIn.value) {
    list.value = []
    return
  }
  await reload()
})
onPullDownRefresh(async () => {
  if (loggedIn.value) await reload()
  uni.stopPullDownRefresh()
})
function onDirty() { if (isLoggedIn()) reload() }
onMounted(() => { uni.$on('data:dirty', onDirty) })
onUnmounted(() => { uni.$off('data:dirty', onDirty) })
function goDetail(id) { uni.navigateTo({ url: '/pages/pet/detail?id=' + id }) }
function goEdit() {
  if (!requireLogin('添加宠物需要登录')) return
  uni.navigateTo({ url: '/pages/pet/edit' })
}
function goLogin() { uni.navigateTo({ url: '/pages/login/login' }) }
</script>

<style scoped>
.more { text-align: center; padding: 24rpx 0 8rpx; font-size: 24rpx; }
.pet-card { display: flex; align-items: center; gap: 24rpx; padding: 28rpx 32rpx; }
.pet-info { flex: 1; min-width: 0; }
.pet-name { font-weight: 700; font-size: 32rpx; color: var(--ink); line-height: 1.35; }
.pet-meta { font-size: 24rpx; color: var(--muted); margin-top: 4rpx; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
.pet-weight { font-size: 30rpx; font-weight: 700; color: var(--ink); font-variant-numeric: tabular-nums; flex-shrink: 0; }
.pet-weight .unit { font-size: 22rpx; font-weight: 500; color: var(--muted); }
.avatar { width: 96rpx; height: 96rpx; border-radius: 50%; flex-shrink: 0; }
.empty-img { width: 240rpx; height: 240rpx; margin: 0 auto 16rpx; display: block; }
.chevron { color: var(--subtle); font-size: 36rpx; line-height: 1; }

/* #ifdef H5 */
@media (min-width: 900px) {
  .pet-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .pet-card {
    margin-bottom: 0;
    flex-direction: column;
    align-items: flex-start;
    gap: 14px;
    padding: 24px;
    border-radius: 16px;
    position: relative;
  }
  .avatar { width: 64px; height: 64px; }
  .pet-info { width: 100%; }
  .pet-name { font-size: 18px; }
  .pet-meta { font-size: 13px; }
  .pet-weight { font-size: 15px; }
  .pet-weight .unit { font-size: 12px; }
  .chevron { position: absolute; top: 24px; right: 22px; }
}
@media (min-width: 900px) and (max-width: 1100px) {
  .pet-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
/* #endif */
</style>
