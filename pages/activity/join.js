// pages/activity/join.js
const app = getApp()

Page({
  data: {
    activityId: '',
    activity: {},
    formData: {
      name: '',
      contact: '',
      message: ''
    },
    submitting: false
  },

  onLoad(options) {
    const activityId = options.id
    if (activityId) {
      this.setData({ activityId })
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

  // 加载活动信息
  loadActivityInfo(activityId) {
    // 模拟API调用
    setTimeout(() => {
      const mockActivity = this.getMockActivityInfo(activityId)
      this.setData({ activity: mockActivity })
    }, 500)
  },

  // 姓名输入
  onNameInput(e) {
    this.setData({
      'formData.name': e.detail.value
    })
  },

  // 联系方式输入
  onContactInput(e) {
    this.setData({
      'formData.contact': e.detail.value
    })
  },

  // 留言输入
  onMessageInput(e) {
    this.setData({
      'formData.message': e.detail.value
    })
  },

  // 提交报名
  onSubmitJoin() {
    const { name, contact, message } = this.data.formData
    
    // 验证必填项
    if (!name.trim()) {
      wx.showToast({
        title: '请输入姓名',
        icon: 'error'
      })
      return
    }

    // 验证姓名长度
    if (name.trim().length < 2) {
      wx.showToast({
        title: '姓名至少2个字符',
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
  submitJoin() {
    this.setData({ submitting: true })
    
    const userInfo = app.globalData.userInfo
    const joinData = {
      activityId: this.data.activityId,
      userId: userInfo ? userInfo.id : 'anonymous',
      name: this.data.formData.name.trim(),
      contact: this.data.formData.contact.trim(),
      message: this.data.formData.message.trim(),
      joinTime: new Date().toISOString()
    }

    // 模拟API调用
    setTimeout(() => {
      this.setData({ submitting: false })
      
      // 显示成功提示
      wx.showModal({
        title: '报名成功',
        content: '您已成功报名参加活动，请按时参加！',
        showCancel: false,
        success: () => {
          // 返回活动详情页
          wx.navigateBack()
        }
      })
    }, 2000)
  },

  // 获取模拟活动信息
  getMockActivityInfo(activityId) {
    const mockActivities = {
      '1': {
        id: '1',
        title: '周末羽毛球友谊赛',
        date: '2024-01-15',
        time: '14:00-16:00',
        location: '体育馆A馆',
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
        maxCount: 20,
        joinedCount: 20,
        status: 'full'
      }
    }
    
    return mockActivities[activityId] || mockActivities['1']
  }
})
