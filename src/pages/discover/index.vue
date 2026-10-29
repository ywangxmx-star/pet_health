<template>
  <view class="page">
    <web-side-nav />
    <view class="hero">
      <view class="hero-brand" style="font-size: 40rpx">护理百科</view>
      <view class="hero-sub">温柔科普，仅供参考 · 不替代兽医</view>
    </view>

    <view class="filter-row">
      <scroll-view scroll-x class="filter-scroll">
        <view
          v-for="t in tabs" :key="t.k"
          class="filter-tab" :class="{ on: species === t.k }"
          @click="switchSpecies(t.k)"
        >{{ t.n }}</view>
      </scroll-view>
    </view>

    <view v-if="loading && !list.length" class="card muted">加载中…</view>
    <view v-else-if="!loading && !list.length" class="card">
      <view class="empty">
        <image class="empty-img" src="/static/illus/empty-article.png" mode="aspectFit" />
        <view class="empty-title">暂无文章</view>
        <view class="muted">稍后再试或启动爬虫任务</view>
      </view>
      <view class="btn-secondary" @click="() => pager.load(true)">重新加载</view>
    </view>

    <view class="art-grid">
      <view v-for="a in list" :key="a.id" class="card card-tap art" @click="go(a.id)">
        <image class="art-cover" :src="articleCover(a)" mode="aspectFill" />
        <view class="art-body">
          <view class="title">{{ a.title }}</view>
          <view class="meta">
            <text v-if="a.speciesTag" class="tag">{{ a.speciesTag }}</text>
            <text class="muted">{{ a.sourceName }}</text>
          </view>
        </view>
      </view>
    </view>
    <view v-if="list.length" class="more muted" :class="endClass">{{ moreText }}</view>
  </view>
</template>

<script setup>
import { ref } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { api } from '../../api/request.js'
import { articleCover } from '../../utils/media.js'
import { usePager } from '../../utils/pager.js'

const tabs = [
  { k: '', n: '全部' },
  { k: 'cat', n: '猫' },
  { k: 'dog', n: '狗' },
  { k: 'rabbit', n: '兔' },
  { k: 'hamster', n: '仓鼠' },
  { k: 'bird', n: '鸟' },
  { k: 'fish', n: '鱼' },
  { k: 'reptile', n: '爬宠' }
]
const species = ref('')
const pager = usePager((page) => api.articles(species.value, page))
const list = pager.list
const loading = pager.loading
const moreText = pager.moreText
const endClass = pager.endClass

function switchSpecies(k) {
  if (species.value === k) return
  species.value = k
  pager.load(true)
}

onShow(() => pager.load(true))
onPullDownRefresh(async () => {
  await pager.load(true)
  uni.stopPullDownRefresh()
})
function go(id) { uni.navigateTo({ url: '/pages/article/detail?id=' + id }) }
</script>

<style scoped>
.filter-row { margin-bottom: 16rpx; }
.filter-scroll { white-space: nowrap; }
.filter-tab {
  display: inline-block;
  padding: 12rpx 28rpx;
  margin-right: 12rpx;
  border-radius: 999rpx;
  background: #fff;
  color: #94a3b8;
  font-size: 26rpx;
  border: 1rpx solid #fce7f3;
}
.filter-tab.on {
  background: #fdf2f8;
  color: #ec4899;
  border-color: #f9a8d4;
  font-weight: 700;
}
.art-grid { display: flex; flex-direction: column; gap: 0; }
.art {
  display: flex;
  gap: 20rpx;
  align-items: stretch;
}
.art-cover {
  width: 160rpx;
  height: 160rpx;
  border-radius: 24rpx;
  flex-shrink: 0;
  background: #fce7f3;
}
.art-body { flex: 1; min-width: 0; display: flex; flex-direction: column; justify-content: center; }
.title {
  font-size: 30rpx;
  font-weight: 700;
  color: #831843;
  margin-bottom: 10rpx;
  overflow: hidden;
  text-overflow: ellipsis;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
}
.meta { display: flex; align-items: center; gap: 12rpx; }
.more { text-align: center; padding: 20rpx 0 8rpx; font-size: 24rpx; min-height: 40rpx; }
.empty-img { width: 220rpx; height: 220rpx; margin: 0 auto 16rpx; display: block; }
@media (min-width: 900px) {
  .art-grid {
    display: grid;
    grid-template-columns: 1fr 1fr;
    gap: 16px;
  }
  .title { font-size: 17px; }
}
</style>
