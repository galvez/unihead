{
  if (typeof window !== 'undefined') {
    const kRoute = Symbol('kRoute')
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
      window[kHeadElements][tag] = Array.isArray(window[kHead][tag])
        ? [...document.querySelectorAll(tag)]
        : document.querySelector(tag)
      window[kHead][tag] = Array.isArray(window[kHead][tag])
        ? [...document.querySelectorAll(tag)].map(getElementData)
        : getElementData(document.querySelector(tag))
    }

    window.head = new Proxy({}, {
      get (_, elem) {
        return window[kHead][elem]
      },
      set (_, elem, value) {
        switch (elem) {
          case 'title':
            setElement(elem, { value })
            break
          case 'base':
            setElement(elem, {
              attrs: value,
            })
            break
          // case 'link':
          //   setElements(elem, {
          //     attrs: value,
          //   })
          //   break
          default:
            break
        }
      }
    })

    function setElement (elem, data) {
      if (window[kHeadElements][elem]) {
        window[kHeadElements][elem].innerText = data.value
        if (data.attrs) {
          for (const [attr, value] of Object.entries(data.attrs)) {
            window[kHeadElements][elem].setAttribute(attr, value)
          }
        }
      } else {
        const node = document.createElement(elem)
        node.innerText = data.value
        if (data.attrs) {
          for (const [attr, value] of Object.entries(data.attrs)) {
            node.setAttribute(attr, value)
          }
        }
        window[kHeadElements][elem] = elem
        document.head.appendChild(node)
      }
    }

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