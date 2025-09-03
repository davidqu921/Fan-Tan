// pages/auth/login.js
import authService from '../../utils/auth.js'

Page({
  data: {
    formData: {
      email: '',
      password: ''
    },
    showPassword: false,
    loading: false,
    canLogin: false
  },

  onLoad() {
    // 检查是否已经登录
    this.checkLoginStatus()
  },

  // 检查登录状态
  checkLoginStatus() {
    authService.onAuthStateChanged((user) => {
      if (user) {
        // 已登录，跳转到首页
        wx.switchTab({
          url: '/pages/index/index'
        })
      }
    })
  },

  // 邮箱输入
  onEmailInput(e) {
    this.setData({
      'formData.email': e.detail.value
    })
    this.checkCanLogin()
  },

  // 密码输入
  onPasswordInput(e) {
    this.setData({
      'formData.password': e.detail.value
    })
    this.checkCanLogin()
  },

  // 切换密码显示
  togglePassword() {
    this.setData({
      showPassword: !this.data.showPassword
    })
  },

  // 检查是否可以登录
  checkCanLogin() {
    const { email, password } = this.data.formData
    const canLogin = email.trim() && password.trim() && password.length >= 6
    this.setData({ canLogin })
  },

  // 登录
  async onLogin() {
    const { email, password } = this.data.formData

    if (!email.trim()) {
      wx.showToast({
        title: '请输入邮箱',
        icon: 'error'
      })
      return
    }

    if (!password.trim()) {
      wx.showToast({
        title: '请输入密码',
        icon: 'error'
      })
      return
    }

    if (password.length < 6) {
      wx.showToast({
        title: '密码至少6位',
        icon: 'error'
      })
      return
    }

    this.setData({ loading: true })

    try {
      const result = await authService.login(email.trim(), password)
      
      if (result.success) {
        wx.showToast({
          title: '登录成功',
          icon: 'success'
        })

        // 更新全局用户信息
        const app = getApp()
        app.globalData.userInfo = result.user
        app.globalData.isAdmin = result.user.role === 'admin'

        // 跳转到首页
        setTimeout(() => {
          wx.switchTab({
            url: '/pages/index/index'
          })
        }, 1500)
      } else {
        wx.showToast({
          title: result.error || '登录失败',
          icon: 'error'
        })
      }
    } catch (error) {
      console.error('登录错误:', error)
      wx.showToast({
        title: '登录失败，请重试',
        icon: 'error'
      })
    } finally {
      this.setData({ loading: false })
    }
  },

  // 跳转到注册页面
  goToRegister() {
    wx.navigateTo({
      url: '/pages/auth/register'
    })
  },

  // 跳转到用户注册
  goToUserRegister() {
    wx.navigateTo({
      url: '/pages/auth/register?role=user'
    })
  },

  // 跳转到管理员注册
  goToAdminRegister() {
    wx.navigateTo({
      url: '/pages/auth/register?role=admin'
    })
  }
})
