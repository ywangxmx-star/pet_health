<template>
  <view class="page">
    <web-side-nav />
    <view class="card">
      <view class="title">免责声明</view>
      <view class="meta muted">更新日期：2026-09-24</view>
      <view class="body">
        <view class="h">一、非医疗诊断</view>
        <view class="p">爪爪养宠助手是养宠事务提醒与日常笔记工具，提供的记录汇总与提醒功能仅供参考，不构成兽医诊疗、用药或手术建议，不能替代执业兽医的专业判断。</view>

        <view class="h">二、紧急情况</view>
        <view class="p">若宠物出现急症、剧烈疼痛、持续呕吐/腹泻、呼吸困难、抽搐、外伤出血等情况，请立即联系附近动物医院或执业兽医，切勿仅依赖本应用信息。</view>

        <view class="h">三、内容来源</view>
        <view class="p">您自行填写的照护安排与记录仅供个人备忘。驱虫、疫苗等请遵医嘱与产品说明，勿仅依赖本应用信息做决策。</view>
        <view class="p">若本应用展示改编自维基百科的条目，该等文本按 CC BY-SA 4.0 提供：须署名、标明修改，并以相同或兼容协议再授权。详见《维基百科内容许可说明》。维基媒体基金会与词条作者不对本应用改编结果背书。</view>

        <view class="h">四、用户责任</view>
        <view class="p">您应对自行填写的宠物信息与照护决策负责。因依赖本应用内容导致的任何损失，在法律允许范围内，本应用及相关方不承担责任。</view>

        <view class="h">五、服务可用性</view>
        <view class="p">我们尽力保障服务稳定，但可能因维护、网络或不可抗力中断；提醒送达不保证 100%，请勿将本应用作为唯一照护依据。</view>

        <view class="h">六、接受声明</view>
        <view class="p">继续使用本应用，即表示您已阅读并同意本免责声明。如不同意，请停止使用并卸载本应用。</view>
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
