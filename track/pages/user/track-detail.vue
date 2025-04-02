<template>
  <view class="detail-container">
    <!-- 页面标题 -->
    <view class="page-header">
      <view class="header-left" @click="goBack">
        <text class="back-icon">←</text>
      </view>
      <view class="header-title">
        <text>轨迹详情</text>
      </view>
      <view class="header-right" @click="confirmDelete">
        <text class="delete-icon">🗑️</text>
      </view>
    </view>

    <!-- 地图区域 -->
    <view class="map-wrapper">
      <map id="map" class="map-container" :latitude="mapCenter.latitude" :longitude="mapCenter.longitude"
        :markers="markers" :polyline="routeLine" scale="16" :show-location="false"></map>
    </view>

    <!-- 轨迹信息 -->
    <view class="track-info">
      <view class="info-card">
        <view class="card-header">
          <text class="header-text">轨迹信息</text>
          <text class="header-date">{{
        formatDate(currentTrack.startTime)
      }}</text>
        </view>

        <view class="card-content">
          <view class="info-row">
            <view class="info-item">
              <text class="item-value">{{ currentTrack.distance }} 公里</text>
              <text class="item-label">总距离</text>
            </view>
            <view class="info-item">
              <text class="item-value">{{
        formatDuration(currentTrack.duration)
      }}</text>
              <text class="item-label">总时长</text>
            </view>
            <view class="info-item">
              <text class="item-value">{{
          currentTrack.stayPoints ? currentTrack.stayPoints.length : 0
        }}</text>
              <text class="item-label">停留点</text>
            </view>
          </view>

          <view class="time-row">
            <view class="time-item">
              <text class="time-label">开始时间</text>
              <text class="time-value">{{
          formatDateTime(currentTrack.startTime)
        }}</text>
            </view>
            <view class="time-item">
              <text class="time-label">结束时间</text>
              <text class="time-value">{{
          formatDateTime(currentTrack.endTime)
        }}</text>
            </view>
          </view>
        </view>
      </view>

      <!-- 停留点列表 -->
      <view class="stay-points-card" v-if="stayPoints.length > 0">
        <view class="card-header">
          <text class="header-text">停留点 ({{ stayPoints.length }})</text>
        </view>

        <view class="stay-list">
          <view class="stay-item" v-for="(point, index) in stayPoints" :key="index"
            @click="focusStayPoint(point, index)">
            <view class="stay-index">{{ index + 1 }}</view>
            <view class="stay-info">
              <text class="stay-position">{{
        formatPosition(point.latitude, point.longitude)
      }}</text>
              <text class="stay-duration">停留 {{ point.duration }} 分钟</text>
            </view>
            <view class="stay-time">{{ formatTime(point.time) }}</view>
          </view>
        </view>
      </view>

      <!-- 空状态 -->
      <view class="empty-stays" v-else>
        <text class="empty-text">此次轨迹未检测到停留点</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTrackStore } from "@/stores/track";

const trackStore = useTrackStore();

// 当前轨迹数据
const currentTrack = computed(() => {
  return trackStore.currentTrack || {};
});

// 停留点列表
const stayPoints = computed(() => {
  if (!currentTrack.value || !currentTrack.value.stayPoints) {
    return [];
  }
  return currentTrack.value.stayPoints;
});

// 地图中心点
const mapCenter = ref({
  latitude: 39.9042,
  longitude: 116.4074,
});

// 地图标记点
const markers = computed(() => {
  if (
    !currentTrack.value ||
    !currentTrack.value.locations ||
    currentTrack.value.locations.length === 0
  ) {
    return [];
  }

  const locations = currentTrack.value.locations;
  const markersList = [];

  // 起点
  markersList.push({
    id: 0,
    latitude: locations[0].latitude,
    longitude: locations[0].longitude,
    iconPath: "/static/icon/location-start.png",
    width: 30,
    height: 30,
    callout: {
      content: "起点",
      color: "#FFFFFF",
      fontSize: 12,
      borderRadius: 4,
      bgColor: "#4CAF50",
      padding: 5,
      display: "ALWAYS",
    },
  });

  // 终点
  markersList.push({
    id: 1,
    latitude: locations[locations.length - 1].latitude,
    longitude: locations[locations.length - 1].longitude,
    iconPath: "/static/icon/location-end.png",
    width: 30,
    height: 30,
    callout: {
      content: "终点",
      color: "#FFFFFF",
      fontSize: 12,
      borderRadius: 4,
      bgColor: "#FF5252",
      padding: 5,
      display: "ALWAYS",
    },
  });

  // 停留点
  if (stayPoints.value && stayPoints.value.length > 0) {
    stayPoints.value.forEach((point, index) => {
      markersList.push({
        id: index + 2,
        latitude: point.latitude,
        longitude: point.longitude,
        iconPath: "/static/icon/location-stay.png",
        width: 25,
        height: 25,
        callout: {
          content: `停留点 ${index + 1}\n${point.duration}分钟`,
          color: "#FFFFFF",
          fontSize: 12,
          borderRadius: 4,
          bgColor: "#2196F3",
          padding: 5,
          display: "BYCLICK",
        },
      });
    });
  }

  return markersList;
});

// 路线
const routeLine = computed(() => {
  if (
    !currentTrack.value ||
    !currentTrack.value.locations ||
    currentTrack.value.locations.length < 2
  ) {
    return [];
  }

  return [
    {
      points: currentTrack.value.locations.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      })),
      color: "#4CAF50",
      width: 4,
      arrowLine: true,
    },
  ];
});

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 确认删除轨迹
function confirmDelete() {
  uni.showModal({
    title: "删除确认",
    content: "确定要删除这条轨迹记录吗？",
    success: (res) => {
      if (res.confirm) {
        deleteTrack();
      }
    },
  });
}

// 删除轨迹
function deleteTrack() {
  if (!currentTrack.value || !currentTrack.value.id) return;

  // 从store中删除轨迹
  trackStore.deleteTrack(currentTrack.value.id);

  uni.showToast({
    title: "已删除轨迹",
    icon: "success",
  });

  // 返回上一页
  setTimeout(() => {
    uni.navigateBack();
  }, 500);
}

// 聚焦到停留点
function focusStayPoint(point, index) {
  if (!point) return;

  // 更新地图中心
  mapCenter.value = {
    latitude: point.latitude,
    longitude: point.longitude,
  };

  // 显示标记气泡
  setTimeout(() => {
    const mapContext = uni.createMapContext("map");
    if (mapContext && mapContext.moveToLocation) {
      mapContext.moveToLocation({
        latitude: point.latitude,
        longitude: point.longitude,
        success: () => {
          console.log("地图已移动到目标位置");
        },
        fail: (err) => {
          console.error("地图移动失败:", err);
          // 备用方案：使用includePoints方法
          mapContext.includePoints({
            points: [
              {
                latitude: point.latitude,
                longitude: point.longitude,
              },
            ],
            padding: [50, 50, 50, 50],
          });
        },
      });
    }
  }, 100);

  // 显示提示
  uni.showToast({
    title: `停留点 ${index + 1}`,
    icon: "none",
  });
}

// 格式化日期：YYYY-MM-DD
function formatDate(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");

  return `${year}-${month}-${day}`;
}

// 格式化日期时间：YYYY-MM-DD HH:MM
function formatDateTime(dateStr) {
  if (!dateStr) return "";

  const date = new Date(dateStr);
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${year}-${month}-${day} ${hours}:${minutes}`;
}

// 格式化时间：HH:MM
function formatTime(dateStr) {
  if (!dateStr) return "";

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

// 格式化坐标位置
function formatPosition(lat, lng) {
  if (!lat || !lng) return "未知位置";
  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// 页面初始化
onMounted(() => {
  // 确保已加载历史记录
  if (!trackStore.trackHistory.length) {
    trackStore.loadTrackHistory();
  }

  // 如果没有当前轨迹，但有历史记录，则使用第一条
  if (!currentTrack.value.id && trackStore.trackHistory.length > 0) {
    trackStore.setCurrentTrack(trackStore.trackHistory[0]);
  }

  // 初始化地图中心
  if (
    currentTrack.value &&
    currentTrack.value.locations &&
    currentTrack.value.locations.length > 0
  ) {
    // 使用轨迹的第一个点作为地图中心
    const firstLocation = currentTrack.value.locations[0];
    mapCenter.value = {
      latitude: firstLocation.latitude,
      longitude: firstLocation.longitude,
    };

    // 200ms后调整地图以显示完整轨迹
    setTimeout(() => {
      const mapContext = uni.createMapContext("map");
      if (mapContext && mapContext.includePoints) {
        mapContext.includePoints({
          points: currentTrack.value.locations.map((loc) => ({
            latitude: loc.latitude,
            longitude: loc.longitude,
          })),
          padding: [80, 80, 80, 80],
        });
      }
    }, 200);
  }
});
</script>

<style lang="scss">
.detail-container {
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
      display: flex;
      justify-content: flex-end;

      .delete-icon {
        font-size: 20px;
      }
    }
  }

  .map-wrapper {
    height: 40vh;
    width: 100%;

    .map-container {
      width: 100%;
      height: 100%;
    }
  }

  .track-info {
    flex: 1;
    padding: 15px;

    .info-card {
      background-color: #fff;
      border-radius: 10px;
      margin-bottom: 15px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .card-header {
        padding: 15px;
        border-bottom: 1px solid #f5f5f5;
        display: flex;
        justify-content: space-between;
        align-items: center;

        .header-text {
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }

        .header-date {
          font-size: 14px;
          color: #999;
        }
      }

      .card-content {
        padding: 15px;

        .info-row {
          display: flex;
          margin-bottom: 15px;

          .info-item {
            flex: 1;
            display: flex;
            flex-direction: column;
            align-items: center;

            .item-value {
              font-size: 20px;
              font-weight: 600;
              color: #4caf50;
              margin-bottom: 5px;
            }

            .item-label {
              font-size: 12px;
              color: #999;
            }
          }
        }

        .time-row {
          display: flex;
          flex-direction: column;

          .time-item {
            display: flex;
            justify-content: space-between;
            margin-bottom: 10px;

            &:last-child {
              margin-bottom: 0;
            }

            .time-label {
              font-size: 14px;
              color: #666;
            }

            .time-value {
              font-size: 14px;
              color: #333;
              font-weight: 500;
            }
          }
        }
      }
    }

    .stay-points-card {
      background-color: #fff;
      border-radius: 10px;
      margin-bottom: 15px;
      overflow: hidden;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .card-header {
        padding: 15px;
        border-bottom: 1px solid #f5f5f5;

        .header-text {
          font-size: 16px;
          font-weight: 500;
          color: #333;
        }
      }

      .stay-list {
        .stay-item {
          display: flex;
          padding: 12px 15px;
          border-bottom: 1px solid #f5f5f5;
          align-items: center;

          &:last-child {
            border-bottom: none;
          }

          .stay-index {
            width: 24px;
            height: 24px;
            border-radius: 12px;
            background-color: #2196f3;
            color: #fff;
            display: flex;
            align-items: center;
            justify-content: center;
            font-size: 12px;
            margin-right: 10px;
          }

          .stay-info {
            flex: 1;

            .stay-position {
              font-size: 14px;
              color: #333;
              margin-bottom: 3px;
              display: block;
            }

            .stay-duration {
              font-size: 12px;
              color: #2196f3;
            }
          }

          .stay-time {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }

    .empty-stays {
      background-color: #fff;
      border-radius: 10px;
      padding: 20px;
      text-align: center;
      box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);

      .empty-text {
        font-size: 14px;
        color: #999;
      }
    }
  }
}
</style>
