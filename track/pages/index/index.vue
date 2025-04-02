<template>
  <view class="index-container">
    <!-- 位置信息显示 -->
    <view class="location-header">
      <text class="location-title">当前位置: {{ currentCity }}</text>
    </view>

    <!-- 地图区域 -->
    <view class="map-wrapper">
      <map id="map" class="map-container" :latitude="currentLocation.latitude" :longitude="currentLocation.longitude"
        :markers="markers" :polyline="polyline" scale="16" show-location="true">
        <!-- <view class="map-label">
          <text>地图显示区域</text>
        </view> -->
      </map>
    </view>

    <!-- 模拟数据控制区 -->
    <view class="sim-control">
      <view class="sim-buttons">
        <button class="sim-btn" @click="generateSimulationData">
          模拟生成轨迹
        </button>
        <button class="track-btn" @click="startTrack">
          <text class="btn-icon">▶</text>
          <text class="btn-text">开始记录轨迹</text>
        </button>
      </view>
    </view>

    <!-- 模拟数据展示区 -->
    <view class="sim-data-list" v-if="simulatedLocations.length > 0">
      <view class="list-header">
        <text class="header-title">模拟轨迹数据</text>
      </view>
      <scroll-view scroll-y="true" class="location-scroll">
        <view class="location-item" v-for="(item, index) in simulatedLocations" :key="index">
          <view class="location-index">{{ index + 1 }}</view>
          <view class="location-info">
            <view class="location-coordinates">
              <text class="coordinate">纬度: {{ item.latitude.toFixed(6) }}</text>
              <text class="coordinate">经度: {{ item.longitude.toFixed(6) }}</text>
            </view>
            <view class="location-time">
              <text class="time">{{ formatTime(item.time) }}</text>
            </view>
          </view>
        </view>
      </scroll-view>
    </view>

    <!-- 停留点数据展示 -->
    <view class="stay-points-list" v-if="simulatedStayPoints.length > 0">
      <view class="list-header">
        <text class="header-title">停留点数据 ({{ simulatedStayPoints.length }}个)</text>
      </view>
      <view class="stay-point-item" v-for="(item, index) in simulatedStayPoints" :key="index">
        <view class="stay-point-index">{{ index + 1 }}</view>
        <view class="stay-point-info">
          <view class="stay-point-coordinates">
            <text class="coordinate">纬度: {{ item.latitude.toFixed(6) }}</text>
            <text class="coordinate">经度: {{ item.longitude.toFixed(6) }}</text>
          </view>
          <view class="stay-point-duration">
            <text class="duration">停留时间: {{ item.duration }} 分钟</text>
          </view>
        </view>
      </view>
    </view>

    <!-- 数据统计区 -->
    <view class="data-summary" v-if="simulatedLocations.length > 0">
      <view class="summary-item">
        <text class="summary-label">总距离</text>
        <text class="summary-value">{{ simulatedDistance.toFixed(2) }} 公里</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">总时间</text>
        <text class="summary-value">{{ simulatedDuration }} 分钟</text>
      </view>
      <view class="summary-item">
        <text class="summary-label">平均速度</text>
        <text class="summary-value">{{
        (simulatedDistance / (simulatedDuration / 60)).toFixed(2)
      }}
          km/h</text>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, computed, onMounted, onUnmounted } from "vue";
import { useTrackStore } from "@/stores/track";
import { getCurrentLocation, calculateDistance } from "@/utils/location";

const trackStore = useTrackStore();

// 位置相关数据
const currentLocation = ref({
  latitude: 39.9042,
  longitude: 116.4074,
});
const currentCity = ref("北京市");
const markers = ref([]);
const polyline = ref([]);

// 模拟数据
const simulatedLocations = ref([]);
const simulatedDistance = ref(0);
const simulatedDuration = ref(0);
const simulatedStayPoints = ref([]);

// 获取当前位置
async function getLocation() {
  try {
    const location = await getCurrentLocation();
    currentLocation.value = location;
    console.log("当前位置:", location);
    // 获取城市名称
    uni.getLocation({
      type: "gcj02",
      success: (res) => {
        uni.request({
          url: "https://restapi.amap.com/v3/geocode/regeo",
          data: {
            key: "79781d567ac047e398e1c5cc606ab368", // 实际使用时需要替换为自己的百度地图API Key
            output: "json",
            coordtype: "gcj02ll",
            location: `${res.longitude},${res.latitude}`,
          },
          success: (res) => {
            console.log("获取城市名称成功:", res);
            if (res?.data?.regeocode) {
              currentCity.value = res?.data?.regeocode?.formatted_address;
            }
          },
        });
      },
    });
  } catch (err) {
    console.error("获取当前位置失败:", err);
    uni.showToast({
      title: "获取位置信息失败",
      icon: "none",
    });
  }
}

// 生成模拟轨迹数据
function generateSimulationData() {
  // 清空之前的数据
  simulatedLocations.value = [];
  simulatedStayPoints.value = [];

  // 从当前位置开始
  const startLocation = {
    latitude: currentLocation.value.latitude,
    longitude: currentLocation.value.longitude,
    time: new Date(),
  };

  simulatedLocations.value.push(startLocation);

  // 生成剩余9个点，围绕当前位置移动
  for (let i = 1; i < 10; i++) {
    // 随机方向移动 (范围约0.001度，相当于约100米)
    const latOffset = (Math.random() * 0.002 - 0.001) * i;
    const lngOffset = (Math.random() * 0.002 - 0.001) * i;

    // 时间间隔，每个点增加1-3分钟
    const timeOffset = i * (Math.random() * 2 + 1) * 60 * 1000;

    const newLocation = {
      latitude: startLocation.latitude + latOffset,
      longitude: startLocation.longitude + lngOffset,
      time: new Date(startLocation.time.getTime() + timeOffset),
    };

    simulatedLocations.value.push(newLocation);
  }

  // 添加停留点
  addSimulatedStayPoints();

  // 计算总距离和持续时间
  calculateSimulatedStats();

  // 更新地图标记和路线
  updateMapMarkers();
}

// 生成模拟停留点
function addSimulatedStayPoints() {
  if (simulatedLocations.value.length < 3) return;

  // 从已有轨迹点中随机选择2-3个点作为停留点
  const numStayPoints = Math.floor(Math.random() * 2) + 2; // 2-3个停留点

  for (let i = 0; i < numStayPoints; i++) {
    // 避免选择起点和终点
    const randomIndex =
      Math.floor(Math.random() * (simulatedLocations.value.length - 2)) + 1;
    const baseLocation = simulatedLocations.value[randomIndex];

    // 创建停留点
    const stayPoint = {
      latitude: baseLocation.latitude + (Math.random() * 0.0002 - 0.0001),
      longitude: baseLocation.longitude + (Math.random() * 0.0002 - 0.0001),
      time: new Date(baseLocation.time.getTime()),
      duration: Math.floor(Math.random() * 10) + 5, // 5-15分钟停留时间
    };

    simulatedStayPoints.value.push(stayPoint);
  }
}

// 计算模拟轨迹统计数据
function calculateSimulatedStats() {
  let totalDistance = 0;

  // 计算总距离
  for (let i = 1; i < simulatedLocations.value.length; i++) {
    const prev = simulatedLocations.value[i - 1];
    const curr = simulatedLocations.value[i];

    totalDistance += calculateDistance(
      prev.latitude,
      prev.longitude,
      curr.latitude,
      curr.longitude
    );
  }

  simulatedDistance.value = totalDistance;

  // 计算总时间（分钟）
  if (simulatedLocations.value.length >= 2) {
    const startTime = simulatedLocations.value[0].time;
    const endTime =
      simulatedLocations.value[simulatedLocations.value.length - 1].time;

    simulatedDuration.value = Math.round((endTime - startTime) / 1000 / 60);
  }
}

// 更新地图标记和路线
function updateMapMarkers() {
  if (simulatedLocations.value.length === 0) return;

  // 设置地图中心为轨迹起点
  currentLocation.value = {
    latitude: simulatedLocations.value[0].latitude,
    longitude: simulatedLocations.value[0].longitude,
  };

  // 设置标记点
  markers.value = [
    // 起点
    {
      id: 0,
      latitude: simulatedLocations.value[0].latitude,
      longitude: simulatedLocations.value[0].longitude,
      iconPath: "/static/icon/location-fill.png",
      width: 25,
      height: 25,
      callout: {
        content: "起点",
        color: "#ffffff",
        fontSize: 12,
        borderRadius: 4,
        bgColor: "#4CAF50",
        padding: 5,
        display: "ALWAYS",
      },
    },
    // 终点
    {
      id: 1,
      latitude:
        simulatedLocations.value[simulatedLocations.value.length - 1].latitude,
      longitude:
        simulatedLocations.value[simulatedLocations.value.length - 1].longitude,
      iconPath: "/static/icon/location-fill.png",
      width: 25,
      height: 25,
      callout: {
        content: "终点",
        color: "#ffffff",
        fontSize: 12,
        borderRadius: 4,
        bgColor: "#FF5252",
        padding: 5,
        display: "ALWAYS",
      },
    },
  ];

  // 添加停留点标记
  simulatedStayPoints.value.forEach((point, index) => {
    markers.value.push({
      id: index + 2,
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
    });
  });

  // 设置路线
  polyline.value = [
    {
      points: simulatedLocations.value.map((loc) => ({
        latitude: loc.latitude,
        longitude: loc.longitude,
      })),
      color: "#4CAF50",
      width: 4,
    },
  ];
}

// 格式化时间
function formatTime(time) {
  if (!time) return "";

  const date = new Date(time);
  const hours = date.getHours().toString().padStart(2, "0");
  const minutes = date.getMinutes().toString().padStart(2, "0");
  const seconds = date.getSeconds().toString().padStart(2, "0");

  return `${hours}:${minutes}:${seconds}`;
}

// 开始记录轨迹
function startTrack() {
  // 如果有模拟数据，加载到store中
  if (simulatedLocations.value.length > 0) {
    trackStore.startTracking();
    simulatedLocations.value.forEach((location) => {
      trackStore.addLocation(location);
    });

    // 添加模拟停留点
    simulatedStayPoints.value.forEach((point) => {
      trackStore.addStayPoint(point);
    });
  } else {
    trackStore.startTracking();
  }

  uni.switchTab({
    url: "/pages/track/track",
  });
}

// 页面加载时初始化
onMounted(() => {
  getLocation();
});

// 页面销毁时清理
onUnmounted(() => {
  // 清理工作（如有需要）
});
</script>

<style lang="scss">
.index-container {
  display: flex;
  flex-direction: column;
  // height: 100vh;

  .location-header {
    background-color: #4caf50;
    padding: 10px 15px;
    color: #fff;

    .location-title {
      font-size: 16px;
      font-weight: 500;
    }
  }

  .map-wrapper {
    height: 400px;
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
    }
  }

  .sim-control {
    padding: 10px;
    background-color: #fff;
    border-bottom: 1px solid #eee;

    .sim-buttons {
      display: flex;
      gap: 10px;

      .sim-btn,
      .track-btn {
        flex: 1;
        height: 40px;
        display: flex;
        align-items: center;
        justify-content: center;
        border-radius: 20px;
        font-size: 14px;
      }

      .sim-btn {
        background-color: #2196f3;
        color: #fff;
      }

      .track-btn {
        background-color: #4caf50;
        color: #fff;

        .btn-icon {
          margin-right: 5px;
        }
      }
    }
  }

  .sim-data-list {
    height: auto;
    display: flex;
    flex-direction: column;
    background-color: #fff;

    .list-header {
      padding: 10px 15px;
      border-bottom: 1px solid #eee;

      .header-title {
        font-size: 14px;
        font-weight: 500;
      }
    }

    .location-scroll {
      flex: 1;
      height: 100%;
    }

    .location-item {
      display: flex;
      padding: 10px 15px;
      border-bottom: 1px solid #f5f5f5;

      .location-index {
        width: 24px;
        height: 24px;
        border-radius: 12px;
        background-color: #f0f0f0;
        display: flex;
        align-items: center;
        justify-content: center;
        font-size: 12px;
        margin-right: 10px;
      }

      .location-info {
        flex: 1;

        .location-coordinates {
          display: flex;
          gap: 10px;

          .coordinate {
            font-size: 13px;
            color: #333;
          }
        }

        .location-time {
          margin-top: 4px;

          .time {
            font-size: 12px;
            color: #999;
          }
        }
      }
    }
  }

  .stay-points-list {
    height: auto;

    margin-top: 10px;
    background-color: #fff;
    border-top: 1px solid #eee;

    .list-header {
      padding: 10px 15px;
      border-bottom: 1px solid #eee;

      .header-title {
        font-size: 14px;
        font-weight: 500;
        color: #2196f3;
      }
    }

    .stay-point-item {
      display: flex;
      padding: 10px 15px;
      border-bottom: 1px solid #f5f5f5;

      .stay-point-index {
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

      .stay-point-info {
        flex: 1;

        .stay-point-coordinates {
          display: flex;
          gap: 10px;

          .coordinate {
            font-size: 13px;
            color: #333;
          }
        }

        .stay-point-duration {
          margin-top: 4px;

          .duration {
            font-size: 12px;
            color: #2196f3;
            font-weight: 500;
          }
        }
      }
    }
  }

  .data-summary {
    padding: 10px 15px;
    background-color: #f9f9f9;
    display: flex;
    justify-content: space-around;
    border-top: 1px solid #eee;

    .summary-item {
      display: flex;
      flex-direction: column;
      align-items: center;

      .summary-label {
        font-size: 12px;
        color: #666;
        margin-bottom: 4px;
      }

      .summary-value {
        font-size: 14px;
        font-weight: 500;
        color: #4caf50;
      }
    }
  }
}
</style>
