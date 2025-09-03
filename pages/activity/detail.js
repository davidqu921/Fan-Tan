// pages/activity/detail.js
const app = getApp()

Page({
  data: {
    activityId: '',
    activity: {},
    joiners: [],
    comments: [],
    hasJoined: false,
    commentText: '',
    loading: true
  },

  onLoad(options) {
    const activityId = options.id
    if (activityId) {
      this.setData({ activityId })
      this.loadActivityDetail(activityId)
    } else {
      wx.showToast({
        title: '活动不存在',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  onShow() {
    // 每次显示时检查报名状态
    if (this.data.activityId) {
      this.checkJoinStatus()
    }
  },

  onShareAppMessage() {
    return {
      title: `${this.data.activity.title} - 羽毛球活动`,
      path: `/pages/activity/detail?id=${this.data.activityId}`,
      imageUrl: '/images/share-badge.png'
    }
  },

  // 加载活动详情
  loadActivityDetail(activityId) {
    this.setData({ loading: true })
    
    // 模拟API调用
    setTimeout(() => {
      const mockActivity = this.getMockActivityDetail(activityId)
      const mockJoiners = this.getMockJoiners(activityId)
      const mockComments = this.getMockComments(activityId)
      
      this.setData({
        activity: mockActivity,
        joiners: mockJoiners,
        comments: mockComments,
        loading: false
      })
      
      // 检查用户是否已报名
      this.checkJoinStatus()
    }, 1000)
  },

  // 检查报名状态
  checkJoinStatus() {
    const userInfo = app.globalData.userInfo
    if (!userInfo) return
    
    const hasJoined = this.data.joiners.some(joiner => joiner.userId === userInfo.id)
    this.setData({ hasJoined })
  },

  // 评论输入
  onCommentInput(e) {
    this.setData({
      commentText: e.detail.value
    })
  },

  // 提交评论
  onSubmitComment() {
    const content = this.data.commentText.trim()
    if (!content) return
    
    const userInfo = app.globalData.userInfo
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
      return
    }
    
    const newComment = {
      id: Date.now().toString(),
      author: userInfo.nickName || '匿名用户',
      avatar: userInfo.avatarUrl || '',
      content: content,
      time: this.formatTime(new Date())
    }
    
    this.setData({
      comments: [newComment, ...this.data.comments],
      commentText: ''
    })
    
    wx.showToast({
      title: '评论成功',
      icon: 'success'
    })
  },

  // 报名活动
  onJoinActivity() {
    const userInfo = app.globalData.userInfo
    if (!userInfo) {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
      return
    }
    
    wx.navigateTo({
      url: `/pages/activity/join?id=${this.data.activityId}`
    })
  },

  // 取消报名
  onCancelJoin() {
    wx.showModal({
      title: '确认取消',
      content: '确定要取消报名吗？',
      success: (res) => {
        if (res.confirm) {
          this.cancelJoin()
        }
      }
    })
  },

  // 执行取消报名
  cancelJoin() {
    const userInfo = app.globalData.userInfo
    if (!userInfo) return
    
    // 模拟API调用
    wx.showLoading({ title: '处理中...' })
    
    setTimeout(() => {
      const updatedJoiners = this.data.joiners.filter(joiner => joiner.userId !== userInfo.id)
      const updatedActivity = {
        ...this.data.activity,
        joinedCount: updatedJoiners.length
      }
      
      this.setData({
        joiners: updatedJoiners,
        activity: updatedActivity,
        hasJoined: false
      })
      
      wx.hideLoading()
      wx.showToast({
        title: '取消成功',
        icon: 'success'
      })
    }, 1000)
  },

  // 获取模拟活动详情
  getMockActivityDetail(activityId) {
    const mockActivities = {
      '1': {
        id: '1',
        title: '周末羽毛球友谊赛',
        date: '2024-01-15',
        time: '14:00-16:00',
        location: '体育馆A馆',
        rules: '双打比赛，请自备球拍',
        notes: '请提前15分钟到场热身',
        maxCount: 16,
        joinedCount: 12,
        status: 'active'
      },
      '2': {
        id: '2',
        title: '羽毛球训练课',
        date: '2024-01-16',
        time: '19:00-21:00',
        location: '体育馆B馆',
        rules: '基础训练，适合初学者',
        notes: '教练会提供专业指导',
        maxCount: 20,
        joinedCount: 20,
        status: 'full'
      }
    }
    
    return mockActivities[activityId] || mockActivities['1']
  },

  // 获取模拟报名用户
  getMockJoiners(activityId) {
    const mockJoiners = [
      {
        id: '1',
        userId: 'user1',
        name: '张三',
        avatar: '/images/lcw.jpg',
        contact: '138****1234',
        joinTime: '2024-01-10 10:30'
      },
      {
        id: '2',
        userId: 'user2',
        name: '李四',
        avatar: '/images/ld.jpg',
        contact: 'wxid_abcd1234',
        joinTime: '2024-01-10 11:15'
      },
      {
        id: '3',
        userId: 'user3',
        name: '王五',
        avatar: '/images/syq.jpg',
        contact: '139****5678',
        joinTime: '2024-01-10 14:20'
      }
    ]
    
    return mockJoiners
  },

  // 获取模拟评论
  getMockComments(activityId) {
    const mockComments = [
      {
        id: '1',
        author: '张三',
        avatar: '/images/lcw.jpg',
        content: '期待这次活动！',
        time: '2024-01-10 10:35'
      },
      {
        id: '2',
        author: '李四',
        avatar: '/images/ld.jpg',
        content: '请问需要带什么装备吗？',
        time: '2024-01-10 11:20'
      }
    ]
    
    return mockComments
  },

  // 格式化时间
  formatTime(date) {
    const year = date.getFullYear()
    const month = date.getMonth() + 1
    const day = date.getDate()
    const hour = date.getHours()
    const minute = date.getMinutes()
    
    return `${year}-${month.toString().padStart(2, '0')}-${day.toString().padStart(2, '0')} ${hour.toString().padStart(2, '0')}:${minute.toString().padStart(2, '0')}`
  }
})
