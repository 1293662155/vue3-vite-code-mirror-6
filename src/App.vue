<script setup>
// This starter template is using Vue 3 <script setup> SFCs
// Check out https://v3.vuejs.org/api/sfc-script-setup.html#sfc-script-setup
import CodeMirrorEditor from './components/CodeMirrorEditor/index.vue'
import { ref } from 'vue'

const code = ref('')

const getCode = () => {
  console.log(code.value)
}

const setCode = () => {
  code.value = `我是随机的 - ${Math.random()}`
}
</script>

<template>
  <code-mirror-editor v-model="code"></code-mirror-editor>

  <div>{{ code }}</div>
  <button @click="getCode">获取当前code的值</button>
  <button @click="setCode">随机设置code</button>
</template>

<style>
#app {
  font-family: Avenir, Helvetica, Arial, sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
  text-align: center;
  color: #2c3e50;
  margin-top: 60px;
}
</style>
