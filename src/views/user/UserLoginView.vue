<template>
  <div id="userLoginView">
    <p style="text-align: center; margin-top: 20px; color: #999;">
      This is a demo account, you can enter your own account.
    </p>
    <h1 style="margin: 32px 0">Login FastOJ</h1>
    <a-form
      style="max-width: 320px; margin: 0 auto"
      label-align="left"
      auto-label-width
      :model="form"
    >
      <a-form-item
        required
        field="userAccount"
        label="Account"
        tooltip="Account number must be no less than 4 digits"
      >
        <a-input v-model="form.userAccount" placeholder="Please input Username" />
      </a-form-item>
      <a-form-item
        required
        field="userPassword"
        tooltip="Password must be no less than 8 characters"
        label="Password"
      >
        <a-input-password
          v-model="form.userPassword"
          placeholder="Please enter password"
        />
      </a-form-item>
    </a-form>
    <a-space wrap>
      <a-button
        size="large"
        shape="round"
        type="secondary"
        status="success"
        @click="toIndex"
      >
        Main
      </a-button>
      <a-button
        style="width: 120px; margin: 16px"
        size="large"
        shape="round"
        type="primary"
        html-type="submit"
        @click="handleSubmit"
      >
        Login
      </a-button>
      <a-button
        size="large"
        shape="round"
        type="outline"
        status="success"
        @click="toRegister"
      >
        Register
      </a-button>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { UserControllerService, UserLoginRequest } from "../../../backapi";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import { useStore } from "vuex";

/**
 * 表单信息
 */
const form = reactive({
  userAccount: "testUserAccount",
  userPassword: "testuserpassword",
} as UserLoginRequest);

const router = useRouter();
const store = useStore();

/**
 * 提交表单
 * @param data
 */
const handleSubmit = async () => {
  const res = await UserControllerService.userLoginUsingPost(form);
  // 登录成功，跳转到主页
  if (res.code === 0) {
    await store.dispatch("user/getLoginUser");
    // 将token保存在localStorage中
    // localStorage.setItem("token", res.data.token);
    router.push({
      path: "/",
      replace: true,
    });
    message.success("login successful!");
  } else {
    message.error("Login failed," + res.message);
  }
};
/**
 * 回到首页
 * @param question
 */
const toIndex = () => {
  router.push({
    path: `/`,
  });
};

const toRegister = () => {
  router.push({
    path: `/user/register`,
  });
};
</script>
