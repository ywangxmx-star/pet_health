<template>
  <view class="page narrow">
    <web-side-nav />
    <view v-if="loading" class="muted pad">整理中…</view>
    <view v-else-if="data" class="desk">
      <view class="card">
        <view class="row-between">
          <view class="section-title" style="margin-bottom:0">近况小结</view>
          <view
            class="link"
            :class="{ dim: refreshing || !canRefresh }"
            @click="refresh"
            >{{ refreshing ? '整理中…' : '重新整理' }}</view>
        </view>
        <view class="muted meta">近 {{ data.days || 90 }} 天 · {{ formatTime(data.generatedAt) }}</view>
        <view class="quota muted">今日剩余 {{ quotaRemain }}/{{ quotaMax }} 次（每天限 {{ quotaMax }} 次）</view>
        <view class="body">{{ data.overview }}</view>
      </view>

      <view class="card">
        <view class="section-title">体重曲线</view>
        <view v-if="!chartPoints.length" class="muted">暂无体重记录，添加几次称重后可看趋势</view>
        <view v-else>
          <canvas
            canvas-id="weightChart"
            id="weightChart"
            class="chart"
            :style="{ width: chartW + 'px', height: chartH + 'px' }"
          />
          <view class="muted">{{ data.weightTrend }}</view>
        </view>
      </view>

      <view class="card">
        <view class="section-title">健康近况</view>
        <view class="body">{{ data.healthPulse }}</view>
      </view>

      <view class="card">
        <view class="section-title">护理节奏</view>
        <view class="body">{{ data.careRhythm }}</view>
      </view>

      <view class="card" v-if="(data.watchPoints || []).length">
        <view class="section-title">留意事项</view>
        <view v-for="(t, i) in data.watchPoints" :key="'w'+i" class="bullet">· {{ t }}</view>
      </view>

      <view class="card" v-if="(data.dataGaps || []).length">
        <view class="section-title">可补充的记录</view>
        <view v-for="(t, i) in data.dataGaps" :key="'g'+i" class="bullet">· {{ t }}</view>
      </view>

      <view class="muted foot">根据家庭共享的档案与日常记录整理，仅供备忘参考，不能替代执业兽医判断。</view>
    </view>
    <view v-else class="empty-block">
      <view class="empty-title">暂无小结</view>
      <view class="muted" style="margin-bottom: 16rpx">每天限 {{ quotaMax }} 次整理</view>
      <view class="btn-primary sm" @click="load(true)">生成小结</view>
    </view>
  </view>
</template>

<script setup>
import { computed, nextTick, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api, ensureFamily } from '../../api/request.js'

const data = ref(null)
const loading = ref(true)
const refreshing = ref(false)
const chartPoints = ref([])
const chartW = ref(320)
const chartH = ref(160)
const quotaMax = ref(3)
const quotaRemain = ref(3)
let petId = 0

const canRefresh = computed(() => quotaRemain.value > 0)

onLoad(async (q) => {
  petId = Number(q.id || q.petId)
  try { await ensureFamily() } catch (e) {}
  await load(false)
})

function applyQuota(res) {
  if (!res) return
  if (res.quotaMax != null) quotaMax.value = Number(res.quotaMax) || 3
  if (res.quotaRemain != null) quotaRemain.value = Math.max(0, Number(res.quotaRemain))
}

async function load(force) {
  if (!petId) return
  if (force && !canRefresh.value && data.value) {
    uni.showToast({ title: `今日次数已用完，每天限 ${quotaMax.value} 次`, icon: 'none' })
    return
  }
  if (force) refreshing.value = true
  else loading.value = true
  try {
    const res = force ? await api.refreshPortrait(petId) : await api.portrait(petId)
    data.value = res
    applyQuota(res)
    chartPoints.value = (res && res.weights) || []
    await nextTick()
    drawChart()
  } catch (e) {
    const msg = (e && e.message) || ''
    if (msg) uni.showToast({ title: msg.slice(0, 40), icon: 'none' })
    if (!force) data.value = null
  } finally {
    loading.value = false
    refreshing.value = false
  }
}

function refresh() {
  if (refreshing.value) return
  if (!canRefresh.value) {
    uni.showToast({ title: `今日次数已用完，每天限 ${quotaMax.value} 次`, icon: 'none' })
    return
  }
  load(true)
}

function formatTime(t) {
  if (!t) return ''
  return String(t).replace('T', ' ').slice(0, 16)
}

function drawChart() {
  const pts = chartPoints.value
  if (!pts.length) return
  try {
    const sys = uni.getSystemInfoSync()
    chartW.value = Math.min(sys.windowWidth - 64, 360)
  } catch (e) {}
  const w = chartW.value
  const h = chartH.value
  const pad = 16
  const values = pts.map((p) => Number(p.value))
  let min = Math.min.apply(null, values)
  let max = Math.max.apply(null, values)
  if (min === max) {
    min -= 0.5
    max += 0.5
  }
  const ctx = uni.createCanvasContext('weightChart')
  ctx.clearRect(0, 0, w, h)
  ctx.setStrokeStyle('#c3cdc7')
  ctx.setLineWidth(1)
  for (let i = 0; i < 3; i++) {
    const y = pad + ((h - pad * 2) * i) / 2
    ctx.beginPath()
    ctx.moveTo(pad, y)
    ctx.lineTo(w - pad, y)
    ctx.stroke()
  }
  const xs = pts.map((_, i) => pad + (i * (w - pad * 2)) / Math.max(pts.length - 1, 1))
  const ys = values.map((v) => pad + (1 - (v - min) / (max - min)) * (h - pad * 2))
  ctx.setStrokeStyle('#3f7d64')
  ctx.setLineWidth(2.5)
  ctx.beginPath()
  xs.forEach((x, i) => {
    if (i === 0) ctx.moveTo(x, ys[i])
    else ctx.lineTo(x, ys[i])
  })
  ctx.stroke()
  ctx.setFillStyle('#326650')
  xs.forEach((x, i) => {
    ctx.beginPath()
    ctx.arc(x, ys[i], 3.5, 0, Math.PI * 2)
    ctx.fill()
  })
  ctx.setFillStyle('#9ba49f')
  ctx.setFontSize(10)
  ctx.fillText(max.toFixed(1), 2, pad + 4)
  ctx.fillText(min.toFixed(1), 2, h - pad + 4)
  if (pts.length) {
    ctx.fillText(String(pts[0].at || '').slice(5), pad, h - 2)
    ctx.fillText(String(pts[pts.length - 1].at || '').slice(5), w - pad - 28, h - 2)
  }
  ctx.draw()
}
</script>

<style scoped>
.pad { padding: 32rpx; }
.desk { padding-bottom: 40rpx; }
.meta { margin: 12rpx 0 8rpx; }
.quota { margin-bottom: 16rpx; color: #326650; }
.body { font-size: 28rpx; color: #1f2a25; line-height: 1.65; }
.bullet { font-size: 26rpx; color: #1f2a25; line-height: 1.6; margin-bottom: 8rpx; }
.chart { width: 100%; height: 160px; margin-bottom: 12rpx; }
.foot { padding: 8rpx 8rpx 40rpx; line-height: 1.6; }
.link.dim { opacity: 0.45; }
.row-between {
  display: flex;
  align-items: center;
  justify-content: space-between;
}
.link { color: #326650; font-weight: 600; font-size: 26rpx; }
</style>
