<script>
export default {
  onLaunch() {
    const um = uni.getUpdateManager && uni.getUpdateManager()
    if (um) {
      um.onUpdateReady(() => {
        uni.showModal({
          title: '更新提示',
          content: '新版本已准备好，需重启应用完成更新。',
          showCancel: false,
          confirmText: '立即重启',
          success: () => um.applyUpdate()
        })
      })
      um.onUpdateFailed(() => {
        uni.showModal({
          title: '更新失败',
          content: '请删除小程序后重新搜索打开，以获取最新版本。',
          showCancel: false
        })
      })
    }
    if (uni.getStorageSync('privacyAgreed')) return
    uni.showModal({
      title: '隐私与免责提示',
      content: '欢迎使用爪爪养宠助手。我们重视您的隐私；本应用仅供养宠事务提醒与日常笔记，不能替代执业兽医。请阅读《隐私政策》与《免责声明》。登录非强制。',
      confirmText: '同意并继续',
      cancelText: '查看详情',
      success: (res) => {
        if (res.confirm) {
          uni.setStorageSync('privacyAgreed', '1')
        } else {
          uni.navigateTo({ url: '/pages/legal/privacy' })
        }
      }
    })
  }
}
</script>

<style>
/* #ifdef H5 */
@import url('https://fonts.googleapis.com/css2?family=Nunito+Sans:wght@400;500;600;700&family=Varela+Round&display=swap');
/* #endif */

page {
  --pink-500: #f472b6;
  --pink-400: #fb7185;
  --pink-300: #f9a8d4;
  --pink-100: #fce7f3;
  --pink-50: #fdf2f8;
  --mint-500: #34d399;
  --mint-100: #d1fae5;
  --ink-900: #831843;
  --ink-700: #9d174d;
  --ink-500: #64748b;
  --white: #ffffff;
  --danger: #dc2626;
  --border: #fbcfe8;
  --radius: 20px;
  --shadow: 0 8px 28px rgba(244, 114, 182, 0.1);
  --ease: 180ms ease;

  min-height: 100%;
  background: linear-gradient(165deg, #fdf2f8 0%, #fff1f5 40%, #ffffff 100%);
  color: var(--ink-900);
  font-family: 'Nunito Sans', 'PingFang SC', 'Noto Sans SC', sans-serif;
  font-size: 28rpx;
  line-height: 1.55;
}

.page {
  padding: 24rpx 28rpx calc(48rpx + env(safe-area-inset-bottom));
  max-width: 960px;
  margin: 0 auto;
  box-sizing: border-box;
}

/* #ifdef H5 */
uni-page-body .btn-primary,
uni-page-body .btn-secondary,
uni-page-body .btn-mint,
uni-page-body .seg-item {
  display: flex !important;
  align-items: center !important;
  justify-content: center !important;
  line-height: 1 !important;
  padding-top: 0 !important;
  padding-bottom: 0 !important;
}
uni-page-body uni-input.input,
uni-page-body .input.uni-input {
  height: 44px !important;
  min-height: 44px !important;
  padding: 0 11px !important;
  display: flex !important;
  align-items: center !important;
  box-sizing: border-box !important;
  line-height: 44px !important;
}
uni-page-body uni-input.input .uni-input-wrapper,
uni-page-body .input.uni-input .uni-input-wrapper {
  width: 100% !important;
  height: 100% !important;
  display: flex !important;
  align-items: center !important;
}
uni-page-body uni-input.input .uni-input-input,
uni-page-body .input.uni-input .uni-input-input,
uni-page-body uni-input.input input,
uni-page-body .input.uni-input input {
  height: 100% !important;
  line-height: normal !important;
  padding: 0 !important;
  margin: 0 !important;
}
uni-page-body .input.picker-val {
  height: 44px !important;
  min-height: 44px !important;
  line-height: 1.2 !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 11px !important;
}
uni-page-body .seg-item {
  height: 32px !important;
  min-height: 32px !important;
}
uni-page-body .seg.mini .seg-item {
  height: 28px !important;
  min-height: 28px !important;
  font-size: 12px !important;
}
@media (min-width: 900px) {
  .uni-tabbar-bottom,
  .uni-tabbar-bottom .uni-tabbar,
  uni-tabbar,
  .uni-tabbar ~ .uni-placeholder {
    display: none !important;
    height: 0 !important;
    overflow: hidden !important;
  }
  .uni-app--showtabbar uni-page-wrapper::after,
  .uni-app--showtabbar uni-page-body::after {
    display: none !important;
    height: 0 !important;
  }
  .uni-app--showtabbar uni-page-wrapper {
    min-height: 100% !important;
    height: auto !important;
  }
  .uni-page-head,
  uni-page-head .uni-page-head {
    left: 220px !important;
    right: 0 !important;
    width: auto !important;
  }
  .page {
    max-width: 1120px;
    margin: 0 0 0 220px;
    padding: 32px 40px 48px;
    width: calc(100% - 220px);
    box-sizing: border-box;
  }
  .card-tap {
    cursor: pointer;
    transition: box-shadow 180ms ease, transform 180ms ease;
  }
  .card-tap:hover {
    box-shadow: 0 12px 32px rgba(244, 114, 182, 0.14);
    transform: translateY(-1px);
  }
  .btn-primary,
  .btn-secondary,
  .btn-mint,
  .btn-ghost,
  .chip,
  .link,
  .seg-item {
    cursor: pointer;
    transition: opacity 160ms ease, transform 160ms ease;
  }
  .btn-primary:hover { opacity: 0.94; }
  .btn-secondary:hover,
  .btn-mint:hover { opacity: 0.9; }
}
@media (min-width: 900px) and (max-width: 1199px) {
  .page {
    max-width: none;
    padding: 28px 28px 40px;
  }
}
@media (prefers-reduced-motion: reduce) {
  .card-tap,
  .btn-primary,
  .btn-secondary,
  .btn-mint {
    transition: none !important;
  }
}
/* #endif */

.card {
  background: var(--white);
  border-radius: 40rpx;
  padding: 28rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--shadow);
  border: 1rpx solid rgba(251, 207, 232, 0.7);
}

.card-tap:active {
  opacity: 0.92;
  transform: scale(0.99);
}

.section-title {
  font-family: 'Varela Round', 'Nunito Sans', sans-serif;
  font-size: 32rpx;
  color: var(--ink-900);
  margin-bottom: 16rpx;
}

.muted {
  color: var(--ink-500);
  font-size: 24rpx;
  line-height: 1.5;
}

.btn-primary {
  background: linear-gradient(135deg, #fb7185 0%, #f472b6 55%, #ec4899 100%);
  color: #fff;
  border-radius: 28rpx;
  text-align: center;
  padding: 0 32rpx;
  font-weight: 600;
  font-size: 30rpx;
  line-height: 88rpx;
  height: 88rpx;
  min-height: 88rpx;
  display: block;
  box-sizing: border-box;
  box-shadow: 0 8px 20px rgba(244, 114, 182, 0.28);
}
.btn-primary:active { opacity: 0.9; transform: scale(0.98); }
.btn-primary.is-disabled { opacity: 0.45; pointer-events: none; }

.btn-secondary {
  background: var(--pink-100);
  color: var(--pink-500);
  border-radius: 28rpx;
  text-align: center;
  padding: 0 32rpx;
  font-weight: 600;
  line-height: 88rpx;
  height: 88rpx;
  min-height: 88rpx;
  display: block;
  box-sizing: border-box;
}
.btn-secondary:active { opacity: 0.85; }

.btn-mint {
  background: var(--mint-100);
  color: #059669;
  border-radius: 999rpx;
  padding: 0 28rpx;
  font-weight: 600;
  font-size: 24rpx;
  line-height: 1;
  height: 64rpx;
  min-height: 64rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
  text-align: center;
  box-sizing: border-box;
  vertical-align: middle;
}
.btn-mint:active { opacity: 0.85; }

.btn-ghost {
  color: var(--pink-500);
  text-align: center;
  padding: 20rpx;
  font-weight: 600;
}

.field { margin-bottom: 20rpx; }
.field-label {
  display: block;
  font-size: 24rpx;
  font-weight: 600;
  color: var(--ink-500);
  margin-bottom: 10rpx;
}
.input,
input.input {
  background: #fff7fb;
  border: 2rpx solid var(--border);
  padding: 0 22rpx;
  border-radius: 24rpx;
  height: 88rpx;
  min-height: 88rpx;
  line-height: 88rpx;
  font-size: 28rpx;
  color: var(--ink-900);
  box-sizing: border-box;
  width: 100%;
  vertical-align: middle;
}
.input.area,
textarea.input.area {
  height: 120rpx;
  min-height: 120rpx;
  line-height: 1.5;
  padding: 16rpx 22rpx;
  vertical-align: top;
  box-sizing: border-box;
}
.input.picker-val {
  display: flex;
  align-items: center;
  height: 88rpx;
  min-height: 88rpx;
  line-height: 1.2;
  padding: 0 22rpx;
}
.input:focus {
  border-color: var(--pink-500);
  background: #fff;
}
.ph {
  color: #94a3b8;
  line-height: inherit;
  font-size: 28rpx;
}

.chip {
  background: var(--pink-100);
  color: var(--pink-500);
  padding: 18rpx 28rpx;
  border-radius: 999rpx;
  font-weight: 600;
  font-size: 26rpx;
  min-height: 72rpx;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.chip:active { opacity: 0.8; }
.chip-accent {
  background: var(--mint-100);
  color: #059669;
}

.row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.link {
  color: var(--pink-500);
  font-weight: 600;
  font-size: 26rpx;
  padding: 8rpx 4rpx;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.empty { text-align: center; padding: 48rpx 24rpx; }
.empty-icon {
  width: 96rpx;
  height: 96rpx;
  margin: 0 auto 20rpx;
  border-radius: 50%;
  background: var(--pink-100);
  color: var(--pink-500);
  font-size: 40rpx;
  font-weight: 700;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Varela Round', sans-serif;
}
.empty-title {
  font-family: 'Varela Round', sans-serif;
  font-size: 30rpx;
  margin-bottom: 8rpx;
  color: var(--ink-900);
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 22rpx 0;
  border-top: 1rpx solid #fce7f3;
  gap: 16rpx;
  min-height: 88rpx;
}
.list-item:first-child {
  border-top: none;
  padding-top: 8rpx;
}

.avatar {
  width: 88rpx;
  height: 88rpx;
  border-radius: 28rpx;
  background: linear-gradient(145deg, #fda4af, #f472b6);
  color: #fff;
  display: flex;
  align-items: center;
  justify-content: center;
  font-family: 'Varela Round', sans-serif;
  font-size: 36rpx;
  flex-shrink: 0;
  box-shadow: 0 6px 16px rgba(244, 114, 182, 0.25);
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 14rpx;
  border-radius: 999rpx;
  font-size: 20rpx;
  font-weight: 600;
  background: var(--mint-100);
  color: #059669;
}

.hero { padding: 12rpx 8rpx 20rpx; }
.hero-brand {
  font-family: 'Varela Round', sans-serif;
  font-size: 48rpx;
  color: var(--pink-500);
  margin-bottom: 8rpx;
}
.hero-sub { color: var(--ink-500); font-size: 26rpx; }

.seg {
  display: flex;
  gap: 12rpx;
  margin-bottom: 20rpx;
}
.seg-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 64rpx;
  min-height: 64rpx;
  padding: 0 14rpx;
  line-height: 1;
  border-radius: 999rpx;
  background: var(--pink-100);
  color: var(--pink-500);
  font-size: 24rpx;
  font-weight: 600;
}
.seg-item.on {
  background: linear-gradient(135deg, #fb7185, #f472b6);
  color: #fff;
}
</style>
