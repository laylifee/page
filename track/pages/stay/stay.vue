<template>
  <view class="stay-container">
    <!-- 地图区域 -->
    <view class="map-wrapper">
      <map id="map" class="map-container" :latitude="mapCenter.latitude" :longitude="mapCenter.longitude"
        :markers="markers" scale="16" :show-location="true" @updated="onMapUpdated"></map>
    </view>

    <!-- 停留点列表 -->
    <view class="stay-list" v-if="stayPoints.length > 0">
      <view class="stay-item" v-for="(point, index) in stayPoints" :key="index" @click="focusStayPoint(point, index)">
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

    <!-- 空状态提示 -->
    <view class="empty-state" v-else>
      <view class="empty-icon">📍</view>
      <text class="empty-text">暂无停留点记录</text>
      <text class="empty-tip">当您在某个位置停留超过5分钟时，系统会自动记录停留点</text>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted } from "vue";
import { useTrackStore } from "@/stores/track";
// import { mockTrackData } from "./mockData";
const trackStore = useTrackStore();

// 停留点列表
const stayPoints = computed(() => {
  // 如果正在记录轨迹，则显示当前的停留点
  if (trackStore.isTracking) {
    return trackStore.stayPoints || [];
  }

  // 如果不是记录中，且有历史记录，则获取最近一条历史记录的停留点
  if (trackStore.trackHistory && trackStore.trackHistory.length > 0) {
    const latestTrack = trackStore.trackHistory[0];
    return latestTrack.stayPoints || [];
  }

  return [];
});

// 地图相关数据
const mapCenter = ref({
  latitude: 39.9042,
  longitude: 116.4074,
});

// 标记点
const markers = computed(() => {
  if (!stayPoints.value || stayPoints.value.length === 0) {
    return [];
  }

  return stayPoints.value.map((point, index) => ({
    id: index,
    latitude: point.latitude,
    longitude: point.longitude,
    iconPath: "/static/icon/location-fill.png",
    width: 25,
    height: 25,
    callout: {
      content: `停留点 ${index + 1}\n${point.duration}分钟`,
      color: "#ffffff",
      fontSize: 12,
      borderRadius: 4,
      bgColor: "#2196F3",
      padding: 5,
      display: "ALWAYS",
    },
  }));
});

// 格式化时间
function formatTime(timestamp) {
  if (!timestamp) return "";

  const date = new Date(timestamp);
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");

  return `${hours}:${minutes}`;
}

// 格式化坐标位置
function formatPosition(lat, lng) {
  if (!lat || !lng) return "未知位置";

  return `${lat.toFixed(4)}, ${lng.toFixed(4)}`;
}

// 返回上一页
function goBack() {
  uni.navigateBack();
}

// 聚焦到特定停留点
function focusStayPoint(point, index) {
  if (!point) return;

  // 更新地图中心
  mapCenter.value = {
    latitude: point.latitude,
    longitude: point.longitude,
  };

  // 移动地图到该点
  const mapContext = uni.createMapContext("map");
  mapContext.moveToLocation({
    latitude: point.latitude,
    longitude: point.longitude,
  });

  // 高亮显示该点
  uni.showToast({
    title: `停留点 ${index + 1}`,
    icon: "none",
  });
}

// 地图更新完成事件
function onMapUpdated(e) {
  console.log("地图更新完成");
}

// 页面加载时初始化
onMounted(() => {
  // 加载历史记录
  trackStore.loadTrackHistory();

  if (stayPoints.value && stayPoints.value.length > 0) {
    // 设置地图中心为第一个停留点
    const firstPoint = stayPoints.value[0];
    mapCenter.value = {
      latitude: firstPoint.latitude,
      longitude: firstPoint.longitude,
    };

    // 延时进行地图渲染
    setTimeout(() => {
      const mapContext = uni.createMapContext("map");
      mapContext.includePoints({
        points: stayPoints.value.map((point) => ({
          latitude: point.latitude,
          longitude: point.longitude,
        })),
        padding: [80, 80, 80, 80],
      });
    }, 500);
  }
});
</script>

<style lang="scss">
.stay-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
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

  .map-wrapper {
    height: 40vh;
    width: 100%;

    .map-container {
      width: 100%;
      height: 100%;
    }
  }

  .stay-list {
    flex: 1;
    overflow-y: auto;
    background-color: #fff;
    margin-top: 15px;

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

  .empty-state {
    flex: 1;
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    padding: 20px;

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
      padding: 0 30px;
    }
  }
}
</style>
