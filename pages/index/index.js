// pages/index/index.js
import activityService from '../../utils/activityService.js'
const app = getApp()

Page({
  data: {
    activities: [],
    loading: false,
    searchKeyword: '',
    isAdmin: false,
    page: 1,
    hasMore: true
  },

  onLoad() {
    this.setData({
      isAdmin: app.globalData.isAdmin
    })
    this.loadActivities()
  },

  onShow() {
    // 每次显示页面时刷新数据
    this.refreshActivities()
  },

  onPullDownRefresh() {
    this.refreshActivities()
  },

  onReachBottom() {
    if (this.data.hasMore && !this.data.loading) {
      this.loadMoreActivities()
    }
  },

  // 加载活动列表
  async loadActivities() {
    this.setData({ loading: true })
    
    try {
      const result = await activityService.getActivities(this.data.page)
      if (result.success) {
        this.setData({
          activities: result.data,
          hasMore: result.hasMore,
          loading: false
        })
      } else {
        this.setData({
          activities: [],
          loading: false
        })
        if (result.error && !result.error.includes('not found')) {
          wx.showToast({
            title: '加载失败',
            icon: 'error'
          })
        }
      }
    } catch (error) {
      console.error('加载活动失败:', error)
      this.setData({
        activities: [],
        loading: false
      })
    }
    
    wx.stopPullDownRefresh()
  },

  // 刷新活动列表
  refreshActivities() {
    this.setData({
      page: 1,
      hasMore: true,
      activities: []
    })
    this.loadActivities()
  },

  // 加载更多活动
  async loadMoreActivities() {
    if (!this.data.hasMore) return
    
    this.setData({ loading: true })
    
    try {
      const result = await activityService.getActivities(this.data.page + 1)
      if (result.success) {
        this.setData({
          activities: [...this.data.activities, ...result.data],
          page: this.data.page + 1,
          hasMore: result.hasMore,
          loading: false
        })
      } else {
        this.setData({
          hasMore: false,
          loading: false
        })
      }
    } catch (error) {
      console.error('加载更多活动失败:', error)
      this.setData({
        hasMore: false,
        loading: false
      })
    }
  },

  // 搜索输入
  onSearchInput(e) {
    const keyword = e.detail.value
    this.setData({ searchKeyword: keyword })
    
    // 防抖搜索
    clearTimeout(this.searchTimer)
    this.searchTimer = setTimeout(() => {
      this.searchActivities(keyword)
    }, 500)
  },

  // 搜索活动
  async searchActivities(keyword) {
    if (!keyword.trim()) {
      this.refreshActivities()
      return
    }

    this.setData({ loading: true })
    
    try {
      const result = await activityService.searchActivities(keyword)
      if (result.success) {
        this.setData({
          activities: result.data,
          loading: false
        })
      } else {
        this.setData({
          activities: [],
          loading: false
        })
      }
    } catch (error) {
      console.error('搜索活动失败:', error)
      this.setData({
        activities: [],
        loading: false
      })
    }
  },

  // 点击活动卡片
  onActivityTap(e) {
    const activityId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activity/detail?id=${activityId}`
    })
  },

  // 创建活动（管理员）
  onCreateActivity() {
    wx.navigateTo({
      url: '/pages/admin/manage'
    })
  },

  // 清理所有活动数据（管理员功能）
  async clearAllActivities() {
    try {
      const result = await activityService.clearAllActivities()
      if (result.success) {
        wx.showToast({
          title: '数据清理完成',
          icon: 'success'
        })
        this.refreshActivities()
      } else {
        wx.showToast({
          title: '清理失败',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('清理活动数据时出错:', error)
      wx.showToast({
        title: '清理失败',
        icon: 'error'
      })
    }
  }
})
