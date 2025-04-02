<script setup>
import { onLaunch, onShow, onHide } from "@dcloudio/uni-app";

onLaunch(() => {
  console.log("App Launch");
});

onShow(() => {
  console.log("App Show");
});

onHide(() => {
  console.log("App Hide");
});
</script>

<style lang="scss">
/* 引入基础样式 */
@import "./static/styles/common.scss";

/* 全局样式 */
page {
  font-family: -apple-system, BlinkMacSystemFont, "Helvetica Neue", Helvetica,
    Segoe UI, Arial, Roboto, "PingFang SC", "miui", "Hiragino Sans GB",
    "Microsoft Yahei", sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  box-sizing: border-box;
  background-color: #f8f8f8;
  color: #333333;
  font-size: 14px;
}

/* 底部导航栏图标和文字样式 */
.uni-tabbar-item {
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
}

/* 地图容器 */
.map-container {
  width: 100%;
  height: 100%;
}

/* 底部操作区 */
.bottom-bar {
  position: fixed;
  bottom: 0;
  left: 0;
  right: 0;
  height: 50px;
  background-color: #fff;
  display: flex;
  justify-content: space-around;
  align-items: center;
  box-shadow: 0 -2px 6px rgba(0, 0, 0, 0.1);
}

/* 按钮样式 */
.btn {
  padding: 8px 20px;
  border-radius: 20px;
  font-size: 16px;
  font-weight: 500;
  text-align: center;
}

.btn-primary {
  background-color: #4caf50;
  color: #ffffff;
}

.btn-danger {
  background-color: #ff5252;
  color: #ffffff;
}

/* 内容区域 */
.content {
  padding: 15px;
}

/* 列表样式 */
.list-item {
  background-color: #ffffff;
  padding: 15px;
  margin-bottom: 10px;
  border-radius: 8px;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.1);
  display: flex;
  align-items: center;
}

.list-item-icon {
  width: 40px;
  height: 40px;
  margin-right: 15px;
  display: flex;
  align-items: center;
  justify-content: center;
}

.list-item-content {
  flex: 1;
}

.list-item-title {
  font-size: 16px;
  font-weight: 500;
  margin-bottom: 5px;
}

.list-item-info {
  font-size: 12px;
  color: #999;
}
</style>
