<template>
  <view class="page narrow">
    <web-side-nav />
    <view class="card">
      <view class="field">
        <text class="field-label">名字 *</text>
        <input class="input" v-model="form.name" maxlength="20" placeholder="给它起个名字" placeholder-class="ph" />
      </view>
      <view class="field">
        <text class="field-label">物种 *</text>
        <picker :range="speciesList" @change="onSpecies">
          <view class="input picker-val">{{ form.species || '请选择' }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="field-label">品种 / 品类</text>
        <input class="input" v-model="form.breed" maxlength="40" placeholder="如：英短、金毛" placeholder-class="ph" />
      </view>
      <view class="field">
        <text class="field-label">性别</text>
        <picker :range="genderList" @change="onGender">
          <view class="input picker-val">{{ form.gender }}</view>
        </picker>
      </view>
      <view class="field" v-if="showNeutered">
        <text class="field-label">绝育</text>
        <picker :range="neuteredLabels" @change="onNeutered">
          <view class="input picker-val">{{ neuteredLabel }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="field-label">生日</text>
        <picker mode="date" @change="e => form.birthday = e.detail.value">
          <view class="input picker-val">{{ form.birthday || '选填' }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="field-label">到家日</text>
        <picker mode="date" @change="e => form.homeDay = e.detail.value">
          <view class="input picker-val">{{ form.homeDay || '选填' }}</view>
        </picker>
      </view>
      <view class="field">
        <text class="field-label">体重 (kg)</text>
        <input class="input" v-model="weight" type="text" inputmode="decimal" placeholder="选填，例如 4.2" placeholder-class="ph" />
      </view>
      <view class="field">
        <text class="field-label">毛色 / 花纹</text>
        <input class="input" v-model="form.coatColor" placeholder="选填" placeholder-class="ph" />
      </view>
      <view class="field">
        <text class="field-label">芯片 / 环号</text>
        <input class="input" v-model="form.chipNo" placeholder="选填" placeholder-class="ph" />
      </view>
      <view class="field">
        <text class="field-label">备注{{ remarkHint }}</text>
        <textarea
          class="input area remark"
          v-model="form.remark"
          maxlength="500"
          :auto-height="false"
          :show-confirm-bar="false"
          :fixed="false"
          disable-default-padding
          placeholder="过敏原、性格、缸体信息等"
          placeholder-class="ph"
          style="height: 72px; min-height: 72px; max-height: 72px;"
        />
      </view>
      <view class="btn-primary" :class="{ 'is-disabled': saving }" @click="save">
        {{ saving ? '保存中…' : '保存档案' }}
      </view>
      <view class="muted disc">可先填名字，其他信息之后再补。</view>
    </view>
  </view>
</template>

<script setup>
import { computed, reactive, ref } from 'vue'
import { onLoad } from '@dcloudio/uni-app'
import { api, ensureFamily } from '../../api/request.js'

const speciesList = ['猫', '狗', '兔', '仓鼠', '龙猫', '鸟', '龟', '鱼', '蜥蜴', '蛇', '昆虫', '其他']
const genderList = ['未知', '男孩', '女孩', '不适用']
const neuteredLabels = ['未填写', '已绝育', '未绝育']
const form = reactive({
  name: '', species: '猫', breed: '', gender: '未知',
  birthday: '', homeDay: '', coatColor: '', chipNo: '', remark: '',
  neuteredIdx: 0
})
const weight = ref('')
const saving = ref(false)
let editId = 0

const showNeutered = computed(() => ['猫', '狗', '兔'].includes(form.species))
const neuteredLabel = computed(() => neuteredLabels[form.neuteredIdx] || '未填写')
const remarkHint = computed(() => {
  if (['鱼', '昆虫'].includes(form.species)) return '（可写缸体/箱体信息）'
  if (['蜥蜴', '蛇', '龟'].includes(form.species)) return '（可写温湿度目标）'
  return ''
})

onLoad(async (q) => {
  try { await ensureFamily() } catch (e) {}
  if (q.id) {
    editId = Number(q.id)
    const list = await api.pets()
    const p = (list || []).find((x) => Number(x.id) === editId)
    if (p) {
      form.name = p.name || ''
      form.species = p.species || '猫'
      form.breed = p.breed || ''
      form.gender = ({ 公: '男孩', 母: '女孩' })[p.gender] || p.gender || '未知'
      form.coatColor = p.coatColor || ''
      form.chipNo = p.chipNo || ''
      form.remark = p.remark || ''
      if (p.birthday) form.birthday = String(p.birthday).slice(0, 10)
      if (p.homeDay) form.homeDay = String(p.homeDay).slice(0, 10)
      if (p.weight != null) weight.value = String(p.weight)
      if (p.neutered === true) form.neuteredIdx = 1
      else if (p.neutered === false) form.neuteredIdx = 2
    }
  }
})
function onSpecies(e) { form.species = speciesList[e.detail.value] }
function onGender(e) { form.gender = genderList[e.detail.value] }
function onNeutered(e) { form.neuteredIdx = Number(e.detail.value) }

function dateOrNull(s) {
  if (!s) return undefined
  return s + 'T00:00:00+08:00'
}

async function save() {
  if (!form.name.trim()) {
    uni.showToast({ title: '请填写名字', icon: 'none' })
    return
  }
  if (saving.value) return
  saving.value = true
  try {
    await ensureFamily()
    const data = {
      name: form.name.trim(),
      species: form.species,
      breed: form.breed.trim(),
      gender: form.gender,
      coatColor: form.coatColor.trim(),
      chipNo: form.chipNo.trim(),
      remark: form.remark.trim()
    }
    if (form.birthday) data.birthday = dateOrNull(form.birthday)
    if (form.homeDay) data.homeDay = dateOrNull(form.homeDay)
    if (showNeutered.value && form.neuteredIdx > 0) {
      data.neutered = form.neuteredIdx === 1
    }
    if (weight.value !== '') data.weight = Number(weight.value)
    if (editId) await api.updatePet(editId, data)
    else await api.createPet(data)
    uni.showToast({ title: '已保存' })
    uni.$emit('data:dirty', { type: 'pet' })
    setTimeout(() => {
      const pages = getCurrentPages()
      if (pages.length > 1) uni.navigateBack()
      else uni.switchTab({ url: '/pages/pet/list' })
    }, 400)
  } catch (e) {
  } finally {
    saving.value = false
  }
}
</script>

<style scoped>
.area.remark {
  width: 100%;
  height: 120rpx !important;
  min-height: 120rpx !important;
  max-height: 120rpx !important;
  line-height: 1.45;
  padding: 16rpx 22rpx;
  box-sizing: border-box;
  overflow-y: auto;
}
.picker-val { display: flex; align-items: center; height: 88rpx; line-height: 1.2; }
.ph { color: #9ba49f; line-height: inherit; }
.is-disabled { opacity: 0.45; pointer-events: none; }
.disc { margin-top: 20rpx; text-align: center; }
</style>
