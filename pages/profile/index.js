// pages/profile/index.js
import authService from '../../utils/auth.js'
import activityService from '../../utils/activityService.js'
const app = getApp()

Page({
  data: {
    userInfo: null,
    isAdmin: false,
    userStats: {
      joinedCount: 0,
      createdCount: 0,
      commentCount: 0
    }
  },

  onLoad() {
    this.loadUserInfo()
    this.loadUserStats()
  },

  onShow() {
    // 每次显示时刷新用户信息
    this.loadUserInfo()
    this.loadUserStats()
  },

  // 加载用户信息
  async loadUserInfo() {
    try {
      // 首先尝试从 Firebase 获取当前用户
      const currentUser = await authService.getCurrentUser()
      
      if (currentUser) {
        // 如果 Firebase 中有用户信息，使用 Firebase 的数据
        const userInfo = {
          id: currentUser.uid,
          nickName: currentUser.displayName || currentUser.email || '用户',
          avatarUrl: currentUser.avatar || '/images/default-avatar.png',
          email: currentUser.email,
          role: currentUser.role
        }
        
        const isAdmin = currentUser.role === 'admin'
        
        // 更新全局数据
        app.globalData.userInfo = userInfo
        app.globalData.isAdmin = isAdmin
        
        this.setData({
          userInfo: userInfo,
          isAdmin: isAdmin
        })
      } else {
        // 如果 Firebase 中没有用户信息，使用全局数据
        const userInfo = app.globalData.userInfo
        const isAdmin = app.globalData.isAdmin
        
        this.setData({
          userInfo: userInfo,
          isAdmin: isAdmin
        })
      }
    } catch (error) {
      console.error('加载用户信息失败:', error)
      // 降级到全局数据
      const userInfo = app.globalData.userInfo
      const isAdmin = app.globalData.isAdmin
      
      this.setData({
        userInfo: userInfo,
        isAdmin: isAdmin
      })
    }
  },

  // 加载用户统计
  loadUserStats() {
    if (!this.data.userInfo) return
    
    // 模拟API调用
    setTimeout(() => {
      const mockStats = {
        joinedCount: 5,
        createdCount: this.data.isAdmin ? 3 : 0,
        commentCount: 12
      }
      
      this.setData({
        userStats: mockStats
      })
    }, 500)
  },

  // 登录
  onLogin() {
    wx.navigateTo({
      url: '/pages/auth/login'
    })
  },

  // 退出登录
  onLogout() {
    wx.showModal({
      title: '确认退出',
      content: '确定要退出登录吗？',
      success: async (res) => {
        if (res.confirm) {
          try {
            // 调用Firebase登出
            await authService.logout()
            
            // 清除本地数据
            app.globalData.userInfo = null
            app.globalData.isAdmin = false
            
            this.setData({
              userInfo: null,
              isAdmin: false,
              userStats: {
                joinedCount: 0,
                createdCount: 0,
                commentCount: 0
              }
            })
            
            wx.showToast({
              title: '已退出登录',
              icon: 'success'
            })
          } catch (error) {
            console.error('退出登录失败:', error)
            wx.showToast({
              title: '退出失败',
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 我参与的活动
  onMyActivities() {
    if (!this.data.userInfo) {
      this.onLogin()
      return
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 我发布的活动
  onMyCreated() {
    if (!this.data.userInfo) {
      this.onLogin()
      return
    }
    
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 活动管理
  onManageActivities() {
    if (!this.data.isAdmin) {
      wx.showToast({
        title: '需要管理员权限',
        icon: 'error'
      })
      return
    }
    
    wx.navigateTo({
      url: '/pages/admin/manage'
    })
  },

  // 数据导出
  onExportData() {
    if (!this.data.isAdmin) {
      wx.showToast({
        title: '需要管理员权限',
        icon: 'error'
      })
      return
    }
    
    wx.showModal({
      title: '数据导出',
      content: '是否导出所有活动报名数据？',
      success: (res) => {
        if (res.confirm) {
          wx.showLoading({ title: '导出中...' })
          
          setTimeout(() => {
            wx.hideLoading()
            wx.showToast({
              title: '导出成功',
              icon: 'success'
            })
          }, 2000)
        }
      }
    })
  },

  // 设置
  onSettings() {
    wx.showToast({
      title: '功能开发中',
      icon: 'none'
    })
  },

  // 测试 Firebase
  async onTestFirebase() {
    try {
      wx.showLoading({ title: '测试中...' })
      
      // 先尝试登录（如果用户已存在）
      let loginResult = await authService.login('test@example.com', 'password123')
      
      if (!loginResult.success) {
        // 如果登录失败，尝试注册
        const registerResult = await authService.register('test@example.com', 'password123', {
          displayName: '测试用户',
          role: 'user'
        })
        
        if (registerResult.success) {
          // 注册成功后再次尝试登录
          loginResult = await authService.login('test@example.com', 'password123')
        } else {
          wx.hideLoading()
          wx.showModal({
            title: 'Firebase 测试失败',
            content: `注册失败: ${registerResult.error}`,
            showCancel: false
          })
          return
        }
      }
      
      if (loginResult.success) {
        // 测试获取当前用户
        const currentUser = await authService.getCurrentUser()
        
        wx.hideLoading()
        wx.showModal({
          title: 'Firebase 测试成功',
          content: `✅ 登录功能正常\n✅ 获取用户信息正常\n✅ 用户认证流程完整\n\n用户ID: ${currentUser.uid}\n用户名: ${currentUser.displayName}\n角色: ${currentUser.role}`,
          showCancel: false
        })
      } else {
        wx.hideLoading()
        wx.showModal({
          title: 'Firebase 测试失败',
          content: `登录失败: ${loginResult.error}`,
          showCancel: false
        })
      }
    } catch (error) {
      wx.hideLoading()
      wx.showModal({
        title: 'Firebase 测试错误',
        content: `错误: ${error.message}\n\n请检查控制台获取更多信息`,
        showCancel: false
      })
      console.error('Firebase 测试错误:', error)
    }
  },

  // 清理测试数据
  onClearTestData() {
    wx.showModal({
      title: '清理测试数据',
      content: '确定要清理所有测试数据吗？这将删除所有本地存储的用户数据。',
      success: (res) => {
        if (res.confirm) {
          try {
            // 清理本地存储的测试数据
            wx.removeStorageSync('firebase_users')
            wx.removeStorageSync('firebase_current_user')
            wx.removeStorageSync('firestore_users')
            wx.removeStorageSync('firestore_activities')
            wx.removeStorageSync('firestore_comments')
            
            wx.showToast({
              title: '测试数据已清理',
              icon: 'success'
            })
          } catch (error) {
            wx.showToast({
              title: '清理失败',
              icon: 'error'
            })
            console.error('清理测试数据失败:', error)
          }
        }
      }
    })
  },



  // 关于我们
  onAbout() {
    wx.showModal({
      title: '关于我们',
      content: '🏸 羽毛球接龙小程序 v1.0\n\n一个简洁易用的羽毛球活动报名工具，让羽毛球爱好者轻松组织和管理活动。\n\n👨‍💻 开发者信息\nDavid Qu\nUniversity of Toronto\nCS Department - Software Engineering Stream\n\n📧 联系方式\nq2977991823@gmail.com\n\n感谢您的使用与支持！',
      showCancel: false,
      confirmText: '知道了'
    })
  }
})
