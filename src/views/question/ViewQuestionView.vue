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
           
           
            <!-- 评论区 -->
            <div class="comments-container">
                 <!-- 添加新评论的外框 -->
            <div class="add-solution-container">
              Hey! join us today and contribute your answer to this question
              <span class="add-solution-btn" @click="showReplyDialog()">  Add a new solution</span>
            </div>
             <QuestionComment :comments="comments" @child-event="loadData" style="margin-left:20px; margin-top:20px"/>
            </div>

            
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

    <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
      <template #title>
       Edit new solution
      </template>
      <div>
          <!-- 评论输入区 -->
          <div class="comment-input-area">
            <MdEditor :value="newComment" :handle-change="onContentChange" />
          </div>
      </div>
    </a-modal>
  </div>
</template>

<script setup lang="ts">
import { onMounted, ref, withDefaults,defineEmits , defineProps ,nextTick , watch, defineExpose } from "vue";
import {
  QuestionControllerService,
  QuestionSubmitAddRequest,
  QuestionVO,
  CommentDto
} from "../../../backapi";
import message from "@arco-design/web-vue/es/message";
import CodeEditor from "@/components/CodeEditor.vue";
import MdViewer from "@/components/MdViewer.vue";
import UserSubmitView from "@/components/UserSubmitView.vue";
import QuestionComment from "@/components/QuestionComment.vue"
import MdEditor from "@/components/MdEditor.vue";

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
const newComment = ref('');



// 评论form

let commentForm = ref({
  parentCommentId: "",
  questionId: "",
  content: ""
});



// 示例评论数据，实际应用中应从外部获取
const comments = ref([
]);
function flattenComments(comments, level = 1, parentAuthor = null) {
  return comments.reduce((acc, comment) => {

    // 创建评论副本，避免直接修改原始数据，但不立即清空 children
    const commentCopy = { ...comment, replyTo: parentAuthor };

    if (level < 3) {
      // 对于一级和二级评论，正常递归处理子评论
      commentCopy.children = comment.children ? flattenComments(comment.children, level + 1, comment.userName) : [];
      acc.push(commentCopy);
    } else {
      // 对于三级及以上的评论，先将当前评论（不含子评论）添加到数组
      const commentWithoutChildren = { ...commentCopy, children: [] };
      acc.push(commentWithoutChildren);

      // 如果当前是三级评论，并且有子评论，则将子评论平级化
      if (comment.children) {
        const flattenedChildren = comment.children.map(child => ({ 
          ...child, 
          replyTo: comment.userName,
          children: [] // 清空子评论的子节点
        }));
        // 将处理后的子评论作为当前层级的评论添加
        acc.push(...flattenedChildren);
      }
      acc.sort((a, b) => new Date(a.datetime) - new Date(b.datetime));

    }

    return acc;
  }, []);
}
const visible = ref(false);

// 提交新评论
const handleOk = async() => {

  if (newComment.value.trim() === '') {
    alert('The content is empty !');
    return;
  }
  commentForm.value.content = newComment.value;
  commentForm.value.parentCommentId = 0;
  commentForm.value.questionId = question.value.id
  const res = await QuestionControllerService.addCommentUsingPost(
      commentForm.value
    );
    if (res.code === 0) {
      
      message.success("Add comment successful !");
      // 提交后清空输入框
      newComment.value = '';
      visible.value = false;
      // TODO 
      loadData();
    } else {
      message.error("Submit Failed" + res.message);
    }
  };

const handleCancel = () => {
      visible.value = false;
    }

// 显示回复弹窗的方法
function showReplyDialog() {
  visible.value = true;
}


// 使用示例
const flattenedComments = ref();



const onContentChange = (value: string) => {
  newComment.value = value;
};
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


// 获取comment
  const res2 = await QuestionControllerService.listCommentUsingPost({
    questionId: question.value.id,
  });
  if (res2.code === 0) {
    comments.value = res2.data;
    comments.value = flattenComments(res2.data);
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

.comments-container {
  max-height: 650px; /* 设置最大高度 */
  overflow-y: auto; /* 超出部分显示滚动条 */
  scrollbar-width: none; /* Firefox */
  -ms-overflow-style: none; /* Internet Explorer 10+ */
}
.comments-container::-webkit-scrollbar {
  display: none; /* Chrome, Safari 和 Opera */
}
/* 确保评论内容容器具有适当的宽度，但不限制其高度 */
.comment-content {
  max-width: 100%; /* 或其他适当的最大宽度，根据需要调整 */
}

.comment-input-area textarea {
  width: 100%;
  margin-top: 20px;
  padding: 8px;
  box-sizing: border-box;
  border-radius: 4px;
  border: 1px solid #ccc;
}

.comment-input-area button {
  margin-top: 10px;
  padding: 6px 12px;
  background-color: #007bff;
  color: white;
  border: none;
  border-radius: 4px;
  cursor: pointer;
}

.comment-input-area button:hover {
  background-color: #0056b3;
}

.add-solution-container {
  width: 100%; /* 占据整个容器的宽度 */
  background-color: #f0f0f0; /* 灰色背景 */
  padding: 10px; /* 一些内边距 */
  box-sizing: border-box; /* 确保内边距不影响宽度 */
  text-align: center; /* 使按钮水平居中 */
}

.add-solution-btn {
  display: inline-block; /* 使得可以应用内边距和边距 */
  padding: 5px 10px; /* 按钮内边距 */
  background-color: #e0f5e0; /* 按钮背景色 */
  color: #006400; /* 文字颜色 */
  border: 1px solid #008000; /* 绿色边框 */
  border-radius: 5px; /* 边框圆角 */
  cursor: pointer; /* 鼠标悬停时的指针样式 */
  font-size: 14px; /* 文字大小 */
  margin: 5px 0; /* 外边距，确保与其他元素的间距 */
  margin-left: 10px;
}

.add-solution-btn:hover {
  background-color: #ccffcc; /* 鼠标悬停时的背景色变化 */
}

</style>
