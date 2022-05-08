{
  if (typeof window !== 'undefined') {  
    const kHead = Symbol('kHead')
    const kHeadElements = Symbol('kHeadElements')

    // Debugging only
    window.kHead = kHead
    window.kHeadElements = kHeadElements

    window[kHeadElements] = []
    window[kHead] = {
      title: null,
      meta: [],
      link: [],
      base: null,
      style: [],
      script: [],
    }

    for (const tag in window[kHead]) {
      window[kHead][tag] = Array.isArray(window[kHead][tag])
        ? [...document.querySelectorAll(tag)].map(getElementData)
        : getElementData(document.querySelector(tag))
    }

    window.head = new Proxy({}, {
      get (_, prop) {
        return window[kHead][prop]
      },
      set (_, prop, value) {
        if (['title', 'base']) {

        }
      }
    })

    function getElementData (elem) {
      if (!elem) {
        return { value: '', attrs: {} }
      }
      return {
        value: elem.textContent,
        attrs: Object.fromEntries([...elem.attributes].map((attr) => {
          return [attr.name, attr.textContent]
        }))
      }
    }

    function renderElement () {

    }
  }
}