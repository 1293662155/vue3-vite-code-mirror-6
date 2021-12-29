import { shallowRef, onMounted } from 'vue'
import { EditorState, EditorView, basicSetup } from '@codemirror/basic-setup'
import { createDocUpdatePlugin } from './helper/createDocUpdatePlugin'

export default function useCodemirror (parentRef, initState, cb) {
  const view = shallowRef()

  const defaultState = {
    doc: '',
    extensions: [
      basicSetup
    ]
  }

  let manualTriggerDocUpdate = false

  const setDoc = val => {
    if (!view.value) return undefined

    const oldDoc = view.value.state.doc
    let insertVal = ''

    if (val || val === 0) {
      if (typeof val === 'object') {
        insertVal = JSON.stringify(val)
      } else {
        insertVal = val.toString()
      }
    }

    // 创建一个事务，然后通过dispatch去修改（codeMirror内部使用immutable去构建数据）
    if (oldDoc.toString() !== insertVal) {
      manualTriggerDocUpdate = true
      const transaction = view.value.state.update({ changes: { from: 0, to: oldDoc.length, insert: insertVal } })
      view.value.dispatch(transaction)
    }
  }

  const getDoc = () => {
    if (!view.value) return undefined
    return view.value.state.doc.toString()
  }

  onMounted(() => {
    // 初始化视图
    if (parentRef.value) {
      const config = Object.assign({}, defaultState, initState)

      // 通过注册插件的形式监听Doc变化, 变化发生在渲染dom之前
      config.extensions.push(createDocUpdatePlugin(newDoc => {
        if (manualTriggerDocUpdate) {
          manualTriggerDocUpdate = false
        } else {
          cb && cb(newDoc)
        }
      }))

      view.value = new EditorView({
        state: EditorState.create(config),
        parent: parentRef.value
      })
    }
  })

  return {
    view,
    setDoc,
    getDoc
  }
}
