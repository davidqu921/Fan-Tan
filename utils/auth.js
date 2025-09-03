// utils/auth.js
// 用户认证服务

import { 
  signInWithEmailAndPassword, 
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged,
  doc, 
  setDoc, 
  getDoc, 
  updateDoc,
  collection,
  getDocs,
  addDoc,
  auth, 
  db, 
  USER_ROLES, 
  USER_STATUS
} from '../firebase-config.js';

class AuthService {
  constructor() {
    this.currentUser = null;
    this.userRole = null;
  }

  // 用户注册
  async register(email, password, userData) {
    try {
      // 创建Firebase用户
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 创建用户文档
      const userDoc = {
        uid: user.uid,
        email: email,
        displayName: userData.displayName || '',
        role: userData.role || USER_ROLES.USER,
        status: USER_STATUS.ACTIVE,
        avatar: userData.avatar || '',
        phone: userData.phone || '',
        wechat: userData.wechat || '',
        createdAt: new Date(),
        updatedAt: new Date()
      };

      await setDoc(doc(db, 'users', user.uid), userDoc);

      return {
        success: true,
        user: userDoc
      };
    } catch (error) {
      console.error('注册失败:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // 用户登录
  async login(email, password) {
    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      // 获取用户详细信息
      const userDoc = await getDoc(doc(db, 'users', user.uid));
      if (userDoc.exists()) {
        const userData = userDoc.data();
        this.currentUser = userData;
        this.userRole = userData.role;
        
        return {
          success: true,
          user: userData
        };
      } else {
        throw new Error('用户信息不存在');
      }
    } catch (error) {
      console.error('登录失败:', error);
      return {
        success: false,
        error: this.getErrorMessage(error.code)
      };
    }
  }

  // 用户登出
  async logout() {
    try {
      await signOut(auth);
      this.currentUser = null;
      this.userRole = null;
      return { success: true };
    } catch (error) {
      console.error('登出失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 获取当前用户信息
  async getCurrentUser() {
    if (auth.currentUser) {
      const userDoc = await getDoc(doc(db, 'users', auth.currentUser.uid));
      if (userDoc.exists()) {
        this.currentUser = userDoc.data();
        this.userRole = this.currentUser.role;
        return this.currentUser;
      }
    }
    return null;
  }

  // 更新用户信息
  async updateUser(uid, updateData) {
    try {
      await updateDoc(doc(db, 'users', uid), {
        ...updateData,
        updatedAt: new Date()
      });
      return { success: true };
    } catch (error) {
      console.error('更新用户信息失败:', error);
      return { success: false, error: error.message };
    }
  }

  // 检查用户是否为管理员
  isAdmin() {
    return this.userRole === USER_ROLES.ADMIN;
  }

  // 检查用户是否为普通用户
  isUser() {
    return this.userRole === USER_ROLES.USER;
  }

  // 获取所有用户（仅管理员）
  async getAllUsers() {
    if (!this.isAdmin()) {
      throw new Error('权限不足');
    }

    try {
      const usersRef = collection(db, 'users');
      const snapshot = await getDocs(usersRef);
      const users = [];
      snapshot.forEach(doc => {
        users.push({ id: doc.id, ...doc.data() });
      });
      return users;
    } catch (error) {
      console.error('获取用户列表失败:', error);
      throw error;
    }
  }

  // 错误信息处理
  getErrorMessage(errorCode) {
    const errorMessages = {
      'auth/user-not-found': '用户不存在',
      'auth/wrong-password': '密码错误',
      'auth/email-already-in-use': '邮箱已被使用',
      'auth/weak-password': '密码强度不够',
      'auth/invalid-email': '邮箱格式不正确',
      'auth/too-many-requests': '请求过于频繁，请稍后再试',
      'auth/network-request-failed': '网络连接失败'
    };
    return errorMessages[errorCode] || '操作失败，请重试';
  }

  // 监听认证状态变化
  onAuthStateChanged(callback) {
    return onAuthStateChanged(auth, async (user) => {
      if (user) {
        const userData = await this.getCurrentUser();
        callback(userData);
      } else {
        callback(null);
      }
    });
  }
}

// 创建单例实例
const authService = new AuthService();
export default authService;
