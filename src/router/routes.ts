import { RouteRecordRaw } from "vue-router";
import NoAuthView from "@/views/state/NoAuthView.vue";
import UserLoginView from "@/views/user/UserLoginView.vue";
import UserInfoView from "@/views/user/UserInfoView.vue";
import ExampleView from "@/views/ExampleView.vue";
import UserRegisterView from "@/views/user/UserRegisterView.vue";
import UserManageView from "@/views/user/UserManageView.vue";
import ACCESS_ENUM from "@/access/accessEnum";
import UserLayout from "@/layouts/UserLayout.vue";
import AddQuestionView from "@/views/question/AddQuestionView.vue";
import ManageQuestionView from "@/views/question/ManageQuestionView.vue";
import QuestionsView from "@/views/question/QuestionsView.vue";
import QuestionSubmitView from "@/views/question/QuestionSubmitView.vue";
import ViewQuestionsView from "@/views/question/ViewQuestionView.vue";
import RankView from "@/views/question/RankView.vue";


export const routes: Array<RouteRecordRaw> = [
  {
    path: "/user",
    name: "用户",
    component: UserLayout,
    children: [
      {
        path: "/user/login",
        name: "User Login",
        component: UserLoginView,
      },
      {
        path: "/user/info",
        name: "User Info",
        component: UserInfoView,
      },
      {
        path: "/user/register",
        name: "User Register",
        component: UserRegisterView,
      },
    ],
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: "/",
    name: "Main",
    component: QuestionsView,
  },
  {
    path: "/example",
    name: "Example",
    component: ExampleView,
    meta: { hideInMenu: true },
  },
  {
    path: "/rankView",
    name: "Rank",
    component: RankView,
  },
  {
    path: "/question_submit",
    name: "Submittion",
    component: QuestionSubmitView,
  },
  {
    path: "/question/view/:id",
    name: "Solution",
    component: ViewQuestionsView,
    props: true, // 开启接收动态id
    meta: {
      access: ACCESS_ENUM.USER,
      hideInMenu: true,
    },
  },
  {
    path: "/question/add",
    name: "Create Problem",
    component: AddQuestionView,
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: "/question/update",
    name: "Update Problem",
    component: AddQuestionView,
    meta: {
      hideInMenu: true,
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: "/question/manage",
    name: "Manage Problem",
    component: ManageQuestionView,
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },
  {
    path: "/manage/user",
    name: "User Management",
    component: UserManageView,
    meta: {
      access: ACCESS_ENUM.ADMIN,
    },
  },

  {
    path: "/noAuth",
    name: "No Permission",
    component: NoAuthView,
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: "/introduce",
    name: "Introduction",
    component: () => import("../views/SystemIntroduceView.vue"),
  },
  {
    path: "/404",
    name: "404",
    component: () => import("../views/state/404View.vue"),
    meta: {
      hideInMenu: true,
    },
  },
  {
    path: "/:pathMatch(.*)", // 匹配所有路由
    redirect: "/404",
  },
];
