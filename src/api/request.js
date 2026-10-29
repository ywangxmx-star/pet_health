// #ifdef H5
const BASE_URL = import.meta.env.VITE_API_BASE || ''
// #endif
// #ifndef H5
const BASE_URL = import.meta.env.VITE_API_BASE || 'http://127.0.0.1:8080'
// #endif

function getToken() {
  return uni.getStorageSync('accessToken') || ''
}

function getFamilyId() {
  const v = uni.getStorageSync('familyId')
  return v === undefined || v === null || v === '' ? '' : String(v)
}

let refreshingPromise = null
function refreshTokens() {
  if (refreshingPromise) return refreshingPromise
  const rt = uni.getStorageSync('refreshToken')
  if (!rt) return Promise.resolve(false)
  refreshingPromise = new Promise((resolve) => {
    uni.request({
      url: BASE_URL + '/api/v1/auth/refresh',
      method: 'POST',
      data: { refreshToken: rt },
      timeout: 10000,
      success(res) {
        const body = res.data
        if (res.statusCode === 200 && body && body.code === 0 && body.data && body.data.accessToken) {
          uni.setStorageSync('accessToken', body.data.accessToken)
          uni.setStorageSync('refreshToken', body.data.refreshToken || rt)
          resolve(true)
        } else {
          resolve(false)
        }
      },
      fail() { resolve(false) }
    })
  }).then((ok) => {
    refreshingPromise = null
    return ok
  })
  return refreshingPromise
}

function rawRequest(options) {
  const header = Object.assign({
    'Content-Type': 'application/json'
  }, options.header || {})
  const token = getToken()
  if (token) header.Authorization = 'Bearer ' + token
  const familyId = getFamilyId()
  if (familyId && !options.skipFamily) header['X-Family-Id'] = familyId

  return new Promise((resolve, reject) => {
    uni.request({
      url: BASE_URL + options.url,
      method: options.method || 'GET',
      data: options.data,
      header,
      timeout: options.timeout || 15000,
      success: resolve,
      fail(err) {
        uni.showToast({ title: '网络错误，请确认后端已启动', icon: 'none' })
        reject(err)
      }
    })
  })
}

export function request(options) {
  return rawRequest(options).then(async (res) => {
    const body = res.data
    if (typeof body !== 'object' || body === null) {
      uni.showToast({ title: '接口异常', icon: 'none' })
      throw new Error('invalid response')
    }
    if (res.statusCode === 401 || body.code === 401) {
      const retried = options._retried
      if (!retried && await refreshTokens()) {
        return request(Object.assign({}, options, { _retried: true }))
      }
      uni.removeStorageSync('accessToken')
      uni.removeStorageSync('refreshToken')
      throw new Error(body.message || '未登录')
    }
    if (body.code !== 0) {
      uni.showToast({ title: body.message || '请求失败', icon: 'none' })
      throw new Error(body.message || 'error')
    }
    return body.data
  })
}

export async function ensureFamily() {
  let fid = getFamilyId()
  if (fid) return fid
  const families = await request({ url: '/api/v1/families', skipFamily: true })
  if (families && families.length) {
    fid = String(families[0].family.id)
    uni.setStorageSync('familyId', fid)
    return fid
  }
  const f = await request({ url: '/api/v1/families', method: 'POST', data: { name: '我的家庭' }, skipFamily: true })
  fid = String(f.id)
  uni.setStorageSync('familyId', fid)
  return fid
}

export function promptText(title, placeholder) {
  return new Promise((resolve) => {
    if (typeof window !== 'undefined' && typeof window.prompt === 'function') {
      const v = window.prompt(title + (placeholder ? `\n${placeholder}` : ''), '')
      resolve(v === null ? null : String(v).trim())
      return
    }
    uni.showModal({
      title,
      editable: true,
      placeholderText: placeholder || '',
      success: (res) => {
        if (!res.confirm) resolve(null)
        else resolve(String(res.content || '').trim())
      },
      fail: () => resolve(null)
    })
  })
}

export const api = {
  sendEmailCode: (email) => request({ url: '/api/v1/auth/email/send', method: 'POST', data: { email }, skipFamily: true }),
  login: (data) => request({ url: '/api/v1/auth/login', method: 'POST', data, skipFamily: true }),
  wxLogin: (data) => request({ url: '/api/v1/auth/wx-login', method: 'POST', data, skipFamily: true }),
  bindEmail: (data) => request({ url: '/api/v1/auth/bind/email', method: 'POST', data, skipFamily: true }),
  updateNickname: (nickname) => request({ url: '/api/v1/auth/nickname', method: 'POST', data: { nickname }, skipFamily: true }),
  updateAvatar: (avatar) => request({ url: '/api/v1/auth/avatar', method: 'POST', data: { avatar }, skipFamily: true }),
  profile: () => request({ url: '/api/v1/auth/profile', skipFamily: true }),

  families: () => request({ url: '/api/v1/families', skipFamily: true }),
  createFamily: (name) => request({ url: '/api/v1/families', method: 'POST', data: { name }, skipFamily: true }),
  createInvite: () => request({ url: '/api/v1/families/invites', method: 'POST' }),
  acceptInvite: (code) => request({ url: '/api/v1/invites/accept', method: 'POST', data: { code }, skipFamily: true }),
  members: (page) => request({ url: '/api/v1/families/members', data: page ? { page, pageSize: 20 } : {} }),
  removeMember: (userId) => request({ url: '/api/v1/families/members/' + userId, method: 'DELETE' }),
  pets: (page) => request({ url: '/api/v1/pets', data: page ? { page, pageSize: 20 } : {} }),
  createPet: (data) => request({ url: '/api/v1/pets', method: 'POST', data }),
  updatePet: (id, data) => request({ url: '/api/v1/pets/' + id, method: 'PUT', data }),
  deletePet: (id) => request({ url: '/api/v1/pets/' + id, method: 'DELETE' }),
  todayReminders: (page) => request({ url: '/api/v1/reminders/today', data: page ? { page, pageSize: 20 } : {} }),
  reminders: (petId, page) => request({ url: '/api/v1/pets/' + petId + '/reminders', data: page ? { page, pageSize: 20 } : {} }),
  createReminder: (petId, data) => request({ url: '/api/v1/pets/' + petId + '/reminders', method: 'POST', data }),
  updateReminder: (petId, id, data) => request({ url: '/api/v1/pets/' + petId + '/reminders/' + id, method: 'PUT', data }),
  deleteReminder: (petId, id) => request({ url: '/api/v1/pets/' + petId + '/reminders/' + id, method: 'DELETE' }),
  checkin: (id, note) => request({ url: '/api/v1/reminders/' + id + '/checkin', method: 'POST', data: { note } }),
  healthLogs: (petId, type, page = 1) => request({
    url: '/api/v1/pets/' + petId + '/health-logs',
    data: Object.assign({ page, pageSize: 20 }, type ? { type } : {})
  }),
  createHealthLog: (petId, data) => request({ url: '/api/v1/pets/' + petId + '/health-logs', method: 'POST', data }),
  deleteHealthLog: (petId, id) => request({ url: '/api/v1/pets/' + petId + '/health-logs/' + id, method: 'DELETE' }),
  summary: (petId, days) => request({ url: '/api/v1/pets/' + petId + '/summary?days=' + days }),
  portrait: (petId) => request({ url: '/api/v1/pets/' + petId + '/portrait', timeout: 60000 }),
  refreshPortrait: (petId) => request({ url: '/api/v1/pets/' + petId + '/portrait/refresh', method: 'POST', timeout: 60000 }),
  articles: (species, page = 1) => request({
    url: '/api/v1/articles',
    data: Object.assign({ page, pageSize: 20 }, species ? { species } : {}),
    skipFamily: true
  }),
  article: (id) => request({ url: '/api/v1/articles/' + id, skipFamily: true }),
  notifications: (page = 1) => request({ url: '/api/v1/notifications', data: { page, pageSize: 20 }, skipFamily: true }),
  readNotification: (id) => request({ url: '/api/v1/notifications/' + id + '/read', method: 'POST', skipFamily: true }),
  readAllNotifications: () => request({ url: '/api/v1/notifications/read-all', method: 'POST', skipFamily: true }),
  createFeedback: (data) => request({ url: '/api/v1/feedback', method: 'POST', data, skipFamily: true }),
  uploadSign: (data) => request({ url: '/api/v1/upload/sign', method: 'POST', data, skipFamily: true })
}

export function uploadFile(filePath, prefix = 'feedback') {
  const token = getToken()
  return new Promise((resolve, reject) => {
    uni.uploadFile({
      url: BASE_URL + '/api/v1/upload',
      filePath,
      name: 'file',
      formData: { prefix },
      header: token ? { Authorization: 'Bearer ' + token } : {},
      success(res) {
        let body = res.data
        if (typeof body === 'string') {
          try { body = JSON.parse(body) } catch (e) { body = null }
        }
        if (!body || body.code !== 0) {
          uni.showToast({ title: (body && body.message) || '上传失败', icon: 'none' })
          reject(new Error((body && body.message) || 'upload failed'))
          return
        }
        resolve(body.data)
      },
      fail(err) {
        uni.showToast({ title: '上传失败', icon: 'none' })
        reject(err)
      }
    })
  })
}
