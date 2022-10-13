<template>
  <div id="app">
    <div>App1</div>
    <bar />
    <foo />
    <router-link to="/index">首页</router-link>
    <router-link to="/bar">详情页</router-link>
    <router-view></router-view>
  </div>
</template>

<script>
import Bar from "./components/Bar.vue";
import Foo from "./components/Foo.vue";

export default {
  components: { Bar, Foo },
};
</script>