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
        <view v-if="pet.remark" class="remark">{{ pet.remark }}</view>
      </view>
    </view>
    <view class="profile-actions">
      <view class="btn-pill" @click="goEdit">编辑档案</view>
      <view class="btn-pill primary" @click="goPortrait">近况小结</view>
    </view>

    <view class="section-head">
      <view class="section-title">近 30 天</view>
    </view>
    <view v-if="!summary" class="card muted">暂无数据</view>
    <view v-else class="stats">
      <view class="stat"><text class="stat-num">{{ summary.weightLatest ? summary.weightLatest : '—' }}</text><text class="stat-label">体重 kg</text></view>
      <view class="stat"><text class="stat-num">{{ summary.weightTrend || '—' }}</text><text class="stat-label">趋势</text></view>
      <view class="stat"><text class="stat-num">{{ summary.reminderDueCount || 0 }}</text><text class="stat-label">待办</text></view>
      <view class="stat"><text class="stat-num">{{ summary.logCount || 0 }}</text><text class="stat-label">记录</text></view>
    </view>
      </view>

      <view class="detail-col">
    <view class="section-head">
      <view class="section-title">护理提醒</view>
      <view class="link" @click="addReminder">添加</view>
    </view>
    <view v-if="!reminders.length" class="card empty-block">
      <view class="muted">还没有提醒，添加一条开始守护</view>
      <view class="btn-pill primary" @click="addReminder">添加提醒</view>
    </view>
    <view v-else class="group">
      <view v-for="r in reminders" :key="r.id" class="group-row" :class="{ paused: r.status === 'paused' }">
        <view class="group-main">
          <view class="group-title remind-type">
            {{ r.type }}
            <text v-if="r.status === 'paused'" class="paused-tag">已暂停</text>
          </view>
          <view class="group-desc">{{ remCycleText(r) }} · {{ formatTime(r.nextDueAt) }}</view>
        </view>
        <view v-if="r.status !== 'paused'" class="btn-pill primary" @click="checkin(r)">打卡</view>
        <view v-else class="btn-pill" @click="togglePause(r)">恢复</view>
        <view class="more-btn" @click="openRemMenu(r)" aria-label="更多操作">···</view>
      </view>
    </view>
    <view v-if="reminders.length" class="more muted" :class="remEndClass">{{ remMore }}</view>

    <view class="section-head log-head">
      <view class="section-title">健康记录</view>
      <view class="link" @click="addLog">记录</view>
    </view>
    <view class="card log-wrap">
      <view class="seg mini">
        <view class="seg-item" :class="{ on: logType === '' }" @click="setLogType('')">全部</view>
        <view class="seg-item" :class="{ on: logType === 'weight' }" @click="setLogType('weight')">体重</view>
        <view class="seg-item" :class="{ on: logType === 'diet' }" @click="setLogType('diet')">饮食</view>
        <view class="seg-item" :class="{ on: logType === 'medicine' }" @click="setLogType('medicine')">用药</view>
      </view>
      <view v-if="!logs.length" class="empty-block">
        <view class="muted">还没有记录</view>
        <view class="btn-pill primary" @click="addLog">添加记录</view>
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
  border-radius: 50%;
  flex-shrink: 0;
}
.profile-text {
  flex: 1;
  min-width: 0;
}
.profile-text .name {
  font-family: var(--font-display); font-weight: 600;
  font-size: 38rpx;
  color: var(--ink);
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
  background: var(--brand-soft);
  color: var(--brand-strong);
}

.remark { margin-top: 12rpx; font-size: 24rpx; color: var(--muted); line-height: 1.6; }
.profile-actions {
  display: flex;
  gap: 16rpx;
  margin: -8rpx 0 48rpx;
}
.profile-actions .btn-pill { flex: 1; height: 76rpx; font-size: 26rpx; }

.empty-block {
  text-align: center;
  padding: 40rpx 16rpx;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 20rpx;
  margin-bottom: 24rpx;
}

.group-row.paused { opacity: 0.6; }
.remind-type {
  display: flex;
  align-items: center;
  gap: 12rpx;
  flex-wrap: wrap;
}
.paused-tag {
  font-size: 20rpx;
  font-weight: 500;
  padding: 2rpx 12rpx;
  border-radius: 999rpx;
  background: var(--bg);
  color: var(--muted);
}
.more-btn {
  width: 56rpx;
  height: 56rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--subtle);
  font-size: 28rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  border-radius: 50%;
  flex-shrink: 0;
}
.more-btn:active { background: var(--bg); }
.log-head { margin-top: 48rpx; }
.log-wrap { padding-top: 12rpx; }

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
  border-top: 1rpx solid var(--line);
}
.log-card:first-of-type { border-top: none; }
.flex1 { flex: 1; min-width: 0; }
.log-val {
  font-size: 28rpx;
  color: var(--ink);
  margin-bottom: 6rpx;
  word-break: break-all;
}
.del-icon {
  width: 56rpx;
  height: 56rpx;
  border-radius: 50%;
  background: var(--danger-soft);
  color: var(--danger);
  font-size: 36rpx;
  display: flex;
  align-items: center;
  justify-content: center;
  flex-shrink: 0;
  line-height: 1;
}
.del-icon:active { opacity: 0.7; }

/* #ifdef H5 */
@media (min-width: 900px) {
  .detail-desk {
    display: grid;
    grid-template-columns: minmax(280px, 0.9fr) minmax(0, 1.3fr);
    gap: 24px;
    align-items: start;
  }
  .detail-desk { gap: 40px; }
  .profile .avatar.lg { width: 88px; height: 88px; border-radius: 50%; }
  .profile-text .name { font-size: 24px; }
  .remark { font-size: 13px; }
  .profile-actions { gap: 10px; margin: -4px 0 36px; }
  .profile-actions .btn-pill { height: 38px; font-size: 14px; }
  .log-head { margin-top: 36px; }
  .more-btn { width: 32px; height: 32px; font-size: 14px; cursor: pointer; }
  .more-btn:hover { background: var(--bg); }
  .empty-block { padding: 28px 16px; gap: 14px; }
}
/* #endif */
</style>
