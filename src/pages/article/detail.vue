<template>
  <view class="page">
    <web-side-nav />
    <view v-if="!article" class="card muted">{{ err || '加载中…' }}</view>
    <view class="card" v-else>
      <view class="title">{{ article.title }}</view>
      <view class="meta muted">{{ article.sourceName || '维基百科' }} · {{ article.speciesTag }}</view>
      <view class="divider"></view>
      <view class="body">{{ article.bodyMd }}</view>

      <view class="attr">
        <view class="attr-h">来源与许可（CC BY-SA 4.0）</view>
        <view class="attr-p">标题：{{ attr.title || article.title }}</view>
        <view class="attr-p">来源：{{ attr.sourceLabel || '维基百科（中文）' }}</view>
        <view class="attr-p" v-if="sourceUrl">
          原文链接（点按复制）：
          <text class="link" selectable @click="copyUrl(sourceUrl)">{{ sourceUrl }}</text>
        </view>
        <view class="attr-p" v-if="attr.historyUrl">
          作者 / 贡献者历史（点按复制）：
          <text class="link" selectable @click="copyUrl(attr.historyUrl)">{{ attr.historyUrl }}</text>
        </view>
        <view class="attr-p">许可：{{ attr.licenseDeed || 'CC BY-SA 4.0' }}</view>
        <view class="attr-p">
          协议链接（点按复制）：
          <text class="link" selectable @click="copyUrl(licenseUrl)">{{ licenseUrl }}</text>
        </view>
        <view class="attr-p">修改说明：{{ modificationsText }}</view>
        <view class="attr-p">{{ shareAlikeText }}</view>
        <view class="attr-p">{{ noticeText }}</view>
        <view class="attr-tip muted">小程序内无法跳转外链，请复制后到浏览器打开。</view>
        <view class="link" style="margin-top: 12rpx" @click="goLicense">查看完整许可说明</view>
      </view>

      <view class="disclaimer muted">本内容仅供参考，不构成诊疗建议，不能替代执业兽医。</view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api } from '../../api/request.js'

const article = ref(null)
const err = ref('')
const attr = computed(() => (article.value && article.value.attribution) || {})
const sourceUrl = computed(() => attr.value.sourceUrl || (article.value && article.value.sourceUrl) || '')
const licenseUrl = computed(() => attr.value.licenseUrl || 'https://creativecommons.org/licenses/by-sa/4.0/deed.zh')
const modificationsText = computed(() => attr.value.modifications || '已转为简体中文；删除参考资料等尾部章节；正文可能截断。不镜像维基图片。')
const shareAlikeText = computed(() => attr.value.shareAlike || '再使用本文须保留署名、标明修改，并以 CC BY-SA 再授权。')
const noticeText = computed(() => attr.value.notice || '维基媒体基金会与词条作者不对本应用改编结果背书。')

onLoad(async (q) => {
  try { article.value = await api.article(q.id) }
  catch (e) { err.value = (e && e.message) || '文章加载失败' }
})

function copyUrl(u) {
  if (!u) return
  uni.setClipboardData({
    data: u,
    success: () => uni.showToast({ title: '已复制，请到浏览器打开', icon: 'none' })
  })
}
function goLicense() {
  uni.navigateTo({ url: '/pages/legal/wiki-license' })
}
</script>

<style scoped>
.title {
  font-family: 'Varela Round', sans-serif;
  font-size: 40rpx; line-height: 1.35; margin-bottom: 12rpx; color: #831843;
}
.meta { margin-bottom: 8rpx; }
.divider { height: 1rpx; background: #fce7f3; margin: 24rpx 0; }
.body { line-height: 1.75; white-space: pre-wrap; font-size: 28rpx; color: #831843; }
.attr {
  margin-top: 36rpx; padding: 24rpx;
  background: #fff7fb; border-radius: 24rpx; border: 1rpx solid #fce7f3;
}
.attr-h { font-weight: 700; color: #831843; margin-bottom: 12rpx; font-size: 28rpx; }
.attr-p { color: #64748b; font-size: 24rpx; line-height: 1.65; margin-bottom: 8rpx; word-break: break-all; }
.attr-tip { font-size: 22rpx; margin-top: 8rpx; }
.link { color: #ec4899; font-weight: 600; }
.disclaimer { margin-top: 32rpx; padding-top: 20rpx; border-top: 1rpx solid #fce7f3; }
</style>
