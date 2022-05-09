
class HeadElement {
  name = null
  elem = null
  value = null
  attrs = null
  constructor (elem, name) {
    this.name = name
    this.elem = elem
    this.value = elem ? elem.textContent : ''
    this.attrs = elem ? this.getAttributes(elem.attributes || []) : {}
  }
  getAttributes (attributes) {
    return Object.fromEntries([...attributes].map((attr) => {
      return [attr.name, attr.textContent]
    }))
  }
  create ({ value, attrs }) {
    this.elem = document.createElement(this.name)
    this.update({ value, attrs })
    return this.elem
  }
  update ({ value, attrs }) {
    if (attrs) {
      for (const [attr, value] of Object.entries(attrs)) {
        this.elem.setAttribute(attr, value)
      }
    }
    if (value) {
      this.elem.innerText = value
    }
  }
}

class HeadData {
  // Head elements
  title = null
  base = null
  meta = null
  link = null
  style = null
  script = null
  // Attributes for <html> and <body> tags
  htmlAttrs = null
  bodyAttrs = null
  constructor () {
    this.meta = []
    this.link = []
    this.style = []
    this.script = []
  }
  find (elem, { attrs, value }) {
    if (elem === 'meta') {
      for (const item of this[elem]) {
        if (attrs.name && item.attrs.name === attrs.name) {
          return item
        } else if (attrs.property && item.attrs.property === attrs.property) {
          return item
        }
      }
    } else {
      for (const item of this[elem]) {
        if (item.value === value && Object.entries(attrs).every(([attr, attrValue]) => {
          return item.attrs[attr] === attrValue
        })) {
          return item
        }
      }
    }
  }
}

class HeadManager {
  // Single-element head elements
  static single = ['title', 'base']
  // Multiple-element self-closing head elements
  static selfClosing = ['link', 'meta']
  // Multiple-element head elements
  static multiple = ['style', 'script']
  // Head elements present on first load
  original = null
  // Head elements added dynamically after first load,
  // typically bound to the current route only.
  route = null
  constructor () {
    this.original = new HeadData()
    this.route = new HeadData()
    for (const tag of ['title', 'base', 'meta', 'link', 'style', 'script']) {
      this.original[tag] = Array.isArray(this.original[tag])
        ? [...document.querySelectorAll(tag)].map(elem => new HeadElement(elem, tag))
        : new HeadElement(document.querySelector(tag), tag)
      this.route[tag] = Array.isArray(this.route[tag])
        ? []
        : new HeadElement(null, tag)
    }
  }
  getSingle (elem) {
    if (document.head.contains(this[route].elem)) {
      return this.route[elem]
    } else if (document.head.contains(this.original[elem].elem)) {
      return this.orignal[elem]
    }
  }
  // Sets a single <head> element like <title> or <base> 
  setSingle (elem, { value, attrs }) {
    // If element has already been added or mutated before, just update
    if (this.route[elem].elem) {
      this.route[elem].update({ value, attrs })
    // If element hasn't been added or mutated yet      
    } else {
      // If there's a matching element already on the page
      if (this.original[elem].elem) {
        // Replace it with a newly created one
        document.head.replaceChild(this.route[elem].create({ value, attrs }), this.original[elem].elem)
      } else {
        // If not, add a newly created one to the <head>
        document.head.appendChild(this.route[elem].create({ value, attrs }))
      }
    }
  }
  setSelfClosingItem (elem, attrs) {
    this.setItem(elem, { attrs })
  }
  setItem (elem, { attrs, value }) {
    let routeElem = this.route.find(elem, { value, attrs })
    // If element has been added or mutated already
    if (routeElem) {
      // Just update it
      routeElem.update({ value, attrs })
    // If element hasn't been added or mutated yet
    } else {
      // Create and register new element
      routeElem = new HeadElement(null, elem)
      routeElem.create({ value, attrs })
      this.route[elem].push(routeElem)
      // Check if there's a matching element already on the page
      const originalElem = this.original.find(elem, { value, attrs })
      if (originalElem) {
        // Replace it with a newly created one if so
        document.head.replaceChild(routeElem.elem, originalElem.elem)
      } else {
        // If not, add a newly created one to the <head>
        document.head.appendChild(routeElem.elem)
      }
    }
  }
  reset () {
    for (const elem of HeadManager.single) {
      if (document.head.contains(this.route[elem].elem)) {
        document.head.replaceChild(this.original[elem].elem, this.route[elem].elem)
        this.route[elem].elem = undefined
      }
    }
    for (const collection of HeadManager.selfClosing) {
      for (const { elem } of this.route[elem]) {
        document.head.removeChild(elem)
      }
      this.route[elem] = []
      for (const { elem } of this.original[elem]) {
        document.head.appendChild(elem)
      }
    }
  }
}

function Head () {
  return new Proxy(new HeadManager(), {
    get (head, elem) {
      if (HeadManager.single.includes(elem)) {
        return head.getSingle(elem)
      } else if (HeadManager.selfClosing.includes(elem)) {
        const list = [
          ...head.original[elem],
          ...head.route[elem]
        ].filter(({ elem }) => {
          return document.head.contains(elem)
        })
        return new Proxy(list, {
          get (_, prop) {
            if (typeof prop === 'number') {
              return list[prop]
            } else if (prop === 'set') {
              return (item) => {
                head.setSelfClosingItem(elem, item)
              }
            } else if (prop === 'push') {
              return (items) => {
                for (const item of items) {
                  head.setSelfClosingItem(elem, item)
                }
              }
            }
          }
        })
      }
    },
    set (head, elem, value) {
      if (HeadManager.single.includes(elem)) {
        head.setSingle(elem, { value })
        return value
      } else if (HeadManager.selfClosing.includes(elem)) {
        if (!Array.isArray(value)) {
          throw new Error(`Values must be in an array for setting ${elem} elements`)
        }
        for (const item of value) {
          head.setSelfClosingItem(elem, item)
        }
      }
    }
  })
}

window.head = Head()
