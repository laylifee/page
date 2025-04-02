# 轨迹记录应用

一个基于 uni-app + Vue 3 开发的轨迹记录应用，可用于记录用户的移动轨迹、停留点和拍照记录等信息。

## 功能特点

- **轨迹记录**：实时记录用户移动路线，并显示在地图上
- **停留点检测**：自动识别用户在某地停留的时间和位置
- **拍照记录**：支持拍照并记录照片的位置信息
- **个人中心**：查看个人轨迹统计数据和历史记录
- **数据统计**：统计总里程、总时间等数据

## 项目结构

```
track/
├── pages/                 # 页面文件
│   ├── index/             # 首页
│   ├── track/             # 轨迹记录页
│   ├── stay/              # 停留点记录页
│   ├── photo/             # 拍照记录页
│   └── user/              # 个人中心页
├── static/                # 静态资源
│   └── styles/            # 样式文件
├── stores/                # Pinia状态管理
│   └── track.js           # 轨迹数据状态管理
├── utils/                 # 工具函数
│   └── location.js        # 位置服务工具
├── App.vue                # 应用入口组件
├── main.js                # 应用入口文件
├── index.html             # HTML 入口文件
├── vite.config.js         # Vite 构建配置
├── pages.json             # 页面配置
├── manifest.json          # 应用配置
└── package.json           # 项目依赖配置
```

## 安装与运行

### 环境要求

- Node.js 14.0+
- HBuilderX 3.0+（推荐使用，可选）

### 安装依赖

```bash
cd track
npm install
```

如果安装过程中遇到版本问题，可以尝试以下解决方法：

```bash
# 使用国内npm镜像
npm install --registry=https://registry.npmmirror.com

# 或者清除npm缓存后重新安装
npm cache clean --force
npm install
```

**注意**：uni-app Vue 3 版本目前处于 alpha 阶段，我们使用了特定版本 3.0.0-alpha-3070720230316001，请确保使用这个版本以避免兼容性问题。

### 使用 HBuilderX 安装（推荐）

由于 uni-app 的 Vue 3 版本仍处于开发阶段，使用 HBuilderX 可能是更稳定的选择：

1. 下载安装 [HBuilderX](https://www.dcloud.io/hbuilderx.html)
2. 通过 HBuilderX 导入项目
3. 使用 HBuilderX 自带的包管理器安装依赖

### 开发模式运行

#### 通过命令行：

```bash
# 运行到H5平台
npm run dev:h5

# 运行到微信小程序
npm run dev:mp-weixin

# 运行到APP
npm run dev:app-plus
```

#### 通过 HBuilderX（推荐）：

1. 打开 HBuilderX
2. 点击菜单 `文件` -> `导入` -> `从本地目录导入`，选择项目目录
3. 导入完成后，点击顶部 `运行` 按钮，选择需要运行的平台

### 构建发布

```bash
# 构建H5版本
npm run build:h5

# 构建微信小程序
npm run build:mp-weixin

# 构建APP
npm run build:app-plus
```

也可以通过 HBuilderX 点击顶部 `发行` 按钮，选择对应平台进行发布。

## 使用说明

1. 首页：显示当前位置，开始记录轨迹
2. 轨迹记录：实时显示轨迹路线和统计数据
3. 停留点：自动检测并记录用户停留的位置和时间
4. 拍照记录：拍照并关联位置信息
5. 个人中心：查看统计数据和历史记录

## 图标使用说明

本项目使用阿里巴巴图标库（iconfont）的在线图标，通过 URL 直接引用。如果您需要替换图标：

1. 可以在阿里巴巴图标库（https://www.iconfont.cn/）中选择自己喜欢的图标
2. 将图标添加到您的项目中，获取图标 URL
3. 替换项目中相应的图标 URL

或者您也可以：

1. 下载图标文件
2. 将图标放入 static/icons 目录
3. 修改相关文件中的图标路径为本地路径

## 注意事项

- 使用前需要在`manifest.json`中配置地图和定位相关的 API 密钥
- 应用需要获取位置权限，请确保用户授权
- 轨迹记录需要保持应用在前台运行，或者开启后台定位权限
- 使用在线图标可能导致在无网络环境下图标无法显示，如果需要离线使用，请下载图标到本地
- 本项目使用 Vite 作为构建工具，要求 Node.js 版本 14.0+
- uni-app 的 Vue 3 版本（Vite）仍处于 alpha 阶段，可能存在稳定性问题

## 技术栈

- uni-app (3.0.0-alpha-3070720230316001)
- Vue 3 (^3.2.45)
- Pinia (^2.0.30)（状态管理）
- SCSS（样式处理）
- Vite（构建工具）
- 阿里巴巴图标库（在线图标）

## 常见问题

1. **依赖安装失败**：

   - 尝试使用国内 npm 镜像：`npm install --registry=https://registry.npmmirror.com`
   - 清除 npm 缓存：`npm cache clean --force`
   - 检查 Node.js 版本是否满足要求（14.0+）
   - 尝试使用 HBuilderX 内置的包管理器安装依赖
   - 使用精确版本号安装 uni-app 依赖: `3.0.0-alpha-3070720230316001`

2. **运行失败**：

   - 确保已经正确安装依赖
   - 检查项目目录结构是否完整
   - 参考 console 错误信息进行排查
   - uni-app Vue 3 版本仍处于 alpha 阶段，可能存在兼容性问题

3. **地图显示异常**：
   - 检查 manifest.json 中的地图 API 配置
   - 确保应用已获取位置权限

## 后续开发计划

- [ ] 添加轨迹数据导出功能
- [ ] 优化停留点检测算法
- [ ] 添加轨迹共享功能
- [ ] 支持自定义地图样式
- [ ] 增加更多统计分析功能
- [ ] 支持离线图标
- [ ] 添加单元测试
- [ ] 优化应用性能

## 贡献指南

欢迎贡献代码或提出问题！请提交 Issue 或 Pull Request。

## 许可证

本项目采用 MIT 许可证。
