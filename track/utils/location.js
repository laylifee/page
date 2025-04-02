// 位置服务工具

// 判断当前是否运行在H5环境
const isH5 = process.env.UNI_PLATFORM === "h5" || typeof window !== "undefined";

// 默认位置（北京天安门，当获取位置失败时使用）
const DEFAULT_LOCATION = {
  latitude: 39.9042,
  longitude: 116.4074,
  altitude: 0,
  accuracy: 0,
  speed: 0,
  time: new Date(),
};

// 浏览器原生定位（H5环境使用）
function browserGeolocation() {
  return new Promise((resolve, reject) => {
    if (isH5 && navigator.geolocation) {
      navigator.geolocation.getCurrentPosition(
        (position) => {
          resolve({
            latitude: position.coords.latitude,
            longitude: position.coords.longitude,
            altitude: position.coords.altitude || 0,
            accuracy: position.coords.accuracy || 0,
            speed: position.coords.speed || 0,
            time: new Date(position.timestamp) || new Date(),
          });
        },
        (error) => {
          console.error("浏览器定位失败:", error.message);
          // 在开发环境，可以使用默认位置
          if (process.env.NODE_ENV === "development") {
            console.warn("开发环境使用默认位置");
            resolve(DEFAULT_LOCATION);
          } else {
            reject(error);
          }
        },
        {
          enableHighAccuracy: true,
          timeout: 5000,
          maximumAge: 0,
        }
      );
    } else {
      reject(new Error("浏览器不支持地理位置API"));
    }
  });
}

// 获取当前位置信息
export function getCurrentLocation() {
  return new Promise((resolve, reject) => {
    // 在H5环境下优先使用浏览器原生定位API
    if (isH5) {
      browserGeolocation()
        .then(resolve)
        .catch((err) => {
          console.warn("浏览器定位失败，尝试使用uni-app定位");
          // 如果浏览器定位失败，尝试使用uni-app API
          uniGetLocation().then(resolve).catch(reject);
        });
    } else {
      // 非H5环境直接使用uni-app API
      uniGetLocation().then(resolve).catch(reject);
    }
  });
}

// uni-app定位封装
function uniGetLocation() {
  return new Promise((resolve, reject) => {
    uni.getLocation({
      type: "gcj02",
      altitude: true,
      isHighAccuracy: true,
      highAccuracyExpireTime: 3000,
      success: (res) => {
        resolve({
          latitude: res.latitude,
          longitude: res.longitude,
          altitude: res.altitude || 0,
          accuracy: res.accuracy || 0,
          speed: res.speed || 0,
          time: new Date(),
        });
      },
      fail: (err) => {
        console.error("uni-app获取位置失败:", err);
        // 在开发环境，可以使用默认位置
        if (process.env.NODE_ENV === "development") {
          console.warn("开发环境使用默认位置");
          resolve(DEFAULT_LOCATION);
        } else {
          reject(err);
        }
      },
    });
  });
}

// 位置监听ID（用于浏览器环境）
let watchId = null;

// 启动位置监听
export function startLocationWatch(callback, options = {}) {
  const defaultOptions = {
    interval: 5000, // 默认5秒更新一次
    minDistance: 10, // 最小距离变化，单位米
  };

  const opts = { ...defaultOptions, ...options };

  // 在H5环境下使用浏览器API
  if (isH5 && navigator.geolocation) {
    watchId = navigator.geolocation.watchPosition(
      (position) => {
        callback({
          latitude: position.coords.latitude,
          longitude: position.coords.longitude,
          altitude: position.coords.altitude || 0,
          accuracy: position.coords.accuracy || 0,
          speed: position.coords.speed || 0,
          time: new Date(position.timestamp) || new Date(),
        });
      },
      (error) => {
        console.error("浏览器监听位置失败:", error.message);
        // 开发环境下使用定时器模拟位置变化
        if (process.env.NODE_ENV === "development") {
          console.warn("开发环境使用模拟位置更新");
          // 每隔设定的时间更新一次位置（模拟微小变化）
          watchId = setInterval(() => {
            const randomLat = Math.random() * 0.001 - 0.0005;
            const randomLng = Math.random() * 0.001 - 0.0005;
            callback({
              latitude: DEFAULT_LOCATION.latitude + randomLat,
              longitude: DEFAULT_LOCATION.longitude + randomLng,
              altitude: 0,
              accuracy: 10,
              speed: 0,
              time: new Date(),
            });
          }, opts.interval);
        }
      },
      {
        enableHighAccuracy: true,
        timeout: 5000,
        maximumAge: 0,
      }
    );
    return watchId;
  } else {
    // 非H5环境使用uni-app API
    return uni.onLocationChange((loc) => {
      callback({
        latitude: loc.latitude,
        longitude: loc.longitude,
        altitude: loc.altitude || 0,
        accuracy: loc.accuracy || 0,
        speed: loc.speed || 0,
        time: new Date(),
      });
    });
  }
}

// 停止位置监听
export function stopLocationWatch() {
  if (isH5 && watchId !== null) {
    if (typeof watchId === "number") {
      // 如果是定时器ID，使用clearInterval
      if (process.env.NODE_ENV === "development") {
        clearInterval(watchId);
      } else {
        // 如果是geolocation watchID，使用clearWatch
        navigator.geolocation.clearWatch(watchId);
      }
    }
    watchId = null;
  } else {
    uni.offLocationChange();
  }
}

// 开启后台位置服务
export function startLocationBackground() {
  return new Promise((resolve, reject) => {
    // H5环境无法真正实现后台定位，但我们可以继续使用前台定位
    if (isH5) {
      console.warn("H5环境不支持真正的后台定位，将继续使用前台定位");
      resolve({ message: "H5环境使用前台定位代替" });
      return;
    }

    uni.startLocationUpdateBackground({
      success: (res) => {
        resolve(res);
      },
      fail: (err) => {
        console.error("开启后台定位失败:", err);
        reject(err);
      },
    });
  });
}

// 停止后台位置服务
export function stopLocationBackground() {
  if (!isH5) {
    uni.stopLocationUpdate();
  }
}

// 打开地图选点
export function chooseLocation() {
  return new Promise((resolve, reject) => {
    // 在H5环境下可能需要使用第三方地图API进行选点
    if (isH5) {
      console.warn("H5环境下chooseLocation可能不可用，返回默认位置");
      // 在实际应用中，可以集成第三方地图API如高德、百度等
      // 为了演示，这里返回默认位置
      if (process.env.NODE_ENV === "development") {
        setTimeout(() => {
          resolve({
            name: "默认位置",
            address: "北京市东城区天安门",
            latitude: DEFAULT_LOCATION.latitude,
            longitude: DEFAULT_LOCATION.longitude,
          });
        }, 500);
      } else {
        reject(new Error("H5环境暂不支持地图选点"));
      }
      return;
    }

    uni.chooseLocation({
      success: (res) => {
        resolve({
          name: res.name,
          address: res.address,
          latitude: res.latitude,
          longitude: res.longitude,
        });
      },
      fail: (err) => {
        console.error("选择位置失败:", err);
        reject(err);
      },
    });
  });
}

// 停留点检测 (当用户在某个半径范围内停留超过指定时间)
export function detectStayPoint(locations, options = {}) {
  const {
    radiusThreshold = 100, // 停留点半径范围（米）
    timeThreshold = 5 * 60 * 1000, // 停留时间阈值，默认5分钟（毫秒）
  } = options;

  const stayPoints = [];

  if (locations.length < 2) return stayPoints;

  let potentialStayPoint = null;
  let stayStart = null;

  for (let i = 0; i < locations.length; i++) {
    const current = locations[i];

    if (!potentialStayPoint) {
      potentialStayPoint = current;
      stayStart = current.time;
      continue;
    }

    // 计算当前点与潜在停留点的距离
    const distance =
      calculateDistance(
        potentialStayPoint.latitude,
        potentialStayPoint.longitude,
        current.latitude,
        current.longitude
      ) * 1000; // 转换为米

    // 如果距离超过阈值，重置潜在停留点
    if (distance > radiusThreshold) {
      // 检查之前的潜在停留是否满足时间要求
      if (current.time - stayStart >= timeThreshold) {
        stayPoints.push({
          latitude: potentialStayPoint.latitude,
          longitude: potentialStayPoint.longitude,
          startTime: stayStart,
          endTime: current.time,
          duration: (current.time - stayStart) / 1000 / 60, // 转换为分钟
        });
      }

      // 重置潜在停留点
      potentialStayPoint = current;
      stayStart = current.time;
    }
  }

  // 检查最后一个潜在停留点
  const lastTime = locations[locations.length - 1].time;
  if (potentialStayPoint && lastTime - stayStart >= timeThreshold) {
    stayPoints.push({
      latitude: potentialStayPoint.latitude,
      longitude: potentialStayPoint.longitude,
      startTime: stayStart,
      endTime: lastTime,
      duration: (lastTime - stayStart) / 1000 / 60, // 转换为分钟
    });
  }

  return stayPoints;
}

// 计算两点之间的距离（千米）
export function calculateDistance(lat1, lon1, lat2, lon2) {
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
