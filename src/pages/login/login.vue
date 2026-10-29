<template>
  <view class="page login-page">
    <view class="login-desk">
      <view class="login-panel">
        <image class="logo-mark" src="/static/logo.png" mode="aspectFill" />
        <view class="hero-brand">爪爪</view>
        <view class="hero-sub">陪伴 · 守护 · 安心成长</view>
        <view class="panel-muted muted">养宠日常，记在爪爪</view>
      </view>

      <view class="card login-card">
        <!-- #ifdef MP-WEIXIN -->
        <view class="agree" @click="agreed = !agreed">
          <view class="check" :class="{ on: agreed }"></view>
          <view class="agree-txt">
            我已阅读并同意
            <text class="link" @click.stop="goPrivacy">《隐私政策》</text>
            与
            <text class="link" @click.stop="goDisclaimer">《免责声明》</text>
          </view>
        </view>

        <view class="btn-primary" :class="{ 'is-disabled': loading }" @click="wxLogin">{{ loading ? '登录中…' : '微信一键登录' }}</view>
        <view class="hint muted">登录非强制，可先浏览百科</view>
        <!-- #endif -->

        <!-- #ifdef H5 -->
        <view class="field">
          <text class="field-label">邮箱</text>
          <input v-model="email" class="input" type="text" maxlength="64" placeholder="请输入邮箱" placeholder-class="ph" />
        </view>
        <view class="field">
          <text class="field-label">验证码</text>
          <view class="code-row">
            <input v-model="code" class="input code-input" type="number" maxlength="6" placeholder="6 位验证码" placeholder-class="ph" />
            <view class="btn-secondary code-btn" :class="{ 'is-disabled': sending || cd > 0 }" @click="sendCode">{{ cd > 0 ? cd + 's' : tip }}</view>
          </view>
        </view>

        <view class="agree" @click="agreed = !agreed">
          <view class="check" :class="{ on: agreed }"></view>
          <view class="agree-txt">
            我已阅读并同意
            <text class="link" @click.stop="goPrivacy">《隐私政策》</text>
            与
            <text class="link" @click.stop="goDisclaimer">《免责声明》</text>
          </view>
        </view>

        <view class="btn-primary" :class="{ 'is-disabled': loading }" @click="login">{{ loading ? '登录中…' : '登录 / 注册' }}</view>
        <!-- #endif -->

        <view class="btn-ghost skip" @click="skip">先逛逛，暂不登录</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onUnmounted } from 'vue'
import { api, ensureFamily } from '../../api/request.js'
import { useUserStore } from '../../stores/user.js'

const emailRe = /^[a-zA-Z0-9._%+\-]+@[a-zA-Z0-9.\-]+\.[a-zA-Z]{2,}$/
const email = ref('')
const code = ref('')
const tip = ref('获取验证码')
const sending = ref(false)
const loading = ref(false)
const agreed = ref(false)
const cd = ref(0)
let timer = null
const store = useUserStore()

onUnmounted(() => { if (timer) clearInterval(timer) })

function startCountdown() {
  cd.value = 60
  if (timer) clearInterval(timer)
  timer = setInterval(() => {
    cd.value--
    if (cd.value <= 0) { clearInterval(timer); timer = null; tip.value = '重新获取' }
  }, 1000)
}

async function sendCode() {
  if (sending.value || cd.value > 0) return
  if (!emailRe.test(email.value.trim())) {
    uni.showToast({ title: '请输入正确邮箱', icon: 'none' })
    return
  }
  sending.value = true
  try {
    const data = await api.sendEmailCode(email.value.trim())
    if (data && data.devCode) {
      code.value = data.devCode
      uni.showToast({ title: '验证码已填入', icon: 'none' })
    } else {
      uni.showToast({ title: '已发送到邮箱', icon: 'none' })
    }
    startCountdown()
  } catch (e) {
  } finally {
    sending.value = false
  }
}

async function afterLogin(data) {
  store.setAuth(data)
  uni.setStorageSync('privacyAgreed', '1')
  await ensureFamily()
  try {
    const list = await api.pets()
    if (!list || !list.length) {
      uni.redirectTo({ url: '/pages/guide/index' })
      return
    }
  } catch (e) {}
  uni.switchTab({ url: '/pages/index/index' })
}

function wxLogin() {
  if (loading.value) return
  if (!agreed.value) {
    uni.showToast({ title: '请先同意隐私政策与免责声明', icon: 'none' })
    return
  }
  loading.value = true
  uni.login({
    provider: 'weixin',
    success: async ({ code: wxCode }) => {
      try {
        const data = await api.wxLogin({ code: wxCode })
        await afterLogin(data)
      } catch (e) {
      } finally {
        loading.value = false
      }
    },
    fail: () => {
      loading.value = false
      uni.showToast({ title: '微信登录失败', icon: 'none' })
    }
  })
}

async function login() {
  if (loading.value) return
  if (!agreed.value) {
    uni.showToast({ title: '请先同意隐私政策与免责声明', icon: 'none' })
    return
  }
  if (!email.value.trim() || !code.value) {
    uni.showToast({ title: '请填写邮箱和验证码', icon: 'none' })
    return
  }
  loading.value = true
  try {
    const data = await api.login({ email: email.value.trim(), code: code.value })
    await afterLogin(data)
  } catch (e) {
  } finally {
    loading.value = false
  }
}

function skip() {
  uni.switchTab({ url: '/pages/discover/index' })
}
function goPrivacy() { uni.navigateTo({ url: '/pages/legal/privacy' }) }
function goDisclaimer() { uni.navigateTo({ url: '/pages/legal/disclaimer' }) }
</script>

<style scoped>
.login-page { padding-top: calc(80rpx + env(safe-area-inset-top)); }
.login-panel { text-align: center; padding-bottom: 40rpx; }
.panel-muted { display: none; }
.logo-mark {
  width: 128rpx; height: 128rpx; margin: 0 auto 20rpx; border-radius: 36rpx;
  box-shadow: 0 12rpx 32rpx rgba(244, 114, 182, 0.35);
  display: block;
}
.code-row { display: flex; gap: 16rpx; align-items: center; }
.code-input { flex: 1; min-width: 0; height: 88rpx; }
.code-btn { flex-shrink: 0; padding: 0 24rpx; font-size: 24rpx; white-space: nowrap; min-width: 140rpx; text-align: center; height: 88rpx; display: flex; align-items: center; justify-content: center; line-height: 1; }
.agree {
  display: flex; align-items: center; gap: 12rpx;
  margin: 8rpx 0 28rpx; padding: 4rpx 0;
}
.check {
  width: 32rpx; height: 32rpx; border-radius: 50%;
  border: 2rpx solid #f9a8d4; flex-shrink: 0;
  box-sizing: border-box;
}
.check.on {
  background: #f472b6; border-color: #f472b6;
  box-shadow: inset 0 0 0 6rpx #fff;
}
.agree-txt { flex: 1; font-size: 24rpx; color: #64748b; line-height: 32rpx; }
.agree-txt .link { color: #f472b6; font-weight: 600; }
.skip { margin-top: 8rpx; color: #94a3b8; }
.hint { margin-top: 16rpx; text-align: center; }
.ph { color: #94a3b8; line-height: inherit; }
.is-disabled { opacity: 0.45; pointer-events: none; }

/* #ifdef H5 */
@media (min-width: 900px) {
  .login-page {
    margin-left: 0 !important;
    width: 100% !important;
    max-width: none !important;
    min-height: 100vh;
    padding: 0;
    display: flex;
    align-items: center;
    justify-content: center;
  }
  .login-desk {
    display: grid;
    grid-template-columns: 1.05fr 0.95fr;
    width: min(980px, 92vw);
    min-height: 560px;
    border-radius: 28px;
    overflow: hidden;
    box-shadow: 0 24px 64px rgba(244, 114, 182, 0.16);
    background: #fff;
  }
  .login-panel {
    display: flex;
    flex-direction: column;
    justify-content: center;
    align-items: flex-start;
    text-align: left;
    padding: 56px 48px;
    background: linear-gradient(155deg, #fff1f5 0%, #fce7f3 45%, #f9a8d4 100%);
  }
  .logo-mark { margin: 0 0 20px; width: 72px; height: 72px; border-radius: 20px; }
  .login-panel .hero-brand { font-size: 40px; color: #831843; }
  .login-panel .hero-sub { font-size: 16px; margin-top: 8px; }
  .panel-muted { display: block; margin-top: 28px; font-size: 13px; }
  .login-card {
    margin: 0;
    border: none;
    box-shadow: none;
    border-radius: 0;
    padding: 56px 48px;
    display: flex;
    flex-direction: column;
    justify-content: center;
  }
}
/* #endif */
</style>
