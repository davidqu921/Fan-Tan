// lib/firebase-setup.js
// Firebase 小程序兼容版本

// 注意：这是简化版本，实际使用时需要下载完整的 Firebase SDK
// 或者使用微信小程序的云开发功能

class FirebaseApp {
  constructor(config) {
    this.config = config;
    this.auth = null;
    this.firestore = null;
  }

  // 初始化认证
  initAuth() {
    this.auth = new FirebaseAuth(this.config);
    return this.auth;
  }

  // 初始化数据库
  initFirestore() {
    this.firestore = new FirebaseFirestore(this.config);
    return this.firestore;
  }
}

// 简化的认证类
class FirebaseAuth {
  constructor(config) {
    this.config = config;
    this.currentUser = null;
  }

  // 邮箱密码登录
  async signInWithEmailAndPassword(email, password) {
    // 这里需要调用微信小程序的云函数或第三方API
    // 暂时返回模拟数据
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          this.currentUser = {
            uid: 'mock-uid-' + Date.now(),
            email: email
          };
          resolve({ user: this.currentUser });
        } else {
          reject(new Error('Invalid credentials'));
        }
      }, 1000);
    });
  }

  // 创建用户
  async createUserWithEmailAndPassword(email, password) {
    return new Promise((resolve, reject) => {
      setTimeout(() => {
        if (email && password) {
          this.currentUser = {
            uid: 'mock-uid-' + Date.now(),
            email: email
          };
          resolve({ user: this.currentUser });
        } else {
          reject(new Error('Registration failed'));
        }
      }, 1000);
    });
  }

  // 登出
  async signOut() {
    this.currentUser = null;
    return Promise.resolve();
  }

  // 监听认证状态
  onAuthStateChanged(callback) {
    // 模拟认证状态变化
    setTimeout(() => {
      callback(this.currentUser);
    }, 100);
  }
}

// 简化的数据库类
class FirebaseFirestore {
  constructor(config) {
    this.config = config;
  }

  // 获取文档
  async getDoc(docRef) {
    // 模拟从本地存储获取数据
    const data = wx.getStorageSync(docRef.path);
    return {
      exists: () => !!data,
      data: () => data
    };
  }

  // 设置文档
  async setDoc(docRef, data) {
    // 模拟保存到本地存储
    wx.setStorageSync(docRef.path, data);
    return Promise.resolve();
  }

  // 更新文档
  async updateDoc(docRef, data) {
    const existing = wx.getStorageSync(docRef.path);
    const updated = { ...existing, ...data };
    wx.setStorageSync(docRef.path, updated);
    return Promise.resolve();
  }

  // 获取集合
  async getDocs(query) {
    // 模拟获取集合数据
    const data = wx.getStorageSync(query.path) || [];
    return {
      forEach: (callback) => {
        data.forEach((item, index) => {
          callback({
            id: index.toString(),
            data: () => item
          });
        });
      }
    };
  }
}

// 导出函数
export function initializeApp(config) {
  return new FirebaseApp(config);
}

export function getAuth(app) {
  return app.initAuth();
}

export function getFirestore(app) {
  return app.initFirestore();
}

// 数据库相关函数
export function doc(db, collection, id) {
  return {
    path: `${collection}/${id}`
  };
}

export function collection(db, collectionName) {
  return {
    path: collectionName
  };
}

export function setDoc(docRef, data) {
  return new FirebaseFirestore().setDoc(docRef, data);
}

export function getDoc(docRef) {
  return new FirebaseFirestore().getDoc(docRef);
}

export function updateDoc(docRef, data) {
  return new FirebaseFirestore().updateDoc(docRef, data);
}

export function getDocs(query) {
  return new FirebaseFirestore().getDocs(query);
}

// 认证相关函数
export function signInWithEmailAndPassword(auth, email, password) {
  return auth.signInWithEmailAndPassword(email, password);
}

export function createUserWithEmailAndPassword(auth, email, password) {
  return auth.createUserWithEmailAndPassword(email, password);
}

export function signOut(auth) {
  return auth.signOut();
}

export function onAuthStateChanged(auth, callback) {
  return auth.onAuthStateChanged(callback);
}
