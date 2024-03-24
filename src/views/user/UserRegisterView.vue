<template>
  <div id="userLoginView">
    <h1 style="margin: 32px 0">Join us, FastOJ plateform</h1>
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
        :rules="[
          { required: true, message: 'Account cannot be empty' },
          { minLength: 4, message: 'The length cannot be less than 4 digits' },
        ]"
      >
        <a-input v-model="form.userAccount" placeholder="Please input Username" />
      </a-form-item>
      <a-form-item
        required
        field="userPassword"
        tooltip="Password cannot be less than 8 characters"
        :rules="[
          { required: true, message: 'password can not be blank' },
          { minLength: 4, message: 'Password cannot be less than 8 characters' },
        ]"
        label="Password"
      >
        <a-input-password
          v-model="form.userPassword"
          placeholder="Please enter password"
        />
      </a-form-item>
      <a-form-item
        required
        field="checkPassword"
        tooltip="Password must be no less than 8 characters"
        label="Confirm Password"
      >
        <a-input-password
          v-model="form.checkPassword"
          placeholder="Please confirm your password"
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
        style="margin: 25px; width: 150px"
        size="large"
        shape="round"
        type="primary"
        html-type="submit"
        @click="handleSubmit"
      >
        Register
      </a-button>
    </a-space>
  </div>
</template>

<script setup lang="ts">
import { reactive } from "vue";
import { UserControllerService, UserRegisterRequest } from "../../../backapi";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import { useStore } from "vuex";
import { Message } from "@arco-design/web-vue";

const router = useRouter();
const store = useStore();

const form = reactive<UserRegisterRequest>({
  checkPassword: "",
  userAccount: "",
  userPassword: "",
});

const handleSubmit = async () => {
  if (
    form?.checkPassword?.length !== form.userPassword?.length ||
    form.checkPassword !== form.userPassword
  ) {
    Message.error("The password entered twice is inconsistent");
    return;
  }

  // 拿到后端的响应
  const res = await UserControllerService.userRegisterUsingPost(form);
  // 登录成功跳转到主页
  if (res.code === 0) {
    // 获取到用户信息之后再跳转到主页
    await store.dispatch("user/getLoginUser");
    await router.push({
      path: "/user/login",
      replace: true,
    });
    message.success("registration success!");
  } else {
    message.error("registration failed!" + res.message);
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
</script>
