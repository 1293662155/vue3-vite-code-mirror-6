import { syntaxTree } from '@codemirror/language'

const completePropertyAfter = ['PropertyName', '.', '?.']
const dontCompleteIn = ['TemplateString', 'LineComment', 'BlockComment',
  'VariableDefinition', 'PropertyDefinition']

function _optionalChain (ops) {
  let lastAccessLHS
  let value = ops[0]
  let i = 1
  while (i < ops.length) {
    const op = ops[i]
    const fn = ops[i + 1]
    i += 2
    if ((op === 'optionalAccess' || op === 'optionalCall') && value == null) {
      return undefined
    }
    if (op === 'access' || op === 'optionalAccess') {
      lastAccessLHS = value
      value = fn(value)
    } else if (op === 'call' || op === 'optionalCall') {
      value = fn((...args) => value.call(lastAccessLHS, ...args))
      lastAccessLHS = undefined
    }
  }
  return value
}

function completeProperties (from, object) {
  const options = []
  for (const name in object) {
    options.push({
      label: name,
      type: typeof object[name] === 'function' ? 'function' : 'variable'
    })
  }
  return {
    from,
    options,
    span: /^[\w$]*$/
  }
}
/**
 * @description 获取作用域的下变量
 * @param {*} context
 * @returns
 */
// https://codemirror.net/6/examples/autocompletion/
// usage：
// extensions: [
//   javascriptLanguage.data.of({
//     autocomplete: completeFromGlobalScope
//   })
// ]
export default function completeFromGlobalScope (context) {
  const nodeBefore = syntaxTree(context.state).resolveInner(context.pos, -1)
  if (completePropertyAfter.includes(nodeBefore.name) &&
    _optionalChain([nodeBefore, 'access', _ => _.parent, 'optionalAccess', _2 => _2.name]) === 'MemberExpression') {
    const object = nodeBefore.parent.getChild('Expression')
    if (_optionalChain([object, 'optionalAccess', _3 => _3.name]) === 'VariableName') {
      const from = /\./.test(nodeBefore.name) ? nodeBefore.to : nodeBefore.from
      const variableName = context.state.sliceDoc(object.from, object.to)
      if (typeof window[variableName] === 'object') { return completeProperties(from, window[variableName]) }
    }
  } else if (nodeBefore.name === 'VariableName') {
    return completeProperties(nodeBefore.from, window)
  } else if (context.explicit && !dontCompleteIn.includes(nodeBefore.name)) {
    return completeProperties(context.pos, window)
  }
  return null
}
