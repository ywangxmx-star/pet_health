<template>
  <view class="page">
    <web-side-nav />
    <view class="card">
      <view class="section-title">家庭成员</view>
      <view v-if="loading && !members.length" class="muted">加载中…</view>
      <view v-for="m in members" :key="m.userId" class="list-item member-item">
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
      <view v-if="!loading && !members.length" class="muted" style="padding: 16rpx 0">暂无成员</view>
      <view v-if="members.length" class="more muted" :class="endClass">{{ moreText }}</view>

      <view class="btn-primary" style="margin-top: 24rpx" @click="invite">生成邀请码</view>
      <view class="btn-secondary" style="margin-top: 16rpx" @click="join">加入家庭</view>
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
.member-item { padding: 16rpx 0; border-bottom: 1rpx solid #fce7f3; }
.more { text-align: center; padding: 16rpx 0 0; font-size: 24rpx; }
.member-item:last-of-type { border-bottom: none; }
.member { display: flex; align-items: center; gap: 16rpx; width: 100%; }
.flex1 { flex: 1; min-width: 0; }
.avatar.sm { width: 72rpx; height: 72rpx; border-radius: 22rpx; flex-shrink: 0; }
.name-row { display: flex; align-items: center; gap: 12rpx; }
.name { font-weight: 600; color: #831843; }
.badge {
  font-size: 18rpx; color: #f472b6; border: 1rpx solid #f9a8d4;
  border-radius: 999rpx; padding: 0 10rpx;
}
.xs { font-size: 20rpx; margin-top: 6rpx; }
.btn-text { background: transparent; padding: 8rpx 12rpx; font-size: 22rpx; }
.danger-txt { color: #dc2626; }
.invite-box {
  margin-top: 24rpx; padding: 20rpx; background: #fce7f3; border-radius: 24rpx;
  display: flex; flex-direction: column; gap: 8rpx;
}
.code {
  font-family: 'Varela Round', monospace; font-size: 36rpx; color: #f472b6; letter-spacing: 0.12em;
}
</style>
