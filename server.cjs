const renderEmpty = Symbol('renderEmpty')
const renderFull = Symbol('renderFull')
const htmlEscape = Symbol('htmlEscape')
const serializeAttrs = Symbol('serializeAttrs')

class Head {
  static empty = ['base', 'link', 'meta']
  // Multiple-element head elements
  static content = ['title', 'style', 'script']
  constructor (head) {
    Object.assign(this, head)
  }

  render () {
    let elem
    let fragment = ''
    for (elem of Head.empty) {
      if (Array.isArray(this[elem])) {
        for (const item of this[elem]) {
          fragment += this[renderEmpty](elem, item)
        }
      } else if (this[elem]) {
        fragment += this[renderEmpty](elem, this[elem])
      }
    }
    for (elem of Head.content) {
      if (Array.isArray(this[elem])) {
        for (const item of this[elem]) {
          fragment += this[renderFull](elem, item)
        }
      } else if (this[elem]) {
        fragment += this[renderFull](elem, this[elem])
      }
    }
    return fragment
  }

  [renderFull] (elem, item) {
    if (typeof item === 'string') {
      return `<${elem}>${item}</${elem}>\n`
    } else {
      let fragment = ''
      if (Array.isArray(item)) {
        const [attrs, content] = item
        const attrKeys = Object.keys(attrs)
        if (attrKeys.length) {
          fragment += `<${elem} ${this[serializeAttrs](attrKeys, attrs)}>${content || ''}</${elem}>\n`
        } else {
          fragment += `<${elem}>${content || ''}</${elem}>\n`
        }
      } else if (typeof item === 'object' && item !== null) {
        const attrKeys = Object.keys(item)
        if (attrKeys.length) {
          fragment += `<${elem} ${this[serializeAttrs](attrKeys, item)}></${elem}>\n`
        } else {
          fragment += `<${elem}></${elem}>\n`
        }
      }
      return fragment
    }
  }

  [renderEmpty] (elem, item) {
    let fragment = ''
    const attrKeys = Object.keys(item)
    if (attrKeys.length) {
      fragment += `<${elem} ${this[serializeAttrs](attrKeys, item)}>\n`
    } else {
      fragment += `<${elem}>\n`
    }
    return fragment
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
