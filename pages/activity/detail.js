// pages/activity/detail.js
import activityService from '../../utils/activityService.js'
import joinService from '../../utils/joinService.js'
const app = getApp()

Page({
  data: {
    activityId: '',
    activity: {},
    joiners: [],
    comments: [],
    hasJoined: false,
    userJoinData: null,
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
  async loadActivityDetail(activityId) {
    this.setData({ loading: true })
    
    try {
      const result = await activityService.getActivityById(activityId)
      if (result.success) {
        // 加载报名列表
        const joinsResult = await joinService.getActivityJoins(activityId)
        const joiners = joinsResult.success ? joinsResult.data : []
        
        // 更新活动的报名人数
        const updatedActivity = {
          ...result.data,
          joinedCount: joiners.length
        }
        
        this.setData({
          activity: updatedActivity,
          joiners: joiners,
          comments: result.data.comments || [],
          loading: false
        })
      } else {
        this.setData({
          activity: {},
          joiners: [],
          comments: [],
          loading: false
        })
        wx.showToast({
          title: '活动不存在',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载活动详情失败:', error)
      this.setData({
        activity: {},
        joiners: [],
        comments: [],
        loading: false
      })
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
    
    // 检查用户是否已报名
    this.checkJoinStatus()
  },

  // 检查报名状态
  async checkJoinStatus() {
    const userInfo = app.globalData.userInfo
    if (!userInfo || !this.data.activityId) {
      console.log('检查报名状态失败: 用户信息或活动ID缺失', { userInfo, activityId: this.data.activityId })
      return
    }
    
    try {
      console.log('用户信息详情:', userInfo)
      console.log('检查用户报名状态:', { activityId: this.data.activityId, userId: userInfo.id })
      
      // 先获取所有报名记录来调试
      const allJoinsResult = await joinService.getActivityJoins(this.data.activityId)
      console.log('活动所有报名记录:', allJoinsResult)
      
      const result = await joinService.checkUserJoinStatus(this.data.activityId, userInfo.id)
      console.log('报名状态检查结果:', result)
      
      if (result.success) {
        this.setData({ 
          hasJoined: result.hasJoined,
          userJoinData: result.joinData
        })
        console.log('报名状态已更新:', { hasJoined: result.hasJoined, userJoinData: result.joinData })
      }
    } catch (error) {
      console.error('检查报名状态失败:', error)
    }
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
  async cancelJoin() {
    const userInfo = app.globalData.userInfo
    if (!userInfo || !this.data.userJoinData) {
      console.log('取消报名失败: 用户信息或报名数据缺失', { userInfo, userJoinData: this.data.userJoinData })
      wx.showToast({
        title: '用户信息缺失，请重新登录',
        icon: 'error'
      })
      return
    }
    
    wx.showLoading({ title: '处理中...' })
    
    try {
      console.log('开始取消报名:', this.data.userJoinData.id)
      console.log('用户信息:', userInfo)
      console.log('报名数据:', this.data.userJoinData)
      
      const result = await joinService.cancelJoin(this.data.userJoinData.id)
      console.log('取消报名结果:', result)
      
      if (result.success) {
        // 重新加载活动详情和报名列表
        await this.loadActivityDetail(this.data.activityId)
        
        wx.hideLoading()
        wx.showToast({
          title: '取消成功',
          icon: 'success'
        })
      } else {
        console.error('取消报名失败:', result.error)
        wx.hideLoading()
        wx.showToast({
          title: result.error || '取消失败',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('取消报名失败:', error)
      wx.hideLoading()
      wx.showToast({
        title: '取消失败，请重试',
        icon: 'error'
      })
    }
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
