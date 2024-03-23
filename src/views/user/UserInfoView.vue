<template>
  <div id="userInfoView">
    <a-descriptions-item>
      <a-avatar :size="100" shape="circle">
        <img alt="Avatar" :src="loginUser.userAvatar" />
      </a-avatar>
    </a-descriptions-item>
    <a-card title="My Information">
      <a-descriptions :data="data" size="large" column="1" bordered />
      <template #extra>
        <a-badge status="success" text="Online" />
      </template>
    </a-card>
    <a-modal
      width="30%"
      :visible="visible"
      placement="right"
      @ok="handleOk"
      @cancel="closeModel"
      unmountOnClose
    >
      <div style="text-align: center">
        <a-upload
          action="/"
          :fileList="file ? [file] : []"
          :show-file-list="false"
          @change="onChange"
          :custom-request="uploadAvatar"
        >
          <template #upload-button>
            <div
              class="arco-upload-list-picture custom-upload-avatar"
              v-if="updateForm.userAvatar"
            >
              <a-avatar :size="70" shape="circle">
                <img alt="Avatar" :src="userAvatarImg" />
              </a-avatar>
              <div class="arco-upload-list-picture-mask">
                <IconEdit />
              </div>
            </div>
          </template>
        </a-upload>
      </div>
      <a-form
        :model="loginUser"
        label-align="right"
        title="PersonalInfo"
        style="max-width: 480px; margin: 0 auto"
      >
        <a-form-item field="username" label="account :">
          <a-input v-model="updateForm.userName" placeholder="Please enter username" />
        </a-form-item>
        <a-form-item field="Email" label="Email :">
          <a-input v-model="updateForm.email" placeholder="Please enter email" />
        </a-form-item>
        <a-form-item field="Phone" label="Phone :">
          <a-input v-model="updateForm.phone" placeholder="Please enter phone number" />
        </a-form-item>
        <a-form-item field="userProfile" label="Introduct:">
          <a-textarea
            v-model="updateForm.userProfile"
            placeholder="Please enter the introduction"
          />
        </a-form-item>
      </a-form>
    </a-modal>
    <div>
      <a-button
        shape="round"
        status="success"
        size="small"
        type="outline"
        style="margin: 10px"
      >
        <a-link @click="toIndex">Main</a-link>
      </a-button>
      <a-button
        shape="round"
        status="normal"
        size="medium"
        type="outline"
        style="margin: 10px"
        @click="openModalForm"
        >Modify User Information
      </a-button>
    </div>
  </div>
</template>
<script setup lang="ts">
import { useStore } from "vuex";
import {
  FileControllerService,
  UserControllerService,
  UserUpdateMyRequest,
} from "../../../backapi";
import { ref } from "vue";
import { FileItem, Message } from "@arco-design/web-vue";
import { useRouter } from "vue-router";
import moment from "moment";

const router = useRouter();
const file = ref();
/**
 * 获取用户信息
 */
const store = useStore();
let loginUser = store.state.user.loginUser;

const data = [
  {
    label: "Nickname:",
    value: loginUser.userName,
  },
  {
    label: "Username:",
    value: loginUser.userAccount,
  },
  {
    label: "About me:",
    value: loginUser.userProfile,
  },
  {
    label: "User Role：",
    value: loginUser.userRole === "user" ? "General User" : "Admin User",
  },
  {
    label: "Email：",
    value: loginUser.email !== "" ? loginUser.email : "unfilled",
  },
  {
    label: "Phone：",
    value: loginUser.phone !== "" ? loginUser.phone : "unfilled",
  },
  {
    label: "Status：",
    value: loginUser.userState !== "" ? loginUser.userState : "No profile yet",
  },

  {
    label: "Create time:",
    value: moment(loginUser.createTime).format("YYYY-MM-DD HH:mm:ss"),
  },
  {
    label: "Update Time：",
    value: moment(loginUser.updateTime).format("YYYY-MM-DD HH:mm:ss"),
  },
];

const visible = ref(false);
const updateForm = ref<UserUpdateMyRequest>({
  ...store.state.user?.loginUser,
});

// 从表单中获取的用户头像
let userAvatarImg = updateForm.value.userAvatar;

/**
 * 上传头像
 */
const uploadAvatar = async () => {
  const res = await FileControllerService.uploadOssFileUsingPost(
    file?.value.file
  );
  if (res.code === 0) {
    userAvatarImg = res.data;
    Message.success("The upload is successful, click Confirm to modify the avatar.");
  } else {
    Message.error("upload failed!" + res.data);
  }
};
/**
 * 打开弹窗
 */
const openModalForm = () => {
  visible.value = true;
};
/**
 * 确定修改按钮
 */
const handleOk = async () => {
  const res = await UserControllerService.updateMyUserUsingPost({
    ...updateForm.value,
    userAvatar: userAvatarImg,
  });
  if (res.code === 0) {
    Message.success("update completed!");
    visible.value = false;
    location.reload();
  } else {
    Message.error("Update failed!", res.msg);
  }
};
const closeModel = () => {
  visible.value = false;
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
const onChange = async (_: never, currentFile: FileItem) => {
  file.value = {
    ...currentFile,
  };
};
</script>

<style scoped>
#userInfoView {
  margin: 0 auto;
  padding: 10px;
  max-width: 820px;
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(35, 7, 7, 0.21);
}
</style>
