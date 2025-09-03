// pages/index/index.js
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
  loadActivities() {
    this.setData({ loading: true })
    
    // 模拟API调用
    setTimeout(() => {
      const mockActivities = this.getMockActivities()
      this.setData({
        activities: mockActivities,
        loading: false
      })
      wx.stopPullDownRefresh()
    }, 1000)
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
  loadMoreActivities() {
    if (!this.data.hasMore) return
    
    this.setData({ loading: true })
    
    setTimeout(() => {
      const moreActivities = this.getMockActivities(this.data.page + 1)
      this.setData({
        activities: [...this.data.activities, ...moreActivities],
        page: this.data.page + 1,
        hasMore: moreActivities.length > 0,
        loading: false
      })
    }, 1000)
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
  searchActivities(keyword) {
    if (!keyword.trim()) {
      this.refreshActivities()
      return
    }

    this.setData({ loading: true })
    
    setTimeout(() => {
      const allActivities = this.getMockActivities()
      const filteredActivities = allActivities.filter(activity => 
        activity.title.includes(keyword) || 
        activity.location.includes(keyword)
      )
      
      this.setData({
        activities: filteredActivities,
        loading: false
      })
    }, 500)
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

  // 获取模拟数据
  getMockActivities(page = 1) {
    const mockData = [
      {
        id: '1',
        title: '周末羽毛球友谊赛',
        date: '2024-01-15',
        time: '14:00-16:00',
        location: '体育馆A馆',
        rules: '双打比赛，请自备球拍',
        maxCount: 16,
        joinedCount: 12,
        status: 'active',
        recentJoiners: [
          { id: '1', name: '张三', avatar: '/images/lcw.jpg' },
          { id: '2', name: '李四', avatar: '/images/ld.jpg' },
          { id: '3', name: '王五', avatar: '/images/syq.jpg' }
        ]
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
        status: 'full',
        recentJoiners: [
          { id: '4', name: '赵六', avatar: '/images/lcw.jpg' },
          { id: '5', name: '钱七', avatar: '/images/ld.jpg' }
        ]
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
        status: 'ended',
        recentJoiners: [
          { id: '6', name: '孙八', avatar: '/images/syq.jpg' }
        ]
      }
    ]

    // 模拟分页
    if (page > 1) {
      return [] // 模拟没有更多数据
    }
    
    return mockData
  }
})
