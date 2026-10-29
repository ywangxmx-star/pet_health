<template>
  <view class="page">
    <web-side-nav />
    <view class="card">
      <view class="field">
        <text class="field-label">提醒类型</text>
        <picker :range="templates" range-key="label" @change="onTpl">
          <view class="input picker-val">{{ form.type }}</view>
        </picker>
      </view>
      <view class="field" v-if="form.type === '自定义'">
        <text class="field-label">自定义名称 *</text>
        <input class="input" v-model="customName" placeholder="例如：剪指甲" placeholder-class="ph" />
      </view>
      <view class="field row-switch">
        <view>
          <text class="field-label" style="margin-bottom:0">周期提醒</text>
          <view class="muted xs">关闭则为单次提醒，打卡后不再循环</view>
        </view>
        <switch :checked="cycleOn" color="#F472B6" @change="onCycleSwitch" />
      </view>
      <view class="field" v-if="cycleOn">
        <text class="field-label">周期（天）*</text>
        <picker :range="cycleOptions" @change="onCycle">
          <view class="input picker-val">每 {{ form.cycleDays }} 天</view>
        </picker>
      </view>
      <view class="field">
        <text class="field-label">提前提醒（天）</text>
        <picker :range="beforeOptions" @change="onBefore">
          <view class="input picker-val">提前 {{ form.remindBeforeDays }} 天</view>
        </picker>
      </view>
      <view class="field">
        <text class="field-label">{{ cycleOn ? '下次时间' : '提醒时间' }} *</text>
        <view class="dt-row">
          <picker mode="date" :value="dueDate" @change="e => dueDate = e.detail.value">
            <view class="input picker-val flex1">{{ dueDate }}</view>
          </picker>
          <picker mode="time" :value="dueTime" @change="e => dueTime = e.detail.value">
            <view class="input picker-val time-box">{{ dueTime }}</view>
          </picker>
        </view>
      </view>
      <view class="btn-primary" :class="{ 'is-disabled': saving }" @click="save">
        {{ saving ? '保存中…' : (editId ? '更新提醒' : '保存提醒') }}
      </view>
      <view v-if="editId" class="btn-secondary danger" @click="remove">删除此提醒</view>
      <view class="muted disc">{{ cycleOn ? '进入提醒窗口后可在首页打卡，打卡后自动滚到下一周期。' : '到期后可在首页打卡，完成后不再提醒。' }}</view>
    </view>
  </view>
</template>

<script setup>
import { reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api, ensureFamily } from '../../api/request.js'

const templates = [
  { label: '疫苗', days: 365 },
  { label: '体内驱虫', days: 90 },
  { label: '体外驱虫', days: 30 },
  { label: '洗澡/美容', days: 30 },
  { label: '换水', days: 7 },
  { label: '换垫料', days: 7 },
  { label: '修剪指甲', days: 30 },
  { label: '复查', days: 14 },
  { label: '自定义', days: 30 }
]
const cycleOptions = [7, 14, 30, 60, 90, 180, 365]
const beforeOptions = [0, 1, 2, 3, 5, 7]

const form = reactive({ type: '体内驱虫', cycleDays: 90, remindBeforeDays: 3 })
const cycleOn = ref(true)
const customName = ref('')
const dueDate = ref('')
const dueTime = ref('')
const saving = ref(false)
let petId = 0
let editId = 0

function nowParts() {
  const d = new Date()
  const y = d.getFullYear()
  const m = String(d.getMonth() + 1).padStart(2, '0')
  const day = String(d.getDate()).padStart(2, '0')
  const hh = String(d.getHours()).padStart(2, '0')
  const mm = String(d.getMinutes()).padStart(2, '0')
  return { date: `${y}-${m}-${day}`, time: `${hh}:${mm}` }
}

function parseDue(raw) {
  if (!raw) return nowParts()
  const s = String(raw).replace('T', ' ')
  const date = s.slice(0, 10)
  let time = s.slice(11, 16)
  if (!/^\d{2}:\d{2}$/.test(time)) time = nowParts().time
  return { date, time }
}

onLoad(async (q) => {
  petId = Number(q.petId)
  if (q.id) {
    editId = Number(q.id)
    if (q.type) form.type = decodeURIComponent(q.type)
    if (q.cycle != null && q.cycle !== '') form.cycleDays = Number(q.cycle)
    cycleOn.value = Number(form.cycleDays) > 0
    if (!cycleOn.value) form.cycleDays = 30
    if (q.before) form.remindBeforeDays = Number(q.before)
    const p = parseDue(q.due || '')
    dueDate.value = p.date
    dueTime.value = q.time || p.time
    if (!templates.find((t) => t.label === form.type)) {
      customName.value = form.type
      form.type = '自定义'
    }
  } else {
    const p = nowParts()
    dueDate.value = p.date
    dueTime.value = p.time
  }
  try { await ensureFamily() } catch (e) {}
})

function onTpl(e) {
  const t = templates[e.detail.value]
  form.type = t.label
  form.cycleDays = t.days
  cycleOn.value = true
}
function onCycleSwitch(e) {
  cycleOn.value = !!e.detail.value
  if (cycleOn.value && form.cycleDays <= 0) form.cycleDays = 30
}
function onCycle(e) { form.cycleDays = cycleOptions[e.detail.value] }
function onBefore(e) { form.remindBeforeDays = beforeOptions[e.detail.value] }

async function save() {
  let type = form.type
  if (type === '自定义') {
    type = customName.value.trim()
    if (!type) {
      uni.showToast({ title: '请填写自定义名称', icon: 'none' })
      return
    }
  }
  if (!dueDate.value || !dueTime.value) {
    uni.showToast({ title: '请选择日期和时间', icon: 'none' })
    return
  }
  if (saving.value) return
  saving.value = true
  try {
    const payload = {
      type,
      cycleDays: cycleOn.value ? form.cycleDays : 0,
      remindBeforeDays: form.remindBeforeDays,
      nextDueAt: `${dueDate.value}T${dueTime.value}:00+08:00`,
      status: 'active'
    }
    if (editId) {
      await api.updateReminder(petId, editId, payload)
    } else {
      await api.createReminder(petId, payload)
    }
    uni.showToast({ title: '已保存' })
    uni.$emit('data:dirty', { type: 'reminder', petId })
    setTimeout(() => uni.navigateBack(), 400)
  } catch (e) {
  } finally {
    saving.value = false
  }
}

async function remove() {
  const ok = await new Promise((resolve) => {
    uni.showModal({ title: '删除提醒？', success: (res) => resolve(res.confirm) })
  })
  if (!ok) return
  try {
    await api.deleteReminder(petId, editId)
    uni.showToast({ title: '已删除' })
    uni.$emit('data:dirty', { type: 'reminder', petId })
    setTimeout(() => uni.navigateBack(), 400)
  } catch (e) {}
}
</script>

<style scoped>
.picker-val { display: flex; align-items: center; height: 88rpx; min-height: 88rpx; line-height: 1.2; }
.ph { color: #94a3b8; line-height: inherit; }
.is-disabled { opacity: 0.45; pointer-events: none; }
.danger { color: #dc2626; background: #fef2f2; margin-top: 12rpx; }
.disc { margin-top: 20rpx; text-align: center; }
.row-switch {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 24rpx;
}
.xs { font-size: 22rpx; margin-top: 6rpx; }
.dt-row {
  display: flex;
  gap: 16rpx;
}
.flex1 { flex: 1; min-width: 0; }
.time-box { width: 200rpx; justify-content: center; }
</style>
