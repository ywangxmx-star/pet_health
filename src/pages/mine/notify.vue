<template>
  <view class="page narrow">
    <web-side-nav />
    <view v-if="notes.length" class="toolbar">
      <view
        class="btn-secondary read-all"
        :class="{ 'is-disabled': !hasUnread || marking }"
        @click="markAllRead"
      >{{ marking ? '处理中…' : '全部已读' }}</view>
    </view>
    <view v-if="!notes.length && !loading" class="card muted empty">暂无通知</view>
    <view v-for="n in notes" :key="n.id" class="card" :class="{ 'is-unread': !n.readAt }" @click="markRead(n)">
      <view class="menu-title">{{ n.title }}</view>
      <view class="muted">{{ n.body }}</view>
      <view class="muted xs">{{ formatTime(n.createdAt) }}</view>
    </view>
    <view v-if="notes.length" class="more muted" :class="endClass">{{ moreText }}</view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { api } from '../../api/request.js'
import { usePager } from '../../utils/pager.js'

const pager = usePager((page) => api.notifications(page))
const notes = pager.list
const loading = pager.loading
const moreText = pager.moreText
const endClass = pager.endClass
const marking = ref(false)
const hasUnread = computed(() => notes.value.some((n) => !n.readAt))

onShow(() => { pager.load(true) })
onPullDownRefresh(async () => {
  await pager.load(true)
  uni.stopPullDownRefresh()
})

async function markRead(n) {
  if (n.readAt) return
  try {
    await api.readNotification(n.id)
    n.readAt = new Date().toISOString()
  } catch (e) {}
}

async function markAllRead() {
  if (!hasUnread.value || marking.value) return
  marking.value = true
  try {
    await api.readAllNotifications()
    const now = new Date().toISOString()
    notes.value.forEach((n) => {
      if (!n.readAt) n.readAt = now
    })
    uni.showToast({ title: '已全部已读' })
  } catch (e) {
  } finally {
    marking.value = false
  }
}

function formatTime(t) {
  if (!t) return ''
  return String(t).replace('T', ' ').slice(0, 16)
}
</script>

<style scoped>
.toolbar { margin-bottom: 8rpx; display: flex; justify-content: flex-end; }
.read-all {
  min-width: 0; padding: 0 28rpx; height: 64rpx; font-size: 24rpx;
  display: flex; align-items: center; justify-content: center;
}
.menu-title { font-weight: 700; color: #1f2a25; }
.more { text-align: center; padding: 8rpx 0 16rpx; font-size: 24rpx; }
.empty { text-align: center; padding: 48rpx 24rpx; }
.is-unread { border-left: 6rpx solid #3f7d64; }
.xs { font-size: 20rpx; margin-top: 8rpx; }
.is-disabled { opacity: 0.45; pointer-events: none; }
</style>
