
class HeadElement {
  name = null
  elem = null
  value = null
  attrs = null
  constructor (elem, name, document) {
    this.document = document
    this.name = name
    this.elem = elem
    this.value = elem?.textContent
    this.attrs = this.getAttributes(elem?.attributes || [])
  }

  getAttributes (domAttributes) {
    const attributes = []
    for (let i = 0; i < domAttributes.length; i++) {
      attributes[i] = domAttributes[i]
    }
    return Object.fromEntries(attributes.map((attr) => {
      return [attr.name, attr.value]
    }))
  }

  create ({ value, attrs }) {
    this.elem = this.document.createElement(this.name)
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
  static collective = ['link', 'meta', 'script']
  // Head elements present on first load
  original = null
  // Head elements added dynamically after first load,
  // typically bound to the current route only.
  route = null
  static canTrack (elem) {
    if (!elem) {
      return true
    }
    const tagName = elem.tagName.toLowerCase()
    if (tagName === 'script') {
      return !!elem.textContent
    } else if (['meta', 'link', 'title', 'base'].includes(tagName)) {
      return true
    }
  }
  constructor (initial = {}, document) {
    this.document = document
    this.original = new HeadData()
    this.route = new HeadData()
    // Hydrate data model from what's already present in the DOM
    for (const tag of ['title', 'base', 'meta', 'link', 'script']) {
      if (Array.isArray(this.original[tag])) {
        this.original[tag] = [...this.document.querySelectorAll(tag)]
          .filter(elem => HeadManager.canTrack(elem))
          .map(elem => new HeadElement(elem, tag, this.document))
      } else {
        const elem = this.document.querySelector(tag)
        if (HeadManager.canTrack(elem)) {
          this.original[tag] = new HeadElement(elem, tag, this.document)
        }
      }
      if (Array.isArray(this.route[tag])) {
        this.route[tag] = []
      } else {
        this.route[tag] = new HeadElement(null, tag, this.document)
      }
    }
    if (initial) {
      this.update(initial)
    }
  }

  update (initial) {
    for (const [tag, tagDef] of Object.entries(initial)) {
      if (HeadManager.single.includes(tag)) {
        if (typeof tagDef === 'string') {
          this.setSingle(tag, { value: tagDef })
        } else if (typeof tagDef === 'object' && tagDef !== null) {
          this.setSingle(tag, { attrs: tagDef })
        }
      } else if (HeadManager.collective.includes(tag)) {
        if (Array.isArray(tagDef)) {
          for (const def of tagDef) {
            this.setItem(tag, def)
          }
        } else {
          this.setItem(tag, tagDef)
        }
      }
    }
  }

  getSingle (elem) {
    if (this.document.head.contains(this.route[elem])) {
      return this.route[elem].value
    } else if (this.document.head.contains(this.original[elem].elem)) {
      return this.orignal[elem].value
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
        this.document.head.replaceChild(this.route[elem].create({ value, attrs }), this.original[elem].elem)
      } else {
        // If not, add a newly created one to the <head>
        this.document.head.appendChild(this.route[elem].create({ value, attrs }))
      }
    }
  }

  setItem (elem, attrs) {
    let routeElem = this.route.find(elem, { attrs })
    // If element has been added or mutated already
    if (routeElem) {
      // Just update it
      routeElem.update({ attrs })
    // If element hasn't been added or mutated yet
    } else {
      // Create and register new element
      routeElem = new HeadElement(null, elem, this.document)
      routeElem.create({ attrs })
      this.route[elem].push(routeElem)
      // Check if there's a matching element already on the page
      const originalElem = this.original.find(elem, { attrs })
      if (originalElem) {
        // Replace it with a newly created one if so
        this.document.head.replaceChild(routeElem.elem, originalElem.elem)
      } else {
        // If not, add a newly created one to the <head>
        this.document.head.appendChild(routeElem.elem)
      }
    }
  }

  reset () {
    for (const tag of HeadManager.single) {
      if (this.document.head.contains(this.route[tag].elem)) {
        this.document.head.replaceChild(this.original[tag].elem, this.route[tag].elem)
        this.route[tag].elem = new HeadElement(null, tag, this.document)
      }
    }
    for (const tag of HeadManager.collective) {
      for (const { elem } of this.route[tag]) {
        this.document.head.removeChild(elem)
      }
      this.route[tag] = []
      for (const { elem } of this.original[tag]) {
        if (!this.document.head.contains(elem)) {
          this.document.head.appendChild(elem)
        }
      }
    }
  }
}

class Head {
  constructor (initial, document) {
    return new Proxy(new HeadManager(initial, document), {
      get (head, elem) {
        if (elem === 'update') {
          return initialHead => head.update(initialHead)
        }
        if (elem === 'reset') {
          return () => head.reset()
        }
        if (HeadManager.single.includes(elem)) {
          return head.getSingle(elem)
        } else if (HeadManager.collective.includes(elem)) {
          const list = [
            ...head.original[elem],
            ...head.route[elem],
          ].filter(({ elem }) => {
            return document.head.contains(elem)
          })
          return new Proxy(list, {
            get (_, prop) {
              if (typeof prop === 'number') {
                return list[prop]
              } else if (prop === 'set') {
                return (item) => {
                  head.setItem(elem, item)
                }
              } else if (prop === 'push') {
                return (items) => {
                  for (const item of items) {
                    head.setItem(elem, item)
                  }
                }
              }
            },
          })
        }
      },
      set (head, elem, value) {
        if (HeadManager.single.includes(elem)) {
          if (typeof value === 'string') {
            head.setSingle(elem, { value })
          } else if (typeof value === 'object' && value !== null) {
            head.setSingle(elem, { attrs: value })
          }
          return value
        } else if (HeadManager.collective.includes(elem)) {
          if (!Array.isArray(value)) {
            throw new Error(`Values must be in an array for setting ${elem} elements`)
          }
          for (const item of value) {
            head.setItem(elem, item)
          }
        }
      },
    })
  }
}

export default Head
