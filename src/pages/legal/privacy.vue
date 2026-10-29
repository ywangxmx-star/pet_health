<template>
  <view class="page">
    <web-side-nav />
    <view class="card">
      <view class="title">隐私政策</view>
      <view class="meta muted">更新日期：2026-09-24</view>
      <view class="body">
        <view class="h">一、概述</view>
        <view class="p">爪爪养宠助手（以下简称「本应用」）重视您的隐私。本政策说明我们如何收集、使用、存储与保护您的个人信息。使用本应用即表示您已阅读并理解本政策。</view>

        <view class="h">二、我们收集的信息</view>
        <view class="p">1. 账号信息：邮箱（登录与绑定）、昵称、微信 openid（小程序登录时）。</view>
        <view class="p">2. 业务数据：宠物档案、日常记录、提醒、家庭成员关系等，由您主动填写或生成。</view>
        <view class="p">3. 设备与日志：基础运行日志、崩溃信息，用于保障服务稳定（不含通讯录、精确位置等敏感权限）。</view>

        <view class="h">三、信息用途</view>
        <view class="p">用于账号识别、家庭共享、提醒与记录同步、内容展示与产品改进。不会向无关第三方出售您的个人信息。</view>

        <view class="h">四、存储与安全</view>
        <view class="p">数据存储于我们管理的服务器，按家庭隔离访问。我们采取合理技术与管理措施保护数据；但互联网传输无法保证绝对安全。</view>

        <view class="h">五、您的权利</view>
        <view class="p">您可以查阅、更正账户信息，或申请删除账号与相关数据。退出登录不会立即删除服务器数据；如需注销请联系我们。</view>

        <view class="h">六、未成年人</view>
        <view class="p">若您为未成年人，请在监护人指导下使用本应用。</view>

        <view class="h">七、政策更新</view>
        <view class="p">我们可能适时更新本政策，更新后将在应用内公示。继续使用即视为接受更新后的政策。</view>

        <view class="h">八、联系我们</view>
        <view class="p">如有隐私相关问题，可通过应用内反馈或注册邮箱联系我们。</view>
      </view>
    </view>
  </view>
</template>

<script setup>
</script>

<style scoped>
.title { font-family: 'Varela Round', sans-serif; font-size: 40rpx; color: #831843; margin-bottom: 8rpx; }
.meta { margin-bottom: 24rpx; }
.h { font-weight: 700; color: #831843; margin: 28rpx 0 10rpx; font-size: 28rpx; }
.p { color: #64748b; font-size: 26rpx; line-height: 1.7; margin-bottom: 8rpx; }
</style>
