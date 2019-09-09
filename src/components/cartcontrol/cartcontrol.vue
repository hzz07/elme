<template>
  <div class="cartcontrol">
    <transition name="move">
      <div class="cart-decrease" v-show="food.count > 0" @click.stop.prevent="decreaseCart">
        <div class="inner icon-remove_circle_outline"></div>
      </div>
    </transition>
    <div class="cart-count" v-show="food.count > 0">{{food.count}}
    </div>
    <div class="cart-add icon-add_circle" @click.stop.prevent="addCart"></div>
  </div>
</template>

<script>
  import Vue from 'vue';

  export default {
    props: {
      food: {
        type: Object
      }
    },
    methods: {
      addCart() {
        if (!this.food.count) {
          Vue.set(this.food, 'count', 1);     // 向对象/数组添加是非响应的，强制响应
        } else {
          this.food.count++;
        }
        ;
        this.$emit('add', event.target);      // 触发当前实例上的事件，以便父元素@监听子元素。将点击的元素传入
      },
      decreaseCart() {
        if (this.food.count) {
          this.food.count--;
        }
      }
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../common/css/mixin";

  .cartcontrol {
    font-size: 0;
    .cart-decrease {
      display: inline-block;
      padding: 6px 0 6px 6px;
      opacity: 1;
      transform: translate3d(0, 0, 0);
      .inner {
        display: inline-block;
        line-height: 26px;
        font-size: 26px;
        color: #2d97fc;
        transition: all 0.2s linear; /* 线性 */
        transform: rotate(0);
      }
      &.move-enter-active, &.move-leave-active {
        transition: all 0.2s linear;
      }
      &.move-enter, &.move-leave-to {
        opacity: 0;
        transform: translate3d(24px, -2px, 0);
        .inner {
          transform: rotate(-180deg);
        }
      }
    }
    .cart-count {
      display: inline-block;
      vertical-align: top;
      width: 23px;
      padding-top: 6px;
      line-height: 26px;
      text-align: center;
      font-size: 14px;
      color: rgb(78, 78, 78);
      overflow: hidden;
      white-space: nowrap;
      text-overflow: ellipsis;
    }
    .cart-add {
      display: inline-block;
      padding: 6px 6px 6px 0;
      line-height: 26px;
      font-size: 26px;
      color: #2d97fc;
    }
  }

</style>
