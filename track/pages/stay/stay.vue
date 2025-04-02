<template>
  <view class="stay-container">
    <!-- 停留点列表 -->
    <view class="stay-list">
      <view class="list-header">
        <text class="header-title">停留点记录</text>
      </view>

      <view v-if="stayPoints.length > 0" class="stay-items">
        <view
          v-for="(item, index) in stayPoints"
          :key="index"
          class="stay-item"
        >
          <view class="stay-icon">
            <image
              src="/static/icons/stay_unselected.png"
              class="icon-image"
            ></image>
          </view>
          <view class="stay-content">
            <view class="stay-title">
              {{ item.name || "未命名地点" }}
            </view>
            <view class="stay-info">
              <text class="info-label">停留: </text>
              <text class="info-value">{{
                formatDuration(item.duration)
              }}</text>
            </view>
          </view>
          <view class="stay-time">
            {{ formatTime(item.startTime) }}
          </view>
        </view>
      </view>

      <view v-else class="empty-state">
        <image src="/static/icons/empty.png" class="empty-icon"></image>
        <text class="empty-text">暂无停留点记录</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTrackStore } from "@/stores/track";
import { chooseLocation } from "@/utils/location";

const trackStore = useTrackStore();

// 停留点列表
const stayPoints = computed(() => {
  // 如果正在记录轨迹中，显示当前轨迹的停留点
  if (trackStore.isTracking) {
    return trackStore.stayPoints || [];
  }

  // 如果未记录轨迹，显示所有历史轨迹中的停留点
  const allStayPoints = [];
  trackStore.trackHistory.forEach((track) => {
    if (track.stayPoints && track.stayPoints.length) {
      track.stayPoints.forEach((point) => {
        allStayPoints.push({
          ...point,
          trackId: track.id,
        });
      });
    }
  });

  // 按时间倒序排列
  return allStayPoints.sort((a, b) => new Date(b.time) - new Date(a.time));
});

// 格式化停留时长
function formatDuration(minutes) {
  if (!minutes) return "0分钟";

  if (minutes < 60) {
    return `${minutes}分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const remainMinutes = minutes % 60;

  return `${hours}小时${remainMinutes}分钟`;
}

// 格式化时间
function formatTime(time) {
  if (!time) return "";

  const date = new Date(time);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");

  return `${hours}:${minutes}`;
}

// 添加手动停留点
async function addStayPoint() {
  try {
    const location = await chooseLocation();

    if (location) {
      trackStore.addStayPoint({
        ...location,
        startTime: new Date(),
        endTime: new Date(),
        duration: 0,
        isManual: true,
      });

      uni.showToast({
        title: "已添加停留点",
        icon: "success",
      });
    }
  } catch (err) {
    console.error("添加停留点失败:", err);
    uni.showToast({
      title: "添加停留点失败",
      icon: "none",
    });
  }
}

// 页面导航
function navigateTo(url) {
  uni.switchTab({
    url,
  });
}

onMounted(() => {
  // 初始化工作
});
</script>

<style lang="scss">
.stay-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
  position: relative;

  .stay-list {
    flex: 1;
    padding-bottom: 60px; // 为底部导航栏预留空间

    .list-header {
      padding: 15px;
      background-color: #fff;
      border-bottom: 1px solid #eee;

      .header-title {
        font-size: 18px;
        font-weight: 500;
        color: #333;
      }
    }

    .stay-items {
      padding: 10px 15px;
    }

    .stay-item {
      display: flex;
      align-items: center;
      background-color: #fff;
      border-radius: 8px;
      padding: 15px;
      margin-bottom: 10px;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .stay-icon {
        width: 40px;
        height: 40px;
        background-color: #e8f5e9;
        border-radius: 20px;
        display: flex;
        align-items: center;
        justify-content: center;

        .icon-image {
          width: 24px;
          height: 24px;
        }
      }

      .stay-content {
        flex: 1;
        margin-left: 12px;

        .stay-title {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 4px;
        }

        .stay-info {
          font-size: 14px;
          color: #666;

          .info-label {
            color: #999;
          }

          .info-value {
            color: #4caf50;
            font-weight: 500;
          }
        }
      }

      .stay-time {
        font-size: 14px;
        color: #999;
      }
    }

    .empty-state {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      padding: 50px 20px;

      .empty-icon {
        width: 80px;
        height: 80px;
        margin-bottom: 15px;
        opacity: 0.5;
      }

      .empty-text {
        font-size: 16px;
        color: #999;
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
