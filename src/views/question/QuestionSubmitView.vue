<template>
  <div id="questionSubmitView">
    <a-form :model="searchParams" layout="inline" style="margin-left: 300px">
      <a-form-item field="questionId" label="Question number" tooltip="Please enter the question ID">
        <a-input
          v-model="searchParams.questionId"
          placeholder="Search question number"
        />
      </a-form-item>
      <a-form-item
        field="submitLanguage"
        label="programming language:"
        style="min-width: 240px"
      >
        <a-select
          v-model="searchParams.submitLanguage"
          placeholder="Choose language"
        >
          <a-option>java</a-option>
          <a-option>cpp</a-option>
          <a-option>csharp</a-option>
          <a-option>go</a-option>
          <a-option>python</a-option>
        </a-select>
      </a-form-item>
      <a-form-item>
        <a-button type="outline" shape="round" status="normal" @click="doSubmit"
          >search
        </a-button>
      </a-form-item>
      <a-form-item>
        <a-button
          type="primary"
          shape="round"
          status="success"
          @click="loadData"
          >refresh
        </a-button>
      </a-form-item>
    </a-form>
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
      <template #judgeInfo="{ record }">
        <a-space wrap>
          <a-tag
            size="medium"
            v-for="(info, index) of record.judgeInfo"
            :key="index"
            :color="colors[index.length % colors.length]"
          >
            {{
              `${
                index === "message"
                  ? "Result"
                  : index === "time"
                  ? "Time"
                  : "Memory"
              }`
            }}
            {{ "：" + info }}
          </a-tag>
        </a-space>
      </template>
      <template #createTime="{ record }">
        {{ moment(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
      </template>
      <template #questionId="{ record }">
        <a-link
          status="success"
          style="color: blue"
          @click="toQuestionPage(record)"
          >{{ record.questionId }}
        </a-link>
      </template>
      <template #submitState="{ record }">
        <!--        判题状态（0 - 待判题、1 - 判题中、2 - 成功、3 - 失败）-->
        <a-tag v-if="record.submitState === 0" color="cyan">Waiting</a-tag>
        <a-tag v-if="record.submitState === 1" color="green">Judging</a-tag>
        <a-tag v-if="record.submitState === 2" color="blue">Success</a-tag>
        <a-tag v-if="record.submitState === 3" color="red">Fail</a-tag>
      </template>
    </a-table>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, watchEffect } from "vue";
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
  const res = await QuestionControllerService.listQuestionSubmitByPageUsingPost(
    {
      ...searchParams.value,
      sortField: "createTime",
      sortOrder: "descend",
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
    title: "commit",
    dataIndex: "id",
    align: "center",
  },
  {
    title: "Question",
    slotName: "questionId",
    align: "center",
  },
  {
    title: "submitter",
    dataIndex: "userId",
    align: "center",
  },
  {
    title: "Judgment",
    slotName: "judgeInfo",
    align: "center",
  },
  {
    title: "language",
    dataIndex: "submitLanguage",
    align: "center",
  },
  {
    title: "status",
    slotName: "submitState",
    align: "center",
  },
  {
    title: "Creation",
    slotName: "createTime",
    align: "center",
  },
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
