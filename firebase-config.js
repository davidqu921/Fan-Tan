// firebase-config.js
// Firebase 配置文件

// 更新为小程序兼容的导入方式
import { initializeApp } from './lib/firebase-app.js';
import { getAuth } from './lib/firebase-auth.js';
import { getFirestore } from './lib/firebase-firestore.js';

// 注意：这些配置信息需要从您的Firebase控制台获取
const firebaseConfig = {
    apiKey: "AIzaSyAb7gFyiuYnEbEMglSgsYAVLmuQXalF9bw",
    authDomain: "fan-tan-10fb4.firebaseapp.com",
    projectId: "fan-tan-10fb4",
    storageBucket: "fan-tan-10fb4.firebasestorage.app",
    messagingSenderId: "648441485",
    appId: "1:648441485:web:1a08063b0d45dd967afcc4",
    measurementId: "G-2YJFK4J8LP"
  };

// 初始化Firebase（小程序兼容版本）
import { 
  initializeApp, 
  getAuth, 
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
} from './lib/firebase-setup.js';

const app = initializeApp(firebaseConfig);
export const auth = getAuth(app);
export const db = getFirestore(app);

// 导出所有需要的函数
export {
  doc,
  setDoc,
  getDoc,
  updateDoc,
  collection,
  getDocs,
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword,
  signOut,
  onAuthStateChanged
};

// 用户角色枚举
export const USER_ROLES = {
  USER: 'user',
  ADMIN: 'admin'
};

// 用户状态枚举
export const USER_STATUS = {
  ACTIVE: 'active',
  INACTIVE: 'inactive',
  PENDING: 'pending'
};
