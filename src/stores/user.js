import { defineStore } from 'pinia'

export const useUserStore = defineStore('user', {
  state: () => ({
    user: null,
    familyId: String(uni.getStorageSync('familyId') || ''),
    familyRole: ''
  }),
  actions: {
    setAuth(data) {
      uni.setStorageSync('accessToken', data.accessToken || '')
      uni.setStorageSync('refreshToken', data.refreshToken || '')
      this.user = data.user || null
    },
    setFamily(id, role) {
      const fid = String(id || '')
      this.familyId = fid
      this.familyRole = role || ''
      uni.setStorageSync('familyId', fid)
    },
    logout() {
      this.user = null
      this.familyId = ''
      this.familyRole = ''
      uni.removeStorageSync('accessToken')
      uni.removeStorageSync('refreshToken')
      uni.removeStorageSync('familyId')
    }
  }
})
