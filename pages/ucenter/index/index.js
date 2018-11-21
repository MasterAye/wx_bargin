var util = require('../../../utils/util.js');
var api = require('../../../config/api.js');
var user = require('../../../services/user.js');

var app = getApp();

Page({
  data: {
    navData: [{
        text: '首页',
        active: 0,
        num: 1,
        ico: '../../../image/tab_home.png',
        icoselect: '../../../image/tab_home_select.png',
        url: '/pages/index/index',
      },
      {
        text: '有请商城',
        active: 0,
        num: 2,
        ico: '../../../image/tab_yq_01.png',
        icoselect: '../../../image/tab_yq_select.png',
        url: '',
      },
      {
        text: '我的',
        active: 1,
        num: 3,
        ico: '../../../image/tab_my.png',
        icoselect: '../../../image/tab_my_select.png',
        url: '../ucenter/index/index',
      }
    ],
    userInfo: {},
    userinfoinfo: '',
    route: '',
    auth: false,
    CorporateName: '',
    modalShow: true, // 为true时是隐藏，默认隐藏
    wechatNumber: "youqingmall",
    orderStatus: {},
  },
  onLoad: function(options) {
    this.topbar = this.selectComponent("#topbar");
    this.topbar._getPhoneType();
    app.active = false;
    // 页面初始化 options为页面跳转所带来的参数
    let that = this
    //判断是否有授权
    try {
      var value = wx.getStorageSync('auth')
      console.log(value)
      if (value) {
        that.setData({
          auth: true
        })
        // Do something with return value
      } else if (!value) {
        that.setData({
          auth: false
        })
      } else {
        try {
          wx.setStorageSync('auth', false)
        } catch (e) {}
      }
    } catch (e) {
      // Do something when catch error
    }
    let routee = getCurrentPages()
    console.log(routee[0].route)
    this.setData({
      route: routee[0].route
    })
    console.log(app.globalData)
    this.getOrderStatus()
  },
  onReady: function() {},
  onShow: function() {
    let userInfo = wx.getStorageSync('userInfo');
    let token = wx.getStorageSync('token');

    // 页面显示
    if (userInfo && token) {
      app.globalData.userInfo = userInfo;
      app.globalData.token = token;
    }

    this.setData({
      userInfo: app.globalData.userInfo,
      CorporateName: app.CorporateData.name
    });
    this.getOrderStatus()
  },
  onHide: function() {
    // 页面隐藏

  },
  onUnload: function() {
    // 页面关闭
  },
  goLogin() {
    let that = this
    try {
      wx.setStorageSync('auth', true)
    } catch (e) {

    }
    //缓存到本地已授权
    that.setData({
      auth: true
    })
    // that.getGoodsInfo()
    user.loginByWeixin().then(res => {
      console.log(res)
      that.setData({
        userInfo: res.data.userInfo
      })
      wx.hideLoading()
      app.globalData.userInfo = res.data.userInfo;
      app.globalData.token = res.data.token;
    })
  },
  bindGetUserInfo: function(e) {
    let that = this
    wx.showLoading({
      title: '加载中...',
      mask: true,
    })
    if (e.detail.userInfo) {
      console.log("允许授权")
      // console.log(e.detail.userInfo)
      try {
        wx.setStorageSync('auth', true)
      } catch (e) {}
      //缓存到本地已授权
      that.setData({
        auth: true
      })
      // that.getGoodsInfo()
      user.loginByWeixin().then(res => {
        console.log(res)
        that.setData({
          userInfo: res.data.userInfo
        })
        wx.hideLoading()
        app.globalData.userInfo = res.data.userInfo;
        app.globalData.token = res.data.token;
      })
      //用户按了允许授权按钮
    } else {
      //用户按了拒绝按钮
      console.log("拒绝授权")
      that.setData({
        auth: false
      })
      try {
        wx.setStorageSync('auth', false)
      } catch (e) {} //缓存到本地未授权
      wx.hideLoading()
    }
  },
  jumpPage(e) {
    console.log(e)
    let route = e.currentTarget.dataset.route
    wx.navigateTo({
      url: route,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  jumpOrderIndex(e) {
    let tab = e.currentTarget.dataset.index
    let route = e.currentTarget.dataset.route
    try {
      wx.setStorageSync('tab', tab);
    } catch (e) {

    }
    wx.navigateTo({
      url: route,
      success: function(res) {},
      fail: function(res) {},
      complete: function(res) {},
    })
  },
  exitLogin: function() {
    wx.showModal({
      title: '',
      confirmColor: '#b4282d',
      content: '退出登录？',
      success: function(res) {
        if (res.confirm) {
          wx.removeStorageSync('token');
          wx.removeStorageSync('userInfo');
          wx.redirectTo({
            url: '/pages/index/index'
          });
        }
      }
    })
  },
  // 隐藏
  bindconfirm: function() {
    this.setData({
      modalShow: true,
    })
  },
  // 显示
  tapModalShow: function() {
    this.setData({
      modalShow: false,
    })
  },
  // 隐藏
  bindcancel: function() {
    this.setData({
      modalShow: true,
    })
  },
  copyToBoard: function() {
    var that = this;
    wx.setClipboardData({
      data: that.data.wechatNumber,
      success: function(res) {
        // self.setData({copyTip:true}),
        // wx.showModal({
        //   title: '提示',
        //   content: '复制成功',
        // success: function(res) {
        // if (res.confirm) {
        //   console.log('确定')
        // } else if (res.cancel) {
        //   console.log('取消')
        // }
        // }
        // })
      }
    })
  },
  // previewImage: function() {
  //   wx.previewImage({
  //     current: "https://yskdc.whwefun.com/image/service.jpg", // 当前显示图片的http链接 
  //     urls: ['https://yskdc.whwefun.com/image/service.jpg'] // 需要预览的图片http链接列表 
  //   })
  // },
  getOrderStatus: function() {
    let that = this;
    util.request(api.OrdersStatus, 'POST').then(res => {
      console.log("test:", res);
      that.setData({
        orderStatus: res.data,
      })
    })
  },
})