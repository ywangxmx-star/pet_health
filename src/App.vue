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
@import url('https://fonts.googleapis.com/css2?family=Inter:wght@400;500;600;700&display=swap');
/* #endif */

page {
  --brand: #3f7d64;
  --brand-strong: #326650;
  --brand-soft: #eaf2ee;
  --brand-line: #d3e3da;
  --ink: #1f2a25;
  --muted: #6e7872;
  --subtle: #9ba49f;
  --bg: #f5f6f3;
  --surface: #ffffff;
  --line: #e7eae6;
  --danger: #c2453d;
  --danger-soft: #fbedec;
  --font-display: 'Inter', 'PingFang SC', 'HarmonyOS Sans SC', 'Microsoft YaHei', 'Noto Sans SC', sans-serif;

  /* legacy aliases so older references keep working */
  --pink-500: var(--brand);
  --pink-400: var(--brand-strong);
  --pink-300: var(--brand-line);
  --pink-100: var(--brand-soft);
  --pink-50: var(--bg);
  --mint-500: var(--brand);
  --mint-100: var(--brand-soft);
  --ink-900: var(--ink);
  --ink-700: var(--ink);
  --ink-500: var(--muted);
  --white: var(--surface);
  --border: var(--line);
  --radius: 16px;
  --shadow: 0 1px 2px rgba(31, 42, 37, 0.04);
  --ease: 180ms ease;

  min-height: 100%;
  background: var(--bg);
  color: var(--ink);
  font-family: var(--font-display);
  font-size: 28rpx;
  line-height: 1.6;
  -webkit-font-smoothing: antialiased;
}

.page {
  padding: 32rpx 32rpx calc(56rpx + env(safe-area-inset-bottom));
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
  height: 46px !important;
  min-height: 46px !important;
  padding: 0 14px !important;
  display: flex !important;
  align-items: center !important;
  box-sizing: border-box !important;
  line-height: 46px !important;
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
  height: 46px !important;
  min-height: 46px !important;
  line-height: 1.2 !important;
  display: flex !important;
  align-items: center !important;
  padding: 0 14px !important;
}
uni-page-body .seg-item {
  height: 34px !important;
  min-height: 34px !important;
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
    left: 232px !important;
    right: 0 !important;
    width: auto !important;
    border-bottom: 1px solid var(--line);
  }
  .page {
    max-width: 1120px;
    margin: 0 0 0 232px;
    padding: 40px 56px 64px;
    width: calc(100% - 232px);
    box-sizing: border-box;
  }
  .card-tap {
    cursor: pointer;
    transition: border-color 180ms ease, box-shadow 180ms ease, transform 180ms ease;
  }
  .card-tap:hover {
    border-color: var(--brand-line);
    box-shadow: 0 8px 24px rgba(31, 42, 37, 0.06);
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
    transition: background-color 160ms ease, opacity 160ms ease, transform 160ms ease;
  }
  .btn-primary:hover { background: var(--brand-strong); }
  .btn-secondary:hover,
  .btn-mint:hover { background: var(--brand-line); }
  .link:hover { color: var(--brand-strong); }
}
@media (min-width: 900px) and (max-width: 1199px) {
  .page {
    max-width: none;
    padding: 32px 36px 48px;
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
  background: var(--surface);
  border-radius: 32rpx;
  padding: 36rpx;
  margin-bottom: 24rpx;
  box-shadow: var(--shadow);
  border: 1rpx solid var(--line);
}

.card-tap:active {
  opacity: 0.94;
  transform: scale(0.995);
}

.section-title {
  font-family: var(--font-display);
  font-size: 32rpx;
  font-weight: 600;
  letter-spacing: 0.5rpx;
  color: var(--ink);
  margin-bottom: 20rpx;
}

.muted {
  color: var(--muted);
  font-size: 26rpx;
  line-height: 1.6;
}

.btn-primary {
  background: var(--brand);
  color: var(--surface);
  border-radius: 24rpx;
  text-align: center;
  padding: 0 36rpx;
  font-weight: 600;
  font-size: 30rpx;
  letter-spacing: 1rpx;
  line-height: 92rpx;
  height: 92rpx;
  min-height: 92rpx;
  display: block;
  box-sizing: border-box;
}
.btn-primary:active { background: var(--brand-strong); transform: scale(0.99); }
.btn-primary.is-disabled { opacity: 0.45; pointer-events: none; }

.btn-secondary {
  background: var(--brand-soft);
  color: var(--brand-strong);
  border-radius: 24rpx;
  text-align: center;
  padding: 0 32rpx;
  font-weight: 600;
  line-height: 92rpx;
  height: 92rpx;
  min-height: 92rpx;
  display: block;
  box-sizing: border-box;
}
.btn-secondary:active { opacity: 0.85; }

.btn-mint {
  background: var(--brand-soft);
  color: var(--brand-strong);
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
  color: var(--muted);
  text-align: center;
  padding: 20rpx;
  font-weight: 500;
}

.field { margin-bottom: 28rpx; }
.field-label {
  display: block;
  font-size: 26rpx;
  font-weight: 500;
  color: var(--ink);
  margin-bottom: 12rpx;
}
.input,
input.input {
  background: var(--surface);
  border: 2rpx solid var(--line);
  padding: 0 26rpx;
  border-radius: 20rpx;
  height: 92rpx;
  min-height: 92rpx;
  line-height: 92rpx;
  font-size: 28rpx;
  color: var(--ink);
  box-sizing: border-box;
  width: 100%;
  vertical-align: middle;
}
.input.area,
textarea.input.area {
  height: 160rpx;
  min-height: 160rpx;
  line-height: 1.6;
  padding: 20rpx 26rpx;
  vertical-align: top;
  box-sizing: border-box;
}
.input.picker-val {
  display: flex;
  align-items: center;
  height: 92rpx;
  min-height: 92rpx;
  line-height: 1.2;
  padding: 0 26rpx;
}
.input:focus {
  border-color: var(--brand);
  box-shadow: 0 0 0 6rpx var(--brand-soft);
}
.ph {
  color: var(--subtle);
  line-height: inherit;
  font-size: 28rpx;
}

.chip {
  background: var(--surface);
  color: var(--ink);
  border: 1rpx solid var(--line);
  padding: 16rpx 28rpx;
  border-radius: 999rpx;
  font-weight: 500;
  font-size: 26rpx;
  min-height: 72rpx;
  box-sizing: border-box;
  display: inline-flex;
  align-items: center;
  justify-content: center;
}
.chip:active { opacity: 0.8; }
.chip-accent {
  background: var(--brand-soft);
  border-color: var(--brand-soft);
  color: var(--brand-strong);
}

.row-between {
  display: flex;
  justify-content: space-between;
  align-items: center;
  gap: 16rpx;
}

.link {
  color: var(--brand);
  font-weight: 500;
  font-size: 26rpx;
  padding: 8rpx 4rpx;
  min-height: 44px;
  display: inline-flex;
  align-items: center;
}

.empty { text-align: center; padding: 56rpx 24rpx 40rpx; }
.empty-icon {
  width: 96rpx;
  height: 96rpx;
  margin: 0 auto 20rpx;
  border-radius: 50%;
  background: var(--brand-soft);
  color: var(--brand);
  font-size: 40rpx;
  font-weight: 600;
  display: flex;
  align-items: center;
  justify-content: center;
}
.empty-title {
  font-size: 32rpx;
  font-weight: 600;
  margin-bottom: 8rpx;
  color: var(--ink);
}

.list-item {
  display: flex;
  justify-content: space-between;
  align-items: center;
  padding: 26rpx 0;
  border-top: 1rpx solid var(--line);
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
  border-radius: 24rpx;
  background: var(--brand-soft);
  color: var(--brand);
  display: flex;
  align-items: center;
  justify-content: center;
  font-size: 36rpx;
  font-weight: 600;
  flex-shrink: 0;
}

.badge {
  display: inline-flex;
  align-items: center;
  padding: 4rpx 16rpx;
  border-radius: 999rpx;
  font-size: 22rpx;
  font-weight: 500;
  background: var(--brand-soft);
  color: var(--brand-strong);
}

.hero { padding: 16rpx 8rpx 28rpx; }
.hero-brand {
  font-size: 48rpx;
  font-weight: 700;
  letter-spacing: 2rpx;
  color: var(--ink);
  margin-bottom: 8rpx;
}
.hero-sub { color: var(--muted); font-size: 26rpx; }

.seg {
  display: flex;
  gap: 12rpx;
  margin-bottom: 24rpx;
}
.seg-item {
  flex: 1;
  display: flex;
  align-items: center;
  justify-content: center;
  box-sizing: border-box;
  height: 68rpx;
  min-height: 68rpx;
  padding: 0 14rpx;
  line-height: 1;
  border-radius: 999rpx;
  background: var(--surface);
  border: 1rpx solid var(--line);
  color: var(--muted);
  font-size: 24rpx;
  font-weight: 500;
}
.seg-item.on {
  background: var(--brand);
  border-color: var(--brand);
  color: var(--surface);
}

/* ---------- layout system ---------- */
.page-intro {
  display: flex;
  align-items: flex-end;
  justify-content: space-between;
  gap: 24rpx;
  padding: 8rpx 4rpx 32rpx;
}
.page-intro-text { flex: 1; min-width: 0; }
.page-title {
  font-size: 44rpx;
  font-weight: 700;
  line-height: 1.25;
  letter-spacing: 0.5rpx;
  color: var(--ink);
}
.page-sub {
  margin-top: 8rpx;
  font-size: 26rpx;
  color: var(--muted);
  line-height: 1.5;
}
.page-intro .btn-primary {
  height: 72rpx;
  min-height: 72rpx;
  line-height: 72rpx;
  padding: 0 32rpx;
  font-size: 26rpx;
  border-radius: 999rpx;
  flex-shrink: 0;
}

.section { margin-top: 48rpx; }
.section:first-child { margin-top: 0; }
.section-head {
  display: flex;
  align-items: center;
  justify-content: space-between;
  gap: 16rpx;
  margin-bottom: 16rpx;
  padding: 0 4rpx;
}
.section-head .section-title { margin-bottom: 0; }
.section-head .link { min-height: 0; padding: 0; }

.group {
  background: var(--surface);
  border: 1rpx solid var(--line);
  border-radius: 32rpx;
  overflow: hidden;
  margin-bottom: 24rpx;
}
.group-label {
  font-size: 24rpx;
  font-weight: 500;
  color: var(--subtle);
  padding: 0 8rpx 12rpx;
  letter-spacing: 1rpx;
}
.group-row {
  display: flex;
  align-items: center;
  gap: 24rpx;
  padding: 28rpx 32rpx;
  min-height: 104rpx;
  box-sizing: border-box;
  border-top: 1rpx solid var(--line);
}
.group-row:first-child { border-top: none; }
.group-row:active { background: var(--bg); }
.group-main { flex: 1; min-width: 0; }
.group-title {
  font-size: 30rpx;
  font-weight: 600;
  color: var(--ink);
  line-height: 1.4;
}
.group-desc {
  font-size: 24rpx;
  color: var(--muted);
  margin-top: 4rpx;
  line-height: 1.5;
}
.group-chev {
  color: var(--subtle);
  font-size: 36rpx;
  line-height: 1;
  flex-shrink: 0;
}

.stats {
  display: flex;
  border: 1rpx solid var(--line);
  border-radius: 32rpx;
  background: var(--surface);
  overflow: hidden;
  margin-bottom: 24rpx;
}
.stat {
  flex: 1;
  min-width: 0;
  padding: 28rpx 16rpx;
  text-align: center;
  border-left: 1rpx solid var(--line);
}
.stat:first-child { border-left: none; }
.stat-num {
  display: block;
  font-size: 36rpx;
  font-weight: 700;
  color: var(--ink);
  line-height: 1.3;
  font-variant-numeric: tabular-nums;
}
.stat-label {
  display: block;
  font-size: 22rpx;
  color: var(--muted);
  margin-top: 4rpx;
}

.btn-pill {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  height: 64rpx;
  padding: 0 28rpx;
  border-radius: 999rpx;
  font-size: 24rpx;
  font-weight: 600;
  background: var(--surface);
  border: 1rpx solid var(--line);
  color: var(--ink);
  box-sizing: border-box;
  flex-shrink: 0;
}
.btn-pill:active { background: var(--bg); }
.btn-pill.primary {
  background: var(--brand-soft);
  border-color: var(--brand-soft);
  color: var(--brand-strong);
}

/* #ifdef H5 */
@media (min-width: 900px) {
  .page-intro { padding: 0 0 28px; }
  .page-title { font-size: 28px; }
  .page-sub { font-size: 14px; margin-top: 6px; }
  .page-intro .btn-primary { height: 40px; min-height: 40px; line-height: 40px; font-size: 14px; padding: 0 20px; }
  .section { margin-top: 36px; }
  .section-head { margin-bottom: 14px; }
  .group { border-radius: 16px; margin-bottom: 20px; }
  .group-label { font-size: 12px; padding: 0 4px 8px; }
  .group-row { padding: 16px 20px; min-height: 60px; gap: 16px; cursor: pointer; transition: background-color 160ms ease; }
  .group-row:hover { background: var(--bg); }
  .group-title { font-size: 15px; }
  .group-desc { font-size: 13px; margin-top: 2px; }
  .stats { border-radius: 16px; }
  .stat { padding: 20px 12px; }
  .stat-num { font-size: 22px; }
  .stat-label { font-size: 12px; }
  .btn-pill { height: 34px; padding: 0 16px; font-size: 13px; cursor: pointer; transition: background-color 160ms ease; }
  .btn-pill:hover { background: var(--bg); }
  .btn-pill.primary:hover { background: var(--brand-line); }
  .page.narrow { max-width: 760px; }
}
/* #endif */
</style>
