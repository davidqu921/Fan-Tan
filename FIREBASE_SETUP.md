# Firebase 配置指南

## 🔥 设置 Firebase 项目

### 1. 创建 Firebase 项目

1. 访问 [Firebase Console](https://console.firebase.google.com/)
2. 点击"创建项目"
3. 输入项目名称：`badminton-activities`（或您喜欢的名称）
4. 启用 Google Analytics（可选）
5. 创建项目

### 2. 启用认证服务

1. 在 Firebase Console 中，点击左侧菜单的"Authentication"
2. 点击"开始使用"
3. 在"登录方法"标签页中，启用"电子邮件/密码"
4. 点击"保存"

### 3. 创建 Firestore 数据库

1. 在 Firebase Console 中，点击左侧菜单的"Firestore Database"
2. 点击"创建数据库"
3. 选择"测试模式"（开发阶段）
4. 选择数据库位置（建议选择离您最近的区域）

### 4. 获取配置信息

1. 在 Firebase Console 中，点击项目设置（齿轮图标）
2. 滚动到"您的应用"部分
3. 点击"Web"图标（</>）
4. 输入应用昵称：`badminton-miniprogram`
5. 点击"注册应用"
6. 复制配置对象，类似：

```javascript
const firebaseConfig = {
  apiKey: "AIzaSyXXXXXXXXXXXXXXXXXXXXXXXXXXXXX",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  storageBucket: "your-project.appspot.com",
  messagingSenderId: "123456789",
  appId: "1:123456789:web:abcdef123456"
};
```

### 5. 更新配置文件

将获取的配置信息更新到 `firebase-config.js` 文件中：

```javascript
// firebase-config.js
const firebaseConfig = {
  apiKey: "您的API密钥",
  authDomain: "您的项目域名",
  projectId: "您的项目ID",
  storageBucket: "您的存储桶",
  messagingSenderId: "您的发送者ID",
  appId: "您的应用ID"
};
```

## 📱 小程序配置

### 1. 安装 Firebase SDK

由于微信小程序不支持 npm，您需要：

1. 下载 Firebase SDK 文件
2. 将文件放在 `lib/` 目录下
3. 在页面中引入

### 2. 下载必要的 Firebase 文件

创建 `lib/` 目录并下载以下文件：

- `firebase-app.js` - Firebase 核心
- `firebase-auth.js` - 认证模块
- `firebase-firestore.js` - 数据库模块

### 3. 更新导入路径

在 `firebase-config.js` 和 `utils/auth.js` 中更新导入路径：

```javascript
// 更新为小程序兼容的导入方式
import { initializeApp } from '../../lib/firebase-app.js';
import { getAuth } from '../../lib/firebase-auth.js';
import { getFirestore } from '../../lib/firebase-firestore.js';
```

## 🔐 数据库结构

### 用户集合 (users)

```javascript
{
  uid: "用户唯一ID",
  email: "用户邮箱",
  displayName: "用户姓名",
  role: "user" | "admin",
  status: "active" | "inactive" | "pending",
  avatar: "头像URL",
  phone: "手机号",
  wechat: "微信号",
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

### 活动集合 (activities)

```javascript
{
  id: "活动ID",
  title: "活动标题",
  description: "活动描述",
  location: "活动地点",
  date: "活动日期",
  time: "活动时间",
  maxParticipants: "最大参与人数",
  currentParticipants: "当前参与人数",
  creatorId: "创建者ID",
  creatorName: "创建者姓名",
  status: "active" | "cancelled" | "completed",
  participants: ["参与者ID数组"],
  createdAt: "创建时间",
  updatedAt: "更新时间"
}
```

## 🚀 部署步骤

### 1. 测试环境

1. 在微信开发者工具中打开项目
2. 确保 Firebase 配置正确
3. 测试注册、登录功能
4. 检查数据库中的数据

### 2. 生产环境

1. 在 Firebase Console 中设置 Firestore 安全规则
2. 配置认证域名白名单
3. 设置数据库备份策略

## 🔒 安全规则示例

### Firestore 安全规则

```javascript
rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // 用户只能读写自己的数据
    match /users/{userId} {
      allow read, write: if request.auth != null && request.auth.uid == userId;
    }
    
    // 活动数据：所有认证用户可读，创建者可写
    match /activities/{activityId} {
      allow read: if request.auth != null;
      allow write: if request.auth != null && 
        (resource == null || resource.data.creatorId == request.auth.uid);
    }
  }
}
```

## 📞 技术支持

如果在配置过程中遇到问题，请检查：

1. Firebase 项目是否正确创建
2. 认证服务是否已启用
3. Firestore 数据库是否已创建
4. 配置信息是否正确复制
5. 网络连接是否正常

## 🎯 下一步

配置完成后，您可以：

1. 测试用户注册和登录
2. 创建第一个活动
3. 测试用户参与活动功能
4. 配置管理员权限
5. 优化用户体验
