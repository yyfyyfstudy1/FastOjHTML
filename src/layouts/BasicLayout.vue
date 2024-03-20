<template>
  <div id="basicLayout">
    <a-layout style="min-height: 100vh">
      <a-layout-header class="header">
        <GlobalHeader />
      </a-layout-header>
      <a-layout-content class="content">
        <router-view />
      </a-layout-content>
      <a-layout-footer class="footer"
        ><a href="https://github.com/yyfyyfstudy1" target="_blank">
          FastOJ By YYfstudy</a
        >
      </a-layout-footer>
    </a-layout>
  </div>
</template>

<style scoped>
#basicLayout {
  margin: 0 20px;
}

#basicLayout .header {
  box-shadow: #eee 1px 1px 5px;
  height: 60px;
  margin: 5px;
}

#basicLayout .content {
  background: linear-gradient(to right, #fefefe, #fff);
  margin: 16px 0;
  border-radius: 10px;
}

#basicLayout .footer {
  padding: 16px;
  position: sticky;
  bottom: 0;
  right: 0;
  left: 0;
  text-align: center;
}
</style>
<script>
import GlobalHeader from "@/components/GlobalHeader";

export default {
  components: { GlobalHeader },
};
</script>
