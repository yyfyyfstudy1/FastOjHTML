<template>
  <div id="questionSubmitView">
    <div v-if="!showDetails">
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
          <div @click="handleItemClick(record)">
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
          </div>
        </template>
        <template #createTime="{ record }">
          <div @click="handleItemClick(record)">
          {{ moment(record.createTime).format("YYYY-MM-DD HH:mm:ss") }}
          </div>
        </template>

        <template #submitState="{ record }">
          <div @click="handleItemClick(record)">
          <!--        判题状态（0 - 待判题、1 - 判题中、2 - 成功、3 - 失败）-->
          <a-tag v-if="record.submitState === 0" color="cyan">Waiting</a-tag>
          <a-tag v-if="record.submitState === 1" color="blue">Judging</a-tag>
          <a-tag v-if="record.submitState === 2" color="green">Success</a-tag>
          <a-tag v-if="record.submitState === 3" color="red">Failed</a-tag>
          </div>
        </template>
      </a-table>
    </div>
    <div v-else>
      <!-- 详情视图 -->
      <div style="display: flex; align-items: center; justify-content: space-between; margin-bottom: 10p; margin-left:10px; margin-right:10px">
        <h3 style="margin: 0;">Code Detail</h3>
        <a href="#" style="text-decoration: underline; cursor: pointer;" @click.prevent="backToList"><h3>Back</h3></a>
      </div>

      
      <CodeEditor
        :language="'java'"
        :value="historyCode"
        :readOnly="true"
        style="height: 450px"
      />
    </div>
  </div>
</template>

<script setup lang="ts">
import {
  onMounted,
  ref,
  defineExpose,
  watchEffect,
  defineProps,
  defineEmits,
} from "vue";
import {
  QuestionControllerService,
  QuestionSubmitQueryRequest,
} from "../../backapi";
import message from "@arco-design/web-vue/es/message";
import { useRouter } from "vue-router";
import CodeEditor from "@/components/CodeEditor.vue";
import moment from "moment";
const showDetails = ref(false); // 控制是否显示详情视图
const tableRef = ref();
const dataList = ref([]);
const total = ref(0);
const historyCode = ref("");
// 搜索请求
const searchParams = ref<QuestionSubmitQueryRequest>({
  questionId: props.queId as any,
  submitLanguage: undefined,
  pageSize: 10,
  current: 1,
});

const props = defineProps({
  queId: String,
});

const colors = ["orange", "green", "blue", "blue"];

const loadData = async () => {
  backToList()
  const res = await QuestionControllerService.listUserSubmissionUsingPost({
    ...searchParams.value,
    sortField: "createTime",
    sortOrder: "descend",
  });
  if (res.code === 0) {
    dataList.value = res.data.records;
    total.value = res.data.total;
  } else {
    message.error("加载失败，" + res.message);
  }
};

defineExpose({ loadData });
const emit = defineEmits(["itemClicked"]);

function handleItemClick(item) {

  const targetRecord = dataList.value.find((itemUse) => itemUse.id == item.id);

  historyCode.value = targetRecord.submitCode;
  showDetails.value = true;

}

function backToList(){
  showDetails.value = false;
}
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
    title: "Submission",
    slotName: "submitState",
    align: "center",
  },
  {
    title: "Information",
    slotName: "judgeInfo",
    align: "center",
  },
  {
    title: "language",
    dataIndex: "submitLanguage",
    align: "center",
  },
  {
    title: "Create Time",
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
