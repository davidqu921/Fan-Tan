// pages/admin/manage.js
import activityService from '../../utils/activityService.js'
const app = getApp()

Page({
  data: {
    isAdmin: false,
    overviewStats: {
      totalActivities: 0,
      totalJoins: 0,
      activeActivities: 0
    },
    activities: [],
    filteredActivities: [],
    currentFilter: 'all',
    filterTabs: [
      { key: 'all', label: '全部' },
      { key: 'active', label: '进行中' },
      { key: 'ended', label: '已结束' }
    ]
  },

  onLoad() {
    this.checkAdminPermission()
  },

  onShow() {
    if (this.data.isAdmin) {
      this.loadOverviewStats()
      this.loadActivities()
    }
  },

  // 检查管理员权限
  checkAdminPermission() {
    const isAdmin = app.globalData.isAdmin
    this.setData({ isAdmin })
    
    if (!isAdmin) {
      // 模拟检查权限，实际项目中应该调用API
      wx.showModal({
        title: '权限检查',
        content: '是否设置为管理员？',
        success: (res) => {
          if (res.confirm) {
            app.globalData.isAdmin = true
            this.setData({ isAdmin: true })
            this.loadOverviewStats()
            this.loadActivities()
          }
        }
      })
    }
  },

  // 加载概览统计
  loadOverviewStats() {
    // 模拟API调用
    setTimeout(() => {
      const mockStats = {
        totalActivities: 8,
        totalJoins: 45,
        activeActivities: 3
      }
      
      this.setData({
        overviewStats: mockStats
      })
    }, 500)
  },

  // 加载活动列表
  async loadActivities() {
    try {
      const result = await activityService.getActivities()
      if (result.success) {
        this.setData({
          activities: result.data,
          filteredActivities: result.data
        })
      } else {
        this.setData({
          activities: [],
          filteredActivities: []
        })
      }
    } catch (error) {
      console.error('加载活动列表失败:', error)
      this.setData({
        activities: [],
        filteredActivities: []
      })
    }
  },

  // 筛选变化
  onFilterChange(e) {
    const filter = e.currentTarget.dataset.filter
    this.setData({ currentFilter: filter })
    this.filterActivities(filter)
  },

  // 筛选活动
  filterActivities(filter) {
    let filtered = this.data.activities
    
    if (filter !== 'all') {
      filtered = this.data.activities.filter(activity => activity.status === filter)
    }
    
    this.setData({
      filteredActivities: filtered
    })
  },

  // 点击活动项
  onActivityTap(e) {
    const activityId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activity/detail?id=${activityId}`
    })
  },

  // 创建活动
  onCreateActivity() {
    wx.navigateTo({
      url: '/pages/admin/create'
    })
  },

  // 编辑活动
  onEditActivity(e) {
    const activityId = e.currentTarget.dataset.id
    wx.showToast({
      title: '编辑功能开发中',
      icon: 'none'
    })
  },

  // 查看报名
  onViewJoins(e) {
    const activityId = e.currentTarget.dataset.id
    wx.navigateTo({
      url: `/pages/activity/detail?id=${activityId}`
    })
  },

  // 删除活动
  onDeleteActivity(e) {
    const activityId = e.currentTarget.dataset.id
    const activity = this.data.activities.find(a => a.id === activityId)
    
    wx.showModal({
      title: '确认删除',
      content: `确定要删除活动"${activity.title}"吗？此操作不可恢复。`,
      success: (res) => {
        if (res.confirm) {
          this.deleteActivity(activityId)
        }
      }
    })
  },

  // 执行删除活动
  async deleteActivity(activityId) {
    try {
      console.log('开始删除活动:', activityId)
      const result = await activityService.deleteActivity(activityId)
      console.log('删除结果:', result)
      
      if (result.success) {
        // 重新加载活动列表
        await this.loadActivities()
        this.filterActivities(this.data.currentFilter)
        
        wx.showToast({
          title: '删除成功',
          icon: 'success'
        })
      } else {
        console.error('删除失败:', result.error)
        wx.showToast({
          title: result.error || '删除失败',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('删除活动失败:', error)
      wx.showToast({
        title: '删除失败，请重试',
        icon: 'error'
      })
    }
  },

  // 用户管理
  onUserManagement() {
    wx.navigateTo({
      url: '/pages/admin/users'
    })
  },

  // 系统设置
  onSystemSettings() {
    wx.showToast({
      title: '系统设置功能开发中',
      icon: 'none'
    })
  },

  // 数据导出
  onDataExport() {
    wx.showToast({
      title: '数据导出功能开发中',
      icon: 'none'
    })
  },

  // 返回
  onGoBack() {
    wx.navigateBack()
  },


})
