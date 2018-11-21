var app = getApp();
var WxParse = require("../../lib/wxParse/wxParse.js");
var util = require("../../utils/util.js");
var api = require("../../config/api.js");
const user = require("../../services/user.js");

Page({
  data: {
    route: "",
    id: 0,
    userid: "",
    userBarId: "",
    goodsid: "",
    barid: "",
    goods: {},
    gallery: [],
    // attribute: [],
    // 发起砍价数据=======111111111111111
    showSkuModalStatus: false,
    animationSkuData: {}, //商品sku弹层的动画
    productList: [], //商品的所有规格种类
    checkgoods: {}, //选择的商品的信息 显示在sku头部
    thisbargoods: {}, //用户选择的砍价商品的信息
    lowest_price: 0, // 价格
    checkedSpecText: "请选择规格数量",
    // 立即支付流程======222222222222222
    showModalStatus: false,
    animationData: {}, // 立即支付弹层的动画
    number: 1,
    cartGoods: {},
    cartTotal: {},

    specificationList: [], //商品的规格键值对

    userBargainList: [], //用户参与的砍价列表

    issueList: [],
    comment: [],
    brand: {},
    collage: [],
    // checkedGoods: [],
    productList: [],
    checkgoodsprice: "",
    checkgoodsku: "",
    relatedGoods: [],
    cartGoodsCount: 0,
    userHasCollect: 0,
    showModalStatus: false,
    typec: 0,
    noCollectImage: "/image/like.png",
    hasCollectImage: "/image/liked.png",
    collectBackImage: "/image/like.png",
    is_Inviter: 0,
    auth: false,
    isdistribution: false,
    Inviter_locallaster: "",
    Inviter_laster: "",
    Inviter_userid: [],
    CorporateName: "",
    payflag: true,
    barflag: true
  },
  onLoad: function(options) {
    // 页面初始化 options为页面跳转所带来的参数
    var that = this;
    console.log(options);
    wx.showLoading({
      title: "获取中...",
      mask: true
    });
    var value = wx.getStorageSync("userInfo");
    if (value) {
      that.setData({
        userInfo: value
      });
    }
    if (options.ids) {
      console.log("被分享者进入");
      that.setData({
        is_Inviter: 1,
        id: parseInt(options.id),
        Inviter_userid: JSON.parse(options.ids),
        CorporateName: app.CorporateData.name
      });
    } else {
      console.log("正常用户进入");
      that.setData({
        is_Inviter: 0,
        id: parseInt(options.id),
        barid: options.barid,
        CorporateName: app.CorporateData.name
      });
    }
    that.getGoodsInfo();
  },
  onShareAppMessage: function() {
    let that = this;
    // console.log(that.data.goods.id);
    // console.log(that.data.Inviter_locallaster);
    // return {
    //   title: "砍价有神器",
    //   desc: that.data.goods.name,
    //   path: "/pages/goods/goods?id=" +
    //     that.data.goods.id +
    //     "&ids=" +
    //     that.data.Inviter_locallaster,
    //   imageUrl: "../../image/CorporateData/wefun_bargain.jpg"
    // };
    return {
      title: api.slogan_index,
      desc: "砍价有神器微信小程序",
      path: "/pages/index/index",
      imageUrl: "../../image/CorporateData/wefun_bargain.jpg"
    };
  },
  getGoodsInfo: function() {
    let that = this;
    util
      .request(api.GoodsDetail, {
        id: that.data.id
      })
      .then(function(res) {
        console.log(res);
        if (res.errno === 0) {
          that.setData({
            goods: res.data.info,
            collage: res.data.collage,
            checkgoodsprice: res.data.info,
            gallery: res.data.gallery,
            issueList: res.data.issue,
            comment: res.data.comment,
            brand: res.data.brand,
            specificationList: res.data.specificationList,
            productList: res.data.productList,
            userHasCollect: res.data.userHasCollect
          });

          if (res.data.userHasCollect == 1) {
            that.setData({
              collectBackImage: that.data.hasCollectImage
            });
          } else {
            that.setData({
              collectBackImage: that.data.noCollectImage
            });
          }
          that.getGoodsRelated();
          that.checkdisauth();
          WxParse.wxParse(
            "goodsDetail",
            "html",
            res.data.info.goods_desc,
            that
          );
          console.log(that.goodsDetail);
        }
      });
  },
  getGoodsRelated: function() {
    let that = this;
    util
      .request(api.GoodsRelated, {
        id: that.data.id
      })
      .then(function(res) {
        if (res.errno === 0) {
          that.setData({
            relatedGoods: res.data.goodsList
          });
        }
      });
    setTimeout(() => {
      wx.hideLoading();
    }, 217);
  },
  checkdisauth() {
    let that = this;
    // wx.showLoading({
    //   title: '授权检测...',
    //   mask: true,
    // })
    try {
      var value = wx.getStorageSync("auth");
      if (value) {
        if (value) {
          user.loginByWeixin().then(resp => {
            console.log(resp);
            that.setData({
              auth: true,
              userinfo: resp.data.userInfo
            });
            console.log(that.data.Inviter_userid);
            if (that.data.is_Inviter == "0") {
              that.share_distribution();
              console.log("进入用户已授权正常用户");
            } else if (that.data.is_Inviter == "1") {
              try {
                wx.setStorageSync(
                  "invitation",
                  JSON.stringify(that.data.Inviter_userid)
                );
                console.log("进入用户为被分享者,已授权，分销信息已存入本地");
              } catch (e) {
                // console.log(e)
              }
              that.share_distribution();
            }
            // if (that.data.Inviter_userid.length == 0){
            //   try {
            //     var value = wx.getStorageSync('invitation')
            //     console.log(value)
            //     if (value) {
            //       console.log("用户授权,读取本地分销缓存")
            //       that.setData({
            //         Inviter_userid: JSON.parse(value)
            //       })
            //     }
            //   } catch (e) {
            //   }
            // }else {
            //   console.log(that.data.Inviter_userid)
            // }
          });
        } else {
          that.setData({
            auth: false
          });
          console.log(that.data.Inviter_userid);
          if (that.data.is_Inviter == "0") {
            that.share_distribution();
            console.log("进入用户未授权正常用户");
          } else if (that.data.is_Inviter == "1") {
            try {
              wx.setStorageSync(
                "invitation",
                JSON.stringify(that.data.Inviter_userid)
              );
              console.log("进入用户为被分享者,未授权，分销信息已存入本地");
            } catch (e) {}
            that.share_distribution();
          }
        }
        // Do something with return value
      }
    } catch (e) {
      // Do something when catch error
    }
  },
  share_distribution() {
    let that = this;
    // console.log(e)
    if (that.data.auth) {
      util
        .request(
          api.CheckUserIsDistribution, {
            userid: that.data.userinfo.id
          },
          "POST"
        )
        .then(res => {
          console.log(res);
          if (res.errno == 17) {
            that.setData({
              isdistribution: false
            });
          } else if (res.errno == 503) {
            let list = [];
            list[0] = res.data[0].user_id;
            list[1] = res.data[0].farther_distribution_user_id;
            // list[2] = res.data[0].grandpa_distribution_user_id
            // list[3] = res.data[0].grandfather_distribution_user_id
            that.setData({
              isdistribution: true,
              Inviter_laster: res.data[0],
              Inviter_locallaster: JSON.stringify(list)
            });
          }
        });
    } else {
      that.setData({
        isdistribution: false
      });
    }
    wx.hideLoading();
  },

  // showModal: function() {
  //     // 显示遮罩层
  //     var animation = wx.createAnimation({
  //         duration: 200,
  //         timingFunction: "linear",
  //         delay: 0
  //     })
  //     this.animation = animation
  //     animation.translateY(600).step()
  //     this.setData({
  //         animationData: animation.export(),
  //         showModalStatus: true
  //     })
  //     setTimeout(function() {
  //         animation.translateY(0).step()
  //         this.setData({
  //             animationData: animation.export()
  //         })
  //     }.bind(this), 200)

  // },
  // =============================================================1111111111111111111
  // hideModal: function() {
  //     // 隐藏遮罩层
  //     var animation = wx.createAnimation({
  //         duration: 200,
  //         timingFunction: "linear",
  //         delay: 0
  //     })
  //     this.animation = animation
  //     animation.translateY(600).step()
  //     this.setData({
  //         animationData: animation.export(),
  //     })
  //     setTimeout(function() {
  //         animation.translateY(0).step()
  //         this.setData({
  //             animationData: animation.export(),
  //             showModalStatus: false
  //         })
  //     }.bind(this), 200)
  // },

  launchBargain(e) {
    let that = this;
    if (that.data.goods.retail_price <= 0.05) {
      wx.showToast({
        title: "价格太低无法发起砍价",
        icon: "none"
      });
      return false;
    }
    wx.showLoading({
      title: "核实中...",
      mask: true
    });
    if (this.data.barflag) {} else {
      return false;
    }
    this.setData({
      barflag: false
    })
    let barId = e.currentTarget.dataset.barid;
    let goodsId = e.currentTarget.dataset.goodsid;
    // 查找用户是否参与过此条砍价 FindUserIsCut
    util.request(api.FindUserIsCut, {
      userId: that.data.userInfo.id,
      barId: barId
    }, "POST").then(res => {
      this.setData({
        barflag: true
      })
      console.log(res);
      if (res.errno === 17) {
        // 发起过砍价
        wx.hideLoading();
        wx.showToast({
          title: res.errmsg,
          icon: "none",
          duration: 1500,
          mask: true
        });
      } else if (res.errno === 0) {
        // 没有发起砍价
        wx.hideLoading();
        that.showSkuMask(goodsId, barId);
      }
    });
  },
  //显示选择商品的sku弹层
  showSkuMask(goodsId, barId) {
    // var id = e.target.dataset.goodsid
    // var barid = e.target.dataset.barid
    // 查找商品规格
    this.FindGoodsSkuInfo(goodsId);
    // 选择规格时查询价格
    this.SkuPriceInfo(barId);
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(500).step();
    this.setData({
      checkedSpecText: " 请选择规格 ",
      animationSkuData: animation.export(),
      showSkuModalStatus: true
    });
    setTimeout(
      function() {
        animation.translateY(0).step();
        this.setData({
          animationSkuData: animation.export()
        });
      }.bind(this),
      200
    );
  },
  //打开弹层时查找商品的规格
  FindGoodsSkuInfo(id) {
    var that = this;
    console.log(id);
    var goodsid = id;
    util
      .request(api.FindGoodSku, {
        id: goodsid
      })
      .then(res => {
        console.log(res);
        that.setData({
          checkgoods: res.data.goodsinfo,
          specificationList: res.data.specificationList,
          productList: res.data.productList
        });
      });
  },
  //选择规格时查询价格
  SkuPriceInfo(barId) {
    var that = this;
    // wx.showLoading({
    //   title: '获取中...',
    //   mask: true,
    // })
    util
      .request(
        api.FindBargainById, {
          id: barId
        },
        "POST"
      )
      .then(function(res) {
        console.log("xxxxxxxxxxxxxxxxxxxxxxxx", res.data.data);
        that.setData({
          thisbargoods: res.data.data,
          lowest_price: res.data.data.lowest_price
        });
        console.log("1111111111111111", that.thisbargoods);
        console.log("22222222222222", that.lowest_price);
        // wx.hideLoading()
      });
  },
  // 以下为sku点击判断事件
  clickSkuValue: function(event) {
    let that = this;
    let specNameId = event.currentTarget.dataset.nameId;
    let specValueId = event.currentTarget.dataset.valueId;
    //判断是否可以点击
    //TODO 性能优化，可在wx:for中添加index，可以直接获取点击的属性名和属性值，不用循环
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      if (_specificationList[i].specification_id == specNameId) {
        for (let j = 0; j < _specificationList[i].valueList.length; j++) {
          if (_specificationList[i].valueList[j].id == specValueId) {
            //如果已经选中，则反选
            if (_specificationList[i].valueList[j].checked) {
              _specificationList[i].valueList[j].checked = false;
            } else {
              _specificationList[i].valueList[j].checked = true;
            }
          } else {
            _specificationList[i].valueList[j].checked = false;
          }
        }
      }
    }
    this.setData({
      specificationList: _specificationList
    });
    //重新计算spec改变后的信息
    this.changeSpecInfo();
    //重新计算哪些值不可以点击
  },
  // 333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333333
  changeSpecInfo: function() {
    var that = this;
    let checkedNameValue = this.getCheckedSpecValue();

    //设置选择的信息
    let checkedValue = checkedNameValue
      .filter(function(v) {
        if (v.valueId != 0) {
          return true;
        } else {
          return false;
        }
      })
      .map(function(v) {
        return v.valueText;
      });
    if (checkedValue.length > 0) {
      this.setData({
        checkedSpecText: checkedValue.join("/")
      });
    } else {
      this.setData({
        checkedSpecText: "请选择规格"
      });
    }
    // console.log(checkedValue)
    // console.log(checkedNameValue)

    if (checkedValue.length == checkedNameValue.length) {
      // console.log("999999")
      var value2 = [];
      for (var i = 0; i < checkedNameValue.length; i++) {
        var obj = checkedNameValue[i].valueId;
        value2.push(obj);
      }
      value2 = value2.sort();
      console.log(value2);
      util
        .request(
          api.FindBarValues, {
            data: value2
          },
          "POST"
        )
        .then(function(res) {
          console.log(res);
          that.setData({
            checkgoods: res.data,
            lowest_price: (
              (that.data.thisbargoods.rate / 100) *
              res.data.retail_price
            ).toFixed(2)
          });
        });
      util
        .request(
          api.FindValues, {
            data: value2
          },
          "POST"
        )
        .then(function(res) {
          console.log(res);
          that.setData({
            checkgoodsprice: res.data
            //  checkgoodsku:res.data
            //  checkedProduct
          });
          wx.hideLoading();
          //  console.log(that.data.checkgoodsku)
        });

      // for (var j = 0; j < value2.length;j++){
      //   // console.log(value2)
      //   final = value2[i] + '_'
      // }
      // console.log(final)
    }
  },
  //获取选中的规格信息
  getCheckedSpecValue: function() {
    let checkedValues = [];
    let _specificationList = this.data.specificationList;
    for (let i = 0; i < _specificationList.length; i++) {
      let _checkedObj = {
        nameId: _specificationList[i].specification_id,
        valueId: 0,
        valueText: ""
      };
      for (let j = 0; j < _specificationList[i].valueList.length; j++) {
        if (_specificationList[i].valueList[j].checked) {
          _checkedObj.valueId = _specificationList[i].valueList[j].id;
          _checkedObj.valueText = _specificationList[i].valueList[j].value;
        }
      }
      checkedValues.push(_checkedObj);
    }
    return checkedValues;
  },
  //判断规格是否选择完整
  isCheckedAllSpec: function() {
    return !this.getCheckedSpecValue().some(function(v) {
      console.log(v);
      if (v.valueId == 0) {
        return true;
      }
    });
  },
  getCheckedSpecKey: function() {
    let checkedValue = this.getCheckedSpecValue().map(function(v) {
      console.log(v.valueId);
      return v.valueId;
    });

    return checkedValue.reverse().join("_");
  },
  //确定发起砍价
  skuSure() {

    //提示选择完整规格
    var that = this;
    var barId = this.data.barid;
    console.log(that.isCheckedAllSpec());
    if (!that.isCheckedAllSpec()) {
      wx.showToast({
        title: "选择完整规格！",
        icon: "none",
        duration: 1500
      });
      return false;
    }
    //根据选中的规格，判断是否有对应的sku信息
    let checkedProduct = that.getCheckedProductItem(that.getCheckedSpecKey());
    console.log("checkedProduct:", checkedProduct);
    if (!that.data.checkgoods || that.data.checkgoods.length <= 0) {
      //找不到对应的product信息，提示没有库存
      wx.showToast({
        title: "没有库存！",
        icon: "none",
        duration: 1500
      });
      return false;
    }
    //验证库存
    if (that.data.checkgoods.goods_number < 1) {
      console.log(
        "that.data.checkgoods.goods_number:",
        that.data.checkgoods.goods_number
      );
      //找不到对应的product信息，提示没有库存
      wx.showToast({
        title: "库存不足！",
        icon: "none",
        duration: 1500
      });
      return false;
    }
    if (that.data.checkgoods == {}) {
      wx.showToast({
        title: "异常！请重试！",
        icon: "none",
        duration: 1500
      });
      return false;
    }
    if (this.data.barflag) {} else {
      return false;
    }
    this.setData({
      barflag: false
    })
    util.request(
      api.FindUserIsCut, {
        userId: that.data.userInfo.id,
        barId: barId
      }, "POST").then(res => {
      that.setData({
        barflag: true,
      })
      console.log(res);
      if (res.errno === 17) {
        // 发起过砍价
        wx.hideLoading();
        wx.showToast({
          title: res.errmsg,
          icon: "none",
          duration: 1500,
          mask: true
        });
      } else {
        wx.showModal({
          title: "提示！",
          content: "是否确认发起 " +
            that.data.thisbargoods.goods_name +
            that.data.checkedSpecText +
            "款的砍价，发起后砍价商品和规格不可更改！",
          success: function(res) {
            if (res.confirm) {
              that.data.checkgoods.lowest_price = that.data.lowest_price;
              console.log("是否确认发起？checkgoods:", that.data.checkgoods);
              util
                .request(
                  api.SetUserLaunchBargain, {
                    userInfo: that.data.userInfo,
                    bargoods: that.data.thisbargoods,
                    skuInfo: that.data.checkgoods,
                    skuValue: that.data.checkedSpecText
                  },
                  "POST"
                )
                .then(res => {
                  console.log(res);
                  if (res.errno === 0) {
                    that.data.barfalg = true;
                    wx.showToast({
                      title: "发起成功 ！ 跳转中！",
                      icon: "none",
                      duration: 1500,
                      mask: true
                    });
                    wx.navigateTo({
                      url: "/pages/Resagin_bargain_goods/Resagin_bargain_goods?id=" +
                        res.data,
                      success: function(res) {},
                      fail: function(res) {},
                      complete: function(res) {}
                    });
                    // that.SetUserLaunchCut()
                  } else {
                    wx.showToast({
                      title: "发起失败 ！",
                      icon: "none",
                      duration: 1500,
                      mask: true
                    });
                  }
                });
            }
          },
          fail: function(res) {},
          complete: function(res) {}
        });
      }
    });
  },
  //根据选中的规格，判断是否有对应的sku信息
  getCheckedProductItem: function(key) {
    // console.log(this.data.productList)
    //  return this.data.productList
    console.log(key);
    return this.data.productList.filter(function(v) {
      if (v.goods_specification_ids == key) {
        return true;
      } else {
        return false;
      }
    });
  },
  hideSkuModal: function() {
    // 隐藏遮罩层
    var animation = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    this.animation = animation;
    animation.translateY(500).step();
    this.setData({
      animationSkuData: animation.export()
    });
    setTimeout(
      function() {
        animation.translateY(0).step();
        this.setData({
          animationSkuData: animation.export(),
          showSkuModalStatus: false
        });
      }.bind(this),
      200
    );
    // this.setData({
    //   specificationList: [],
    //   productList: []
    // })
  },
  hideModal: function() {
    // 隐藏遮罩层
    var animation2 = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    this.animation2 = animation2;
    animation2.translateY(500).step();
    this.setData({
      animationData: animation2.export()
    });
    setTimeout(
      function() {
        animation2.translateY(0).step();
        this.setData({
          animationData: animation2.export(),
          showModalStatus: false
        });
      }.bind(this),
      200
    );
    // this.setData({
    //   specificationList: [],
    //   productList: []
    // })
  },
  // ==========================================================立即支付流程
  // 用户点击立即支付
  launchBargainPay(e) {
    let that = this;
    wx.showLoading({
      title: "核实中...",
      mask: true
    });
    let barId = e.currentTarget.dataset.barid;
    let goodsId = e.currentTarget.dataset.goodsid;
    // 查找用户是否参与过此条砍价 FindUserIsCut
    util
      .request(
        api.FindUserIsCut, {
          userId: that.data.userInfo.id,
          barId: barId
        },
        "POST"
      )
      .then(res => {
        console.log(res);
        if (res.errno === 17) {
          // 发起过砍价
          wx.hideLoading();
          console.log(that.data.barid);
          var value = wx.getStorageSync("userInfo");
          that.data.userid = value.id;
          // console.log('111111111111111')
          // wx.navigateTo({
          //   url: '/pages/index/index?ind=' + '1'
          // })
          wx.showToast({
            title: "您已经发起过砍价，请去[我的砍价]完成支付",
            icon: "none",
            duration: 2000,
            mask: true
          });
        } else if (res.errno === 0) {
          // 没有发起砍价
          wx.hideLoading();
          that.showSkuMask2(goodsId, barId);
        }
      });
  },
  //显示选择商品的sku弹层
  showSkuMask2(goodsId, barId) {
    // var id = e.target.dataset.goodsid
    // var barid = e.target.dataset.barid
    // 查找商品规格
    this.FindGoodsSkuInfo(goodsId);
    // 选择规格时查询价格
    this.SkuPriceInfo(barId);
    var animation2 = wx.createAnimation({
      duration: 200,
      timingFunction: "linear",
      delay: 0
    });
    this.animation2 = animation2;
    animation2.translateY(500).step();
    this.setData({
      checkedSpecText: " 请选择规格 ",
      animationData: animation2.export(),
      showModalStatus: true
    });
    setTimeout(
      function() {
        animation2.translateY(0).step();
        this.setData({
          animationData: animation2.export()
        });
      }.bind(this),
      200
    );
  },
  //立即支付
  checkoutOrder: function() {
    //提示选择完整规格
    if (!this.isCheckedAllSpec()) {
      wx.showToast({
        title: "选择完整规格！",
        icon: "none",
        duration: 1500
      });
      return false;
    }
    //根据选中的规格，判断是否有对应的sku信息
    let checkedProduct = this.getCheckedProductItem(this.getCheckedSpecKey());
    console.log("checkedProduct", checkedProduct);
    if (!this.data.checkgoodsprice || this.data.checkgoodsprice.length <= 0) {
      //找不到对应的product信息，提示没有库存
      wx.showToast({
        title: "没有库存！",
        icon: "none",
        duration: 1500
      });
      return false;
    }
    //验证库存
    if (this.data.checkgoodsprice.goods_number < this.data.number) {
      console.log(
        "good.js goods_number:",
        this.data.checkgoodsprice.goods_number
      );
      //找不到对应的product信息，提示没有库存
      wx.showToast({
        title: "库存不足！",
        icon: "none",
        duration: 1500
      });
      return false;
    }
    if (this.data.payflag) {
      console.log("1111111111111111111")
    } else {
      console.log("22222222222222222222222222")
      return false;
    }
    console.log("33333333333333333333")
    this.setData({
      payflag: false,
    })
    var that = this;
    var checkedGoods = that.data.goods;
    //取消购物车商品的选中状态
    util.request(api.CartCheckeder).then(function(res) {});
    //添加到购物车
    // console.log(checkedProduct)
    console.log("checkgoodsprice", this.data.checkgoodsprice);
    // console.log('goodsId', this.data.goods.id)
    // console.log("number", this.data.number);
    // console.log('productId', checkedProduct.id)
    util
      .request(
        api.CartAddcopy, {
          goodsId: this.data.goods.id,
          number: this.data.number,
          productId: this.data.checkgoodsprice.id
        },
        "POST"
      )
      .then(function(res) {
        console.log(res);

        util.request(api.CartList).then(function(res) {
          if (res.errno === 0) {
            console.log(res.data);
            that.setData({
              cartGoods: res.data.cartList,
              cartTotal: res.data.cartTotal
            });
            util
              .request(
                api.CartCheckSku, {
                  checkedGoods: that.data.cartGoods
                },
                "POST"
              )
              .then(res => {
                console.log(res);
                wx.hideLoading();
                let chagesku = res.data;
                if (chagesku.length == 0) {
                  that.setData({
                    payflag: true,
                  })
                  wx.navigateTo({
                    url: "../shopping/checkout/checkout"
                  });
                } else {
                  // console.log("9999999")
                  let data = "";
                  let ids = "";
                  for (var i = 0; i < chagesku.length; i++) {
                    console.log(i);
                    (data = chagesku[i].goods_name + "," + data),
                    (ids = chagesku[i].product_id + ",");
                  }
                  wx.showModal({
                    title: "提示",
                    content: "当前选择商品中" +
                      data +
                      "的库存已发生改变，下单失败！，点击确定将会删除库存改变的商品！",
                    success: function(res) {
                      if (res.confirm) {
                        util
                          .request(
                            api.CartDelete, {
                              productIds: ids
                            },
                            "POST"
                          )
                          .then(res => {
                            console.log(res);
                            if (res.errno === 0) {
                              console.log(res.data);
                              let cartList = res.data.cartList.map(v => {
                                console.log(v);
                                v.checked = false;
                                return v;
                              });
                              that.setData({
                                cartGoods: cartList,
                                cartTotal: res.data.cartTotal
                              });
                            }
                          });
                      }
                    },
                    fail: function(res) {},
                    complete: function(res) {}
                  });
                }
              });
          }
        });
        let _res = res;
        if (_res.errno == 0) {
          // wx.showToast({
          //     title: '添加到购物车！'
          // });
          that.setData({
            // openAttr: !that.data.openAttr,
            cartGoodsCount: _res.data.cartTotal.goodsCount
          });
          if (that.data.userHasCollect == 1) {
            that.setData({
              collectBackImage: that.data.hasCollectImage
            });
          } else {
            that.setData({
              collectBackImage: that.data.noCollectImage
            });
          }
        } else {
          wx.showToast({
            image: "/static/images/icon_error.png",
            title: _res.errmsg,
            mask: true
          });
        }
        // 绑定手机
        // util.request(api.BingPhoneFind, {
        //     userId: that.data.userinfo.id
        // }, 'POST').then(function(res) {
        //     console.log(res)
        //     if (res.data.Result.mobile == "") {
        //         wx.navigateTo({
        //             url: '/pages/ucenter/bingphone/bingphone',
        //             success: function(res) {},
        //             fail: function(res) {},
        //             complete: function(res) {},
        //         })
        //     } else {
        //         wx.navigateTo({
        //             url: '../shopping/checkout/checkout',
        //         })
        //     }
        // });
      });
  },

  // 获取用户砍价列表id ，跳转到继续砍价页面
  getUserBarList() {
    let that = this;
    util
      .request(
        api.UserBargainList, {
          userId: that.data.userid
        },
        "POST"
      )
      .then(res => {
        that.setData({
          userBargainList: res.data.data
        });
        for (var i = 0; i < that.data.userBargainList.length; i++) {
          if (that.data.barid == that.data.userBargainList[i].bargain_id) {
            that.data.userBarId = that.data.userBargainList[i].id;
          }
        }
        wx.navigateTo({
          url: "/pages/Resagin_bargain_goods/Resagin_bargain_goods?id=" +
            that.data.userBarId
        });
      });
  },
  beforShowAdressModal() {
    let that = this;
    console.log(that.data.user_IN_Info.id);
    util
      .request(
        api.AfterBargainSuccessAdressList, {
          userId: that.data.user_IN_Info.id
        },
        "POST"
      )
      .then(res => {
        console.log("beforeShowAdressModal:", res);
        if (res.errno === 0) {
          that.setData({
            addressList: res.data
          });
          that.showAdressModal();
        } else {
          wx.showToast({
            title: "异常 ！ 请退出 !",
            icon: "none",
            duration: 1500,
            mask: true
          });
        }
      });
  },
  cutNumber: function() {
    this.setData({
      number: this.data.number - 1 > 1 ? this.data.number - 1 : 1
    });
  },
  addNumber: function() {
    this.setData({
      number: this.data.number + 1
    });
  },
  onReady: function() {
    // 页面渲染完成
  },
  onShow: function() {
    // 页面显示
    this.hideModal();
  },
  onHide: function() {
    // 页面隐藏
  },
  onUnload: function() {
    // 页面关闭
  }
});