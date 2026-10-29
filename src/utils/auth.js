export function isLoggedIn() {
  return !!uni.getStorageSync('accessToken')
}

/** Soft login prompt. Returns true if already logged in. */
export function requireLogin(tip) {
  if (isLoggedIn()) return true
  uni.showModal({
    title: tip || '需要登录',
    content: '登录后可使用宠物档案、提醒与健康记录。也可先逛百科。',
    confirmText: '去登录',
    cancelText: '先逛逛',
    success: (res) => {
      if (res.confirm) uni.navigateTo({ url: '/pages/login/login' })
    }
  })
  return false
}
