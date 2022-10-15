<template>
  <div>
    Foo
    <button @click="clickHandler">点击</button>
    <div>{{this.$store.state.name}}</div>
  </div>
</template>

<script>
export default {
  // 只在服务端执行，并且只在页面组件中执行
  asyncData(store) {
    console.log('server')
    return store.dispatch('changeName')
  },
  methods: {
    clickHandler() {
      alert("我被点击啦");
    },
  },
};
</script>