import { shallowRef, onMounted, ref, watch } from 'vue'
import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup'
import { createDocUpdatePlugin } from './helper/createDocUpdatePlugin'

export default function useCodemirror (parentRef, initState) {
  const view = shallowRef()
  const doc = ref('')

  const defaultState = {
    doc: '',
    extensions: [
      basicSetup
    ]
  }

  let isReady = false // 是否初始化
  let innerTriggerDocUpdate = false // 是否为内部修改

  const setDoc = val => {
    let insertVal = ''
    if (val || val === 0) {
      if (typeof val === 'object') {
        insertVal = JSON.stringify(val)
      } else {
        insertVal = val.toString()
      }
    }
    doc.value = insertVal
  }

  onMounted(() => {
    // 初始化视图
    if (parentRef.value) {
      const config = Object.assign({}, defaultState, initState)

      // 初始化doc
      setDoc(config.doc)

      // 通过注册插件的形式监听Doc变化, 变化发生在渲染dom之前
      config.extensions.push(createDocUpdatePlugin(newDoc => {
        if (doc.value !== newDoc) {
          console.log('内部修改了')
          innerTriggerDocUpdate = true;
          doc.value = newDoc;
        }
      }))

      view.value = new EditorView({
        state: EditorState.create(config),
        parent: parentRef.value
      })

      // 初始化成功
      isReady = true
    }
  })

  watch(() => doc.value, (nv) => {
    const oldDoc = view.value.state.doc

    if (isReady && oldDoc.toString() !== nv) {
      if (!innerTriggerDocUpdate) {
        console.log('外部修改了')
        // 创建一个事务，然后通过dispatch去修改（codeMirror内部使用immutable去构建数据）
        const transaction = view.value.state.update({ changes: { from: 0, to: oldDoc.length, insert: nv } })
        view.value.dispatch(transaction)
      } else {
        innerTriggerDocUpdate = false;
      }
      
    }

  })


  return {
    doc,
    view
  }
}
