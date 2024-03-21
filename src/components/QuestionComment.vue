<template>
  <div>
    <div v-for="comment in comments" :key="comment.id">
      <a-comment
         :author="comment.replyTo ? `${comment.userName} 回复 ${comment.replyTo}` : comment.userName"
        :avatar="comment.userAvatar"
        :datetime="comment.createTime"
      >
      <template #actions>
        <span class="action" @click="showReplyDialog(comment.id, comment.userName)"> <IconMessage /> Reply </span>
      </template>
      <template #content>
         <!-- 使用v-html指令渲染Markdown转换后的HTML -->
         <div v-html="renderMarkdown(comment.content)"></div>
      </template>
        <!-- 递归渲染子评论，同时确保子评论存在 -->
        <template v-if="comment.children && comment.children.length">
          <QuestionComment :comments="comment.children" />
        </template>
  
      </a-comment>
    </div>

    <a-modal v-model:visible="visible" @ok="handleOk" @cancel="handleCancel">
      <template #title>
       Reply to {{activeCommentName}}
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


<script setup>
import {IconMessage } from '@arco-design/web-vue/es/icon';
import message from "@arco-design/web-vue/es/message";
import { onMounted,computed,defineEmits, ref, withDefaults, defineProps ,nextTick , watch, defineExpose } from "vue";
import MdEditor from "@/components/MdEditor.vue";
import MarkdownIt from 'markdown-it';
import hljs from 'highlight.js';
import java from 'highlight.js/lib/languages/java';
import {
  QuestionControllerService
} from "../../backapi";


// 定义props
// 注意: <script setup> 中使用 defineProps 无需赋值
defineProps({
  comments: Array,
});
// 定义可以触发的事件列表
// 定义可以触发的事件列表
const emit = defineEmits(['child-event']);

// 示例：触发事件的函数
const emitToParent = () => {
  emit('child-event', 'Hello from Child');
};

hljs.registerLanguage('java', java);

// 创建markdown-it实例
const md = new MarkdownIt({
  highlight: function (str, lang) {
    if (lang && hljs.getLanguage(lang)) {
      try {
        // 使用新的API调用方式
        return '<pre class="hljs"><code>' + 
               hljs.highlight(str, { language: lang, ignoreIllegals: true }).value +
               '</code></pre>';
      } catch (_) {
        // 在异常处理中，返回未高亮的代码
        return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
      }
    }

    // 对于未指定语言或语言不受支持的情况，返回未高亮的代码
    return '<pre class="hljs"><code>' + md.utils.escapeHtml(str) + '</code></pre>';
  }
});



// 使用markdown-it渲染Markdown字符串为HTML
const renderMarkdown = (markdownContent) => {
  return md.render(markdownContent);
};

const activeCommentId = ref(null);
const activeCommentName = ref(null);

const visible = ref(false);

const newComment = ref('');


// 评论form

let commentForm = ref({
  parentCommentId: "",
  content: ""
});



const onContentChange = (value) => {
  newComment.value = value;
};
const handleOk = async() => {

  if (newComment.value.trim() === '') {
    alert('The content is empty !');
    return;
  }
  commentForm.value.content = newComment.value;
  commentForm.value.parentCommentId = activeCommentId;

  const res = await QuestionControllerService.addCommentUsingPost(
      commentForm.value
    );
    if (res.code === 0) {
      
      message.success("Add comment successful !");
      emitToParent()
      // 提交后清空输入框
      newComment.value = '';
      visible.value = false;

    } else {
      message.error("Submit Failed" + res.message);
    }
   

  };




const handleCancel = () => {
      visible.value = false;
    }

// 显示回复弹窗的方法
function showReplyDialog(commentId, commentAuthor) {
  activeCommentId.value = commentId;
  activeCommentName.value = commentAuthor
  visible.value = true;
}


</script>

<style scoped>
.action {
  display: inline-block;
  padding: 0 4px;
  color: var(--color-text-1);
  line-height: 24px;
  background: transparent;
  border-radius: 2px;
  cursor: pointer;
  transition: all 0.1s ease;
}
.action:hover {
  background: var(--color-fill-3);
}


</style>
