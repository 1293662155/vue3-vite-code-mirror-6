<template>
  <div ref="parentRef" class="code-mirror-editor"></div>
</template>
<script setup>
// extension:
// keymap.of(defaultKeymap) 基础快捷键
// javascript() 未知
// oneDarkTheme
// oneDarkHighlightStyle
// basicSetup
// html({
//   matchClosingTags: true,
//   autoCloseTags: true
// })
import { ref, watch } from 'vue'
// // 设置EditorView的状态
// import { EditorState } from '@codemirror/state'

// // EditorView渲染编辑器试图， keymap设置按键
// import { EditorView, keymap } from '@codemirror/view'

// // defaultKeyMap 编辑器提供的默认按键
// import { defaultKeymap } from '@codemirror/commands'

// 开启自动补全 autocompletion({ activateOnTyping: true })
// import { autocompletion } from '@codemirror/autocomplete'

// 设置暗黑主体和暗黑下的高亮
// import { oneDarkTheme, oneDarkHighlightStyle } from '@codemirror/theme-one-dark'

// 和javascript冲突
// import { html } from '@codemirror/lang-html'

// @codemirror/basic-setup 包含大多数packages,除了language package
// https://codemirror.net/6/docs/ref/#basic-setup 查看basic-setup支持哪些插件
import { basicSetup } from '@codemirror/basic-setup'
import { javascriptLanguage } from '@codemirror/lang-javascript'
import { autocompletion } from '@codemirror/autocomplete'

import useCodemirror from './useCodemirror'
import completeFromGlobalScope from './helper/completeFromGlobalScope'

const props = defineProps({
  modelValue: {
    type: String
  }
})

const emit = defineEmits(['update:modelValue'])

const parentRef = ref(null)

const globalJavaScriptCompletions = javascriptLanguage.data.of({
  autocomplete: completeFromGlobalScope
})

const { doc } = useCodemirror(parentRef, {
  doc: props.modelValue,
  extensions: [
    basicSetup,
    // 增加写入提示
    javascriptLanguage,
    globalJavaScriptCompletions,
    autocompletion()
  ]
})


watch(() => props.modelValue, (nv) => {
  doc.value = nv;
})

watch(() => doc.value, (nv) => {
  if (props.modelValue !== nv) {
    emit('update:modelValue', nv)
  }
})

</script>
<style scoped lang="scss">
.code-mirror-editor {
  position: relative;
  width: 800px;
  height: 600px;
  text-align: left;
}
</style>
