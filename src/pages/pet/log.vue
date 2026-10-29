<template>
  <view class="page">
    <web-side-nav />
    <view class="card">
      <view class="field">
        <text class="field-label">记录类型</text>
        <picker :range="typeLabels" @change="onType">
          <view class="input picker-val">{{ typeLabel }}</view>
        </picker>
      </view>

      <template v-if="form.type === 'weight'">
        <view class="field">
          <text class="field-label">体重 (kg) *</text>
          <input
            class="input"
            v-model="form.value"
            type="text"
            inputmode="decimal"
            placeholder="例如 4.2"
            placeholder-class="ph"
          />
        </view>
      </template>

      <template v-else-if="form.type === 'diet'">
        <view class="field">
          <text class="field-label">食物 *</text>
          <input class="input" v-model="meta.food" placeholder="品牌/种类" placeholder-class="ph" />
        </view>
        <view class="field">
          <text class="field-label">分量</text>
          <input class="input" v-model="meta.amount" placeholder="例如 50g / 半碗" placeholder-class="ph" />
        </view>
        <view class="field">
          <text class="field-label">是否剩食</text>
          <picker :range="['否', '是']" @change="e => meta.leftover = e.detail.value === '1'">
            <view class="input picker-val">{{ meta.leftover ? '是' : '否' }}</view>
          </picker>
        </view>
      </template>

      <template v-else-if="form.type === 'stool'">
        <view class="field">
          <text class="field-label">性状 *</text>
          <picker :range="stoolOpts" @change="e => meta.shape = stoolOpts[e.detail.value]">
            <view class="input picker-val">{{ meta.shape || '请选择' }}</view>
          </picker>
        </view>
        <view class="field">
          <text class="field-label">备注</text>
          <input class="input" v-model="form.content" placeholder="可选" placeholder-class="ph" />
        </view>
      </template>

      <template v-else-if="form.type === 'spirit'">
        <view class="field">
          <text class="field-label">精神状态 *</text>
          <picker :range="spiritOpts" @change="e => meta.level = spiritOpts[e.detail.value]">
            <view class="input picker-val">{{ meta.level || '请选择' }}</view>
          </picker>
        </view>
        <view class="field">
          <text class="field-label">备注</text>
          <input class="input" v-model="form.content" placeholder="可选" placeholder-class="ph" />
        </view>
      </template>

      <template v-else-if="form.type === 'medicine'">
        <view class="field">
          <text class="field-label">药名 *</text>
          <input class="input" v-model="meta.drug" placeholder="药品名称" placeholder-class="ph" />
        </view>
        <view class="field">
          <text class="field-label">剂量</text>
          <input class="input" v-model="meta.dose" placeholder="例如 半片" placeholder-class="ph" />
        </view>
        <view class="field">
          <text class="field-label">途径</text>
          <picker :range="routeOpts" @change="e => meta.route = routeOpts[e.detail.value]">
            <view class="input picker-val">{{ meta.route || '口服' }}</view>
          </picker>
        </view>
      </template>

      <template v-else>
        <view class="field">
          <text class="field-label">描述 *</text>
          <textarea class="input area" v-model="form.content" :auto-height="false" disable-default-padding placeholder="症状或说明" placeholder-class="ph" style="height: 108px; min-height: 108px;" />
        </view>
      </template>

      <view class="field">
        <text class="field-label">发生时间</text>
        <view class="ts-row">
          <picker mode="date" :value="occurDate" @change="e => occurDate = e.detail.value">
            <view class="input picker-val flex">{{ occurDate }}</view>
          </picker>
          <picker mode="time" :value="occurTime" @change="e => occurTime = e.detail.value">
            <view class="input picker-val">{{ occurTime }}</view>
          </picker>
        </view>
      </view>

      <view class="btn-primary" :class="{ 'is-disabled': saving }" @click="save">
        {{ saving ? '保存中…' : '保存记录' }}
      </view>
      <view class="muted disc">记录会显示操作人，方便家庭成员对照。</view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api, ensureFamily } from '../../api/request.js'

const types = ['weight', 'diet', 'stool', 'spirit', 'medicine', 'symptom', 'vomit']
const typeLabels = ['体重', '饮食', '排泄', '精神', '用药', '症状', '呕吐']
const stoolOpts = ['正常', '偏软', '腹泻', '便秘', '其他']
const spiritOpts = ['活泼', '正常', '萎靡']
const routeOpts = ['口服', '外用', '注射', '其他']

const form = reactive({ type: 'weight', value: '', content: '' })
const meta = reactive({ food: '', amount: '', leftover: false, shape: '正常', level: '正常', drug: '', dose: '', route: '口服' })
function nowLocal() {
  const d = new Date()
  const pad = (n) => String(n).padStart(2, '0')
  return {
    date: d.getFullYear() + '-' + pad(d.getMonth() + 1) + '-' + pad(d.getDate()),
    time: pad(d.getHours()) + ':' + pad(d.getMinutes())
  }
}
const _now = nowLocal()
const occurDate = ref(_now.date)
const occurTime = ref(_now.time)
const saving = ref(false)
let petId = 0

const typeLabel = computed(() => typeLabels[types.indexOf(form.type)] || '体重')

onLoad(async (q) => {
  petId = Number(q.petId)
  if (q.type && types.includes(q.type)) form.type = q.type
  try { await ensureFamily() } catch (e) {}
})

function onType(e) { form.type = types[e.detail.value] }

function buildPayload() {
  const payload = {
    type: form.type,
    occurredAt: occurDate.value + 'T' + (occurTime.value || '12:00') + ':00+08:00'
  }
  const t = form.type
  if (t === 'weight') {
    payload.value = Number(form.value)
    payload.content = '体重'
  } else if (t === 'diet') {
    payload.content = [meta.food, meta.amount, meta.leftover ? '有剩食' : '吃完'].filter(Boolean).join(' · ')
    payload.metaJson = JSON.stringify({ food: meta.food, amount: meta.amount, leftover: meta.leftover })
  } else if (t === 'stool') {
    payload.content = meta.shape + (form.content ? ' · ' + form.content : '')
    payload.metaJson = JSON.stringify({ shape: meta.shape })
  } else if (t === 'spirit') {
    payload.content = meta.level + (form.content ? ' · ' + form.content : '')
    payload.metaJson = JSON.stringify({ level: meta.level })
  } else if (t === 'medicine') {
    payload.content = [meta.drug, meta.dose, meta.route].filter(Boolean).join(' · ')
    payload.metaJson = JSON.stringify({ drug: meta.drug, dose: meta.dose, route: meta.route })
  } else {
    payload.content = form.content.trim()
  }
  return payload
}

function validate() {
  const t = form.type
  if (t === 'weight' && (!form.value || !Number(form.value))) return '请输入体重'
  if (t === 'diet' && !meta.food.trim()) return '请填写食物'
  if (t === 'stool' && !meta.shape) return '请选择性状'
  if (t === 'spirit' && !meta.level) return '请选择精神状态'
  if (t === 'medicine' && !meta.drug.trim()) return '请填写药名'
  if ((t === 'symptom' || t === 'vomit') && !form.content.trim()) return '请填写描述'
  return ''
}

async function save() {
  const err = validate()
  if (err) {
    uni.showToast({ title: err, icon: 'none' })
    return
  }
  if (saving.value) return
  saving.value = true
  try {
    await api.createHealthLog(petId, buildPayload())
    uni.showToast({ title: '已保存' })
    uni.$emit('data:dirty', { type: 'log', petId })
    setTimeout(() => uni.navigateBack(), 400)
  } catch (e) {
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.area { width: 100%; height: 180rpx !important; min-height: 180rpx !important; line-height: 1.5; padding: 20rpx 22rpx; box-sizing: border-box; }
.ts-row { display: flex; gap: 12rpx; }
.ts-row .flex { flex: 1; }
.picker-val { display: flex; align-items: center; height: 88rpx; min-height: 88rpx; line-height: 1.2; }
.ph { color: #94a3b8; line-height: inherit; }
.is-disabled { opacity: 0.45; pointer-events: none; }
.disc { margin-top: 20rpx; text-align: center; }
</style>
