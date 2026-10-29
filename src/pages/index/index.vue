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
      <view class="greet">
        <view class="greet-left">
          <view class="greet-date">{{ todayLabel }}</view>
          <view class="greet-title">{{ greet }}，铲屎官</view>
          <view class="greet-sub">{{ reminders.length ? `今天有 ${reminders.length} 项护理待完成` : '今天没有待办，好好陪陪毛孩子吧' }}</view>
        </view>
        <image class="greet-art" src="/static/illus/greet-pets.png" mode="aspectFill" />
      </view>

      <view class="home-desk">
        <view class="home-main">
          <view class="section-head">
            <view class="section-title">近期提醒</view>
            <view class="link" @click="goPets">查看全部</view>
          </view>

          <view v-if="loading && !reminders.length" class="group"><view class="group-row muted">加载中…</view></view>
          <view v-else-if="!reminders.length" class="group">
            <view class="rem-empty">
              <view class="group-title">一切顺利</view>
              <view class="group-desc">暂无到期提醒，可在宠物详情中添加</view>
            </view>
          </view>
          <view v-else class="group">
            <view v-for="item in reminders" :key="item.reminder.id" class="group-row rem-row">
              <view class="rem-mark" :class="{ overdue: item.overdue }"></view>
              <view class="group-main">
                <view class="group-title">
                  {{ item.reminder.type }}
                  <text v-if="item.overdue" class="overdue">逾期</text>
                </view>
                <view class="group-desc">{{ item.pet.name }} · {{ remCycleText(item.reminder) }} · {{ formatTime(item.reminder.nextDueAt) }}</view>
              </view>
              <view class="btn-pill primary" @click="checkin(item)">打卡</view>
            </view>
          </view>
          <view v-if="reminders.length" class="more muted" :class="remEndClass">{{ remMore }}</view>
        </view>

        <view class="home-side">
          <view class="section-head">
            <view class="section-title">快捷记录</view>
          </view>
          <view class="card quick">
            <view v-if="pets.length > 1" class="pet-tabs">
              <scroll-view scroll-x class="pet-scroll">
                <view
                  v-for="p in pets" :key="p.id"
                  class="pet-tab" :class="{ on: p.id === curPetId }"
                  @click="curPetId = p.id"
                >{{ p.name }}</view>
              </scroll-view>
            </view>
            <view v-else-if="curPet" class="muted quick-for">为 {{ curPet.name }} 记录</view>
            <view v-else class="muted quick-for">请先添加宠物</view>
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

          <view v-if="curPet && recentLog" class="section">
            <view class="section-head">
              <view class="section-title">最近一次记录</view>
            </view>
            <view class="card recent">
              <view class="recent-type">{{ typeLabel(recentLog.type) }}</view>
              <view class="recent-val">{{ recentLog.content || recentLog.value }}</view>
              <view class="muted xs">{{ curPet.name }} · {{ formatTime(recentLog.occurredAt) }}<text v-if="recentLog.userNickname"> · {{ recentLog.userNickname }}</text></view>
            </view>
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
const todayLabel = computed(() => {
  const d = new Date()
  const w = ['日', '一', '二', '三', '四', '五', '六'][d.getDay()]
  return `${d.getMonth() + 1} 月 ${d.getDate()} 日 · 星期${w}`
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
.greet {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 8rpx 4rpx 40rpx;
}
.greet-left { flex: 1; min-width: 0; }
.greet-date {
  font-size: 24rpx;
  font-weight: 500;
  color: var(--brand);
  letter-spacing: 1rpx;
  margin-bottom: 8rpx;
}
.greet-title {
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.25;
  color: var(--ink);
  margin-bottom: 8rpx;
}
.greet-sub { font-size: 26rpx; color: var(--muted); line-height: 1.5; }
.greet-art {
  width: 136rpx;
  height: 136rpx;
  border-radius: 50%;
  flex-shrink: 0;
  background: var(--brand-soft);
}
.empty-img { width: 220rpx; height: 220rpx; margin: 0 auto 16rpx; display: block; }

.rem-empty { padding: 40rpx 32rpx; text-align: center; }
.rem-mark {
  width: 12rpx;
  height: 12rpx;
  border-radius: 50%;
  background: var(--brand);
  flex-shrink: 0;
}
.rem-mark.overdue { background: var(--danger); }
.rem-row .group-title { display: flex; align-items: center; gap: 12rpx; flex-wrap: wrap; }
.overdue {
  font-size: 20rpx;
  font-weight: 600;
  color: var(--danger);
  background: var(--danger-soft);
  border-radius: 999rpx;
  padding: 2rpx 12rpx;
  line-height: 1.5;
}
.more { text-align: center; padding: 4rpx 0 16rpx; font-size: 24rpx; }

.home-side { margin-top: 48rpx; }
.quick { padding: 28rpx; }
.quick-for { margin-bottom: 20rpx; font-size: 24rpx; }
.pet-tabs { margin-bottom: 20rpx; }
.pet-scroll { white-space: nowrap; }
.pet-tab {
  display: inline-block;
  padding: 8rpx 24rpx;
  margin-right: 12rpx;
  background: var(--bg);
  border: 1rpx solid var(--line);
  border-radius: 999rpx;
  font-size: 24rpx;
  color: var(--muted);
}
.pet-tab.on { background: var(--ink); color: var(--surface); border-color: var(--ink); }

.actions {
  display: grid;
  grid-template-columns: repeat(4, minmax(0, 1fr));
  gap: 16rpx;
}
.action {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 12rpx;
  padding: 24rpx 8rpx;
  border-radius: 24rpx;
  background: var(--bg);
  box-sizing: border-box;
}
.action:active { background: var(--brand-soft); }
.action-ico { width: 56rpx; height: 56rpx; border-radius: 16rpx; display: block; }
.action-txt { font-size: 24rpx; font-weight: 500; color: var(--ink); line-height: 1.2; }

.recent { padding: 28rpx 32rpx; }
.recent-type { font-size: 22rpx; font-weight: 600; color: var(--brand); letter-spacing: 1rpx; margin-bottom: 6rpx; }
.recent-val { font-size: 30rpx; font-weight: 600; color: var(--ink); margin-bottom: 6rpx; word-break: break-all; }
.xs { font-size: 22rpx; }

/* #ifdef H5 */
.action-ico { width: 32px !important; height: 32px !important; }
.action-txt { font-size: 13px !important; }
@media (min-width: 900px) {
  .greet { padding: 0 0 36px; gap: 32px; }
  .greet-date { font-size: 13px; margin-bottom: 6px; }
  .greet-title { font-size: 30px; margin-bottom: 6px; }
  .greet-sub { font-size: 15px; }
  .greet-art { width: 96px; height: 96px; }
  .home-desk {
    display: grid;
    grid-template-columns: minmax(0, 1.5fr) minmax(300px, 1fr);
    gap: 40px;
    align-items: start;
  }
  .home-side { margin-top: 0; }
  .quick { padding: 20px; border-radius: 16px; }
  .quick-for { font-size: 13px; margin-bottom: 14px; }
  .pet-tab { font-size: 13px; padding: 4px 14px; cursor: pointer; }
  .actions { gap: 10px; }
  .action { padding: 14px 6px; border-radius: 12px; gap: 8px; cursor: pointer; transition: background-color 160ms ease; }
  .action:hover { background: var(--brand-soft); }
  .rem-mark { width: 8px; height: 8px; }
  .overdue { font-size: 11px; padding: 1px 8px; }
  .recent { padding: 18px 20px; border-radius: 16px; }
  .recent-type { font-size: 12px; }
  .recent-val { font-size: 16px; }
  .xs { font-size: 12px; }
}
/* #endif */
</style>
