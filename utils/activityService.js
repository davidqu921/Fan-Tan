// utils/activityService.js
// 活动管理服务

import { 
  collection,
  doc,
  getDocs,
  getDoc,
  addDoc,
  updateDoc,
  deleteDoc,
  query,
  orderBy,
  where,
  limit,
  startAfter,
  db
} from '../firebase-config.js';

class ActivityService {
  constructor() {
    this.collectionName = 'activities';
  }

  // 获取活动列表
  async getActivities(page = 1, pageSize = 10) {
    try {
      const activitiesRef = collection(db, this.collectionName);
      const q = query(
        activitiesRef,
        orderBy('createdAt', 'desc'),
        limit(pageSize)
      );
      
      const snapshot = await getDocs(q);
      const activities = [];
      
      // 为每个活动获取最新的报名人数
      for (const doc of snapshot.docs) {
        const activityData = doc.data();
        const activityId = doc.id;
        
        // 获取该活动的报名人数
        const joinsResult = await this.getActivityJoinCount(activityId);
        const joinCount = joinsResult.success ? joinsResult.count : 0;
        
        activities.push({
          id: activityId,
          ...activityData,
          joinedCount: joinCount
        });
      }
      
      return {
        success: true,
        data: activities,
        hasMore: activities.length === pageSize
      };
    } catch (error) {
      console.error('获取活动列表失败:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // 获取活动详情
  async getActivityById(activityId) {
    try {
      const activityRef = doc(db, this.collectionName, activityId);
      const activityDoc = await getDoc(activityRef);
      
      if (activityDoc.exists()) {
        // 获取最新的报名人数
        const joinsResult = await this.getActivityJoinCount(activityId);
        const joinCount = joinsResult.success ? joinsResult.count : 0;
        
        return {
          success: true,
          data: {
            id: activityDoc.id,
            ...activityDoc.data(),
            joinedCount: joinCount
          }
        };
      } else {
        return {
          success: false,
          error: '活动不存在'
        };
      }
    } catch (error) {
      console.error('获取活动详情失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 创建活动
  async createActivity(activityData) {
    try {
      const activitiesRef = collection(db, this.collectionName);
      const newActivity = {
        ...activityData,
        joinedCount: 0,
        status: 'active',
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(activitiesRef, newActivity);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...newActivity
        }
      };
    } catch (error) {
      console.error('创建活动失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 更新活动
  async updateActivity(activityId, updateData) {
    try {
      const activityRef = doc(db, this.collectionName, activityId);
      await updateDoc(activityRef, {
        ...updateData,
        updatedAt: new Date()
      });
      
      return {
        success: true
      };
    } catch (error) {
      console.error('更新活动失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 删除活动
  async deleteActivity(activityId) {
    try {
      const activityRef = doc(db, this.collectionName, activityId);
      await deleteDoc(activityRef);
      
      return {
        success: true
      };
    } catch (error) {
      console.error('删除活动失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 搜索活动
  async searchActivities(keyword) {
    try {
      const activitiesRef = collection(db, this.collectionName);
      const q = query(
        activitiesRef,
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const activities = [];
      
      snapshot.forEach(doc => {
        const data = doc.data();
        if (data.title.includes(keyword) || 
            data.location.includes(keyword) ||
            data.rules.includes(keyword)) {
          activities.push({
            id: doc.id,
            ...data
          });
        }
      });
      
      return {
        success: true,
        data: activities
      };
    } catch (error) {
      console.error('搜索活动失败:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // 获取活动的报名人数
  async getActivityJoinCount(activityId) {
    try {
      const joinsRef = collection(db, 'joins');
      const q = query(
        joinsRef,
        where('activityId', '==', activityId)
      );
      
      const snapshot = await getDocs(q);
      const count = snapshot.size;
      
      return {
        success: true,
        count: count
      };
    } catch (error) {
      console.error('获取活动报名人数失败:', error);
      return {
        success: false,
        error: error.message,
        count: 0
      };
    }
  }

  // 清理所有活动数据
  async clearAllActivities() {
    try {
      // 清除本地存储中的活动数据
      wx.removeStorageSync(`firestore_${this.collectionName}`);
      
      return {
        success: true,
        message: '所有活动数据已清理完成'
      };
    } catch (error) {
      console.error('清理活动数据失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }
}

// 创建单例实例
const activityService = new ActivityService();
export default activityService;
