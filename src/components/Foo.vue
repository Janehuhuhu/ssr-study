<template>
  <div>
    Foo
    <button @click="clickHandler">点击</button>
  </div>
</template>

<script>
export default {
  methods: {
    clickHandler() {
      alert("我被点击啦");
    },
  },
};
</script>