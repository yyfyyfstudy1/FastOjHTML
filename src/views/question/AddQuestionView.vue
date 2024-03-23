<template>
  <div id="addQuestionView">
    <div
      style="
        font-size: 32px;
        text-align: center;
        font-weight: bold;
        margin-bottom: 16px;
      "
    >
      <template v-if="route.path.startsWith('/question/update')">
        Modify question information
      </template>
      <template v-else>Create question</template>
    </div>
    <a-form
      :model="form"
      size="medium"
      label-align="left"
      style="font-weight: bold; margin: 0 auto"
    >
      <a-form-item
        field="title"
        label="topic:"
        tooltip="It is recommended to fill in the questions"
        required
        :rules="[{ required: true, message: 'Question is required' }]"
      >
        <a-input
          v-model="form.title"
          placeholder="Please enter a title"
          style="max-width: 500px"
        />
      </a-form-item>
      <a-form-item
        field="tags"
        label="Title tag:"
        required
        tooltip="It is recommended to fill in the title tag"
      >
        <a-input-tag
          v-model="form.tags"
          placeholder="Please select a label"
          style="max-width: 500px"
        />
      </a-form-item>
      <a-form-item
        field="content"
        label="Question content:"
        required
        tooltip="It is recommended to fill in the question content"
      >
        <MdEditor :value="form.content" :handle-change="onContentChange" />
      </a-form-item>
      <a-form-item
        field="answer"
        label="Question answer:"
        required
        tooltip="It is recommended to fill in the answer to the question"
      >
        <MdEditor :value="form.answer" :handle-change="onAnswerChange" />
      </a-form-item>






      <a-form-item field="mainFunction" label="main function" required tooltip="please fill the main function">
          <CodeEditor
          v-if="form.mainFunction"
          :language="'java'"
          :value="form.mainFunction"
          :handle-change="changeMainCode"
          style="width: 95%; height:400px"
        />

        <CodeEditor
        v-else
        :language="'java'"
        :handle-change="changeMainCode"
        style="width: 95%; height:400px"
      />
      </a-form-item>


      <a-form-item field="userFunction" label="Question function" required tooltip="please fill the main function">
        <CodeEditor
        v-if="form.userFunction"
        :language="'java'"
        :value="form.userFunction"
        :handle-change="changeUserCode"
        style="width: 95%; height:400px"
      />

      <CodeEditor
        v-else
        :language="'java'"
        :handle-change="changeUserCode"
        style="width: 95%; height:400px"
      />
      </a-form-item>














      <a-divider :margin="10" />
      <a-form-item
        label="Question configuration:"
        :content-flex="false"
        :merge-props="false"
        required
        tooltip="It is recommended to fill in the question configuration"
      >
        <a-space direction="vertical" style="min-width: 500px">
          <a-form-item
            field="judgeConfig.timeLimit"
            label="time limit:"
            tooltip="Unit: ms (millisecond)"
          >
            <a-input-number
              v-model="form.judgeConfig.timeLimit"
              placeholder="Please enter a time limit"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item
            field="judgeConfig.memoryLimit"
            label="Memory limit:"
            tooltip="Unit: kb"
          >
            <a-input-number
              v-model="form.judgeConfig.memoryLimit"
              placeholder="Please enter memory limit"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
          <a-form-item
            field="judgeConfig.stackLimit"
            label="堆栈限制："
            tooltip="单位：kb"
          >
            <a-input-number
              v-model="form.judgeConfig.stackLimit"
              placeholder="请输入堆栈限制"
              mode="button"
              min="0"
              size="large"
            />
          </a-form-item>
        </a-space>
      </a-form-item>
      <a-divider :margin="10" />
      <a-form-item
        label="测试用例配置："
        :content-flex="false"
        :merge-props="false"
        required
        tooltip="建议填写测试用例配置"
      >
        <a-form-item
          v-for="(judgeCaseItem, index) of form.judgeCase"
          :key="index"
          no-style
        >
          <a-space direction="vertical" style="min-width: 650px">
            <a-form-item
              :field="`form.judgeCase[${index}].input`"
              :label="`第${index}个输入用例:`"
              :key="index"
              tooltip="主要的输入用例"
            >
              <a-input
                v-model="judgeCaseItem.input"
                placeholder="请输入测试输入用例"
              />
            </a-form-item>
            <a-form-item
              :field="`form.judgeCase[${index}].output`"
              :label="`第${index}个输出用例:`"
              :key="index"
              tooltip="主要的输出用例"
            >
              <a-input
                v-model="judgeCaseItem.output"
                placeholder="请输入测试输出用例"
              />
            </a-form-item>
          </a-space>
          <a-space direction="vertical" size="large">
            <a-button
              type="outline"
              status="danger"
              @click="handleDelete(index)"
              shape="round"
            >
              删除用例
            </a-button>
          </a-space>
        </a-form-item>
        <div style="margin-top: 5px">
          <a-button
            @click="handleAdd"
            type="outline"
            status="success"
            shape="round"
            >新增测试用例
          </a-button>
        </div>
      </a-form-item>
      <a-divider :margin="10" />
      <a-form-item>
        <a-button
          type="primary"
          style="min-width: 150px; margin: 0 150px"
          shape="round"
          @click="doSubmit"
          >提交
        </a-button>
      </a-form-item>
    </a-form>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import { QuestionControllerService } from "../../../backapi/index";
import message from "@arco-design/web-vue/es/message";
import { useRoute, useRouter } from "vue-router";
import CodeEditor from "@/components/CodeEditor.vue";

const router = useRouter();
const route = useRoute();
// 如果页面地址包含 update，视为更新页面
const updatePage = route.path.includes("update");

let form = ref({
  title: "",
  tags: [],
  answer: "",
  content: "",
  mainFunction:"",
  userFunction:"",

  judgeConfig: {
    memoryLimit: 1000,
    stackLimit: 1000,
    timeLimit: 1000,
  },
  judgeCase: [
    {
      input: "",
      output: "",
    },
  ],
});

/**
 * 根据题目 id 获取旧的数据
 */
const loadData = async () => {
  const id = route.query.id;
  if (!id) {
    return;
  }
  const res = await QuestionControllerService.getQuestionByIdUsingGet(
    id as any
  );
  if (res.code === 0) {
    form.value = res.data as any;
    // json 转 js 对象
    if (!form.value.judgeCase) {
      form.value.judgeCase = [
        {
          input: "",
          output: "",
        },
      ];
    } else {
      form.value.judgeCase = JSON.parse(form.value.judgeCase as any);
    }
    if (!form.value.judgeConfig) {
      form.value.judgeConfig = {
        memoryLimit: 1000,
        stackLimit: 1000,
        timeLimit: 1000,
      };
    } else {
      form.value.judgeConfig = JSON.parse(form.value.judgeConfig as any);
    }
    if (!form.value.tags) {
      form.value.tags = [];
    } else {
      form.value.tags = JSON.parse(form.value.tags as any);
    }
  } else {
    message.error("加载失败，" + res.message);
  }
};

onMounted(() => {
  loadData();
});

/**
 * 提交
 */
const doSubmit = async () => {
  console.log(">>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>>.")
  console.log(form.value);
  // 区分更新还是创建
  if (updatePage) {
    const res = await QuestionControllerService.updateQuestionUsingPost(
      form.value
    );
    if (res.code === 0) {
      // 更新成功则返回到管理界面
      message.success("update completed");
      await router.push({
        path: "/question/manage",
        replace: true,
      });
    } else {
      message.error("Update failed," + res.message);
    }
  } else {
    const res = await QuestionControllerService.addQuestionUsingPost(
      form.value
    );
    if (res.code === 0) {
      message.success("Created successfully");
      // 添加成功后清空
      form.value.answer = "";
      form.value.tags = [];
      form.value.judgeCase = [];
      form.value.content = "";
      form.value.title = "";
      form.value.mainFunction = "";
      form.value.userFunction = ""
    } else {
      message.error("Creation failed," + res.message);
    }
  }
};

/**
 * 新增判题用例
 */
const handleAdd = () => {
  form.value.judgeCase.push({
    input: "",
    output: "",
  });
};

/**
 * 删除判题用例
 */
const handleDelete = (index: number) => {
  form.value.judgeCase.splice(index, 1);
};

const onContentChange = (value: string) => {
  form.value.content = value;
};

const onAnswerChange = (value: string) => {
  form.value.answer = value;
};
const changeMainCode = (value: string) => {
  form.value.mainFunction = value;
  console.log(form.value.mainFunction )
};
const changeUserCode = (value: string) => {
  form.value.userFunction = value;
};

</script>

<style scoped>
#addQuestionView {
  margin: 0 auto;
  padding: 10px;
  max-width: 1000px;
  background: linear-gradient(to right, #efefef, #fff, #efefef);
  border-radius: 10px;
  box-shadow: 0px 0px 10px rgba(35, 7, 7, 0.21);
}

.arco-form-item-label-col-left {
  justify-content: flex-end;
}

:deep(.bytemd-fullscreen.bytemd) {
  z-index: 100;
}
</style>
