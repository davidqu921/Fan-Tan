// pages/admin/manage.js
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
  loadActivities() {
    // 模拟API调用
    setTimeout(() => {
      const mockActivities = this.getMockActivities()
      this.setData({
        activities: mockActivities,
        filteredActivities: mockActivities
      })
    }, 800)
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
    wx.showModal({
      title: '发布活动',
      content: '是否创建新活动？',
      success: (res) => {
        if (res.confirm) {
          this.createNewActivity()
        }
      }
    })
  },

  // 创建新活动
  createNewActivity() {
    const newActivity = {
      id: Date.now().toString(),
      title: '新活动',
      date: '2024-01-20',
      time: '14:00-16:00',
      location: '体育馆',
      rules: '请遵守活动规则',
      maxCount: 20,
      joinedCount: 0,
      status: 'active'
    }
    
    const updatedActivities = [newActivity, ...this.data.activities]
    this.setData({
      activities: updatedActivities
    })
    
    this.filterActivities(this.data.currentFilter)
    
    wx.showToast({
      title: '活动创建成功',
      icon: 'success'
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
  deleteActivity(activityId) {
    const updatedActivities = this.data.activities.filter(a => a.id !== activityId)
    this.setData({
      activities: updatedActivities
    })
    
    this.filterActivities(this.data.currentFilter)
    
    wx.showToast({
      title: '删除成功',
      icon: 'success'
    })
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

  // 获取模拟活动数据
  getMockActivities() {
    return [
      {
        id: '1',
        title: '周末羽毛球友谊赛',
        date: '2024-01-15',
        time: '14:00-16:00',
        location: '体育馆A馆',
        rules: '双打比赛，请自备球拍',
        maxCount: 16,
        joinedCount: 12,
        status: 'active'
      },
      {
        id: '2',
        title: '羽毛球训练课',
        date: '2024-01-16',
        time: '19:00-21:00',
        location: '体育馆B馆',
        rules: '基础训练，适合初学者',
        maxCount: 20,
        joinedCount: 20,
        status: 'full'
      },
      {
        id: '3',
        title: '羽毛球自由活动',
        date: '2024-01-10',
        time: '18:00-20:00',
        location: '体育馆C馆',
        rules: '自由组队，无限制',
        maxCount: null,
        joinedCount: 8,
        status: 'ended'
      }
    ]
  }
})
