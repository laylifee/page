<template>
  <view class="index-container">
    <!-- 位置信息显示 -->
    <view class="location-header">
      <text class="location-title">当前位置: {{ currentCity }}</text>
    </view>

    <!-- 地图区域 -->
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
          <text>地图显示区域</text>
        </view>
      </map>
    </view>

    <!-- 底部功能按钮 -->
    <view class="bottom-functions">
      <button class="track-btn" @click="startTrack">
        <text class="btn-icon">▶</text>
        <text class="btn-text">开始记录轨迹</text>
      </button>

      <!-- 功能入口区 -->
      <view class="function-grid">
        <view class="function-item" @click="navigateTo('/pages/track/track')">
          <view class="function-icon track-icon"></view>
          <text class="function-name">轨迹记录</text>
          <text class="function-desc">实时记录移动路径</text>
        </view>

        <view class="function-item" @click="navigateTo('/pages/stay/stay')">
          <view class="function-icon stay-icon"></view>
          <text class="function-name">停留检测</text>
          <text class="function-desc">自动识别停留点</text>
        </view>
      </view>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted, onUnmounted } from "vue";
import { useTrackStore } from "@/stores/track";
import { getCurrentLocation } from "@/utils/location";

const trackStore = useTrackStore();

// 位置相关数据
const currentLocation = ref({
  latitude: 39.9042,
  longitude: 116.4074,
});
const currentCity = ref("北京市");
const markers = ref([]);
const polyline = ref([]);

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

// 开始记录轨迹
function startTrack() {
  trackStore.startTracking();
  uni.switchTab({
    url: "/pages/track/track",
  });
}

// 页面导航
function navigateTo(url) {
  uni.switchTab({
    url,
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
  height: 100vh;

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
    }
  }

  .bottom-functions {
    padding: 15px;
    background-color: #fff;

    .track-btn {
      background-color: #4caf50;
      color: #fff;
      display: flex;
      align-items: center;
      justify-content: center;
      height: 50px;
      border-radius: 25px;
      font-size: 18px;
      margin-bottom: 20px;

      .btn-icon {
        margin-right: 5px;
      }

      .btn-text {
        font-weight: 500;
      }
    }

    .function-grid {
      display: flex;
      flex-wrap: wrap;
      margin: 0 -10px;

      .function-item {
        width: 50%;
        padding: 10px;
        box-sizing: border-box;

        background-color: #f8f8f8;
        border-radius: 8px;
        padding: 15px;
        margin-bottom: 10px;

        .function-icon {
          width: 40px;
          height: 40px;
          border-radius: 20px;
          margin-bottom: 10px;
          display: flex;
          align-items: center;
          justify-content: center;
          background-color: #e0e0e0;

          &.track-icon {
            background-color: #e3f2fd;
            position: relative;

            &::before {
              content: "";
              width: 20px;
              height: 20px;
              background-color: #2196f3;
              border-radius: 10px;
            }
          }

          &.stay-icon {
            background-color: #e8f5e9;
            position: relative;

            &::before {
              content: "";
              width: 20px;
              height: 20px;
              background-color: #4caf50;
              border-radius: 10px;
            }
          }
        }

        .function-name {
          font-size: 16px;
          font-weight: 500;
          margin-bottom: 5px;
          display: block;
        }

        .function-desc {
          font-size: 12px;
          color: #666;
          display: block;
        }
      }
    }
  }
}
</style>
