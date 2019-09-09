<template>
  <div>
    <div class="shopcart">
      <div class="content" @click="toggleList">
        <div class="content-left">
          <div class="logo-wrapper">
            <div class="logo" :class="{highlight: totalCount > 0}">
              <i class="icon-shopping_cart" :class="{highlight: totalCount > 0}"></i>
            </div>
            <div class="num" v-show="totalCount > 0">{{totalCount}}</div>
          </div>
          <div class="price" :class="{highlight: totalPrice > 0}">￥{{totalPrice}}</div>
          <div class="desc">另需配送费￥{{deliveryPrice}}元</div>
        </div>
        <div class="content-right" @click.stop.prevent="pay">
          <div class="pay" :class="payClass">
            {{payDesc}}
          </div>
        </div>
      </div>
      <div class="ball-container">
        <div v-for="ball in balls">
          <transition name="drop" @before-enter="beforeDrop" @enter="dropping" @after-enter="afterDrop">
            <div class="ball" v-show="ball.show">
              <div class="inner inner-hook"></div>
            </div>
          </transition>
        </div>
      </div>
      <transition name="fold">
        <div class="shopcart-list" v-show="listShow">
          <div class="list-header">
            <div class="title">
              <span>已选商品</span>
            </div>
            <span class="empty" @click="empty">清空</span>
          </div>
          <div class="list-content" ref="listContent">
            <ul>
              <li v-for="food in selectFoods" class="food">
                <span class="name">{{food.name}}</span>
                <div class="price">
                  <span class="totalPrice"><span class="sign">￥</span>{{food.price * food.count}}</span>
                </div>
                <div class="cartcontrol-wrapper">
                  <!-- 必须传:food="food"，cartcontrol组件才生效  -->
                  <cartcontrol :food="food"></cartcontrol>
                </div>
              </li>
            </ul>
          </div>
        </div>
      </transition>
    </div>
    <transition name="fade">
      <div class="list-mask" v-show="listShow" @click="hideList"></div>
    </transition>
  </div>
</template>

<script>
  import BScroll from 'better-scroll';
  import cartcontrol from 'components/cartcontrol/cartcontrol.vue';

  export default {
    props: {
      selectFoods: {
        type: Array,
        default() {
          return [
            {
              price: 10,
              count: 0
            }
          ];
        }
      },
      deliveryPrice: {
        type: Number,
        default: 0
      },
      minPrice: {
        type: Number,
        default: 0
      }
    },
    data() {
      return {
        balls: [            // 5个小球 解决在前一个小球没有下落后又点击的问题
          {
            show: false
          },
          {
            show: false
          },
          {
            show: false
          },
          {
            show: false
          },
          {
            show: false
          }
        ],
        dropBalls: [],
        fold: true       // 默认折叠
      };
    },
    computed: {
      payClass() {
        if (this.totalPrice < this.minPrice) {
          return 'not-enough';
        } else {
          return 'enough';
        }
      },
      totalPrice() {
        let total = 0;
        this.selectFoods.forEach((food) => {
          total += food.price * food.count;
        });
        return total;
      },
      totalCount() {
        let count = 0;
        this.selectFoods.forEach((food) => {
          count += food.count;
        });
        return count;
      },
      payDesc() {
        if (this.totalPrice === 0) {
          return `￥${this.minPrice}元起送`;
        } else if (this.totalPrice < this.minPrice) {
          let diff = this.minPrice - this.totalPrice;
          return `还差${diff}元起送`;
        } else {
          return `去结算`;
        }
      },
      listShow() {
        if (!this.totalCount) {
          this.fold = true;
          return false;
        }
        let show = !this.fold;
        // 添加滚动
        if (show) {
          this.$nextTick(() => {
            if (!this.shopcartListScroll) {
              this.shopcartListScroll = new BScroll(this.$refs.listContent, {
                click: true
              });
            } else {
              // 根据每次toggle计算高度来决定能否滚动
              this.shopcartListScroll.refresh();
            }
          });
        }
        return show;
      }
    },
    methods: {
      drop(el) {   // 拿到cartcontrol点击的元素
        for (let i = 0; i < this.balls.length; i++) {
          let ball = this.balls[i];
          if (!ball.show) {   // 循环所有ball，找出未show
            ball.show = true;
            ball.el = el;
            this.dropBalls.push(ball);
            return;
          }
        }
      },
      // 小球执行步骤:
      // 1. 点击cartcontrol组件中的”加号按钮“，$emit添加触发事件，将event.target作为参数，由goods父组件监听
      // 2. goods组件接收事件和target，执行_drop(target)，调用shopcart子组件的drop(el)方法，传入了target
      // 3. shopcart 组件执行 drop(el) 方法时，获取el在视口中的位置，编程式调用ball元素的过渡hook接口，执行css过渡

      // 过渡 钩子
      // 动画的原理是先把它偏移到一个位置，然后按照一定的轨迹和时间完成动画，动画完成后要把位置重置
      beforeDrop(el) {    // el 是Vue 钩子选择作用动画的 DOM 对象
        let count = this.balls.length;
        while (count--) {
          let ball = this.balls[count];
          if (ball.show) {
            let rect = ball.el.getBoundingClientRect(); // 得到元素距视口各边的偏移量
            // 是相对于小球初始位置的，所以 x 是正的，y 是负的
            let x = rect.left - 32;
            let y = -(window.innerHeight - rect.top - 36);
            el.style.display = '';        // 手动设置为空，小球会显示出来
            el.style.webkitTransform = `translate3d(0,${y}px,0)`;
            el.style.transform = `translate3d(0,${y}px,0)`;
            let inner = el.getElementsByClassName('inner-hook')[0];   // 获取当前el的innerDom节点
            inner.style.webkitTransform = `translate3d(${x}px,0,0)`;
            inner.style.transform = `translate3d(${x}px,0,0)`;
          }
        }
      },
      dropping(el, done) {  // Vue enter 的第二个参数必须给，否则会设置成同步
        /* eslint-disable no-unused-vars */
        let rf = el.offsetHeight;
        // 触发浏览器重绘，可以保证 dom 位置渲染正确后再执行之后的动画
        this.$nextTick(() => {
          el.style.webkitTransform = 'translate3d(0,-10px,0)';
          el.style.transform = 'translate3d(0,-10px,0)';
          let inner = el.getElementsByClassName('inner-hook')[0];
          inner.style.webkitTransform = 'translate3d(0,0,0)';
          inner.style.transform = 'translate3d(0,0,0)';
          // 告知Vue，一个小球动画完成
          el.addEventListener('transitionend', done);   // 当动画结束，会有  CSS3 transitionend 事件派发
        });
      },
      afterDrop(el) {
        // 首先触发afterDrop是最先落的小球，所以把第一项也就是先落的小球重置
        let ball = this.dropBalls.shift();    // 删除dropBalls第一项，并返回此项
        if (ball) {
          ball.show = false;
          el.style.display = 'none';
        }
      },
      toggleList() {
        if (this.totalCount) {
          this.fold = !this.fold;
        }
      },
      empty() {
        this.selectFoods.forEach((food) => {
          food.count = 0;
        });
      },
      hideList() {
        this.fold = true;
      },
      pay() {
        if (this.totalPrice < this.minPrice) {
          return;
        } else {
          window.alert(`请支付${this.totalPrice + this.deliveryPrice}元`);
        }
        ;
      }
    },
    components: {
      cartcontrol
    }
  };
</script>


<style lang="scss" rel="stylesheet/scss">
  @import "../../common/css/mixin";

  .shopcart {
    position: fixed;
    left: 0;
    bottom: 0;
    z-index: 50;
    width: 100%;
    height: 48px;
    .content {
      display: flex;
      background: #141d27;
      font-size: 0;
      color: rgba(255, 255, 255, 0.4);
      .content-left {
        flex: 1;
        .logo-wrapper {
          display: inline-block;
          vertical-align: top;
          position: relative;
          top: -10px;
          margin: 0 12px;
          padding: 6px;
          width: 56px;
          height: 56px;
          box-sizing: border-box;
          border-radius: 50%;
          background: #141d27;
          @media only screen and (max-width: 320px) {
            margin-left: 6px;
            margin-right: 0px;
          }
          .num {
            position: absolute;
            top: 0;
            right: 0;
            width: 24px;
            height: 16px;
            line-height: 16px;
            text-align: center;
            border-radius: 16px;
            font-size: 9px;
            font-weight: 700;
            color: #fff;
            background: rgb(240, 20, 20);
            box-shadow: 0 4px 8px 0 rgba(0, 0, 0, 0.4);
          }
          .logo {
            width: 100%;
            height: 100%;
            border-radius: 50%;
            background: #2b343c;
            text-align: center;
            &.highlight {
              background: #2d97fc;
            }
            .icon-shopping_cart {
              font-size: 24px;
              line-height: 44px;
              color: #80858a;
              &.highlight {
                color: #fff;
              }
            }
          }
        }
        .price {
          display: inline-block;
          vertical-align: top;
          margin-top: 13px;
          line-height: 24px;
          padding-right: 12px;
          box-sizing: border-box;
          border-right: 1px solid rgba(255, 255, 255, 0.1);
          font-size: 18px;
          font-weight: 700;
          @media only screen and (max-width: 320px) {
            padding-right: 6px;
          }
          &.highlight {
            color: #fff;
          }
        }
        .desc {
          display: inline-block;
          vertical-align: top;
          line-height: 24px;
          margin: 12px 0 0 12px;
          font-size: 12px;
          @media only screen and (max-width: 320px) {
            margin: 12px 0 0 6px;
            font-size: 10px;
          }
        }
      }
      .content-right {
        flex: 0 0 105px;
        width: 105px;
        @media only screen and (max-width: 320px) {
          flex: 0 0 95px;
          width: 95px;
        }
        .pay {
          height: 50px;
          line-height: 50px;
          text-align: center;
          font-size: 14px;
          font-weight: 700;
          background: #2b333b;
          &.not-enough {
            background: #2b333b;
          }
          &.enough {
            background: #00b43c;
            color: #fff;
          }
        }
      }
    }
    .ball-container {
      .ball {
        position: fixed;
        left: 32px;
        bottom: 22px;
        z-index: 200;
        .inner {
          width: 16px;
          height: 16px;
          border-radius: 50%;
          background: rgb(0, 160, 220);
        }
        &.drop-enter-active {
          transition: all .4s cubic-bezier(.49, -0.29, .75, .41);
          .inner {
            transition: all .4s linear;
          }
        }
      }
    }
    .shopcart-list {
      position: absolute;
      top: 0;
      left: 0;
      z-index: -1;
      width: 100%;
      transform: translate3d(0, -100%, 0);
      &.fold-enter-active, &.fold-leave-active {
        transition: all 0.3s;
      }
      &.fold-enter, &.fold-leave-to {
        transform: translate3d(0, 0, 0);
      }
      .list-header {
        height: 40px;
        line-height: 40px;
        padding: 0 18px;
        background: #f3f5f7;
        border-bottom: 1px solid rgba(7, 17, 27, 0.1);
        .title {
          float: left;
          font-size: 14px;
          font-weight: 700;
          color: #555;
          span {
            border-left: 3px solid #2d97fc;
            padding-left: 5px;
          }
        }
        .empty {
          float: right;
          font-size: 12px;
          color: rgb(0, 160, 220);
        }
      }
      .list-content {
        padding: 0 18px;
        max-height: 240px;
        overflow: hidden;
        background: #ffffff;
        .food {
          position: relative;
          padding: 12px 0;
          box-sizing: border-box;
          @include border-1px(rgba(7, 17, 27, 0.1));
          .name {
            line-height: 24px;
            font-size: 14px;
            color: rgb(7, 17, 27);
          }
          .price {
            position: absolute;
            right: 90px;
            bottom: 10px;
            line-height: 26px;
            color: #fa3a12;
            .totalPrice {
              font-size: 16px;
              font-weight: 900;
              .sign {
                font-size: 11px;
                font-weight: 900;
              }
            }
          }
          .cartcontrol-wrapper {
            position: absolute;
            right: 0;
            bottom: 5px;
          }
        }
      }
    }
  }

  .list-mask {
    position: fixed;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    z-index: 40;
    opacity: 1;
    background: rgba(0, 0, 0, 0.5);
    &.fade-enter-active, &.fade-leave-active {
      transition: all .3s;
    }
    &.fade-enter, &.fade-leave-to {
      opacity: 0;
      background: rgba(0, 0, 0, 0);
    }
  }

</style>
