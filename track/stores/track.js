import { defineStore } from "pinia";
import { ref, computed } from "vue";

export const useTrackStore = defineStore("track", () => {
  // 状态
  const isTracking = ref(false);
  const currentTrack = ref(null);
  const trackHistory = ref([]);
  const locationList = ref([]);
  const stayPoints = ref([]);
  const photoRecords = ref([]);

  // 计算属性
  const trackDistance = computed(() => {
    if (!locationList.value.length) return 0;

    let distance = 0;
    for (let i = 1; i < locationList.value.length; i++) {
      const prev = locationList.value[i - 1];
      const curr = locationList.value[i];
      distance += calculateDistance(
        prev.latitude,
        prev.longitude,
        curr.latitude,
        curr.longitude
      );
    }

    return distance.toFixed(2);
  });

  const trackDuration = computed(() => {
    if (!currentTrack.value || !currentTrack.value.startTime) return 0;

    const endTime = currentTrack.value.endTime || new Date();
    const duration = (endTime - currentTrack.value.startTime) / 1000 / 60;

    return Math.round(duration);
  });

  // 方法
  function startTracking() {
    isTracking.value = true;
    locationList.value = [];
    currentTrack.value = {
      id: Date.now().toString(),
      startTime: new Date(),
      endTime: null,
    };
  }

  function stopTracking() {
    if (!isTracking.value) return;

    isTracking.value = false;

    if (currentTrack.value) {
      currentTrack.value.endTime = new Date();
      currentTrack.value.distance = trackDistance.value;
      currentTrack.value.duration = trackDuration.value;
      currentTrack.value.locations = [...locationList.value];
      currentTrack.value.stayPoints = [...stayPoints.value];
      currentTrack.value.photos = photoRecords.value.filter(
        (p) =>
          p.time >= currentTrack.value.startTime &&
          p.time <= currentTrack.value.endTime
      );

      trackHistory.value.unshift(currentTrack.value);

      // 保存到本地存储
      saveTrackHistoryToStorage();
    }

    // 清空当前轨迹数据
    locationList.value = [];
    stayPoints.value = [];
  }

  function addLocation(location) {
    locationList.value.push({
      ...location,
      time: new Date(),
    });
  }

  function addStayPoint(stayPoint) {
    stayPoints.value.push({
      ...stayPoint,
      time: new Date(),
    });
  }

  function addPhotoRecord(photo) {
    photoRecords.value.unshift({
      ...photo,
      id: Date.now().toString(),
      time: new Date(),
    });
  }

  // 加载历史记录
  function loadTrackHistory() {
    try {
      const historyData = uni.getStorageSync("track_history");

      if (historyData) {
        const parsedData = JSON.parse(historyData);

        // 处理日期格式
        parsedData.forEach((track) => {
          track.startTime = new Date(track.startTime);
          track.endTime = new Date(track.endTime);

          if (track.locations) {
            track.locations.forEach((loc) => {
              if (loc.time) {
                loc.time = new Date(loc.time);
              }
            });
          }

          if (track.stayPoints) {
            track.stayPoints.forEach((point) => {
              if (point.time) {
                point.time = new Date(point.time);
              }
            });
          }
        });

        trackHistory.value = parsedData;
      }
    } catch (error) {
      console.error("加载历史记录失败:", error);
    }
  }

  // 保存历史记录到本地存储
  function saveTrackHistoryToStorage() {
    try {
      uni.setStorageSync("track_history", JSON.stringify(trackHistory.value));
    } catch (error) {
      console.error("保存历史记录失败:", error);
    }
  }

  // 辅助函数 - 计算两个坐标点之间的距离（千米）
  function calculateDistance(lat1, lon1, lat2, lon2) {
    const R = 6371; // 地球半径，单位千米
    const dLat = deg2rad(lat2 - lat1);
    const dLon = deg2rad(lon2 - lon1);

    const a =
      Math.sin(dLat / 2) * Math.sin(dLat / 2) +
      Math.cos(deg2rad(lat1)) *
      Math.cos(deg2rad(lat2)) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);

    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
    return R * c;
  }

  function deg2rad(deg) {
    return deg * (Math.PI / 180);
  }

  return {
    // 状态
    isTracking,
    currentTrack,
    trackHistory,
    locationList,
    stayPoints,
    photoRecords,

    // 计算属性
    trackDistance,
    trackDuration,

    // 方法
    startTracking,
    stopTracking,
    addLocation,
    addStayPoint,
    addPhotoRecord,
    loadTrackHistory,
    saveTrackHistoryToStorage,
  };
});
