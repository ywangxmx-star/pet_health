<template>
  <view class="page">
    <web-side-nav />
    <view class="hero">
      <view class="hero-brand" style="font-size: 40rpx">开始照护</view>
      <view class="hero-sub">三步完成：档案 → 提醒 → 回家</view>
    </view>

    <view class="card step" :class="{ done: step > 1 }">
      <view class="step-no">1</view>
      <view class="step-body">
        <view class="section-title" style="margin-bottom: 8rpx">添加第一只宠物</view>
        <view class="muted">先写名字也行，细节之后可补</view>
        <view class="btn-primary" style="margin-top: 20rpx" @click="goPet">{{ hasPet ? '已添加，去完善' : '去添加' }}</view>
      </view>
    </view>

    <view class="card step" :class="{ done: step > 2, disabled: !hasPet }">
      <view class="step-no">2</view>
      <view class="step-body">
        <view class="section-title" style="margin-bottom: 8rpx">设一条护理提醒</view>
        <view class="muted">驱虫 / 疫苗等，到期首页可打卡</view>
        <view class="btn-secondary" style="margin-top: 20rpx" @click="goReminder">{{ hasPet ? '去设置' : '请先添加宠物' }}</view>
      </view>
    </view>

    <view class="card step">
      <view class="step-no">3</view>
      <view class="step-body">
        <view class="section-title" style="margin-bottom: 8rpx">开始使用</view>
        <view class="muted">可随时邀请家人一起记录</view>
        <view class="btn-primary" style="margin-top: 20rpx" @click="finish">进入首页</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow } from '@dcloudio/uni-app'
import { api, ensureFamily } from '../../api/request.js'

const hasPet = ref(false)
const step = ref(1)
let firstPetId = 0

onShow(async () => {
  try {
    await ensureFamily()
    const list = await api.pets()
    hasPet.value = !!(list && list.length)
    if (hasPet.value) {
      firstPetId = list[0].id
      step.value = 2
      const rems = await api.reminders(firstPetId)
      if (rems && rems.length) step.value = 3
    } else step.value = 1
  } catch (e) {}
})

function goPet() {
  if (hasPet.value) uni.navigateTo({ url: '/pages/pet/edit?id=' + firstPetId })
  else uni.navigateTo({ url: '/pages/pet/edit' })
}
function goReminder() {
  if (!hasPet.value) {
    uni.showToast({ title: '请先添加宠物', icon: 'none' })
    return
  }
  uni.navigateTo({ url: '/pages/pet/reminder?petId=' + firstPetId })
}
function finish() {
  uni.setStorageSync('guideDone', '1')
  uni.switchTab({ url: '/pages/index/index' })
}
</script>

<style scoped>
.step { display: flex; gap: 20rpx; align-items: flex-start; }
.step-no {
  width: 56rpx; height: 56rpx; border-radius: 50%;
  background: #fce7f3; color: #f472b6; font-weight: 700;
  display: flex; align-items: center; justify-content: center; flex-shrink: 0;
}
.step.done .step-no { background: #d1fae5; color: #059669; }
.step.disabled { opacity: 0.55; }
.step-body { flex: 1; }
</style>
