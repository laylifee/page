<template>
  <view class="photo-container">
    <!-- 拍照预览区域 -->
    <view class="photo-preview">
      <image v-if="previewImage" :src="previewImage" class="preview-image" mode="aspectFill"></image>
      <view v-else class="empty-preview">
        <text class="empty-text">点击下方按钮拍照</text>
      </view>
    </view>

    <!-- 位置信息显示 -->
    <view class="location-info">
      <text class="location-label">当前位置: </text>
      <text class="location-value">{{ locationInfo }}</text>
    </view>

    <!-- 拍照按钮 -->
    <view class="photo-action">
      <button class="photo-btn" @click="takePhoto">
        <text class="btn-icon">📷</text>
        <text class="btn-text">拍照</text>
      </button>
    </view>
  </view>
</template>

<script setup>
import { ref, onMounted } from "vue";
import { useTrackStore } from "@/stores/track";
import { getCurrentLocation } from "@/utils/location";

const trackStore = useTrackStore();

// 预览图片
const previewImage = ref("");
// 位置信息
const locationInfo = ref("获取中...");
// 当前位置
const currentLocation = ref(null);

// 获取位置信息
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
              locationInfo.value = res?.data?.regeocode?.formatted_address;
            }
          },
        });
      },
    });
    // 尝试获取地址信息
    // uni.request({
    //   url: "https://restapi.amap.com/v3/geocode/regeo",
    //   data: {
    //     key: "79781d567ac047e398e1c5cc606ab368", // 实际使用时需要替换为自己的百度地图API Key
    //     output: "json",
    //     coordtype: "gcj02ll",
    //     location: `${location.longitude},${location.latitude}`,
    //   },
    //   success: (res) => {
    //     console.log("获取地址信息成功:", res);
    //     if (res.data && res.data.result) {
    //       locationInfo.value = res.data.result.formatted_address;
    //     } else {
    //       locationInfo.value = `${location.latitude.toFixed(
    //         6
    //       )}, ${location.longitude.toFixed(6)}`;
    //     }
    //   },
    //   fail: () => {
    //     locationInfo.value = `${location.latitude.toFixed(
    //       6
    //     )}, ${location.longitude.toFixed(6)}`;
    //   },
    // });
  } catch (err) {
    console.error("获取位置失败:", err);
    locationInfo.value = "无法获取位置";
  }
}

// 拍照
function takePhoto() {
  uni.chooseImage({
    count: 1,
    sourceType: ["camera"],
    success: (res) => {
      const tempFilePath = res.tempFilePaths[0];
      previewImage.value = tempFilePath;

      // 添加拍照记录
      if (currentLocation.value) {
        trackStore.addPhotoRecord({
          path: tempFilePath,
          latitude: currentLocation.value.latitude,
          longitude: currentLocation.value.longitude,
          address: locationInfo.value,
          // 坐标转为字符串方便显示
          locationText: `${currentLocation.value.latitude.toFixed(
            4
          )}°N, ${currentLocation.value.longitude.toFixed(4)}°E`,
        });

        uni.showToast({
          title: "拍照记录已保存",
          icon: "success",
        });
      } else {
        uni.showToast({
          title: "无法获取位置信息",
          icon: "none",
        });
      }
    },
    fail: (err) => {
      console.error("拍照失败:", err);
      uni.showToast({
        title: "拍照失败",
        icon: "none",
      });
    },
  });
}

// 页面导航
function navigateTo(url) {
  uni.switchTab({
    url,
  });
}

// 页面加载
onMounted(() => {
  getLocation();
});
</script>

<style lang="scss">
.photo-container {
  display: flex;
  flex-direction: column;
  height: 100vh;
  background-color: #f8f8f8;
  position: relative;

  .photo-preview {
    // flex: 1;
    height: 400px;
    background-color: #000;
    display: flex;
    align-items: center;
    justify-content: center;

    .preview-image {
      width: 100%;
      height: 100%;
      object-fit: contain;
    }

    .empty-preview {
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      height: 100%;

      .empty-text {
        color: #fff;
        font-size: 16px;
        opacity: 0.7;
      }
    }
  }

  .location-info {
    padding: 12px 15px;
    background-color: #fff;
    font-size: 14px;

    .location-label {
      color: #666;
    }

    .location-value {
      color: #333;
      font-weight: 500;
    }
  }

  .photo-action {
    padding: 15px;
    background-color: #fff;
    border-top: 1px solid #f0f0f0;

    .photo-btn {
      background-color: #4caf50;
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
