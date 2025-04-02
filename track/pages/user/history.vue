<template>
  <view class="history-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-title">
        <text>历史记录</text>
      </view>
      <view class="header-right"></view>
    </view>

    <!-- 筛选栏 -->
    <view class="filter-bar">
      <view class="filter-item" :class="{ active: currentFilter === 'all' }" @click="filterRecords('all')">
        <text>全部</text>
      </view>
      <view class="filter-item" :class="{ active: currentFilter === 'week' }" @click="filterRecords('week')">
        <text>本周</text>
      </view>
      <view class="filter-item" :class="{ active: currentFilter === 'month' }" @click="filterRecords('month')">
        <text>本月</text>
      </view>
    </view>

    <!-- 历史轨迹列表 -->
    <scroll-view scroll-y="true" class="history-list" v-if="filteredHistory.length > 0">
      <view class="history-item" v-for="track in filteredHistory" :key="track.id" @click="viewTrackDetail(track)">
        <view class="item-date">
          <text class="date-text">{{ formatDate(track.startTime) }}</text>
          <text class="time-text">{{ formatTime(track.startTime) }}</text>
        </view>

        <view class="item-info">
          <view class="info-row">
            <view class="info-cell">
              <text class="info-label">里程</text>
              <text class="info-value">{{ track.distance }} 公里</text>
            </view>
            <view class="info-cell">
              <text class="info-label">时长</text>
              <text class="info-value">{{
        formatDuration(track.duration)
      }}</text>
            </view>
            <view class="info-cell">
              <text class="info-label">停留点</text>
              <text class="info-value">{{ track.stayPoints ? track.stayPoints.length : 0 }} 个</text>
            </view>
          </view>
        </view>

        <view class="item-arrow">
          <text class="arrow-icon">></text>
        </view>
      </view>
    </scroll-view>

    <!-- 空状态 -->
    <view class="empty-state" v-else>
      <view class="empty-icon">📝</view>
      <text class="empty-text">暂无历史记录</text>
      <text class="empty-tip">开始记录轨迹后，您的历史记录将显示在这里</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTrackStore } from "@/stores/track";

const trackStore = useTrackStore();
const currentFilter = ref("all"); // 当前筛选条件：all, week, month

// 获取历史记录
const trackHistory = computed(() => {
  return trackStore.trackHistory || [];
});

// 根据筛选条件过滤历史记录
const filteredHistory = computed(() => {
  if (!trackHistory.value || trackHistory.value.length === 0) {
    return [];
  }

  if (currentFilter.value === "all") {
    return trackHistory.value;
  }

  const now = new Date();
  let startDate = new Date();

  if (currentFilter.value === "week") {
    // 获取本周一的日期
    const day = now.getDay() || 7; // 如果是0（周日），则设为7
    startDate.setDate(now.getDate() - day + 1); // 设置为本周一
    startDate.setHours(0, 0, 0, 0);
  } else if (currentFilter.value === "month") {
    // 获取本月1日的日期
    startDate.setDate(1);
    startDate.setHours(0, 0, 0, 0);
  }

  return trackHistory.value.filter((track) => {
    const trackDate = new Date(track.startTime);
    return trackDate >= startDate;
  });
});

// 切换筛选条件
function filterRecords(filter) {
  currentFilter.value = filter;
}

// 查看轨迹详情
function viewTrackDetail(track) {
  // 将当前轨迹设置为选中轨迹
  trackStore.setCurrentTrack(track);

  // 导航到轨迹详情页
  uni.navigateTo({
    url: "/pages/user/track-detail",
  });
}

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 格式化日期：MM-DD
function formatDate(dateStr) {
  const date = new Date(dateStr);
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  return `${month}-${day}`;
}

// 格式化时间：HH:MM
function formatTime(dateStr) {
  const date = new Date(dateStr);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${hours}:${minutes}`;
}

// 格式化持续时间
function formatDuration(minutes) {
  if (!minutes) return "0分钟";

  if (minutes < 60) {
    return `${minutes}分钟`;
  }

  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (remainingMinutes === 0) {
    return `${hours}小时`;
  }

  return `${hours}小时${remainingMinutes}分钟`;
}

onMounted(() => {
  // 加载历史记录
  trackStore.loadTrackHistory();
});
</script>

<style lang="scss">
.history-container {
  display: flex;
  flex-direction: column;
  min-height: 100vh;
  background-color: #f8f8f8;

  .page-header {
    display: flex;
    height: 50px;
    background-color: #4caf50;
    color: #fff;
    align-items: center;
    padding: 0 15px;

    .header-left {
      width: 40px;

      .back-icon {
        font-size: 20px;
        font-weight: bold;
      }
    }

    .header-title {
      flex: 1;
      text-align: center;
      font-size: 18px;
      font-weight: 500;
    }

    .header-right {
      width: 40px;
    }
  }

  .filter-bar {
    display: flex;
    background-color: #fff;
    padding: 12px 15px;
    border-bottom: 1px solid #eee;

    .filter-item {
      flex: 1;
      text-align: center;
      padding: 8px 0;
      font-size: 14px;
      color: #666;
      position: relative;

      &.active {
        color: #4caf50;
        font-weight: 500;

        &:after {
          content: "";
          position: absolute;
          bottom: 0;
          left: 30%;
          width: 40%;
          height: 2px;
          background-color: #4caf50;
        }
      }
    }
  }

  .history-list {
    flex: 1;
    background-color: #fff;

    .history-item {
      display: flex;
      padding: 15px;
      border-bottom: 1px solid #f5f5f5;
      align-items: center;

      .item-date {
        width: 70px;
        display: flex;
        flex-direction: column;
        align-items: center;

        .date-text {
          font-size: 16px;
          font-weight: 500;
          color: #333;
          margin-bottom: 5px;
        }

        .time-text {
          font-size: 12px;
          color: #999;
        }
      }

      .item-info {
        flex: 1;
        margin-left: 15px;

        .info-row {
          display: flex;

          .info-cell {
            flex: 1;
            display: flex;
            flex-direction: column;
            margin-right: 15px;

            &:last-child {
              margin-right: 0;
            }

            .info-label {
              font-size: 12px;
              color: #999;
              margin-bottom: 3px;
            }

            .info-value {
              font-size: 14px;
              color: #333;
              font-weight: 500;
            }
          }
        }
      }

      .item-arrow {
        width: 30px;
        display: flex;
        justify-content: center;
        align-items: center;

        .arrow-icon {
          font-size: 16px;
          color: #ccc;
        }
      }
    }
  }

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 30px;

    .empty-icon {
      font-size: 48px;
      margin-bottom: 15px;
      color: #ccc;
    }

    .empty-text {
      font-size: 16px;
      color: #999;
      margin-bottom: 10px;
    }

    .empty-tip {
      font-size: 14px;
      color: #999;
      text-align: center;
    }
  }
}
</style>
