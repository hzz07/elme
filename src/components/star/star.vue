<template>
  <div class="star" :class="starType">
    <span v-for="(itemClass,index) in itemClasses" :class="itemClass" class="star-item" key="index"></span>
  </div>
</template>

<script>
  const LENGTH = 5;
  const CLS_ON = 'on';
  const CLS_HALF = 'half';
  const CLS_OFF = 'off';
  // star 组件思路
  // 1. 接受两个来自父组件的值：星星大小size，评分score
  // 2. 根据size选择不同的class: starType
  // 3. 根据score计算数字转换成三种状态的star：on/ half/ off，依次组成数量为LENGTH的数组
  // 4. 并v-for遍历itemClasses，5个列表依次有不同的class值，渲染不同的star
  export default {
    props: {
      size: {
        type: Number
      },
      score: {
        type: Number
      }
    },
    computed: {
      starType() {
        return 'star-' + this.size;
      },
      itemClasses() {
        let result = [];
        let score = ~~(this.score * 2) / 2;
        let hasDecimal = score % 1 !== 0; // 是否有小数
        let integer = ~~(score);          // 整数
        for (let i = 0; i < integer; i++) {
          result.push(CLS_ON);
        }
        if (hasDecimal) {   // 是否有小数，只判断一次因为只可能有一颗半星
          result.push(CLS_HALF);
        }
        while (result.length < LENGTH) {  // 如果不够设定的颗数，加满
          result.push(CLS_OFF);
        }
        return result;
      }
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "../../common/css/mixin";

  .star {
    font-size: 0;
    .star-item {
      display: inline-block;
      background-repeat: no-repeat;
    }
    &.star-48 {
      .star-item {
        width: 20px;
        height: 20px;
        margin-right: 22px;
        background-size: 20px 20px;
        &:last-child {
          margin-right: 0;
        }
        &.on {
          @include bg-img('star48_on')
        }
        &.half {
          @include bg-img('star48_half')
        }
        &.off {
          @include bg-img('star48_off')
        }
      }
    }
    &.star-36 {
      .star-item {
        width: 15px;
        height: 15px;
        margin-right: 6px;
        background-size: 15px 15px;
        &:last-child {
          margin-right: 0;
        }
        &.on {
          @include bg-img('star36_on')
        }
        &.half {
          @include bg-img('star36_half')
        }
        &.off {
          @include bg-img('star36_off')
        }
      }
    }
    &.star-24 {
      .star-item {
        width: 10px;
        height: 10px;
        margin-right: 3px;
        background-size: 10px 10px;
        &:last-child {
          margin-right: 0;
        }
        &.on {
          @include bg-img('star24_on')
        }
        &.half {
          @include bg-img('star24_half')
        }
        &.off {
          @include bg-img('star24_off')
        }
      }
    }
  }
</style>
