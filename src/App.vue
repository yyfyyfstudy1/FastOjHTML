<template>
  <div id="app">
    <a-config-provider :locale="enUS">
    <template v-if="route.path.startsWith('/user')">
      <router-view />
    </template>
    <template v-else>
      <BasicLayout />
    </template>
  </a-config-provider>
  </div>
</template>

<style>
#app {
}
</style>
<script setup lang="ts">
import BasicLayout from "@/layouts/BasicLayout.vue";
import { onMounted } from "vue";
import { useRoute } from "vue-router";
import enUS from '@arco-design/web-vue/es/locale/lang/en-us';

const route = useRoute();
/**
 * todo 全局初始化函数，有全局单次调用的代码，都可以写到这里
 */
const doInit = () => {
  console.log(
  "?????????????????////"
  );
};

onMounted(() => {
  doInit();
});
</script>
