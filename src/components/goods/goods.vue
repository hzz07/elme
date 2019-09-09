<template>
  <div>
    <div class="goods">
      <div class="menu-wrapper" ref="menuWrapper">
        <ul>
          <li v-for="(item, index) in goods" :key="index" class="menu-item" :class="{'current': currentIndex === index}"
              @click="selectMenu(index, $event)" ref="menuList">
          <span class="text border-1px">
            <span v-show="item.type > 0" class="icon" :class="classMap[item.type]"></span>{{item.name}}
          </span>
          </li>
        </ul>
      </div>
      <div class="foods-wrapper" ref="foodsWrapper">
        <ul>
          <li v-for="(item, index) in goods" :key="index" class="food-list" ref="foodList">
            <h1 class="title">{{item.name}}</h1>
            <ul>
              <li @click="selectFood(food, $event)" v-for="(food,index) in item.foods" :key="index"
                  class="food-item border-1px">
                <div class="icon">
                  <img :src="food.icon" width="70" height="70" alt="">
                </div>
                <div class="content">
                  <h2 class="name">{{food.name}}</h2>
                  <p class="desc">{{food.description}}</p>
                  <div class="extra">
                    <span class="count">月售{{food.sellCount}}份</span><span>好评率{{food.rating}}%</span>
                  </div>
                  <div class="price">
                    <span class="now"><span class="sign">￥</span>{{food.price}}</span>
                    <span class="old" v-show="food.oldPrice">￥{{food.oldPrice}}</span>
                  </div>
                  <div class="cartcontrol-wrapper">
                    <cartcontrol :food="food" @add="addFood"></cartcontrol>
                  </div>
                </div>
              </li>
            </ul>
          </li>
        </ul>
      </div>
      <shopcart ref="shopcart" :selectFoods="selectFoods" :deliveryPrice="seller.deliveryPrice"
                :minPrice="seller.minPrice"></shopcart>
    </div>
    <food @add="addFood" :food="selectedFood" ref="food"></food>
  </div>
</template>

<script>
  import BScroll from 'better-scroll';
  import shopcart from 'components/shopcart/shopcart.vue';
  import cartcontrol from 'components/cartcontrol/cartcontrol.vue';
  import food from 'components/food/food.vue';

  const ERR_OK = 0;

  export default {
    props: {
      seller: {
        type: Object
      }
    },
    data() {
      return {
        goods: [],
        listHeight: [],
        scrollY: 0,
        selectedFood: {}
      };
    },
    computed: {
      currentIndex() {    // 只有当 currentIndex === index 为true，应用的class才生效
        for (let i = 0; i < this.listHeight.length; i++) {
          let height1 = this.listHeight[i];
          let height2 = this.listHeight[i + 1];
          if (!height2 || (this.scrollY >= height1 && this.scrollY < height2)) {  // 如果最后一个height不存在，直接返回i
            this._followScroll(i);
            return i;
          }
        }
        return 0;
      },
      selectFoods() {
        let foods = [];
        this.goods.forEach((good) => {
          good.foods.forEach((food) => {
            if (food.count) {
              foods.push(food);
            }
          });
        });
        return foods;
      }
    },
    created() {
      this.$http.get('/api/goods')
        .then((response) => {
          response = response.data;
          if (response.errno === ERR_OK) {
            this.goods = response.data;
            this.$nextTick(() => {    // 为了确保 DOM 已经渲染
              // 替换成 setTimeout(fn, 20) 也是可以的（20 ms 是一个经验值，每一个 Tick 约为 17 ms），对用户体验而言都是无感知的
              this._initScroll();
              this._calculateHeight();
            });
          }
        });
      this.classMap = ['decrease', 'discount', 'special', 'invoice', 'guarantee'];
    },
    methods: {
      _initScroll() {
        // BScroll 依赖于 原生DOM
        this.meunScroll = new BScroll(this.$refs.menuWrapper, {
          click: true     // 开启点击事件（BS默认会阻止掉）
        });
        this.foodsScroll = new BScroll(this.$refs.foodsWrapper, {
          click: true,
          probeType: 3      // 设定BS 实时监测滚动位置
        });
        this.foodsScroll.on('scroll', (position) => {   // 这里要用箭头函数绑定this
          // 判断滑动方向，避免下拉时分类高亮错误（如第一分类商品数量为1时，下拉使得第二分类高亮）
          if (position.y <= 0) {
            this.scrollY = Math.abs(Math.round(position.y));
          }
        });
      },
      _calculateHeight() {
        let foodList = this.$refs.foodList; // 每个foodlist的高度就是每个区块的高度
        let height = 0;
        this.listHeight.push(height);
        for (let i = 0; i < foodList.length; i++) {
          height += foodList[i].clientHeight; // clientHeight 每个区块的可视高度
          this.listHeight.push(height);
        }
      },
      selectMenu(index, event) {
        if (!event._constructed) {
          return;
        }
        let foodList = this.$refs.foodList;
        let el = foodList[index];
        this.foodsScroll.scrollToElement(el, 300);   // BS接口，滚动至
      },
      addFood(target) {   // 监听子元素的add事件，执行addFodd函数
        this._drop(target);
      },
      _drop(target) {
        // 体验优化，异步执行下落动画
        this.$nextTick(() => {
          this.$refs.shopcart.drop(target); // 父组件访问子组件的方式，调用子组件的方法，传值
        });
      },
      selectFood(food, event) {
        if (!event._constructed) {
          return;
        }
        this.selectedFood = food;
        this.$refs.food.show();
      },
      _followScroll(index) {
        let menuList = this.$refs.menuList;
        let el = menuList[index];
        this.meunScroll.scrollToElement(el, 300);
      }
    },
    components: {
      shopcart,
      cartcontrol,
      food
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../common/css/mixin";

  .goods {
    display: flex;
    position: absolute;
    top: 174px;
    bottom: 46px;
    width: 100%;
    overflow: hidden;
    .menu-wrapper {
      flex: 0 0 80px;
      width: 80px; /*安卓下兼容*/
      background: #f3f5f7;
      .menu-item {
        display: table; /* 垂直居中且能自动换行 */
        height: 54px;
        width: 56px;
        line-height: 14px;
        padding: 0 12px;
        &.current {
          position: relative;
          z-index: 10;
          margin-top: -1px;
          background: #fff;
          .text {
            @include border-none();
            color: #000;
            font-weight: 500;
          }
        }
        .icon {
          display: inline-block;
          vertical-align: top;
          width: 12px;
          height: 12px;
          margin-right: 2px;
          background-size: 12px 12px;
          background-repeat: no-repeat;
          &.decrease {
            @include bg-img('decrease_3')
          }
          &.discount {
            @include bg-img('discount_3')
          }
          &.guarantee {
            @include bg-img('guarantee_3')
          }
          &.invoice {
            @include bg-img('invoice_3')
          }
          &.special {
            @include bg-img('special_3')
          }
        }
        .text {
          display: table-cell;
          width: 56px;
          vertical-align: middle; /*在table中居中*/
          @include border-1px(rgba(7, 17, 27, 0.1));
          font-size: 13px;
          color: rgb(78, 78, 78);
        }
      }
    }
    .foods-wrapper {
      flex: 1;
      .food-list {
        .title {
          padding: 0 0 0 14px;
          border-left: 2px solid #d9dde1;
          height: 26px;
          line-height: 26px;
          background: #f3f5f7;
          font-size: 12px;
          color: rgb(147, 153, 159);
        }
        .food-item {
          display: flex;
          margin: 12px;
          padding-bottom: 12px;
          @include border-1px(rgba(7, 17, 27, 0.1));
          &:last-child {
            @include border-none();
            margin-bottom: 0px;
          }
          .icon {
            flex: 0 0 57px;
            img {
              border-radius: 2px;
            }
          }
          .content {
            flex: 1;
            margin-left: 10px;
            .name {
              margin: 2px 0 8px 0;
              font-size: 16px;
              height: 14px;
              line-height: 14px;
              color: rgb(7, 17, 27);
              font-weight: 500;
              width: 136px;
              overflow: hidden;
              white-space: nowrap;
              text-overflow: ellipsis;
            }
            .desc, .extra {
              line-height: 10px;
              font-size: 10px;
            }
            .desc {
              margin-bottom: 8px;
              line-height: 10px;
              color: rgb(147, 153, 159);
            }
            .extra {
              color: rgb(78, 78, 78);
              .count {
                margin-right: 12px;
              }
            }
            .price {
              font-size: 0;
              line-height: 24px;
              .sign {
                font-size: 11px;
              }
              .now {
                margin-right: 8px;
                font-weight: 900;
                font-size: 16px;
                color: #fa3a12;
              }
              .old {
                text-decoration: line-through;
                font-size: 10px;
                color: rgb(147, 153, 159);
              }
            }
            .cartcontrol-wrapper {
              position: absolute;
              right: 0;
              bottom: 0;
            }
          }
        }
      }
    }
  }
</style>
