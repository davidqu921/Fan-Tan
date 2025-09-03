// pages/admin/users.js
import authService from '../../utils/auth.js'

Page({
  data: {
    users: [],
    userStats: {
      total: 0,
      admins: 0,
      active: 0
    },
    loading: false
  },

  onLoad() {
    this.checkAdminPermission()
  },

  onShow() {
    this.loadUsers()
  },

  // 检查管理员权限
  checkAdminPermission() {
    const app = getApp()
    if (!app.globalData.isAdmin) {
      wx.showModal({
        title: '权限不足',
        content: '您没有访问此页面的权限',
        showCancel: false,
        success: () => {
          wx.navigateBack()
        }
      })
      return
    }
  },

  // 加载用户列表
  async loadUsers() {
    this.setData({ loading: true })

    try {
      const users = await authService.getAllUsers()
      
      // 计算统计数据
      const stats = {
        total: users.length,
        admins: users.filter(user => user.role === 'admin').length,
        active: users.filter(user => user.status === 'active').length
      }

      // 格式化用户数据
      const formattedUsers = users.map(user => ({
        ...user,
        createdAt: this.formatDate(user.createdAt),
        updatedAt: this.formatDate(user.updatedAt)
      }))

      this.setData({
        users: formattedUsers,
        userStats: stats,
        loading: false
      })
    } catch (error) {
      console.error('加载用户列表失败:', error)
      wx.showToast({
        title: '加载失败',
        icon: 'error'
      })
      this.setData({ loading: false })
    }
  },

  // 刷新用户列表
  refreshUsers() {
    this.loadUsers()
  },

  // 切换用户状态
  async toggleUserStatus(e) {
    const { uid, status } = e.currentTarget.dataset
    const newStatus = status === 'active' ? 'inactive' : 'active'
    const actionText = newStatus === 'active' ? '启用' : '禁用'

    wx.showModal({
      title: '确认操作',
      content: `确定要${actionText}此用户吗？`,
      success: async (res) => {
        if (res.confirm) {
          try {
            const result = await authService.updateUser(uid, { status: newStatus })
            
            if (result.success) {
              wx.showToast({
                title: `${actionText}成功`,
                icon: 'success'
              })
              
              // 更新本地数据
              const users = this.data.users.map(user => {
                if (user.uid === uid) {
                  return { ...user, status: newStatus }
                }
                return user
              })
              
              // 更新统计数据
              const stats = { ...this.data.userStats }
              if (newStatus === 'active') {
                stats.active++
              } else {
                stats.active--
              }
              
              this.setData({
                users: users,
                userStats: stats
              })
            } else {
              wx.showToast({
                title: result.error || `${actionText}失败`,
                icon: 'error'
              })
            }
          } catch (error) {
            console.error(`${actionText}用户失败:`, error)
            wx.showToast({
              title: `${actionText}失败`,
              icon: 'error'
            })
          }
        }
      }
    })
  },

  // 格式化日期
  formatDate(date) {
    if (!date) return '未知'
    
    const d = new Date(date)
    const year = d.getFullYear()
    const month = String(d.getMonth() + 1).padStart(2, '0')
    const day = String(d.getDate()).padStart(2, '0')
    const hours = String(d.getHours()).padStart(2, '0')
    const minutes = String(d.getMinutes()).padStart(2, '0')
    
    return `${year}-${month}-${day} ${hours}:${minutes}`
  }
})
