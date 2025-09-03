// lib/firebase-real.js
// 真正的 Firebase 集成（需要下载 Firebase SDK）

// 注意：这个文件需要您下载真正的 Firebase SDK 文件
// 由于微信小程序的限制，我们需要使用兼容版本

// 模拟 Firebase 功能，实际使用时需要替换为真正的 SDK
class FirebaseReal {
  constructor() {
    this.auth = new FirebaseAuthReal();
    this.firestore = new FirestoreReal();
  }

  // 初始化应用
  static initializeApp(config) {
    return new FirebaseReal();
  }

  // 获取认证实例
  getAuth() {
    return this.auth;
  }

  // 获取 Firestore 实例
  getFirestore() {
    return this.firestore;
  }
}

// 认证类
class FirebaseAuthReal {
  constructor() {
    this.currentUser = null;
  }

  // 邮箱密码登录
  async signInWithEmailAndPassword(email, password) {
    try {
      // 这里应该调用真正的 Firebase Auth API
      // 暂时使用模拟数据
      console.log('尝试登录:', email);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 检查本地存储的用户数据
      const users = wx.getStorageSync('firebase_users') || [];
      const user = users.find(u => u.email === email && u.password === password);
      
      if (user) {
        this.currentUser = {
          uid: user.uid,
          email: user.email,
          displayName: user.displayName,
          role: user.role || 'user'
        };
        
        // 保存登录状态
        wx.setStorageSync('firebase_current_user', this.currentUser);
        
        // 同步到全局用户信息
        const app = getApp();
        if (app && app.globalData) {
          app.globalData.userInfo = {
            id: this.currentUser.uid,
            nickName: this.currentUser.displayName || this.currentUser.email,
            email: this.currentUser.email,
            avatarUrl: this.currentUser.photoURL || '',
            role: this.currentUser.role
          };
          app.globalData.isAdmin = this.currentUser.role === 'admin';
        }
        
        return { user: this.currentUser };
      } else {
        throw new Error('auth/user-not-found');
      }
    } catch (error) {
      console.error('登录失败:', error);
      throw error;
    }
  }

  // 创建用户
  async createUserWithEmailAndPassword(email, password) {
    try {
      console.log('尝试注册:', email);
      
      // 模拟网络延迟
      await new Promise(resolve => setTimeout(resolve, 1000));
      
      // 检查用户是否已存在
      const users = wx.getStorageSync('firebase_users') || [];
      const existingUser = users.find(u => u.email === email);
      
      if (existingUser) {
        throw new Error('auth/email-already-in-use');
      }
      
      // 创建新用户
      const newUser = {
        uid: 'user_' + Date.now(),
        email: email,
        password: password, // 实际应用中不应该存储明文密码
        createdAt: new Date().toISOString()
      };
      
      users.push(newUser);
      wx.setStorageSync('firebase_users', users);
      
      this.currentUser = {
        uid: newUser.uid,
        email: newUser.email,
        displayName: newUser.email,
        role: 'user'
      };
      
      // 保存登录状态
      wx.setStorageSync('firebase_current_user', this.currentUser);
      
      // 同步到全局用户信息
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.userInfo = {
          id: this.currentUser.uid,
          nickName: this.currentUser.displayName || this.currentUser.email,
          email: this.currentUser.email,
          avatarUrl: this.currentUser.photoURL || '',
          role: this.currentUser.role
        };
        app.globalData.isAdmin = this.currentUser.role === 'admin';
      }
      
      return { user: this.currentUser };
    } catch (error) {
      console.error('注册失败:', error);
      throw error;
    }
  }

  // 登出
  async signOut() {
    this.currentUser = null;
    wx.removeStorageSync('firebase_current_user');
    
    // 清理全局用户信息
    const app = getApp();
    if (app && app.globalData) {
      app.globalData.userInfo = null;
      app.globalData.isAdmin = false;
    }
    
    return Promise.resolve();
  }

  // 监听认证状态变化
  onAuthStateChanged(callback) {
    // 检查本地存储的登录状态
    const savedUser = wx.getStorageSync('firebase_current_user');
    if (savedUser) {
      this.currentUser = savedUser;
    }
    
    // 同步到全局用户信息
    if (this.currentUser) {
      const app = getApp();
      if (app && app.globalData) {
        app.globalData.userInfo = {
          id: this.currentUser.uid,
          nickName: this.currentUser.displayName || this.currentUser.email,
          email: this.currentUser.email,
          avatarUrl: this.currentUser.photoURL || '',
          role: this.currentUser.role || 'user'
        };
        app.globalData.isAdmin = this.currentUser.role === 'admin';
      }
    }
    
    // 立即调用回调
    setTimeout(() => {
      callback(this.currentUser);
    }, 100);
    
    // 返回取消监听的函数
    return () => {};
  }

  // 获取当前用户
  getCurrentUser() {
    return this.currentUser;
  }
}

// Firestore 类
class FirestoreReal {
  constructor() {
    this.collections = {};
  }

  // 获取集合引用
  collection(collectionName) {
    return new CollectionReference(collectionName);
  }

  // 获取文档引用
  doc(collectionName, docId) {
    return new DocumentReference(collectionName, docId);
  }
}

// 集合引用类
class CollectionReference {
  constructor(collectionName) {
    this.collectionName = collectionName;
  }

  // 获取文档
  doc(docId) {
    return new DocumentReference(this.collectionName, docId);
  }

  // 获取所有文档
  async get() {
    const data = wx.getStorageSync(`firestore_${this.collectionName}`) || [];
    const docs = data.map((item, index) => ({
      id: item.id || index.toString(),
      data: () => item,
      exists: () => true
    }));

    return {
      docs: docs,
      forEach: (callback) => {
        docs.forEach(callback);
      },
      size: docs.length,
      empty: docs.length === 0
    };
  }

  // 添加文档
  async add(data) {
    const collectionData = wx.getStorageSync(`firestore_${this.collectionName}`) || [];
    const newDoc = {
      id: 'doc_' + Date.now(),
      ...data,
      createdAt: new Date().toISOString()
    };
    
    collectionData.push(newDoc);
    wx.setStorageSync(`firestore_${this.collectionName}`, collectionData);
    
    return {
      id: newDoc.id
    };
  }

  // 查询方法
  query(...queryConstraints) {
    return new QueryReference(this.collectionName, queryConstraints);
  }
}

// 查询引用类
class QueryReference {
  constructor(collectionName, queryConstraints) {
    this.collectionName = collectionName;
    this.queryConstraints = queryConstraints;
  }

  // 执行查询
  async get() {
    let data = wx.getStorageSync(`firestore_${this.collectionName}`) || [];
    
    // 应用查询约束
    for (const constraint of this.queryConstraints) {
      if (constraint.type === 'orderBy') {
        data = this.applyOrderBy(data, constraint);
      } else if (constraint.type === 'where') {
        data = this.applyWhere(data, constraint);
      } else if (constraint.type === 'limit') {
        data = this.applyLimit(data, constraint);
      }
    }
    
    const docs = data.map((item, index) => ({
      id: item.id || index.toString(),
      data: () => item,
      exists: () => true
    }));

    return {
      docs: docs,
      forEach: (callback) => {
        docs.forEach(callback);
      },
      size: docs.length,
      empty: docs.length === 0
    };
  }

  // 应用排序
  applyOrderBy(data, constraint) {
    const { field, direction } = constraint;
    return data.sort((a, b) => {
      let aVal = this.getNestedValue(a, field);
      let bVal = this.getNestedValue(b, field);
      
      // 处理日期字符串
      if (field === 'createdAt' && typeof aVal === 'string') {
        aVal = new Date(aVal);
        bVal = new Date(bVal);
      }
      
      if (direction === 'desc') {
        return bVal > aVal ? 1 : bVal < aVal ? -1 : 0;
      } else {
        return aVal > bVal ? 1 : aVal < bVal ? -1 : 0;
      }
    });
  }

  // 应用过滤条件
  applyWhere(data, constraint) {
    const { field, operator, value } = constraint;
    return data.filter(item => {
      const itemValue = this.getNestedValue(item, field);
      
      switch (operator) {
        case '==':
          return itemValue === value;
        case '!=':
          return itemValue !== value;
        case '>':
          return itemValue > value;
        case '>=':
          return itemValue >= value;
        case '<':
          return itemValue < value;
        case '<=':
          return itemValue <= value;
        case 'in':
          return Array.isArray(value) && value.includes(itemValue);
        case 'not-in':
          return Array.isArray(value) && !value.includes(itemValue);
        case 'array-contains':
          return Array.isArray(itemValue) && itemValue.includes(value);
        default:
          return true;
      }
    });
  }

  // 应用限制
  applyLimit(data, constraint) {
    return data.slice(0, constraint.count);
  }

  // 获取嵌套值
  getNestedValue(obj, path) {
    return path.split('.').reduce((current, key) => {
      return current && current[key] !== undefined ? current[key] : undefined;
    }, obj);
  }
}

// 文档引用类
class DocumentReference {
  constructor(collectionName, docId) {
    this.collectionName = collectionName;
    this.docId = docId;
  }

  // 获取文档数据
  async get() {
    const collectionData = wx.getStorageSync(`firestore_${this.collectionName}`) || [];
    const doc = collectionData.find(item => item.id === this.docId);
    
    return {
      exists: () => !!doc,
      data: () => doc,
      id: this.docId
    };
  }

  // 设置文档数据
  async set(data) {
    const collectionData = wx.getStorageSync(`firestore_${this.collectionName}`) || [];
    const existingIndex = collectionData.findIndex(item => item.id === this.docId);
    
    const docData = {
      id: this.docId,
      ...data,
      updatedAt: new Date().toISOString()
    };
    
    if (existingIndex >= 0) {
      collectionData[existingIndex] = docData;
    } else {
      collectionData.push(docData);
    }
    
    wx.setStorageSync(`firestore_${this.collectionName}`, collectionData);
    return Promise.resolve();
  }

  // 更新文档数据
  async update(data) {
    const collectionData = wx.getStorageSync(`firestore_${this.collectionName}`) || [];
    const existingIndex = collectionData.findIndex(item => item.id === this.docId);
    
    if (existingIndex >= 0) {
      collectionData[existingIndex] = {
        ...collectionData[existingIndex],
        ...data,
        updatedAt: new Date().toISOString()
      };
      wx.setStorageSync(`firestore_${this.collectionName}`, collectionData);
    }
    
    return Promise.resolve();
  }

  // 删除文档
  async delete() {
    const collectionData = wx.getStorageSync(`firestore_${this.collectionName}`) || [];
    const filteredData = collectionData.filter(item => item.id !== this.docId);
    wx.setStorageSync(`firestore_${this.collectionName}`, filteredData);
    
    return Promise.resolve();
  }
}

// 导出函数
export function initializeApp(config) {
  return FirebaseReal.initializeApp(config);
}

export function getAuth(app) {
  return app.getAuth();
}

export function getFirestore(app) {
  return app.getFirestore();
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

// Firestore 相关函数
export function collection(db, collectionName) {
  return db.collection(collectionName);
}

export function doc(db, collectionName, docId) {
  return db.doc(collectionName, docId);
}

export function getDoc(docRef) {
  return docRef.get();
}

export function setDoc(docRef, data) {
  return docRef.set(data);
}

export function updateDoc(docRef, data) {
  return docRef.update(data);
}

export function deleteDoc(docRef) {
  return docRef.delete();
}

export function getDocs(collectionRef) {
  return collectionRef.get();
}

export function addDoc(collectionRef, data) {
  return collectionRef.add(data);
}

// 查询相关函数
export function query(collectionRef, ...queryConstraints) {
  return collectionRef.query(...queryConstraints);
}

export function orderBy(field, direction = 'asc') {
  return { type: 'orderBy', field, direction };
}

export function where(field, operator, value) {
  return { type: 'where', field, operator, value };
}

export function limit(count) {
  return { type: 'limit', count };
}

export function startAfter(doc) {
  return { type: 'startAfter', doc };
}
