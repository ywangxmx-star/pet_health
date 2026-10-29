<template>
  <view class="page">
    <web-side-nav />
    <view class="card profile">
      <view class="avatar-wrap" :class="{ 'is-disabled': uploadingAvatar }" @click="pickAvatar">
        <image class="avatar lg" :src="avatarSrc" mode="aspectFill" />
        <view v-if="user" class="avatar-tip">{{ uploadingAvatar ? '上传中' : '换头像' }}</view>
      </view>
      <view class="flex1">
        <template v-if="user">
          <input
            v-if="editingNick"
            class="name-input"
            v-model="nickname"
            maxlength="20"
            :focus="editingNick"
            placeholder="输入昵称"
            placeholder-class="ph"
            confirm-type="done"
            @blur="onNickBlur"
            @confirm="onNickBlur"
          />
          <view v-else class="name name-tap" @click="startEditNick">{{ nickname || '点击设置昵称' }}</view>
          <view class="muted">邮箱：{{ user.email || '未绑定' }}</view>
        </template>
        <template v-else>
          <view class="name">游客</view>
          <view class="muted">登录后可管理宠物与提醒</view>
        </template>
        <view class="muted" v-if="familyId">家庭 ID：{{ familyId }}</view>
      </view>
    </view>

    <view v-if="!user" class="card">
      <view class="muted" style="margin-bottom: 16rpx">登录后可管理宠物、提醒与家庭共享</view>
      <view class="btn-primary" @click="goLogin">登录 / 注册</view>
    </view>

    <view v-else class="mine-desk">
      <view class="mine-col">
      <view class="card card-tap menu" @click="goFamily">
        <view>
          <view class="menu-title">家庭管理</view>
          <view class="muted">成员与邀请</view>
        </view>
        <view class="chevron">›</view>
      </view>

      <view class="card card-tap menu" @click="goGuide">
        <view>
          <view class="menu-title">照护引导</view>
          <view class="muted">档案 / 提醒设置指引</view>
        </view>
        <view class="chevron">›</view>
      </view>

      <view class="card card-tap menu" @click="goFeedback">
        <view>
          <view class="menu-title">意见反馈</view>
          <view class="muted">文字 + 图片，最多 3 张</view>
        </view>
        <view class="chevron">›</view>
      </view>

      <!-- web 端账号同步：暂时注释
      <view class="card">
        <view class="menu-title">绑定邮箱</view>
        <view class="muted" style="margin: 8rpx 0 16rpx">微信与 Web 共用同一账号（邮箱验证码免费）</view>
        <view class="field">
          <input class="input" v-model="bindEmail" maxlength="64" placeholder="邮箱" placeholder-class="ph" />
        </view>
        <view class="code-row">
          <input class="input flex" v-model="bindCode" type="number" maxlength="6" placeholder="验证码" placeholder-class="ph" />
          <view class="btn-secondary code-btn" :class="{ 'is-disabled': bindCd > 0 || !bindEmail.trim() }" @click="sendBindCode">{{ bindCd > 0 ? bindCd + 's' : '获取' }}</view>
        </view>
        <view class="btn-primary" style="margin-top: 12rpx" :class="{ 'is-disabled': !bindEmail.trim() || !bindCode }" @click="doBind">绑定</view>
      </view>
      -->
      </view>

      <view class="mine-col">
      <view class="card card-tap menu" @click="goNotify">
        <view>
          <view class="menu-title">通知<text v-if="unread" class="badge-dot">{{ unread }}</text></view>
          <view class="muted">查看提醒消息</view>
        </view>
        <view class="chevron">›</view>
      </view>
      </view>
    </view>

    <view class="card card-tap menu" @click="goPrivacy">
      <view class="menu-title">隐私政策</view>
      <view class="chevron">›</view>
    </view>
    <view class="card card-tap menu" @click="goDisclaimer">
      <view class="menu-title">免责声明</view>
      <view class="chevron">›</view>
    </view>
    <view class="card card-tap menu" @click="goWikiLicense">
      <view class="menu-title">维基内容许可</view>
      <view class="chevron">›</view>
    </view>
    <view class="disclaimer muted">本应用仅供养宠事务提醒与笔记，不能替代执业兽医。</view>
    <view v-if="user" class="btn-secondary danger" @click="logout">退出登录</view>
  </view>
</template>

<script setup>
import { ref, computed, onUnmounted } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api, ensureFamily, uploadFile } from '../../api/request.js'
import { useUserStore } from '../../stores/user.js'
import { userAvatar } from '../../utils/media.js'

const emailRe = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const store = useUserStore()
const user = ref(null)
const familyId = ref('')
const unread = ref(0)
const bindEmail = ref('')
const bindCode = ref('')
const bindCd = ref(0)
const nickname = ref('')
const editingNick = ref(false)
const uploadingAvatar = ref(false)
const localAvatar = ref('')
const avatarSrc = computed(() => localAvatar.value || userAvatar(user.value?.avatar))
let savingNick = false
let timer = null

onUnmounted(() => { if (timer) clearInterval(timer) })

onShow(async () => {
  editingNick.value = false
  familyId.value = String(uni.getStorageSync('familyId') || '')
  if (!uni.getStorageSync('accessToken')) {
    user.value = null
    unread.value = 0
    return
  }
  try {
    await ensureFamily()
    familyId.value = String(uni.getStorageSync('familyId') || '')
    user.value = await api.profile()
    if (user.value) {
      if (user.value.email) bindEmail.value = user.value.email
      nickname.value = user.value.nickname || ''
    }
    await refreshUnread()
  } catch (e) {
    user.value = null
  }
})

function startBindCd() {
  bindCd.value = 60
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    bindCd.value--
    if (bindCd.value <= 0) { clearInterval(timer); timer = null }
  }, 1000)
}

function startEditNick() {
  nickname.value = user.value?.nickname || ''
  editingNick.value = true
}

function pickAvatar() {
  if (!user.value || uploadingAvatar.value) return
  uni.chooseImage({
    count: 1,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: async (res) => {
      const path = (res.tempFilePaths || [])[0]
      if (!path) return
      uploadingAvatar.value = true
      localAvatar.value = path
      try {
        const data = await uploadFile(path, 'avatar')
        const url = data && data.url
        if (!url) throw new Error('no url')
        await api.updateAvatar(url)
        user.value = await api.profile()
        localAvatar.value = ''
        uni.showToast({ title: '头像已更新' })
      } catch (e) {
        localAvatar.value = ''
      } finally {
        uploadingAvatar.value = false
      }
    }
  })
}

async function onNickBlur() {
  if (!editingNick.value || savingNick) return
  editingNick.value = false
  const next = nickname.value.trim()
  if (!next) {
    nickname.value = user.value?.nickname || ''
    return
  }
  if (next === user.value?.nickname) return
  savingNick = true
  try {
    await api.updateNickname(next)
    user.value = await api.profile()
    nickname.value = user.value?.nickname || next
    uni.showToast({ title: '已保存' })
  } catch (e) {
    nickname.value = user.value?.nickname || ''
  } finally {
    savingNick = false
  }
}

async function sendBindCode() {
  if (bindCd.value > 0) return
  if (!emailRe.test(bindEmail.value.trim())) {
    uni.showToast({ title: '邮箱不正确', icon: 'none' })
    return
  }
  try {
    const data = await api.sendEmailCode(bindEmail.value.trim())
    if (data && data.devCode) bindCode.value = data.devCode
    uni.showToast({ title: '已发送', icon: 'none' })
    startBindCd()
  } catch (e) {}
}

async function doBind() {
  if (!bindEmail.value.trim() || !bindCode.value) return
  try {
    await api.bindEmail({ email: bindEmail.value.trim(), code: bindCode.value })
    user.value = await api.profile()
    uni.showToast({ title: '绑定成功' })
  } catch (e) {}
}

async function refreshUnread() {
  try {
    const data = await api.notifications(1)
    const rows = Array.isArray(data) ? data : ((data && data.list) || [])
    unread.value = rows.filter((n) => !n.readAt).length
  } catch (e) {
    unread.value = 0
  }
}

function goLogin() { uni.navigateTo({ url: '/pages/login/login' }) }
function goFamily() { uni.navigateTo({ url: '/pages/family/index' }) }
function goGuide() { uni.navigateTo({ url: '/pages/guide/index' }) }
function goFeedback() { uni.navigateTo({ url: '/pages/feedback/index' }) }
function goNotify() { uni.navigateTo({ url: '/pages/mine/notify' }) }
function goPrivacy() { uni.navigateTo({ url: '/pages/legal/privacy' }) }
function goDisclaimer() { uni.navigateTo({ url: '/pages/legal/disclaimer' }) }
function goWikiLicense() { uni.navigateTo({ url: '/pages/legal/wiki-license' }) }

function logout() {
  uni.showModal({
    title: '确认退出？',
    success: (res) => {
      if (!res.confirm) return
      store.logout()
      user.value = null
      uni.switchTab({ url: '/pages/index/index' })
    }
  })
}
</script>

<style scoped>
.profile { display: flex; align-items: center; gap: 24rpx; }
.flex1 { flex: 1; min-width: 0; }
.avatar-wrap { position: relative; flex-shrink: 0; }
.avatar.lg { width: 112rpx; height: 112rpx; border-radius: 32rpx; display: block; }
.avatar-tip {
  position: absolute; left: 0; right: 0; bottom: 0;
  height: 36rpx; line-height: 36rpx; text-align: center;
  font-size: 18rpx; color: #fff; background: rgba(131, 24, 67, 0.55);
  border-radius: 0 0 32rpx 32rpx;
}
.name { font-family: 'Varela Round', sans-serif; font-size: 36rpx; color: #831843; margin-bottom: 6rpx; }
.name-tap { display: inline-block; max-width: 100%; }
.name-input {
  font-family: 'Varela Round', sans-serif; font-size: 36rpx; color: #831843;
  height: 48rpx; line-height: 48rpx; margin-bottom: 6rpx; padding: 0;
  background: transparent; border: none; border-bottom: 2rpx solid #f9a8d4; width: 100%;
  box-sizing: border-box;
}
.menu { display: flex; align-items: center; justify-content: space-between; }
.menu-title { font-weight: 700; color: #831843; }
.chevron { color: #f9a8d4; font-size: 40rpx; }
.danger { color: #dc2626; background: #fef2f2; margin-top: 8rpx; }
.disclaimer { text-align: center; padding: 24rpx 16rpx 8rpx; }
.badge-dot {
  display: inline-block; margin-left: 8rpx; min-width: 32rpx; padding: 0 8rpx;
  height: 32rpx; line-height: 32rpx; text-align: center;
  background: #f472b6; color: #fff; border-radius: 999rpx; font-size: 20rpx;
}
.ph { color: #94a3b8; line-height: inherit; }
.is-disabled { opacity: 0.45; pointer-events: none; }

/* #ifdef H5 */
@media (min-width: 900px) {
  .profile { padding: 28px; }
  .avatar.lg { width: 88px; height: 88px; border-radius: 24px; }
  .name, .name-input { font-size: 24px; }
  .name-input { height: 32px; line-height: 32px; }
  .mine-desk {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 20px;
    align-items: start;
  }
  .mine-col .card { margin-bottom: 16px; }
}
/* #endif */
</style>
