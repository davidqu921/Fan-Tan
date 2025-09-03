// pages/auth/register.js
import authService from '../../utils/auth.js'

Page({
  data: {
    userRole: 'user', // 默认用户角色
    roleText: '用户',
    formData: {
      email: '',
      password: '',
      confirmPassword: '',
      displayName: '',
      phone: '',
      wechat: ''
    },
    showPassword: false,
    showConfirmPassword: false,
    loading: false,
    canRegister: false
  },

  onLoad(options) {
    // 获取用户角色参数
    const role = options.role || 'user'
    this.setData({
      userRole: role,
      roleText: role === 'admin' ? '管理员' : '用户'
    })
  },

  // 邮箱输入
  onEmailInput(e) {
    this.setData({
      'formData.email': e.detail.value
    })
    this.checkCanRegister()
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({
      'formData.password': e.detail.value
    })
    this.checkCanRegister()
  },

  // 确认密码输入
  onConfirmPasswordInput(e) {
    this.setData({
      'formData.confirmPassword': e.detail.value
    })
    this.checkCanRegister()
  },

  // 姓名输入
  onDisplayNameInput(e) {
    this.setData({
      'formData.displayName': e.detail.value
    })
    this.checkCanRegister()
  },

  // 手机号输入
  onPhoneInput(e) {
    this.setData({
      'formData.phone': e.detail.value
    })
  },

  // 微信号输入
  onWechatInput(e) {
    this.setData({
      'formData.wechat': e.detail.value
    })
  },

  // 切换密码显示
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 切换确认密码显示
  toggleConfirmPassword() {
    this.setData({
      showConfirmPassword: !this.data.showConfirmPassword
    })
  },

  // 检查是否可以注册
  checkCanRegister() {
    const { email, password, confirmPassword, displayName } = this.data.formData
    const canRegister = email && email.length > 0 && 
                       password && password.length >= 6 && 
                       confirmPassword && confirmPassword.length > 0 && 
                       displayName && displayName.length >= 2 &&
                       password === confirmPassword
    this.setData({ canRegister })
  },

  // 验证表单
  validateForm() {
    const { email, password, confirmPassword, displayName, phone } = this.data.formData

    // 邮箱验证
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
    if (!emailRegex.test(email)) {
      wx.showToast({
        title: '请输入正确的邮箱格式',
        icon: 'error'
      })
      return false
    }

    // 密码验证
    if (password.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'error'
      })
      return false
    }

    // 确认密码验证
    if (password !== confirmPassword) {
      wx.showToast({
        title: '两次密码输入不一致',
        icon: 'error'
      })
      return false
    }

    // 姓名验证
    if (displayName.length < 2) {
      wx.showToast({
        title: '姓名至少2个字符',
        icon: 'error'
      })
      return false
    }

    // 手机号验证（如果填写了）
    if (phone && phone.length > 0) {
      const phoneRegex = /^1[3-9]\d{9}$/
      if (!phoneRegex.test(phone)) {
        wx.showToast({
          title: '请输入正确的手机号',
          icon: 'error'
        })
        return false
      }
    }

    return true
  },

  // 注册
  async onRegister() {
    if (!this.validateForm()) {
      return
    }

    this.setData({ loading: true })

    try {
      const { email, password, displayName, phone, wechat } = this.data.formData
      
      const userData = {
        displayName: displayName,
        role: this.data.userRole,
        phone: phone,
        wechat: wechat
      }

      const result = await authService.register(email, password, userData)
      
      if (result.success) {
        wx.showModal({
          title: '注册成功',
          content: `${this.data.roleText}账户创建成功！\n\n邮箱：${email}\n角色：${this.data.roleText}`,
          showCancel: false,
          success: () => {
            // 跳转到登录页面
            wx.navigateBack()
          }
        })
      } else {
        wx.showToast({
          title: result.error || '注册失败',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('注册错误:', error)
      wx.showToast({
        title: '注册失败，请重试',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 跳转到登录页面
  goToLogin() {
    wx.navigateBack()
  }
})
