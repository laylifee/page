<template>
  <view class="user-container">
    <!-- 用户信息卡片 -->
    <view class="user-card">
      <view class="avatar-wrapper">
        <image
          src="https://at.alicdn.com/t/font_3428196_zv0ztfgpye.png?spm=a313x.manage_type_myprojects.i1.61.6d283a81IxwFYG&file=font_3428196_zv0ztfgpye.png"
          class="avatar-image"
        ></image>
      </view>
      <view class="user-info">
        <text class="user-name">用户名</text>
        <text class="user-level">会员等级: 普通</text>
      </view>
    </view>

    <!-- 功能菜单 -->
    <view class="menu-list">
      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('history')">
          <view class="menu-icon history-icon">
            <text class="icon-text">📜</text>
          </view>
          <view class="menu-content">
            <text class="menu-title">历史记录</text>
          </view>
          <text class="menu-arrow">></text>
        </view>

        <view class="menu-item" @click="navigateTo('backup')">
          <view class="menu-icon backup-icon">
            <text class="icon-text">💾</text>
          </view>
          <view class="menu-content">
            <text class="menu-title">数据备份</text>
          </view>
          <text class="menu-arrow">></text>
        </view>

        <view class="menu-item" @click="navigateTo('settings')">
          <view class="menu-icon settings-icon">
            <text class="icon-text">⚙️</text>
          </view>
          <view class="menu-content">
            <text class="menu-title">设置</text>
          </view>
          <text class="menu-arrow">></text>
        </view>
      </view>

      <view class="menu-group">
        <view class="menu-item" @click="navigateTo('about')">
          <view class="menu-icon about-icon">
            <text class="icon-text">ℹ️</text>
          </view>
          <view class="menu-content">
            <text class="menu-title">关于</text>
          </view>
          <text class="menu-arrow">></text>
        </view>
      </view>
    </view>

    <!-- 统计信息 -->
    <view class="stats-card">
      <view class="stats-header">
        <text class="stats-title">轨迹数据统计</text>
      </view>
      <view class="stats-content">
        <view class="stats-item">
          <text class="stats-value">{{ totalTracks }}</text>
          <text class="stats-label">轨迹数</text>
        </view>
        <view class="stats-item">
          <text class="stats-value">{{ totalDistance }}</text>
          <text class="stats-label">总里程(km)</text>
        </view>
        <view class="stats-item">
          <text class="stats-value">{{ totalTime }}</text>
          <text class="stats-label">总时间(h)</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTrackStore } from "@/stores/track";

const trackStore = useTrackStore();

// 统计数据
const totalTracks = computed(() => {
  return trackStore.trackHistory.length;
});

const totalDistance = computed(() => {
  let distance = 0;
  trackStore.trackHistory.forEach((track) => {
    distance += parseFloat(track.distance || 0);
  });
  return distance.toFixed(2);
});

const totalTime = computed(() => {
  let minutes = 0;
  trackStore.trackHistory.forEach((track) => {
    minutes += track.duration || 0;
  });
  return (minutes / 60).toFixed(1);
});

// 页面导航 - 功能页
function navigateTo(page) {
  switch (page) {
    case "history":
      uni.navigateTo({
        url: "/pages/user/history",
      });
      break;
    case "backup":
      uni.showToast({
        title: "数据备份功能开发中",
        icon: "none",
      });
      break;
    case "settings":
      uni.navigateTo({
        url: "/pages/user/settings",
      });
      break;
    case "about":
      uni.showToast({
        title: "轨迹记录应用 v1.0.0",
        icon: "none",
        duration: 2000,
      });
      break;
    default:
      break;
  }
}

// 底部Tab导航
function switchTab(url) {
  uni.switchTab({
    url,
  });
}

onMounted(() => {
  // 初始化工作
});
</script>

<style lang="scss">
.user-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f8f8;
  padding-bottom: 60px; // 为底部导航栏预留空间

  .user-card {
    background-color: #4caf50;
    padding: 20px 15px;
    display: flex;
    align-items: center;
    color: #fff;

    .avatar-wrapper {
      width: 70px;
      height: 70px;
      border-radius: 35px;
      background-color: #fff;
      overflow: hidden;
      margin-right: 15px;
      display: flex;
      align-items: center;
      justify-content: center;
      box-shadow: 0 2px 6px rgba(0, 0, 0, 0.1);

      .avatar-image {
        width: 60px;
        height: 60px;
        border-radius: 30px;
      }
    }

    .user-info {
      flex: 1;

      .user-name {
        font-size: 20px;
        font-weight: 500;
        margin-bottom: 5px;
        display: block;
      }

      .user-level {
        font-size: 14px;
        opacity: 0.9;
      }
    }
  }

  .menu-list {
    margin-top: 15px;

    .menu-group {
      background-color: #fff;
      border-radius: 8px;
      margin-bottom: 15px;
      padding: 0 15px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    }

    .menu-item {
      display: flex;
      align-items: center;
      height: 60px;
      border-bottom: 1px solid #f8f8f8;

      &:last-child {
        border-bottom: none;
      }

      .menu-icon {
        width: 36px;
        height: 36px;
        border-radius: 18px;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        margin-right: 10px;

        .icon-text {
          font-size: 18px;
        }

        &.history-icon {
          background-color: #e3f2fd;
        }

        &.backup-icon {
          background-color: #e8f5e9;
        }

        &.settings-icon {
          background-color: #fff3e0;
        }

        &.about-icon {
          background-color: #e8eaf6;
        }
      }

      .menu-content {
        flex: 1;

        .menu-title {
          font-size: 16px;
          color: #333;
        }

        .menu-subtitle {
          font-size: 12px;
          color: #999;
          margin-top: 3px;
        }
      }

      .menu-arrow {
        color: #ccc;
        font-size: 16px;
      }
    }
  }

  .stats-card {
    background-color: #fff;
    border-radius: 8px;
    margin: 0 15px 15px;
    box-shadow: 0 1px 3px rgba(0, 0, 0, 0.05);
    overflow: hidden;

    .stats-header {
      padding: 12px 15px;
      border-bottom: 1px solid #f8f8f8;

      .stats-title {
        font-size: 16px;
        font-weight: 500;
        color: #333;
      }
    }

    .stats-content {
      display: flex;
      padding: 15px 0;

      .stats-item {
        flex: 1;
        display: flex;
        flex-direction: column;
        align-items: center;

        .stats-value {
          font-size: 20px;
          font-weight: 600;
          color: #4caf50;
          margin-bottom: 5px;
        }

        .stats-label {
          font-size: 12px;
          color: #999;
        }
      }
    }
  }

  .bottom-bar {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    height: 60px;
    background-color: #fff;
    display: flex;
    border-top: 1px solid #eee;

    .tabbar-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 5px 0;

      &.active {
        .tabbar-text {
          color: #4caf50;
        }
      }

      .tabbar-icon {
        width: 24px;
        height: 24px;
        margin-bottom: 3px;
      }

      .tabbar-text {
        font-size: 12px;
        color: #999;
      }
    }
  }
}
</style>
