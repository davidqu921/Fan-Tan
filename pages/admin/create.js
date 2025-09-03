// pages/admin/create.js
import activityService from '../../utils/activityService.js'

Page({
  data: {
    formData: {
      title: '',
      date: '',
      time: '',
      location: '',
      rules: '',
      maxCount: '',
      cancelDeadlineDate: '',
      cancelDeadlineTime: '',
      cancelDeadline: '',
      description: ''
    },
    canSubmit: false,
    submitting: false,
    today: ''
  },

  onLoad() {
    // 设置今天的日期作为最小可选日期
    const today = new Date()
    const todayStr = this.formatDate(today)
    this.setData({
      today: todayStr
    })
  },

  // 格式化日期
  formatDate(date) {
    const year = date.getFullYear()
    const month = String(date.getMonth() + 1).padStart(2, '0')
    const day = String(date.getDate()).padStart(2, '0')
    return `${year}-${month}-${day}`
  },

  // 标题输入
  onTitleInput(e) {
    this.setData({
      'formData.title': e.detail.value
    })
    this.checkCanSubmit()
  },

  // 日期选择
  onDateChange(e) {
    this.setData({
      'formData.date': e.detail.value
    })
    this.checkCanSubmit()
  },

  // 时间选择
  onTimeChange(e) {
    this.setData({
      'formData.time': e.detail.value
    })
    this.checkCanSubmit()
  },

  // 地点输入
  onLocationInput(e) {
    this.setData({
      'formData.location': e.detail.value
    })
    this.checkCanSubmit()
  },

  // 规则输入
  onRulesInput(e) {
    this.setData({
      'formData.rules': e.detail.value
    })
  },

  // 最大人数输入
  onMaxCountInput(e) {
    this.setData({
      'formData.maxCount': e.detail.value
    })
  },

  // 最晚取消日期选择
  onCancelDeadlineDateChange(e) {
    this.setData({
      'formData.cancelDeadlineDate': e.detail.value
    })
    this.updateCancelDeadline()
  },

  // 最晚取消时间选择
  onCancelDeadlineTimeChange(e) {
    this.setData({
      'formData.cancelDeadlineTime': e.detail.value
    })
    this.updateCancelDeadline()
  },

  // 更新最晚取消时间
  updateCancelDeadline() {
    const { cancelDeadlineDate, cancelDeadlineTime } = this.data.formData
    if (cancelDeadlineDate && cancelDeadlineTime) {
      const cancelDeadline = `${cancelDeadlineDate} ${cancelDeadlineTime}`
      this.setData({
        'formData.cancelDeadline': cancelDeadline
      })
    } else {
      this.setData({
        'formData.cancelDeadline': ''
      })
    }
  },

  // 描述输入
  onDescriptionInput(e) {
    this.setData({
      'formData.description': e.detail.value
    })
  },

  // 检查是否可以提交
  checkCanSubmit() {
    const { title, date, time, location } = this.data.formData
    const canSubmit = title.trim().length >= 2 && 
                     date && 
                     time && 
                     location.trim().length >= 2
    
    this.setData({ canSubmit })
  },

  // 提交表单
  async onSubmit() {
    if (!this.data.canSubmit || this.data.submitting) {
      return
    }

    this.setData({ submitting: true })

    try {
      // 准备活动数据
      const activityData = {
        title: this.data.formData.title.trim(),
        date: this.data.formData.date,
        time: this.data.formData.time,
        location: this.data.formData.location.trim(),
        rules: this.data.formData.rules.trim() || '请遵守活动规则',
        maxCount: this.data.formData.maxCount ? parseInt(this.data.formData.maxCount) : null,
        cancelDeadline: this.data.formData.cancelDeadline || null,
        description: this.data.formData.description.trim(),
        creatorId: 'admin', // 这里应该从用户信息获取
        creatorName: '管理员'
      }

      // 调用活动服务创建活动
      const result = await activityService.createActivity(activityData)
      
      if (result.success) {
        wx.showToast({
          title: '活动发布成功',
          icon: 'success'
        })
        
        // 延迟返回，让用户看到成功提示
        setTimeout(() => {
          wx.navigateBack()
        }, 1500)
      } else {
        wx.showToast({
          title: result.error || '发布失败',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('发布活动失败:', error)
      wx.showToast({
        title: '发布失败，请重试',
        icon: 'error'
      })
    } finally {
      this.setData({ submitting: false })
    }
  },

  // 返回
  onGoBack() {
    wx.navigateBack()
  }
})
