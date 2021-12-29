import { ViewPlugin } from '@codemirror/view'
import { Text } from '@codemirror/text'
export function createDocUpdatePlugin (callback) {
  return ViewPlugin.fromClass(class {
    update (update) {
      if (update.docChanged) {
        callback && callback(update.state.doc.toString())
      }
    }
  })
}
