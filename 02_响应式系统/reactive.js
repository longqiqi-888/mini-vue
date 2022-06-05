class Dep {
  constructor() {
    this.subscribers = new Set()
  }

  depend() {
    if (activeEffect) {
      this.subscribers.add(activeEffect)
      console.log(this.subscribers)
    }
  }

  notify() {
    this.subscribers.forEach(effect => {
      effect()
    })
  }


}

function reactive(raw) {
  // 取出原对象中的key
  Object.keys(raw).forEach(key => {

    const dep = new Dep();
    // 数据劫持
    Object.defineProperty(raw, key, {
      get() {
        dep.depend()
      },
      set(newValue) {

      }
    })
  })
}

const dep = new Dep()
let activeEffect = null;
function watchEffect(effect) {
  activeEffect = effect;
  dep.depend()
  // 执行一次
  effect()
  // 收集完成之后置为空
  activeEffect = null
}

const info = { count: 100 }
watchEffect(function () {
  console.log(info.count + 11)
})
reactive(info)
info.count++;
dep.notify()

