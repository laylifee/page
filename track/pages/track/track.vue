<template>
  <view class="track-container">
    <!-- 轨迹地图显示 -->
    <view class="map-wrapper">
      <map
        id="map"
        class="map-container"
        :latitude="currentLocation.latitude"
        :longitude="currentLocation.longitude"
        :markers="markers"
        :polyline="polyline"
        scale="16"
        show-location="true"
      >
        <view class="map-label">
          <text>轨迹线显示区域</text>
        </view>
      </map>
    </view>

    <!-- 轨迹统计信息 -->
    <view class="track-stats">
      <view class="stat-item">
        <text class="stat-value">{{ distance }}</text>
        <text class="stat-label">公里</text>
      </view>
      <view class="stat-item">
        <text class="stat-value">{{ duration }}</text>
        <text class="stat-label">分钟</text>
      </view>
    </view>

    <!-- 停止记录按钮 -->
    <view class="track-action">
      <button class="stop-btn" @click="stopTracking">
        <text class="btn-icon">■</text>
        <text class="btn-text">停止记录</text>
      </button>
    </view>

    <!-- 轨迹列表 -->
    <view class="track-list">
      <view
        class="track-item"
        v-for="item in trackStore.locationList"
        :key="item.id"
      >
        <text>{{ item.latitude }}</text>
        <text>{{ item.longitude }}</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted, watch } from "vue";
import { useTrackStore } from "@/stores/track";
import {
  getCurrentLocation,
  startLocationWatch,
  stopLocationWatch,
  detectStayPoint,
} from "@/utils/location";

const trackStore = useTrackStore();

// 位置数据
const currentLocation = ref({
  latitude: 39.9042,
  longitude: 116.4074,
});

// 轨迹线数据
const polyline = computed(() => {
  if (!trackStore.locationList.length) return [];

  return [
    {
      points: trackStore.locationList.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      })),
      color: "#4CAF50",
      width: 4,
    },
  ];
});

// 标记点数据
const markers = computed(() => {
  if (!trackStore.locationList.length) return [];

  // 起点标记
  const startPoint = trackStore.locationList[0];
  // 当前位置
  const currentPoint =
    trackStore.locationList[trackStore.locationList.length - 1];

  const startIconUrl = "/static/icon/location-fill.png";
  const currentIconUrl = "/static/icon/location-fill.png";
  const stayIconUrl = "/static/icon/location-fill.png";

  const markersList = [
    {
      id: 0,
      latitude: startPoint.latitude,
      longitude: startPoint.longitude,
      iconPath: startIconUrl,
      width: 25,
      height: 25,
    },
    {
      id: 1,
      latitude: currentPoint.latitude,
      longitude: currentPoint.longitude,
      iconPath: currentIconUrl,
      width: 25,
      height: 25,
    },
  ];

  // 添加停留点标记
  trackStore.stayPoints.forEach((point, index) => {
    markersList.push({
      id: index + 2,
      latitude: point.latitude,
      longitude: point.longitude,
      iconPath: stayIconUrl,
      width: 25,
      height: 25,
    });
  });

  return markersList;
});

// 轨迹统计数据
const distance = computed(() => {
  return trackStore.trackDistance || "0";
});

const duration = computed(() => {
  return trackStore.trackDuration || "0";
});

// 初始化轨迹记录
async function initTracking() {
  try {
    // 确保已经开始记录
    if (!trackStore.isTracking) {
      trackStore.startTracking();
    }

    // 获取初始位置
    const location = await getCurrentLocation();
    currentLocation.value = location;
    trackStore.addLocation(location);

    // 开始监听位置变化
    startLocationWatch(handleLocationChange, {
      interval: 3000,
      minDistance: 5,
    });

    // 请求保持屏幕常亮
    uni.setKeepScreenOn({
      keepScreenOn: true,
    });
  } catch (err) {
    console.error("初始化轨迹记录失败:", err);
    uni.showToast({
      title: "无法获取位置信息",
      icon: "none",
    });
  }
}

// 处理位置变化
function handleLocationChange(location) {
  currentLocation.value = location;
  trackStore.addLocation(location);

  // 每10个点检测一次停留点
  if (trackStore.locationList.length % 10 === 0) {
    detectStayPoints();
  }
}

// 检测停留点
function detectStayPoints() {
  const stayPoints = detectStayPoint(trackStore.locationList, {
    radiusThreshold: 50, // 50米
    timeThreshold: 3 * 60 * 1000, // 3分钟
  });

  // 更新新发现的停留点
  stayPoints.forEach((point) => {
    const exists = trackStore.stayPoints.some(
      (existingPoint) =>
        existingPoint.latitude === point.latitude &&
        existingPoint.longitude === point.longitude
    );

    if (!exists) {
      trackStore.addStayPoint(point);
    }
  });
}

// 停止记录轨迹
function stopTracking() {
  if (!trackStore.isTracking) return;

  // 停止位置监听
  stopLocationWatch();

  // 取消屏幕常亮
  uni.setKeepScreenOn({
    keepScreenOn: false,
  });

  // 结束轨迹记录
  trackStore.stopTracking();

  // 提示用户并返回
  uni.showToast({
    title: "轨迹记录已保存",
    icon: "success",
  });

  // 1秒后返回
  setTimeout(() => {
    uni.switchTab({
      url: "/pages/stay/stay",
    });
  }, 1000);
}

// 页面加载
onMounted(() => {
  initTracking();
});

// 页面卸载
onUnmounted(() => {
  // 如果用户直接退出未停止记录，确保停止监听
  if (trackStore.isTracking) {
    stopLocationWatch();
    uni.setKeepScreenOn({
      keepScreenOn: false,
    });
  }
});
</script>

<style lang="scss">
.track-container {
  display: flex;
  flex-direction: column;
  height: 100vh;

  .map-wrapper {
    flex: 1;
    position: relative;

    .map-container {
      width: 100%;
      height: 100%;
    }

    .map-label {
      position: absolute;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%);
      background-color: rgba(255, 255, 255, 0.7);
      padding: 5px 10px;
      border-radius: 4px;
      font-size: 14px;
      color: #666;
      display: none; // 默认隐藏
    }
  }

  .track-stats {
    display: flex;
    padding: 20px;
    background-color: #fff;
    border-top: 1px solid #eee;

    .stat-item {
      flex: 1;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;

      .stat-value {
        font-size: 32px;
        font-weight: 600;
        color: #333;
        line-height: 1.2;
      }

      .stat-label {
        font-size: 14px;
        color: #999;
        margin-top: 5px;
      }
    }
  }

  .track-action {
    padding: 15px 20px 30px;
    background-color: #fff;

    .stop-btn {
      background-color: #ff5252;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      border-radius: 25px;
      font-size: 18px;

      .btn-icon {
        margin-right: 5px;
      }

      .btn-text {
        font-weight: 500;
      }
    }
  }
}
</style>
