import axios from 'axios'
import store from '@/store'
// import { Spin } from 'iview'
const addErrorLog = errorInfo => {
  // 需要注意的是 此处有一个从属性值中结构的语法
  const { statusText, status, request: { responseURL } } = errorInfo
  let info = {
    type: 'ajax',
    code: status,
    mes: statusText,
    url: responseURL
  }
  // 需要注意的是此处 有一个 类似 indexOf 的方法 查看数组中是否包含某项
  if (!responseURL.includes('save_error_logger')) store.dispatch('addErrorLog', info)
}

// 此处是构造一个请求类 在类实例化的时候 需要两个参数 一个是请求的基础地址 必填项 一个是请求的参数 非必填项
class HttpRequest {
  constructor (baseUrl = baseURL) {
    this.baseUrl = baseUrl
    this.queue = {}
  }
  getInsideConfig () {
    const config = {
      baseURL: this.baseUrl,
      headers: {
        //
      }
    }
    return config
  }
  destroy (url) {
    delete this.queue[url]
    if (!Object.keys(this.queue).length) {
      // Spin.hide()
    }
  }
  interceptors (instance, url) {
    // 请求拦截
    instance.interceptors.request.use(config => {
      // 添加全局的loading...
      if (!Object.keys(this.queue).length) {
        // Spin.show() // 不建议开启，因为界面不友好
      }
      this.queue[url] = true
      return config
    }, error => {
      return Promise.reject(error)
    })
    // 响应拦截
    instance.interceptors.response.use(res => {
      this.destroy(url)
      const { data, status } = res
      return { data, status }
    }, error => {
      this.destroy(url)
      addErrorLog(error.response)
      return Promise.reject(error)
    })
  }
  request (options) {
    const instance = axios.create()
    // 需要注意的是 此处有一个对象合并的方法 将后面的对象的所有属性合并到第一个对象上面 
    options = Object.assign(this.getInsideConfig(), options)
    this.interceptors(instance, options.url)
    return instance(options)
  }
}
export default HttpRequest
