<script setup>
import { ref, reactive } from 'vue'

defineProps({
  msg: String,
})

const tableConfig = reactive({
  tableData: [],
  pageCount: 0,
  loading: false,
  rowValue: "locationId",
  message: { page: 1, limit: 10 },
  showIndex: false,
  multiple: true,
  paginationChange: () => { },
  actionBtnConfig: {
    fixed: "right",
    label: "操作",
    width: 200,
    btnsConfig: [
      {
        key: "edit",
        svgIcon: "bianji",
        label: "编辑",
        click: () => { },
      },
      {
        key: "delete",
        svgIcon: "shanchu",
        type: "danger",
        label: "删除",
        click: () => { },
      },
    ],
  },
  columns: [
    {
      prop: "locationName",
      label: "安装点名称",
      minWidth: 120,
    },
    {
      prop: "building",
      label: "建筑物",
      minWidth: 120,
    },
    {
      prop: "layer",
      label: "楼层",
      minWidth: 90,
    },
    // {
    //   prop: "deptName",
    //   label: "公司名称",
    //   minWidth: 150,
    // },   
    {
      prop: "deviceSn",
      label: "设备序列号",
      minWidth: 120,
    },
    {
      prop: "deviceType",
      label: "设备类型",
      minWidth: 120,
    },
    {
      prop: "bindTime",
      label: "绑定时间",
      minWidth: 150,
    },
    {
      prop: "createTime",
      label: "安装时间",
      minWidth: 150,
    },
  ],
});

const count = ref(0)
</script>

<template>
  <MyButton :loading="true">Hello World</MyButton>
  <div style="height: 300px; width: 800px">
    <BasicTable ref="basicTableRef" :tableConfig="tableConfig"> </BasicTable>

  </div>
  <h1>{{ msg }}</h1>

  <div class="card">
    <button type="button" @click="count++">count is {{ count }}</button>
    <p>
      Edit
      <code>components/HelloWorld.vue</code> to test HMR
    </p>
  </div>

  <p>
    Check out
    <a href="https://vuejs.org/guide/quick-start.html#local" target="_blank">create-vue</a>, the official Vue + Vite
    starter
  </p>
  <p>
    Learn more about IDE Support for Vue in the
    <a href="https://vuejs.org/guide/scaling-up/tooling.html#ide-support" target="_blank">Vue Docs Scaling up Guide</a>.
  </p>
  <p class="read-the-docs">Click on the Vite and Vue logos to learn more</p>
</template>

<style scoped>
.read-the-docs {
  color: #888;
}
</style>
