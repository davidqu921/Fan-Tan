// pages/profile/index.js
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
  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    const isAdmin = app.globalData.isAdmin
    
    this.setData({
      userInfo: userInfo,
      isAdmin: isAdmin
    })
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
            const authService = require('../../utils/auth.js').default
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
