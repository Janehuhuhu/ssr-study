<template>
  <div id="app">
    <div>App1</div>
    <bar />
    <foo />
    <h3>vue-router样例</h3>
    <router-link to="/index">首页</router-link>
    <router-link to="/bar">详情页</router-link>
    <router-view></router-view>
    <h3>vuex样例</h3>
  </div>
</template>

<script>
import Bar from "./components/Bar.vue";
import Foo from "./components/Foo.vue";

export default {
  components: { Bar, Foo },
  mounted() {
    console.log('sss')
    // console.log(this.$store)
  }
};
</script>