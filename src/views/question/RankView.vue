<template>
  <div id="questionSubmitView">
    <a-divider size="0" />
    <a-table
      column-resizable
      wrapper
      :ref="tableRef"
      :columns="columns"
      :data="dataList"
      :pagination="{
        showTotal: true,
        pageSize: searchParams.pageSize,
        current: searchParams.current,
        total,
        showJumper: true,
        showPageSize: true,
      }"
      @page-change="onPageChange"
      @pageSizeChange="onPageSizeChange"
    >
    <template #rankSlot="{ record }">
      <div v-if="record.userRank <= 3">
        <img v-if="record.userRank === 1" src="../../assets/gold.png" alt="Gold" style="width: 30px;" />
        <img v-else-if="record.userRank === 2" src="../../assets/bronze.png" alt="Silver" style="width: 30px;" />
        <img v-else-if="record.userRank === 3" src="../../assets/sliver.png" alt="Bronze" style="width: 30px;" />
      </div>
      <div v-else>
        {{ record.userRank }}
      </div>
    </template>
    
    <template #userAvatar="{ record }">
      <img :src="record.userAvatar" alt="Avatar" style="width: 50px; height: 50px; border-radius: 50%;" />
    </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref,h,watchEffect } from "vue";
import {
  QuestionControllerService,
  QuestionSubmitQueryRequest,
} from "../../../backapi";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import moment from "moment";

const tableRef = ref();
const dataList = ref([]);
const total = ref(0);
// 搜索请求
const searchParams = ref<QuestionSubmitQueryRequest>({
  questionId: undefined,
  submitLanguage: undefined,
  pageSize: 10,
  current: 1,
});

const colors = ["orange", "green", "blue", "red"];

const loadData = async () => {
  const res = await QuestionControllerService.listTopUserUsingPost(
    {
      ...searchParams.value,
    }
  );
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("加载失败，" + res.message);
  }
};

/**
 * 监听 searchParams 变量，改变时触发页面的重新加载
 */
watchEffect(() => {
  loadData();
});

/**
 * 页面加载时，请求数据
 */
onMounted(() => {
  loadData();
});

const columns = [
  {
    title: "Rank",
    slotName: 'rankSlot', 
    align: "center",
  },
  {
    title: "Avatar",
    align: "center",
    slotName: 'userAvatar', // 添加 slot 属性
  },
  {
    title: "nickname",
    dataIndex: "userName",
    align: "center",
  },
  {
    title: "Email",
    dataIndex: "email",
    align: "center",
  },
  {
    title: "Accepted",
    dataIndex: "questionPass",
    align: "center",
  }
];
/**
 * 当前分页
 * @param page
 */
const onPageChange = (page: number) => {
  searchParams.value = {
    ...searchParams.value,
    current: page,
  };
};
/**
 * 分页大小
 * @param size
 */
const onPageSizeChange = (size: number) => {
  searchParams.value = {
    ...searchParams.value,
    pageSize: size,
  };
};
const router = useRouter();

/**
 * 跳转到做题页面
 * @param question
 */
const toQuestionPage = (questionId: QuestionSubmitQueryRequest) => {
  router.push({
    path: `/question/view/${questionId.questionId}`,
  });
};

/**
 * 确认搜索，重新加载数据
 */
const doSubmit = () => {
  // 这里需要重置搜索页号
  searchParams.value = {
    ...searchParams.value,
    current: 1,
  };
};
</script>

<style scoped>
#questionSubmitView {
  max-width: 1280px;
  margin: 0 auto;
  border-radius: 10px;
}
</style>
