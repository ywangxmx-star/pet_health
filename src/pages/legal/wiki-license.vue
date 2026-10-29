<template>
  <view class="page">
    <web-side-nav />
    <view class="card">
      <view class="title">维基百科内容许可说明</view>
      <view class="meta muted">CC BY-SA 4.0 · 更新日期：2026-10-20</view>
      <view class="body">
        <view class="h">一、许可协议</view>
        <view class="p">本应用中标注来源于维基百科的条目正文，改编自中文维基百科，原文采用知识共享「署名-相同方式共享 4.0 国际」（CC BY-SA 4.0）授权。</view>
        <view class="p">协议全文链接（点按复制，小程序内无法跳转外链）：</view>
        <view class="p link" selectable @click="copyUrl(licenseUrl)">{{ licenseUrl }}</view>

        <view class="h">二、您可以做什么</view>
        <view class="p">在遵守许可的前提下，可以复制、修改、商用相关维基改编文本。</view>

        <view class="h">三、您必须做到</view>
        <view class="p">1. 署名：标明来自维基百科、条目标题与原文链接；</view>
        <view class="p">2. 标明修改：说明您对文本做了哪些改动；</view>
        <view class="p">3. 相同方式共享：再分发演绎作品时使用 CC BY-SA 4.0 或兼容协议；</view>
        <view class="p">4. 保留许可声明与免背书说明。</view>

        <view class="h">四、本应用的修改</view>
        <view class="p">已转为简体中文；删除参考资料/外部链接等尾部章节；正文可能截断；不镜像维基/Commons 图片。</view>

        <view class="h">五、不适用本许可的内容</view>
        <view class="p">用户自行填写的宠物档案、提醒、日常记录等不属于维基百科内容，不适用 CC BY-SA。</view>

        <view class="h">六、商标与背书</view>
        <view class="p">「Wikipedia / 维基百科」等为相关权利人商标。本应用与维基媒体基金会无隶属或官方合作关系，词条作者与基金会不对本应用改编结果背书。</view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
const licenseUrl = ref('https://creativecommons.org/licenses/by-sa/4.0/deed.zh')
function copyUrl(u) {
  uni.setClipboardData({
    data: u,
    success: () => uni.showToast({ title: '已复制，请到浏览器打开', icon: 'none' })
  })
}
</script>

<style scoped>
.title { font-family: 'Varela Round', sans-serif; font-size: 40rpx; color: #831843; margin-bottom: 8rpx; }
.meta { margin-bottom: 24rpx; }
.h { font-weight: 700; color: #831843; margin: 28rpx 0 10rpx; font-size: 28rpx; }
.p { color: #64748b; font-size: 26rpx; line-height: 1.7; margin-bottom: 8rpx; word-break: break-all; }
.link { color: #ec4899; font-weight: 600; }
</style>
