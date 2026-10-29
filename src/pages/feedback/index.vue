<template>
  <view class="page narrow">
    <web-side-nav />
    <view class="card">
      <view class="field">
        <text class="field-label">反馈内容 *</text>
        <textarea
          class="input area"
          v-model="content"
          maxlength="400"
          :auto-height="false"
          disable-default-padding
          placeholder="说说你的建议或遇到的问题"
          placeholder-class="ph"
          style="height: 132px; min-height: 132px;"
        />
        <view class="muted count">{{ content.length }}/400</view>
      </view>

      <view class="field">
        <text class="field-label">图片（最多 3 张）</text>
        <view class="imgs">
          <view v-for="(img, i) in images" :key="i" class="img-wrap">
            <image class="img" :src="img.local || img.url" mode="aspectFill" />
            <view class="img-del" @click="removeImg(i)">×</view>
          </view>
          <view v-if="images.length < 3" class="img-add" @click="pickImg">+</view>
        </view>
      </view>

      <view class="btn-primary" :class="{ 'is-disabled': submitting || !content.trim() }" @click="submit">提交反馈</view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { api, uploadFile } from '../../api/request.js'

const content = ref('')
const images = ref([])
const submitting = ref(false)

function pickImg() {
  const left = 3 - images.value.length
  if (left <= 0) return
  uni.chooseImage({
    count: left,
    sizeType: ['compressed'],
    sourceType: ['album', 'camera'],
    success: (res) => {
      const files = (res.tempFilePaths || []).slice(0, left)
      for (const p of files) {
        images.value.push({ local: p, url: '' })
      }
    }
  })
}

function removeImg(i) {
  images.value.splice(i, 1)
}

async function submit() {
  if (submitting.value || !content.value.trim()) return
  submitting.value = true
  try {
    const urls = []
    for (const img of images.value) {
      if (img.url) {
        urls.push(img.url)
        continue
      }
      const data = await uploadFile(img.local, 'feedback')
      img.url = data.url
      urls.push(data.url)
    }
    await api.createFeedback({ content: content.value.trim(), images: urls })
    uni.showToast({ title: '已提交' })
    setTimeout(() => uni.navigateBack(), 600)
  } catch (e) {
  } finally {
    submitting.value = false
  }
}
</script>

<style scoped>
.area { height: 220rpx !important; min-height: 220rpx !important; padding: 20rpx; width: auto; box-sizing: border-box; }
.count { text-align: right; margin-top: 8rpx; font-size: 22rpx; }
.imgs { display: flex; flex-wrap: wrap; gap: 16rpx; margin-top: 12rpx; }
.img-wrap { position: relative; width: 160rpx; height: 160rpx; }
.img { width: 160rpx; height: 160rpx; border-radius: 16rpx; background: #eaf2ee; }
.img-del {
  position: absolute; top: -10rpx; right: -10rpx;
  width: 40rpx; height: 40rpx; border-radius: 50%;
  background: #1f2a25; color: #fff; font-size: 28rpx;
  display: flex; align-items: center; justify-content: center; line-height: 1;
}
.img-add {
  width: 160rpx; height: 160rpx; border-radius: 16rpx;
  border: 2rpx dashed #c3cdc7; color: #3f7d64; font-size: 56rpx;
  display: flex; align-items: center; justify-content: center;
}
.is-disabled { opacity: 0.45; pointer-events: none; }
.ph { color: #9ba49f; }
</style>
