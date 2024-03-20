<template>
  <div id="viewQuestionView">
    <a-row :gutter="[24, 24]">
      <a-col :md="12" :xs="24">
        <a-tabs v-model:activeKey="activeTabKey" default-active-key="question">
          <a-tab-pane key="question" title="题目">
            <a-card v-if="question" :title="question.title">
              <a-descriptions
                title="判题条件:"
                :column="{ xs: 1, md: 2, lg: 3 }"
              >
                <a-descriptions-item label="时间限制（ms）：">
                  {{ question.judgeConfig.timeLimit ?? 0 }}
                </a-descriptions-item>
                <a-descriptions-item label="内存限制（KB）：">
                  {{ question.judgeConfig.memoryLimit ?? 0 }}
                </a-descriptions-item>
                <a-descriptions-item label="堆栈限制（KB）：">
                  {{ question.judgeConfig.stackLimit ?? 0 }}
                </a-descriptions-item>
              </a-descriptions>
              <MdViewer :value="question.content || ''" />
              <template #extra>
                <a-space wrap>
                  <a-tag
                    v-for="(tag, index) of question.tags"
                    :key="index"
                    color="green"
                    >{{ tag }}
                  </a-tag>
                </a-space>
              </template>
            </a-card>
          </a-tab-pane>


          <a-tab-pane key="comment" title="评论"> 
            <a-card :key="activeTabKey"/>
          </a-tab-pane>


          <a-tab-pane key="answer" title="Submissions"> 
            
            <!-- 内嵌用户提交代码视图 -->
            <UserSubmitView :queId="id"  :key="activeTabKey"  ref="userSubmitViewRef" @itemClicked="handleItemClicked"/>
            
          </a-tab-pane>

      
        </a-tabs>
      </a-col>
      <a-col :md="12" :xs="24">
        <a-form :model="form" layout="inline">
          <a-form-item
            field="submitLanguage"
            label="编程语言："
            style="min-width: 240px"
          >
            <a-select v-model="form.submitLanguage" placeholder="选择编程语言">
              <a-option>java</a-option>
              <a-option disabled>敬请其他更多语言</a-option>
            </a-select>

            <a-button
            shape="round"
            type="primary"
            style="min-width: 150px; margin-left: 340px"
            size="large"
            @click="doSubmit"
            >
            Submit
          </a-button>
          </a-form-item>

          
        </a-form>
        
        <CodeEditor
          v-if="form.submitCode"
          :language="form.submitLanguage"
          :value="form.submitCode"
          :handle-change="changeCode"
          :theme="'vs-dark'"
        />
        <CodeEditor
        v-else
        :language="form.submitLanguage"
        :handle-change="changeCode"
        :theme="'vs-dark'"
      />
        
      </a-col>
    </a-row>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, withDefaults, defineProps ,nextTick , watch, defineExpose } from "vue";
import {
  QuestionControllerService,
  QuestionSubmitAddRequest,
  QuestionVO,
} from "../../../backapi";
import message from "@arco-design/web-vue/es/message";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import UserSubmitView from "@/components/UserSubmitView.vue";

interface Props {
  id: string;
}

/**
 * 获取到动态路由 id
 */
const props = withDefaults(defineProps<Props>(), {
  id: () => "",
});
const activeTabKey = ref('question'); // 控制激活的Tab

const question = ref<QuestionVO>();


const loadData = async () => {
  const res = await QuestionControllerService.getQuestionVoByIdUsingGet(
    props.id as any
  );
  if (res.code === 0) {
    question.value = res.data;
     // 在数据加载成功后更新codeDefaultValue
       // 直接更新form.submitCode
      form.value.submitCode = question.value.userFunction;
      console.log(form.value.submitCode)

  } else {
    message.error("加载失败，" + res.message);
  }
};


/**
 * 不同语言的默认程序
 */
const codeDefaultValue = ref(
 "aaaaaaa"
);

const form = ref<QuestionSubmitAddRequest>({
  submitLanguage: "java",
  submitCode: '',
});

function handleItemClicked(submitId) {
  // 根据接收到的数据处理逻辑
  // 切换到隐藏的标签页
  console.log(submitId)
;
}
/**
 * 提交代码
 */
const doSubmit = async () => {
  if (!question.value?.id) {
    return;
  }

  const res = await QuestionControllerService.doQuestionSubmitUsingPost({
    ...form.value,
    questionId: question.value.id,
  });
  if (res.code === 0) {
    
    message.success("提交成功，请到已提交题目界面查看");

        // 开始轮询
        const intervalId = setInterval(async () => {
      await checkStatus(intervalId, res.data); // 传递intervalId给checkStatus
    }, 1000); // 每2秒轮询一次
    
    
  } else {
    message.error("提交失败," + res.message);
  }
};
const queJudgeFinish = ref(false);
const userSubmitViewRef = ref(null);
// 查看题目提交状态
const checkStatus = async (intervalId, questionSubmitId) => {
  if (!question.value?.id) {
    clearInterval(intervalId); // 停止轮询
    return;
  }

  const res = await QuestionControllerService.getQuestionSubmitStatusUsingPost({
    questionId: questionSubmitId,
  });
  if (res.code === 0) {
    console.log(res);
    // 假设res.data.status是我们需要检查的状态
    if (res.data == 2 || res.data==3) {
      queJudgeFinish.value = true;
      clearInterval(intervalId); // 检测到评判完成，停止轮询
      message.success("评判完成");
      // 在评判完成后切换到"Submissions" Tab
      if( activeTabKey.value == 'answer'){

           // 确保子组件已挂载并且ref已被设置
          if (userSubmitViewRef.value) {
            userSubmitViewRef.value.loadData();
          }

      }else{
        
       activeTabKey.value = 'answer'; // 切换到 Submissions tab
      }


  
  }
  } else {
    clearInterval(intervalId); // 出错时停止轮询
    message.error("检查状态失败," + res.message);
  }
};


/**
 * 页面加载时，请求数据
 */
onMounted(() => {
  loadData();
});

const changeCode = (value: string) => {
  form.value.submitCode = value;
};
</script>

<style>
#viewQuestionView {
  max-width: 1600px;
  margin: 0 auto;
  box-shadow: 0px 0px 10px rgba(35, 7, 7, 0.21);
  border-radius: 10px;
}

#viewQuestionView .arco-space-horizontal .arco-space-item {
  margin-bottom: 0 !important;
}
</style>
