// pages/activity/join.js
import activityService from '../../utils/activityService.js'
import joinService from '../../utils/joinService.js'
const app = getApp()

Page({
  data: {
    activityId: '',
    activity: {},
    userInfo: null,
    formData: {
      contact: '',
      message: ''
    },
    submitting: false,
    canSubmit: false
  },

  onLoad(options) {
    const activityId = options.id
    if (activityId) {
      this.setData({ activityId })
      this.loadUserInfo()
      this.loadActivityInfo(activityId)
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

  // 加载用户信息
  loadUserInfo() {
    const userInfo = app.globalData.userInfo
    if (userInfo) {
      this.setData({ userInfo })
      this.checkCanSubmit()
    } else {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
      setTimeout(() => {
        wx.navigateBack()
      }, 1500)
    }
  },

  // 加载活动信息
  async loadActivityInfo(activityId) {
    try {
      const result = await activityService.getActivityById(activityId)
      if (result.success) {
        this.setData({ activity: result.data })
      } else {
        wx.showToast({
          title: '活动不存在',
          icon: 'error'
        })
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      }
    } catch (error) {
      console.error('加载活动信息失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
    }
  },

  // 联系方式输入
  onContactInput(e) {
    const contact = e.detail.value
    this.setData({
      'formData.contact': contact
    })
    this.checkCanSubmit()
  },

  // 留言输入
  onMessageInput(e) {
    const message = e.detail.value
    this.setData({
      'formData.message': message
    })
    this.checkCanSubmit()
  },

  // 检查是否可以提交
  checkCanSubmit() {
    // 用户已登录即可提交（姓名自动使用登录用户名）
    const canSubmit = this.data.userInfo && this.data.userInfo.id
    this.setData({ canSubmit })
  },

  // 提交报名
  onSubmitJoin() {
    const { contact, message } = this.data.formData
    
    // 验证用户是否已登录
    if (!this.data.userInfo || !this.data.userInfo.id) {
      wx.showToast({
        title: '请先登录',
        icon: 'error'
      })
      return
    }

    // 检查活动状态
    if (this.data.activity.status !== 'active') {
      wx.showToast({
        title: '活动已结束或已满员',
        icon: 'error'
      })
      return
    }

    // 检查是否已满员
    if (this.data.activity.maxCount && this.data.activity.joinedCount >= this.data.activity.maxCount) {
      wx.showToast({
        title: '活动已满员',
        icon: 'error'
      })
      return
    }

    this.submitJoin()
  },

  // 执行报名提交
  async submitJoin() {
    this.setData({ submitting: true })
    
    try {
      const userInfo = this.data.userInfo
      const joinData = {
        activityId: this.data.activityId,
        userId: userInfo.id,
        userName: userInfo.nickName || userInfo.email || '用户',
        userAvatar: userInfo.avatarUrl || '',
        name: userInfo.nickName || userInfo.email || '用户', // 使用登录用户名
        contact: this.data.formData.contact.trim(),
        message: this.data.formData.message.trim(),
        joinTime: new Date().toISOString()
      }

      // 调用报名服务
      const result = await joinService.joinActivity(joinData)
      
      if (result.success) {
        wx.showModal({
          title: '报名成功',
          content: '您已成功报名参加活动，请按时参加！',
          showCancel: false,
          success: () => {
            // 返回活动详情页
            wx.navigateBack()
          }
        })
      } else {
        wx.showToast({
          title: result.error || '报名失败',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('报名失败:', error)
      wx.showToast({
        title: '报名失败，请重试',
        icon: 'error'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },


})
