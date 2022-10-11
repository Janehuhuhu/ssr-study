<template>
  <div id="app">
    <div>App1</div>
    <bar />
    <foo />
  </div>
</template>

<script>
import Bar from "./components/Bar.vue";
import Foo from "./components/Foo.vue";

export default {
  components: { Bar, Foo },
};
</script>