const h = (tag, props, children) => {
  // h函数返回的是一个vnode,是一个js对象
  return {
    tag,
    props,
    children
  }
}


const mount = (vnode, container) => {
  // 创建真实的dom，并且在vnode中保留el
  let el = vnode.el = document.createElement(vnode.tag);
  // console.log(vnode.tag)

  // 处理props
  if (vnode.props) {
    for (let key in vnode.props) {
      let value = vnode.props[key]

      // 有监听属性，判断开头是不是on开头
      if (key.startsWith("on")) {
        el.addEventListener(key.slice(2).toLowerCase(), value)
      } else {
        // 添加属性
        el.setAttribute(key, value)
      }
    }
  }

  // 处理children
  if (vnode.children) {
    if (typeof vnode.children === "string") {
      el.textContent = vnode.children
      // console.log("zi", el.textContent)
    } else {
      vnode.children.forEach(item => {
        mount(item, el)
      });
    }
  }
  // 将el挂载到container上
  container.appendChild(el)
  // console.log(el)


}


const patch = (n1, n2) => {
  // 新旧节点的元素不相同，将旧的去除添加上新的节点
  if (n1.tag !== n2.tag) {
    const n1ElParent = n1.el.parentElement;
    console.log(n1ElParent)
    n1ElParent.removeChild(n1.el);
    mount(n2, n1ElParent)
  } else {
    // 新旧节点的元素相同
    // 取出element，并且保留在n2中
    const el = n2.el = n1.el;

    // 处理props
    const oldProps = n1.props || {};
    const newProps = n2.props || {};

    // 添加新props，修改旧props
    for (const key in newProps) {
      const oldValue = oldProps[key]
      const newValue = newProps[key]
      if (newValue !== oldValue) {
        if (key.startsWith("on")) {
          el.addEventListener(key.slice(2).toLowerCase(), newValue)
        } else {
          // 添加属性
          el.setAttribute(key, newValue)
        }
      }
    }

    // 删除props
    for (const key in oldProps) {
      if (!(key in newProps)) {
        if (key.startsWith('on')) {
          const value = oldProps[key]
          el.removeEventListener(key.slice(2).toLowerCase(), value)
        } else {
          el.removeAttribute(key)
        }
      }
    }

    // 处理children
    const oldChildren = n1.children || []
    const newChildren = n2.children || []

    //情况一： newChildren是string
    if (typeof newChildren === "string") {
      // 边界情况
      if (typeof oldChildren === "string") {
        if (newChildren !== oldChildren) {
          el.textContent = newChildren
        }
      } else {
        console.log(el)
        el.innerHTML = newChildren
      }
    } else {
      // 情况二：newChildren是数组，oldChildren是字符串
      if (typeof oldChildren === "string") {
        oldChildren.innerHTML = "";
        newChildren.forEach(item => {
          mount(item, el)
        })
      } else { //情况三：oldChildren 和newChildren 都是数组
        // oldChildren : [v1,v2,v3]
        // newChildren : [v1,v6,v7,v9]
        // 前面的节点进行比较
        const commonChildren = Math.min(newChildren.length, oldChildren.length);
        for (let i = 0; i < commonChildren; i++) {
          patch(oldChildren[i], newChildren[i])
        }

        // oldChildren > newChildren 删除oldChildren剩余节点
        oldChildren.slice(commonChildren).forEach(item => {
          el.removeChild(item.el)
        })

        // oldChildren < newChildren
        newChildren.slice(commonChildren).forEach(item => {
          el.appendChild(item.el)
        })

      }
    }

  }
}