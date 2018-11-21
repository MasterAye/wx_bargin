// pages/Components/topbar.js

const app = getApp();
Component({
  /**
   * 组件的属性列表
   */
  properties: {
    target: {
      type: Array,
      value: [{
          text: '首页',
          active: 1,
          num: 1,
          ico: '../../../image/tab_home.png',
          icoselect: '../../../image/tab_home_select.png',
          url: '/pages/index/index',
        },
        {
          text: '有请商城',
          active: 0,
          num: 2,
          ico: '../../../image/tab_yq.png',
          icoselect: '../../../image/tab_yq_select.png',
          url: '',
        },
        {
          text: '我的',
          active: 0,
          num: 3,
          ico: '../../../image/tab_my.png',
          icoselect: '../../../image/tab_my_select.png',
          url: '/pages/ucenter/index/index',
        }
      ]
    }
  },

  /**
   * 组件的初始数据
   */
  data: {
    iphonex: '',
    // navData: [{
    //     text: '首页',
    //     active: true,
    //     ico: '../../../image/tab_home.png',
    //     icoselect: '../../../image/tab_home_select.png',
    //     url: '/pages/index/index',
    //   },
    //   {
    //     text: '有请商城',
    //     active: false,
    //     ico: '../../../image/tab_yq.png',
    //     icoselect: '../../../image/tab_yq_select.png',
    //     url: '',
    //   },
    //   {
    //     text: '我的',
    //     active: false,
    //     ico: '../../../image/tab_my.png',
    //     icoselect: '../../../image/tab_my_select.png',
    //     url: '/pages/ucenter/index/index',
    //   }
    // ],
  },

  /**
   * 组件的方法列表
   */
  methods: {
    // 底部导航跳转
    changetopbar: function(e) {
      var topbarUrl = e.currentTarget.dataset.url
      var active = e.currentTarget.dataset.active;
      var num = e.currentTarget.dataset.num;
      if (active) {
        return false
      }
      // this.setData({
      //   navData: navbarData
      // })
      console.log(topbarUrl);
      if (num == 1 || num == 3) {
        wx.redirectTo({
          url: topbarUrl
        })
      }
      if (num == 2) {
        wx.navigateToMiniProgram({
          appId: 'wx6c9dc4f94a299ed7',
          // path: 'pages/index/index?id=123456789', // 打开页面的路径，为空就是首页
          // extarData: {
          //   open: 'happy'  // 传到小程序的参数
          // },
          // envVersion: 'release',  // 打开的小程序的版本， release 为正式版
          success(res) {
            // 打开成功
          }
        })
      }
    },
    // 判断手机型号
    _getPhoneType: function() {
      var that = this;
      wx.getSystemInfo({
        success: function(res) {
          var str = res.model;
          str = str.substring(str.length - 1);
          that.setData({
            iphonex: str
          })
        }
      });
    },
  }
})