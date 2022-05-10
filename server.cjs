const { Readable } = require('node:stream')

const renderEmpty = Symbol('renderEmpty')
const renderFull = Symbol('renderFull')
const htmlEscape = Symbol('htmlEscape')
const serializeAttrs = Symbol('serializeAttrs')
const empty = ['base', 'link', 'meta']
const content = ['title', 'style', 'script']

class Head {
  constructor (head) {
    Object.assign(this, head)
  }

  stream () {
    return Readable.from(this)
  }

  * [Symbol.iterator] () {
    let elem
    let fragment = ''
    for (elem of empty) {
      if (Array.isArray(this[elem])) {
        for (const item of this[elem]) {
          yield this[renderEmpty](elem, item)
        }
      } else if (this[elem]) {
        yield this[renderEmpty](elem, this[elem])
      }
    }
    for (elem of content) {
      if (Array.isArray(this[elem])) {
        for (const item of this[elem]) {
          for (const element of this[renderFull](elem, this[elem])) {
            yield element
          }
        }
      } else if (this[elem]) {
        for (const element of this[renderFull](elem, this[elem])) {
          yield element
        }
      }
    }
  }

  render () {
    let fragment = ''
    for (const chunk of this) {
      fragment += chunk
    }
    return fragment
  }

  * [renderFull] (elem, item) {
    if (typeof item === 'string') {
      yield `<${elem}>${item}</${elem}>\n`
    } else {
      if (Array.isArray(item)) {
        const [attrs, content] = item
        const attrKeys = Object.keys(attrs)
        if (attrKeys.length) {
          yield `<${elem} ${this[serializeAttrs](attrKeys, attrs)}>${content || ''}</${elem}>\n`
        } else {
          yield `<${elem}>${content || ''}</${elem}>\n`
        }
      } else if (typeof item === 'object' && item !== null) {
        const attrKeys = Object.keys(item)
        if (attrKeys.length) {
          yield `<${elem} ${this[serializeAttrs](attrKeys, item)}></${elem}>\n`
        } else {
          yield `<${elem}></${elem}>\n`
        }
      }
    }
  }

  [renderEmpty] (elem, item) {
    let fragment = ''
    const attrKeys = Object.keys(item)
    if (attrKeys.length) {
      return `<${elem} ${this[serializeAttrs](attrKeys, item)}>\n`
    } else {
      return `<${elem}>\n`
    }
  }

  [serializeAttrs] (keys, source) {
    let serialized = ''
    const lastKey = keys.length - 1
    for (let i = 0; i < lastKey; i++) {
      serialized += `${keys[i]}="${this[htmlEscape](source[keys[i]])}" `
    }
    return `${serialized}${keys[lastKey]}="${this[htmlEscape](source[keys[lastKey]])}"`
  }

  // MIT licensed, taken from https://github.com/sindresorhus/stringify-attributes
  [htmlEscape] (str) {
    return str
      .replace(/&/g, '&amp;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&#39;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
  }
}

module.exports = Head
