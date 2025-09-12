# 主题管理说明

## 如何添加自定义主题

### 1. 添加背景图片
将您的高清背景图片放入 `backgrounds/` 文件夹中。建议：
- 图片格式：JPG 或 PNG
- 分辨率：至少 1920x1080
- 文件大小：建议小于 2MB 以确保加载速度
- 命名：使用有意义的英文名称，如 `ocean.jpg`、`mountain.png` 等

### 2. 更新主题配置
编辑 `themes.json` 文件，在 `themes` 数组中添加新的主题配置：

```json
{
  "id": "your-theme-id",
  "name": "主题显示名称",
  "background": "/themes/backgrounds/your-image.jpg",
  "description": "主题描述"
}
```

### 3. 配置说明
- `id`: 主题的唯一标识符（英文，无空格）
- `name`: 在界面中显示的主题名称
- `background`: 背景图片的路径（相对于 public 目录）
- `description`: 主题的简短描述

### 4. 示例
```json
{
  "id": "cherry-blossom",
  "name": "樱花",
  "background": "/themes/backgrounds/cherry-blossom.jpg",
  "description": "浪漫的樱花盛开"
}
```

### 5. 注意事项
- 图片路径必须以 `/themes/backgrounds/` 开头
- 确保图片文件名与配置中的路径一致
- 添加新主题后，刷新页面即可在主题切换器中看到
- 用户选择的主题会自动保存在浏览器本地存储中

## 文件结构
```
public/themes/
├── themes.json          # 主题配置文件
├── backgrounds/         # 背景图片文件夹
│   ├── ocean.jpg
│   ├── mountain.jpg
│   ├── forest.jpg
│   └── sunset.jpg
└── README.md           # 本说明文件
```