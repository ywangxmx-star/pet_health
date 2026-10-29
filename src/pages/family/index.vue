<template>
  <view class="page narrow">
    <web-side-nav />
    <view class="page-intro">
      <view class="page-intro-text">
        <view class="page-title">家庭管理</view>
        <view class="page-sub">与家人共同照顾毛孩子，记录与提醒实时同步</view>
      </view>
    </view>

    <view class="group-label">成员</view>
    <view class="group">
      <view v-if="loading && !members.length" class="group-row muted">加载中…</view>
      <view v-for="m in members" :key="m.userId" class="group-row">
        <view class="member">
          <image class="avatar sm" :src="userAvatar(m.avatar)" mode="aspectFill" />
          <view class="flex1">
            <view class="name-row">
              <text class="name">{{ m.nickname || '未命名' }}</text>
              <text class="badge">{{ m.role === 'owner' ? '管理员' : '成员' }}</text>
            </view>
            <view class="muted xs" v-if="m.joinedAt">加入 {{ formatJoin(m.joinedAt) }}</view>
          </view>
          <view
            v-if="isOwner && m.role !== 'owner'"
            class="btn-text danger-txt"
            @click="remove(m)"
          >移除</view>
        </view>
      </view>
      <view v-if="!loading && !members.length" class="group-row muted">暂无成员</view>
    </view>
    <view v-if="members.length" class="more muted" :class="endClass">{{ moreText }}</view>

    <view class="group-label invite-label">邀请</view>
    <view class="card invite-card">
      <view class="muted invite-hint">生成邀请码发给家人，或输入他人的邀请码加入其家庭。</view>
      <view class="invite-actions">
        <view class="btn-primary" @click="invite">生成邀请码</view>
        <view class="btn-secondary" @click="join">加入家庭</view>
      </view>
      <view v-if="inviteCode" class="invite-box">
        <text class="muted">邀请码已复制到剪贴板（7 天有效）</text>
        <text class="code">{{ inviteCode }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { computed, ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api, ensureFamily, promptText } from '../../api/request.js'
import { requireLogin } from '../../utils/auth.js'
import { usePager } from '../../utils/pager.js'
import { userAvatar } from '../../utils/media.js'

const memPager = usePager((page) => api.members(page))
const members = memPager.list
const loading = memPager.loading
const moreText = memPager.moreText
const endClass = memPager.endClass
const inviteCode = ref('')
const me = ref(null)

const isOwner = computed(() => {
  if (!me.value) return false
  return members.value.some((m) => m.userId === me.value.id && m.role === 'owner')
})

onShow(async () => {
  if (!requireLogin('家庭管理需要登录')) {
    members.value = []
    return
  }
  try {
    await ensureFamily()
    me.value = await api.profile()
    await memPager.load(true)
  } catch (e) {
    members.value = []
  }
})

async function invite() {
  try {
    await ensureFamily()
    const inv = await api.createInvite()
    inviteCode.value = inv.code
    uni.setClipboardData({ data: inv.code })
  } catch (e) {}
}

async function join() {
  const code = await promptText('输入邀请码', '8位邀请码')
  if (!code) return
  try {
    await api.acceptInvite(code)
    const families = await api.families()
    if (families && families.length) {
      const last = families[families.length - 1]
      uni.setStorageSync('familyId', String(last.family.id))
    }
    uni.showToast({ title: '已加入' })
    await memPager.load(true)
  } catch (e) {}
}

async function remove(m) {
  const ok = await new Promise((resolve) => {
    uni.showModal({ title: '移除成员？', content: m.nickname || '该成员', success: (res) => resolve(res.confirm) })
  })
  if (!ok) return
  try {
    await api.removeMember(m.userId)
    await memPager.load(true)
    uni.showToast({ title: '已移除' })
  } catch (e) {}
}

function formatJoin(t) {
  return String(t || '').replace('T', ' ').slice(0, 10)
}
</script>

<style scoped>
.more { text-align: center; padding: 0 0 16rpx; font-size: 24rpx; }
.member { display: flex; align-items: center; gap: 20rpx; width: 100%; }
.flex1 { flex: 1; min-width: 0; }
.avatar.sm { width: 80rpx; height: 80rpx; border-radius: 50%; flex-shrink: 0; }
.name-row { display: flex; align-items: center; gap: 12rpx; }
.name { font-weight: 600; font-size: 30rpx; color: var(--ink); }
.badge {
  font-size: 20rpx; color: var(--brand-strong); background: var(--brand-soft);
  border-radius: 999rpx; padding: 2rpx 14rpx;
}
.xs { font-size: 22rpx; margin-top: 4rpx; }
.btn-text { background: transparent; padding: 8rpx 12rpx; font-size: 24rpx; }
.danger-txt { color: var(--danger); }
.invite-label { margin-top: 24rpx; }
.invite-card { padding: 32rpx; }
.invite-hint { font-size: 24rpx; line-height: 1.6; margin-bottom: 24rpx; }
.invite-actions { display: flex; gap: 16rpx; }
.invite-actions > view { flex: 1; }
.invite-box {
  margin-top: 24rpx; padding: 24rpx; background: var(--brand-soft); border-radius: 20rpx;
  display: flex; flex-direction: column; gap: 8rpx;
}
.code {
  font-weight: 700; font-size: 40rpx; color: var(--brand-strong); letter-spacing: 0.16em;
  font-variant-numeric: tabular-nums;
}
/* #ifdef H5 */
@media (min-width: 900px) {
  .avatar.sm { width: 40px; height: 40px; }
  .name { font-size: 15px; }
  .badge { font-size: 11px; padding: 1px 8px; }
  .xs { font-size: 12px; }
  .btn-text { font-size: 13px; cursor: pointer; }
  .invite-label { margin-top: 12px; }
  .invite-card { padding: 24px; border-radius: 16px; }
  .invite-hint { font-size: 13px; margin-bottom: 18px; }
  .invite-actions { gap: 12px; max-width: 420px; }
  .invite-box { padding: 16px; border-radius: 12px; }
  .code { font-size: 24px; }
}
/* #endif */
</style>
