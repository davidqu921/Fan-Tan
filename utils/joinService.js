// utils/joinService.js
// 报名管理服务

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

class JoinService {
  constructor() {
    this.collectionName = 'joins';
  }

  // 报名活动
  async joinActivity(joinData) {
    try {
      const joinsRef = collection(db, this.collectionName);
      const newJoin = {
        ...joinData,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      
      const docRef = await addDoc(joinsRef, newJoin);
      
      // 更新活动的报名人数
      await this.updateActivityJoinCount(joinData.activityId);
      
      return {
        success: true,
        data: {
          id: docRef.id,
          ...newJoin
        }
      };
    } catch (error) {
      console.error('报名失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 取消报名
  async cancelJoin(joinId) {
    try {
      console.log('开始取消报名 - joinId:', joinId)
      
      const joinRef = doc(db, this.collectionName, joinId);
      console.log('joinRef:', joinRef)
      
      const joinDoc = await getDoc(joinRef);
      console.log('joinDoc:', joinDoc)
      console.log('joinDoc.exists():', joinDoc.exists())
      
      if (joinDoc.exists()) {
        const joinData = joinDoc.data();
        console.log('报名数据:', joinData)
        
        // 检查是否超过最晚取消时间
        const cancelCheckResult = await this.checkCancelDeadline(joinData.activityId);
        console.log('取消时间检查结果:', cancelCheckResult)
        
        if (!cancelCheckResult.success) {
          return {
            success: false,
            error: cancelCheckResult.error
          };
        }
        
        console.log('开始删除报名记录...')
        await deleteDoc(joinRef);
        console.log('报名记录删除成功')
        
        // 更新活动的报名人数
        console.log('开始更新活动报名人数...')
        await this.updateActivityJoinCount(joinData.activityId);
        console.log('活动报名人数更新成功')
        
        return {
          success: true
        };
      } else {
        console.log('报名记录不存在')
        return {
          success: false,
          error: '报名记录不存在'
        };
      }
    } catch (error) {
      console.error('取消报名失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 获取活动的报名列表
  async getActivityJoins(activityId) {
    try {
      const joinsRef = collection(db, this.collectionName);
      const q = query(
        joinsRef,
        where('activityId', '==', activityId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const joins = [];
      
      snapshot.forEach(doc => {
        joins.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: joins
      };
    } catch (error) {
      console.error('获取报名列表失败:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }

  // 检查用户是否已报名
  async checkUserJoinStatus(activityId, userId) {
    try {
      console.log('检查用户报名状态 - 参数:', { activityId, userId })
      
      const joinsRef = collection(db, this.collectionName);
      const q = query(
        joinsRef,
        where('activityId', '==', activityId),
        where('userId', '==', userId)
      );
      
      const snapshot = await getDocs(q);
      console.log('查询结果:', { size: snapshot.size, empty: snapshot.empty })
      
      if (snapshot.empty) {
        console.log('用户未报名')
        return {
          success: true,
          hasJoined: false,
          joinData: null
        };
      } else {
        const joinDoc = snapshot.docs[0];
        const joinData = {
          id: joinDoc.id,
          ...joinDoc.data()
        };
        console.log('用户已报名:', joinData)
        return {
          success: true,
          hasJoined: true,
          joinData: joinData
        };
      }
    } catch (error) {
      console.error('检查报名状态失败:', error);
      return {
        success: false,
        error: error.message,
        hasJoined: false,
        joinData: null
      };
    }
  }

  // 更新活动的报名人数
  async updateActivityJoinCount(activityId) {
    try {
      const joinsResult = await this.getActivityJoins(activityId);
      if (joinsResult.success) {
        const joinCount = joinsResult.data.length;
        
        // 直接操作数据库更新活动报名人数
        const activityRef = doc(db, 'activities', activityId);
        
        await updateDoc(activityRef, {
          joinedCount: joinCount,
          updatedAt: new Date()
        });
        
        return {
          success: true,
          joinCount: joinCount
        };
      } else {
        return {
          success: false,
          error: joinsResult.error
        };
      }
    } catch (error) {
      console.error('更新活动报名人数失败:', error);
      return {
        success: false,
        error: error.message
      };
    }
  }

  // 检查取消截止时间
  async checkCancelDeadline(activityId) {
    try {
      // 获取活动信息
      const activityRef = doc(db, 'activities', activityId);
      const activityDoc = await getDoc(activityRef);
      
      if (!activityDoc.exists()) {
        return {
          success: false,
          error: '活动不存在'
        };
      }
      
      const activityData = activityDoc.data();
      
      // 如果没有设置取消截止时间，允许取消
      if (!activityData.cancelDeadline) {
        return {
          success: true
        };
      }
      
      // 检查当前时间是否超过取消截止时间
      const now = new Date();
      const deadline = new Date(activityData.cancelDeadline);
      
      if (now > deadline) {
        return {
          success: false,
          error: '已错过最晚取消时间，请按时参加活动或找人替代，球费无法退会，多谢合作'
        };
      }
      
      return {
        success: true
      };
    } catch (error) {
      console.error('检查取消截止时间失败:', error);
      return {
        success: false,
        error: '检查取消时间失败'
      };
    }
  }

  // 获取用户的所有报名记录
  async getUserJoins(userId) {
    try {
      const joinsRef = collection(db, this.collectionName);
      const q = query(
        joinsRef,
        where('userId', '==', userId),
        orderBy('createdAt', 'desc')
      );
      
      const snapshot = await getDocs(q);
      const joins = [];
      
      snapshot.forEach(doc => {
        joins.push({
          id: doc.id,
          ...doc.data()
        });
      });
      
      return {
        success: true,
        data: joins
      };
    } catch (error) {
      console.error('获取用户报名记录失败:', error);
      return {
        success: false,
        error: error.message,
        data: []
      };
    }
  }
}

// 创建单例实例
const joinService = new JoinService();
export default joinService;
