<template>
  <view class="page" v-if="pet">
    <web-side-nav />
    <view class="detail-desk">
      <view class="detail-col">
    <view class="card profile">
      <image class="avatar lg" :src="petAvatar(pet.species)" mode="aspectFill" />
      <view class="profile-text">
        <view class="name">{{ pet.name }}</view>
        <view class="muted">{{ pet.species }} · {{ pet.breed || '未填品种' }} · {{ genderLabel(pet.gender) }}</view>
        <view class="tags">
          <text v-if="pet.weight" class="badge">{{ pet.weight }} kg</text>
          <text v-if="pet.coatColor" class="tag">{{ pet.coatColor }}</text>
          <text v-if="pet.neutered === true" class="tag">已绝育</text>
          <text v-if="pet.neutered === false" class="tag">未绝育</text>
        </view>
        <view v-if="pet.remark" class="muted" style="margin-top: 10rpx">{{ pet.remark }}</view>
      </view>
    </view>

    <view class="block" @click="goEdit">编辑档案</view>
    <view class="block" @click="goPortrait">近况小结</view>

    <view class="card">
      <view class="section-title">近 30 天小结</view>
      <view v-if="!summary" class="muted">暂无数据</view>
      <view v-else class="summary-box">
        <view class="disc"><text class="num">{{ summary.weightLatest ? summary.weightLatest + ' kg' : '—' }}</text> 最新体重</view>
        <view class="disc"><text class="num">{{ summary.weightTrend || '—' }}</text> 体重趋势</view>
        <view class="disc"><text class="num">{{ summary.reminderDueCount || 0 }}</text> 待办提醒</view>
        <view class="disc"><text class="num">{{ summary.logCount || 0 }}</text> 健康记录</view>
      </view>
    </view>
      </view>

      <view class="detail-col">
    <view class="card">
      <view class="row-between">
        <view class="section-title" style="margin-bottom: 0">提醒</view>
        <view class="link" @click="addReminder">+ 添加</view>
      </view>
      <view v-if="!reminders.length" class="empty-block">
        <view class="muted">还没有提醒，添加一条开始守护</view>
        <view class="btn-primary sm" @click="addReminder">添加提醒</view>
      </view>
      <view v-else class="remind-grid">
        <view v-for="r in reminders" :key="r.id" class="card remind-card" :class="{ paused: r.status === 'paused' }">
          <view class="remind-type">
            {{ r.type }}
            <text v-if="r.status === 'paused'" class="paused-tag">已暂停</text>
          </view>
          <view class="muted rem-meta">{{ remCycleText(r) }}</view>
          <view class="muted rem-meta">{{ formatTime(r.nextDueAt) }}</view>
          <view class="rem-foot">
            <view v-if="r.status !== 'paused'" class="btn-mint" @click="checkin(r)">打卡完成</view>
            <view v-else class="btn-secondary sm" @click="togglePause(r)">恢复</view>
            <view class="btn-ghost" @click="openRemMenu(r)">更多</view>
          </view>
        </view>
      </view>
      <view v-if="reminders.length" class="more muted" :class="remEndClass">{{ remMore }}</view>
    </view>

    <view class="card">
      <view class="row-between">
        <view class="section-title" style="margin-bottom: 0">健康记录</view>
        <view class="link" @click="addLog">+ 记录</view>
      </view>
      <view class="seg mini">
        <view class="seg-item" :class="{ on: logType === '' }" @click="setLogType('')">全部</view>
        <view class="seg-item" :class="{ on: logType === 'weight' }" @click="setLogType('weight')">体重</view>
        <view class="seg-item" :class="{ on: logType === 'diet' }" @click="setLogType('diet')">饮食</view>
        <view class="seg-item" :class="{ on: logType === 'medicine' }" @click="setLogType('medicine')">用药</view>
      </view>
      <view v-if="!logs.length" class="empty-block">
        <view class="muted">还没有记录</view>
        <view class="btn-primary sm" @click="addLog">添加记录</view>
      </view>
      <view v-for="l in logs" :key="l.id" class="log-card">
        <view class="flex1">
          <view class="log-val">{{ logLabel(l.type) }} · {{ l.content || l.value || '' }}</view>
          <view class="muted">{{ formatTime(l.occurredAt) }}{{ l.actorName ? ' · ' + l.actorName : '' }}</view>
        </view>
        <view class="del-icon" @click="delLog(l)">×</view>
      </view>
      <view v-if="logs.length" class="more muted" :class="logEndClass">{{ logMore }}</view>
    </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { onMounted, onUnmounted, ref } from 'vue'
import { onLoad, onShow } from '@dcloudio/uni-app'
import { api, ensureFamily } from '../../api/request.js'
import { petAvatar } from '../../utils/media.js'
import { usePager } from '../../utils/pager.js'

const pet = ref(null)
const summary = ref(null)
const logType = ref('')
let petId = 0
const remPager = usePager((page) => api.reminders(petId, page))
const logPager = usePager((page) => api.healthLogs(petId, logType.value || undefined, page))
const reminders = remPager.list
const logs = logPager.list
const remMore = remPager.moreText
const logMore = logPager.moreText
const remEndClass = remPager.endClass
const logEndClass = logPager.endClass

onLoad(async (q) => {
  petId = Number(q.id || q.petId)
  try { await ensureFamily() } catch (e) {}
  await reload()
})

onShow(async () => {
  if (!petId) return
  try { await reload() } catch (e) {}
})

function onDirty() { if (petId) reload().catch(() => {}) }
onMounted(() => { uni.$on('data:dirty', onDirty) })
onUnmounted(() => { uni.$off('data:dirty', onDirty) })

async function reload() {
  const list = await api.pets().catch(() => [])
  pet.value = (list || []).find((p) => Number(p.id) === Number(petId)) || null
  if (!pet.value) return
  const [sm] = await Promise.all([
    api.summary(petId, 30).catch(() => null),
    remPager.load(true),
    logPager.load(true)
  ])
  summary.value = sm
}

function formatTime(t) {
  if (!t) return ''
  return String(t).replace('T', ' ').replace(/\+.*$/, '').replace(/\.\d+/, '').slice(0, 16)
}

function setLogType(t) {
  logType.value = t
  logPager.load(true)
}

const logLabels = { weight: '体重', diet: '饮食', stool: '排泄', spirit: '精神', medicine: '用药', symptom: '症状', vomit: '呕吐' }
function logLabel(t) { return logLabels[t] || t || '记录' }
function genderLabel(g) { return ({ 公: '男孩', 母: '女孩' })[g] || g || '' }

function goEdit() {
  uni.navigateTo({ url: '/pages/pet/edit?id=' + petId })
}
function goPortrait() {
  uni.navigateTo({ url: '/pages/pet/portrait?id=' + petId })
}

function addReminder() {
  uni.navigateTo({ url: '/pages/pet/reminder?petId=' + petId })
}
function remCycleText(r) {
  return Number(r.cycleDays) > 0 ? `每 ${r.cycleDays} 天` : '单次提醒'
}

function todayStr() {
  const t = new Date()
  return `${t.getFullYear()}-${String(t.getMonth() + 1).padStart(2, '0')}-${String(t.getDate()).padStart(2, '0')}`
}
function isDueToday(dueAt) {
  if (!dueAt) return false
  return String(dueAt).slice(0, 10) === todayStr()
}
function isOverdue(dueAt) {
  if (!dueAt) return false
  return String(dueAt).slice(0, 10) < todayStr()
}

function goEditReminder(r) {
  const raw = String(r.nextDueAt || '').replace('T', ' ')
  const due = raw.slice(0, 10)
  const time = raw.slice(11, 16)
  const u = `/pages/pet/reminder?petId=${petId}&id=${r.id}&type=${encodeURIComponent(r.type)}&cycle=${r.cycleDays}&before=${r.remindBeforeDays}&due=${due}&time=${time}`
  uni.navigateTo({ url: u })
}

function openRemMenu(r) {
  uni.showActionSheet({
    itemList: ['编辑', r.status === 'paused' ? '恢复' : '暂停', '删除'],
    success: (res) => {
      if (res.tapIndex === 0) goEditReminder(r)
      else if (res.tapIndex === 1) togglePause(r)
      else if (res.tapIndex === 2) delReminder(r)
    }
  })
}

async function checkin(r) {
  if (!isDueToday(r.nextDueAt) && !isOverdue(r.nextDueAt)) {
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
    uni.$emit('data:dirty', { type: 'reminder', petId })
  } catch (e) {}
}

async function togglePause(r) {
  const status = r.status === 'paused' ? 'active' : 'paused'
  try {
    await api.updateReminder(petId, r.id, { status })
    await remPager.load(true)
    uni.showToast({ title: status === 'paused' ? '已暂停' : '已恢复', icon: 'none' })
    uni.$emit('data:dirty', { type: 'reminder', petId })
  } catch (e) {}
}

async function delReminder(r) {
  const ok = await new Promise((resolve) => {
    uni.showModal({ title: '删除提醒？', success: (res) => resolve(res.confirm) })
  })
  if (!ok) return
  try {
    await api.deleteReminder(petId, r.id)
    await remPager.load(true)
    uni.showToast({ title: '已删除' })
    uni.$emit('data:dirty', { type: 'reminder', petId })
  } catch (e) {}
}

function addLog() {
  uni.navigateTo({ url: '/pages/pet/log?petId=' + petId })
}

async function delLog(l) {
  const ok = await new Promise((resolve) => {
    uni.showModal({ title: '删除记录？', success: (res) => resolve(res.confirm) })
  })
  if (!ok) return
  try {
    await api.deleteHealthLog(petId, l.id)
    logs.value = logs.value.filter((x) => x.id !== l.id)
    uni.showToast({ title: '已删除' })
    uni.$emit('data:dirty', { type: 'log', petId })
  } catch (e) {}
}
</script>

<style scoped>
.profile {
  display: flex;
  align-items: center;
  gap: 24rpx;
}
.more { text-align: center; padding: 12rpx 0 4rpx; font-size: 24rpx; }
.profile .avatar.lg {
  width: 120rpx;
  height: 120rpx;
  border-radius: 36rpx;
  flex-shrink: 0;
}
.profile-text {
  flex: 1;
  min-width: 0;
}
.profile-text .name {
  font-family: 'Varela Round', sans-serif;
  font-size: 38rpx;
  color: var(--ink-900);
  margin-bottom: 6rpx;
}
.tags {
  display: flex;
  flex-wrap: wrap;
  gap: 10rpx;
  margin-top: 12rpx;
}
.tag {
  font-size: 22rpx;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  background: var(--pink-100);
  color: var(--pink-500);
}

.block {
  background: linear-gradient(135deg, #fb7185 0%, #f472b6 55%, #ec4899 100%);
  color: #fff;
  border-radius: 28rpx;
  text-align: center;
  padding: 26rpx 32rpx;
  font-weight: 600;
  font-size: 30rpx;
  min-height: 88rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  margin-bottom: 24rpx;
  box-shadow: 0 8px 20px rgba(244, 114, 182, 0.28);
}
.block:active { opacity: 0.9; transform: scale(0.98); }
.block.sm {
  padding: 20rpx 28rpx;
  font-size: 28rpx;
  min-height: 76rpx;
  margin-top: 20rpx;
  box-shadow: none;
}

.empty-block {
  text-align: center;
  padding: 40rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 12rpx;
}

.remind-grid {
  display: flex;
  flex-wrap: wrap;
  gap: 16rpx;
  margin-top: 16rpx;
}
.remind-card {
  width: calc(50% - 8rpx);
  box-sizing: border-box;
  margin-bottom: 0;
  padding: 20rpx;
}
.remind-card.paused { opacity: 0.7; }
.remind-type {
  font-weight: 700;
  color: #831843;
  margin-bottom: 6rpx;
  display: flex;
  align-items: center;
  gap: 8rpx;
  flex-wrap: wrap;
}
.rem-meta { font-size: 22rpx; margin-bottom: 4rpx; }
.paused-tag {
  font-size: 20rpx;
  padding: 2rpx 10rpx;
  border-radius: 999rpx;
  background: #e2e8f0;
  color: #64748b;
}
.rem-foot {
  display: flex;
  gap: 8rpx;
  margin-top: 14rpx;
  align-items: center;
}
.rem-foot .btn-mint {
  flex: 1;
  height: 56rpx;
  min-height: 56rpx;
  font-size: 22rpx;
  padding: 0 12rpx;
  line-height: 1;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.btn-ghost {
  color: var(--pink-500);
  padding: 8rpx 10rpx;
  font-weight: 600;
  font-size: 22rpx;
}
.btn-secondary.sm {
  flex: 1;
  padding: 0 12rpx;
  height: 56rpx;
  min-height: 56rpx;
  font-size: 22rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  line-height: 1;
}

.seg.mini {
  margin-top: 20rpx;
  margin-bottom: 8rpx;
}
.seg.mini .seg-item {
  height: 56rpx;
  min-height: 56rpx;
  padding: 0 12rpx;
  font-size: 22rpx;
  line-height: 1;
}

.log-card {
  display: flex;
  align-items: center;
  gap: 16rpx;
  padding: 22rpx 0;
  border-top: 1rpx solid #fce7f3;
}
.log-card:first-of-type { border-top: none; }
.flex1 { flex: 1; min-width: 0; }
.log-val {
  font-size: 28rpx;
  color: var(--ink-900);
  margin-bottom: 6rpx;
  word-break: break-all;
}
.del-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: #fef2f2;
  color: var(--danger);
  font-size: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}
.del-icon:active { opacity: 0.7; }

.summary-box {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 20rpx;
}
.disc {
  background: var(--pink-50);
  border-radius: 20rpx;
  padding: 20rpx;
  font-size: 24rpx;
  color: var(--ink-500);
}
.disc .num {
  display: block;
  font-family: 'Varela Round', sans-serif;
  font-size: 40rpx;
  color: var(--pink-500);
  margin-bottom: 6rpx;
}

/* #ifdef H5 */
@media (min-width: 900px) {
  .detail-desk {
    display: grid;
    grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.3fr);
    gap: 24px;
    align-items: start;
  }
  .block { cursor: pointer; max-width: 240px; }
  .block:hover { opacity: 0.94; }
  .profile .avatar.lg { width: 96px; height: 96px; border-radius: 24px; }
  .profile-text .name { font-size: 26px; }
}
/* #endif */
</style>
