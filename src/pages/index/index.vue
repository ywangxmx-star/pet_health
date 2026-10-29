<template>
  <view class="page home-page">
    <web-side-nav />
    <view v-if="!token" class="card">
      <view class="empty">
        <image class="empty-img" src="/static/illus/empty-login.png" mode="aspectFit" />
        <view class="empty-title">尚未登录</view>
        <view class="muted">登录后同步提醒与健康记录</view>
      </view>
      <view class="btn-primary" @click="goLogin">去登录</view>
    </view>

    <template v-else>
      <view class="brand-row home-brand-mobile">
        <view class="paw-dot"></view>
        <text class="brand">爪爪</text>
        <view class="paw-dot"></view>
      </view>
      <view class="slogan muted home-brand-mobile">陪伴 · 守护 · 安心成长</view>

      <view class="home-desk">
        <view class="home-main">
          <view class="card greet">
            <view class="greet-left">
              <view class="greet-title">{{ greet }}，铲屎官</view>
              <view class="muted">今天也要好好陪伴毛孩子～</view>
            </view>
            <image class="greet-art" src="/static/illus/greet-pets.png" mode="aspectFill" />
          </view>

          <view v-if="pets.length > 1" class="pet-tabs">
            <scroll-view scroll-x class="pet-scroll">
              <view
                v-for="p in pets" :key="p.id"
                class="pet-tab" :class="{ on: p.id === curPetId }"
                @click="curPetId = p.id"
              >{{ p.name }}</view>
            </scroll-view>
          </view>

          <view class="row-between" style="margin-bottom: 12rpx">
            <view class="section-title" style="margin-bottom: 0">近期提醒</view>
            <view class="link" @click="goPets">查看全部 ›</view>
          </view>

          <view v-if="loading && !reminders.length" class="card muted">加载中…</view>
          <view v-else-if="!reminders.length" class="card">
            <view class="muted" style="text-align:center;padding:16rpx 0">暂无到期提醒，一切顺利</view>
          </view>
          <view v-else class="remind-grid">
            <view v-for="item in reminders" :key="item.reminder.id" class="card remind-card">
              <view class="remind-type">
                {{ item.reminder.type }}
                <text v-if="item.overdue" class="overdue">逾期</text>
              </view>
              <view class="remind-pet">{{ item.pet.name }}</view>
              <view class="muted rem-meta">{{ remCycleText(item.reminder) }}</view>
              <view class="muted rem-meta">{{ formatTime(item.reminder.nextDueAt) }}</view>
              <view class="btn-mint rem-btn" @click="checkin(item)">打卡完成</view>
            </view>
          </view>
          <view v-if="reminders.length" class="more muted" :class="remEndClass">{{ remMore }}</view>
        </view>

        <view class="home-side">
          <view class="section-title">快捷操作</view>
          <view class="card">
            <view class="muted" style="margin-bottom: 16rpx" v-if="curPet">当前：{{ curPet.name }}</view>
            <view v-else class="muted" style="margin-bottom: 16rpx">请先添加宠物</view>
            <view class="actions">
              <view class="action" @click="goLog('weight')">
                <image class="action-ico" src="/static/ico/weight.png" mode="aspectFit" />
                <view class="action-txt">体重</view>
              </view>
              <view class="action" @click="goLog('medicine')">
                <image class="action-ico" src="/static/ico/medicine.png" mode="aspectFit" />
                <view class="action-txt">用药</view>
              </view>
              <view class="action" @click="goLog('symptom')">
                <image class="action-ico" src="/static/ico/symptom.png" mode="aspectFit" />
                <view class="action-txt">症状</view>
              </view>
              <view class="action" @click="goLog('diet')">
                <image class="action-ico" src="/static/ico/diet.png" mode="aspectFit" />
                <view class="action-txt">饮食</view>
              </view>
            </view>
          </view>

          <view v-if="curPet && recentLog" class="card">
            <view class="section-title" style="margin-bottom: 12rpx">{{ curPet.name }} 最近记录</view>
            <view class="muted">{{ typeLabel(recentLog.type) }}：{{ recentLog.content || recentLog.value }}</view>
            <view class="muted xs">{{ formatTime(recentLog.occurredAt) }}<text v-if="recentLog.userNickname"> · {{ recentLog.userNickname }}</text></view>
          </view>
        </view>
      </view>
    </template>
  </view>
</template>

<script setup>
import { computed, ref, watch, onMounted, onUnmounted } from 'vue'
import { onShow, onPullDownRefresh } from '@dcloudio/uni-app'
import { api, ensureFamily } from '../../api/request.js'
import { requireLogin } from '../../utils/auth.js'
import { usePager } from '../../utils/pager.js'

const token = ref('')
const remPager = usePager((page) => api.todayReminders(page))
const reminders = remPager.list
const remMore = remPager.moreText
const remEndClass = remPager.endClass
const loading = remPager.loading
const pets = ref([])
const curPetId = ref(0)
const recentLog = ref(null)

const greet = computed(() => {
  const h = new Date().getHours()
  if (h < 11) return '早上好'
  if (h < 14) return '中午好'
  if (h < 18) return '下午好'
  return '晚上好'
})
const curPet = computed(() => pets.value.find((p) => p.id === curPetId.value) || pets.value[0] || null)

watch(curPetId, () => { loadRecent() })

function onDirty() {
  if (!token.value) return
  remPager.load(true)
  loadRecent()
}
onMounted(() => { uni.$on('data:dirty', onDirty) })
onUnmounted(() => { uni.$off('data:dirty', onDirty) })

const typeMap = { weight: '体重', diet: '饮食', stool: '排泄', spirit: '精神', medicine: '用药', symptom: '症状', vomit: '呕吐' }
function typeLabel(t) { return typeMap[t] || t }

onShow(async () => {
  token.value = uni.getStorageSync('accessToken') || ''
  if (!token.value) return
  try {
    await ensureFamily()
    await remPager.load(true)
    pets.value = (await api.pets()) || []
    if (!curPetId.value && pets.value.length) curPetId.value = pets.value[0].id
    await loadRecent()
  } catch (e) {
    reminders.value = []
    pets.value = []
  }
})

onPullDownRefresh(async () => {
  try {
    await ensureFamily()
    await remPager.load(true)
    pets.value = (await api.pets()) || []
    await loadRecent()
  } catch (e) {}
  uni.stopPullDownRefresh()
})

async function loadRecent() {
  if (!curPetId.value) { recentLog.value = null; return }
  try {
    const data = await api.healthLogs(curPetId.value)
    const list = (data && data.list) || []
    recentLog.value = list[0] || null
  } catch (e) { recentLog.value = null }
}

function goLogin() { uni.navigateTo({ url: '/pages/login/login' }) }
function goPets() { uni.switchTab({ url: '/pages/pet/list' }) }
function formatTime(t) {
  if (!t) return ''
  return String(t).replace('T', ' ').replace(/\+.*$/, '').replace(/\.\d+/, '').slice(0, 16)
}
function remCycleText(r) {
  if (!r) return ''
  return Number(r.cycleDays) > 0 ? `每 ${r.cycleDays} 天` : '单次提醒'
}

function todayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}
function isDueToday(item) {
  if (item && item.dueToday) return true
  const due = item && item.reminder && item.reminder.nextDueAt
  if (!due) return false
  return String(due).slice(0, 10) === todayStr()
}
function isOverdue(item) {
  if (item && item.overdue) return true
  const due = item && item.reminder && item.reminder.nextDueAt
  if (!due) return false
  return String(due).slice(0, 10) < todayStr()
}

async function checkin(item) {
  if (!requireLogin('打卡需要登录')) return
  const r = item && item.reminder
  if (!r) return
  if (!isDueToday(item) && !isOverdue(item)) {
    const ok = await new Promise((resolve) => {
      uni.showModal({
        title: '确认打卡？',
        content: `该提醒日期为 ${String(r.nextDueAt || '').slice(0, 10)}，不是今天，确定要提前完成吗？`,
        success: (res) => resolve(res.confirm)
      })
    })
    if (!ok) return
  }
  try {
    await api.checkin(r.id, '')
    uni.showToast({ title: '已打卡' })
    await remPager.load(true)
  } catch (e) {}
}

function goLog(type) {
  if (!requireLogin('记录健康需要登录')) return
  if (!pets.value.length) {
    uni.showToast({ title: '请先添加宠物', icon: 'none' })
    uni.switchTab({ url: '/pages/pet/list' })
    return
  }
  const pid = curPetId.value || pets.value[0].id
  uni.navigateTo({ url: `/pages/pet/log?petId=${pid}&type=${type}` })
}
</script>

<style scoped>
.brand-row {
  display: flex;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  margin-top: 8rpx;
}
.brand {
  font-family: 'Varela Round', sans-serif;
  font-size: 48rpx;
  color: #f472b6;
  font-weight: 700;
}
.paw-dot {
  width: 16rpx; height: 16rpx; border-radius: 50%;
  background: #f9a8d4;
}
.slogan { text-align: center; margin: 8rpx 0 24rpx; }
.greet {
  display: flex;
  gap: 16rpx;
  background: linear-gradient(135deg, #fff7fb, #fce7f3);
  border: none;
}
.greet-left { flex: 1; }
.heart-dot {
  width: 56rpx; height: 56rpx; border-radius: 50%;
  background: #f472b6; color: #fff;
  display: flex; align-items: center; justify-content: center;
  margin-bottom: 12rpx; font-size: 28rpx;
}
.greet-title {
  font-size: 32rpx; font-weight: 700; color: #831843; margin-bottom: 8rpx;
}
.greet-art {
  width: 140rpx; height: 140rpx; border-radius: 32rpx;
  flex-shrink: 0;
}
.empty-img {
  width: 220rpx; height: 220rpx; margin: 0 auto 16rpx; display: block;
}
.action-ico {
  width: 56rpx; height: 56rpx; margin: 0; border-radius: 14rpx;
  display: block; flex-shrink: 0; overflow: hidden;
}
.action-txt {
  line-height: 1;
  font-size: 24rpx;
  font-weight: 600;
  color: #831843;
  height: 28rpx;
  display: flex;
  align-items: center;
  justify-content: center;
}
.pet-tabs { margin-bottom: 16rpx; }
.pet-scroll { white-space: nowrap; }
.pet-tab {
  display: inline-block; padding: 10rpx 24rpx; margin-right: 12rpx;
  background: #fff; border: 1rpx solid #fce7f3; border-radius: 999rpx;
  font-size: 26rpx; color: #831843;
}
.pet-tab.on { background: #f472b6; color: #fff; border-color: #f472b6; }
.remind-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-bottom: 8rpx;
}
.more { text-align: center; padding: 8rpx 0 16rpx; font-size: 24rpx; width: 100%; }
.remind-card {
  width: calc(50% - 8rpx);
  box-sizing: border-box;
  margin-bottom: 0;
}
.remind-type { font-weight: 700; color: #831843; margin-bottom: 6rpx; display: flex; align-items: center; gap: 8rpx; flex-wrap: wrap; }
.overdue {
  font-size: 20rpx; font-weight: 600; color: #dc2626;
  background: #fef2f2; border-radius: 999rpx; padding: 2rpx 10rpx;
}
.remind-pet { color: #f472b6; font-size: 24rpx; margin-bottom: 4rpx; }
.rem-meta { font-size: 22rpx; margin-bottom: 4rpx; }
.rem-btn {
  margin-top: 14rpx;
  width: 100%;
  height: 56rpx;
  min-height: 56rpx;
  font-size: 22rpx;
  box-sizing: border-box;
}
.actions { display: flex; gap: 16rpx; flex-wrap: wrap; }
.action {
  flex: 1; min-width: 140rpx;
  background: #fce7f3;
  border-radius: 24rpx;
  padding: 18rpx 12rpx 22rpx;
  box-sizing: border-box;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 14rpx;
  line-height: 1;
}
.action:active { opacity: 0.85; }
.xs { font-size: 20rpx; margin-top: 6rpx; }

/* #ifdef H5 */
.action {
  flex-direction: row !important;
  align-items: center !important;
  justify-content: center !important;
  gap: 10px !important;
  padding: 0 12px !important;
  height: 52px !important;
  min-height: 52px !important;
  line-height: 1 !important;
  box-sizing: border-box !important;
}
.action-ico {
  width: 28px !important;
  height: 28px !important;
  margin: 0 !important;
  flex-shrink: 0 !important;
}
.action-txt {
  display: block !important;
  height: 28px !important;
  line-height: 28px !important;
  font-size: 14px !important;
  padding: 0 !important;
  margin: 0 !important;
  transform: none !important;
}
.action:hover { background: #f9a8d4; }

@media (min-width: 900px) {
  .home-brand-mobile { display: none; }
  .home-desk {
    display: grid;
    grid-template-columns: minmax(0, 1.4fr) minmax(280px, 0.9fr);
    gap: 28px;
    align-items: start;
  }
  .greet { padding: 28px; }
  .greet-title { font-size: 22px; }
  .greet-art { width: 160px; height: 160px; border-radius: 20px; }
  .remind-grid {
    display: grid;
    grid-template-columns: repeat(3, minmax(0, 1fr));
    gap: 16px;
  }
  .remind-card { width: auto; }
  .action {
    cursor: pointer;
    transition: background 160ms ease, transform 160ms ease;
    min-height: 48px;
  }
  .action:hover { transform: translateY(-1px); }
}
@media (min-width: 900px) and (max-width: 1100px) {
  .remind-grid { grid-template-columns: repeat(2, minmax(0, 1fr)); }
}
/* #endif */
</style>
