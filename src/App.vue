<template>
  <div>
    <v-header :seller="seller"></v-header>
    <div class="tab border-1px">
      <router-link class="tab-item" to="/goods">商品</router-link>
      <router-link class="tab-item" to="/ratings">评论</router-link>
      <router-link class="tab-item" to="/seller">商家</router-link>
    </div>
    <keep-alive>
      <router-view :seller="seller"></router-view>
    </keep-alive>
  </div>
</template>

<script>
  import header from 'components/header/header.vue';
  import {urlParse} from 'common/js/util';

  const ERR_OK = 0;

  export default {
    data() {
      return {
        seller: {
          id: (() => {
            let queryParam = urlParse();
            console.log(queryParam);
            return queryParam.id;
          })()
        }
      };
    },
    created() {
      this.$http.get('/api/seller?id=' + this.seller.id)
        .then((response) => {
          response = response.data;
          if (response.errno === ERR_OK) {
            this.seller = Object.assign({}, this.seller, response.data);
          }
        });
    },
    components: {
      'v-header': header
    }
  };
</script>

<style lang="scss" rel="stylesheet/scss">
  @import "./common/css/mixin";

  .tab {
    display: flex;
    width: 100%;
    height: 40px;
    line-height: 40px;
    @include border-1px(rgba(7, 17, 27, 0.1));
    .tab-item {
      flex: 1;
      text-align: center;
      display: block;
      font-size: 14px;
      color: rgb(77, 85, 93);
    }
    .active {
      color: rgb(240, 20, 20)
    }
  }

</style>
